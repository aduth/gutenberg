/**
 * External dependencies
 */
import { map } from 'lodash';

/**
 * WordPress Dependencies
 */
import { compose } from '@wordpress/compose';
import { Component } from '@wordpress/element';
import { withDispatch, withSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { BlockEditorProvider } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import transformStyles from '../../editor-styles';

/**
 * Compute the Editor Provider's state object from props.
 * @param {Object} props Component props.
 *
 * @return {Object} Component state.
 */
function computeProviderStateFromProps( props ) {
	return {
		settings: props.settings,
		meta: props.meta,
		onMetaChange: props.onMetaChange,
		editorSettings: {
			...props.settings,
			__experimentalMetaSource: {
				value: props.meta,
				onChange: props.onMetaChange,
			},
		},
	};
}

class EditorProvider extends Component {
	constructor( props ) {
		super( ...arguments );

		this.state = computeProviderStateFromProps( props );

		// Assume that we don't need to initialize in the case of an error recovery.
		if ( props.recovery ) {
			return;
		}

		props.updatePostLock( props.settings.postLock );
		props.setupEditor( props.post, props.initialEdits, props.settings.template );

		if ( props.settings.autosave ) {
			props.createWarningNotice(
				__( 'There is an autosave of this post that is more recent than the version below.' ),
				{
					id: 'autosave-exists',
					actions: [
						{
							label: __( 'View the autosave' ),
							url: props.settings.autosave.editLink,
						},
					],
				}
			);
		}
	}

	componentDidMount() {
		if ( ! this.props.settings.styles ) {
			return;
		}

		const updatedStyles = transformStyles( this.props.settings.styles, '.editor-styles-wrapper' );

		map( updatedStyles, ( updatedCSS ) => {
			if ( updatedCSS ) {
				const node = document.createElement( 'style' );
				node.innerHTML = updatedCSS;
				document.body.appendChild( node );
			}
		} );
	}

	static getDerivedStateFromProps( props, state ) {
		if (
			props.settings === state.settings &&
			props.meta === state.meta &&
			props.onMetaChange === state.onMetaChange
		) {
			return null;
		}

		return computeProviderStateFromProps( props );
	}

	render() {
		const {
			children,
			blocks,
			updateEditorBlocks,
			isReady,
		} = this.props;
		const { editorSettings } = this.state;

		if ( ! isReady ) {
			return null;
		}

		return (
			<BlockEditorProvider
				value={ blocks }
				onChange={ updateEditorBlocks }
				settings={ editorSettings }
			>
				{ children }
			</BlockEditorProvider>
		);
	}
}

export default compose( [
	withSelect( ( select ) => {
		return {
			isReady: select( 'core/editor' ).isEditorReady(),
			blocks: select( 'core/editor' ).getEditorBlocks(),
			meta: select( 'core/editor' ).getEditedPostAttribute( 'meta' ),
		};
	} ),
	withDispatch( ( dispatch ) => {
		const {
			setupEditor,
			updatePostLock,
			updateEditorBlocks,
			editPost,
		} = dispatch( 'core/editor' );
		const { createWarningNotice } = dispatch( 'core/notices' );

		return {
			setupEditor,
			updatePostLock,
			createWarningNotice,
			updateEditorBlocks,
			onMetaChange( meta ) {
				editPost( { meta } );
			},
		};
	} ),
] )( EditorProvider );
