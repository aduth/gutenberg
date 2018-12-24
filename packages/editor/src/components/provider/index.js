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

class EditorProvider extends Component {
	constructor( props ) {
		super( ...arguments );

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

	render() {
		const { children, settings, blocks, updateEditorBlocks, isReady } = this.props;

		if ( ! isReady ) {
			return null;
		}

		return (
			<BlockEditorProvider
				value={ blocks }
				onChange={ updateEditorBlocks }
				settings={ settings }
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
		};
	} ),
	withDispatch( ( dispatch ) => {
		const {
			setupEditor,
			updatePostLock,
			updateEditorBlocks,
		} = dispatch( 'core/editor' );
		const { createWarningNotice } = dispatch( 'core/notices' );

		return {
			setupEditor,
			updatePostLock,
			createWarningNotice,
			updateEditorBlocks,
		};
	} ),
] )( EditorProvider );
