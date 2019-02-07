/**
 * WordPress dependencies
 */
import { default as triggerFetch } from '@wordpress/api-fetch';
import { select as selectData, dispatch as dispatchData } from '@wordpress/data';

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
	SELECT( { reducerKey, selectorName, args } ) {
		return selectData( reducerKey )[ selectorName ]( ...args );
	},
	DISPATCH( { reducerKey, actionName, args } ) {
		return dispatchData( reducerKey )[ actionName ]( ...args );
	},
};
