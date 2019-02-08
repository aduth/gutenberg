/**
 * WordPress dependencies
 */
import { default as triggerFetch } from '@wordpress/api-fetch';
import { createRegistryControl } from '@wordpress/data';

export function apiFetch( request ) {
	return {
		type: 'API_FETCH',
		request,
	};
}

export function select( reducerKey, selectorName, ...args ) {
	return {
		type: 'SELECT',
		reducerKey,
		selectorName,
		args,
	};
}

export function dispatch( reducerKey, actionName, ...args ) {
	return {
		type: 'DISPATCH',
		reducerKey,
		actionName,
		args,
	};
}

export default {
	API_FETCH( { request } ) {
		return triggerFetch( request );
	},
	SELECT: createRegistryControl(
		( registry ) => ( { reducerKey, selectorName, args } ) => {
			return registry.select( reducerKey )[ selectorName ]( ...args );
		}
	),
	DISPATCH: createRegistryControl(
		( registry ) => ( { reducerKey, actionName, args } ) => {
			return registry.dispatch( reducerKey )[ actionName ]( ...args );
		}
	),
};
