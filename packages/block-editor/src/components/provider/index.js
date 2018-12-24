/**
 * External dependencies
 */
import { flow } from 'lodash';

/**
 * WordPress Dependencies
 */
import { createElement, Component } from '@wordpress/element';
import { DropZoneProvider, SlotFillProvider } from '@wordpress/components';
import { withDispatch, withSelect } from '@wordpress/data';
import { compose } from '@wordpress/compose';

class BlockEditorProvider extends Component {
	constructor( props ) {
		super( ...arguments );
		props.updateEditorSettings( props.settings );
		props.initBlocks( props.value );
		this.persistedValue = props.select( 'core/block-editor' ).getBlocks();
	}

	componentDidUpdate( prevProps ) {
		if ( this.props.settings !== prevProps.settings ) {
			this.props.updateEditorSettings( this.props.settings );
		}

		if (
			this.props.blocks !== prevProps.blocks &&
			this.props.blocks !== this.persistedValue
		) {
			this.persistedValue = this.props.blocks;
			this.props.onChange( this.props.blocks );
		}
	}

	render() {
		const {
			children,
		} = this.props;

		const providers = [
			// Slot / Fill provider:
			//
			//  - context.getSlot
			//  - context.registerSlot
			//  - context.unregisterSlot
			[
				SlotFillProvider,
			],

			// DropZone provider:
			[
				DropZoneProvider,
			],
		];

		const createEditorElement = flow(
			providers.map( ( [ Provider, props ] ) => (
				( arg ) => createElement( Provider, props, arg )
			) )
		);

		return createEditorElement( children );
	}
}

export default compose( [
	withSelect( ( select ) => {
		return {
			blocks: select( 'core/block-editor' ).getBlocks(),
			select,
		};
	} ),
	withDispatch( ( dispatch ) => {
		const {
			updateEditorSettings,
			initBlocks,
		} = dispatch( 'core/block-editor' );

		return {
			updateEditorSettings,
			initBlocks,
		};
	} ),
] )( BlockEditorProvider );
