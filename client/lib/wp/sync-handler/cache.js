/**
 * External dependencies
 */
import moment from 'moment';
import debugFactory from 'debug';
import ms from 'ms';

/**
 * Internal dependencies
 */
import warn from 'lib/warn';
import { getLocalForage } from 'lib/localforage';

/**
 * Module variables
 */
const localforage = getLocalForage();
const debug = debugFactory( 'calypso:sync-handler:cache' );

const RECORDS_LIST_KEY = 'records-list';
const SYNC_RECORD_REGEX = /^sync-record-\w+$/;
const LIFETIME = '2 days';

/**
 * Check it the given key is a `sync-record-` key
 *
 * @param {String} key - record key
 * @return {Boolean} `true` if it's a sync-record-<key>
 */
const isSyncRecordKey = key => SYNC_RECORD_REGEX.test( key );

export class Cache {
	getAll() {
		return localforage.getItem( RECORDS_LIST_KEY );
	}

	/**
	 * Add the given `key` into the records-list object
	 * adding at the same a timestamp (now).
	 * If the pair key-timestamp already exists it will be updated.
	 *
	 * @param {String} key - record key
	 * @return {Promise} promise
	 */
	addItem( key ) {
		return this.filterByKey( key ).then( records => {
			debug( 'adding %o to list (%s)', key, records.length + 1 );
			return localforage.setItem( RECORDS_LIST_KEY, [
				...records,
				{ key, timestamp: Date.now() }
			] );
		} );
	}

	removeItem( key ) {
		return this.filterByKey( key ).then( records => {
			return localforage.setItem( RECORDS_LIST_KEY, records );
		} );
	}

	/**
	 * Retrieve all records filter by the given key
	 *
	 * @param {String} key - compare records with this key
	 * @return {Promise} promise
	 */
	filterByKey( key ) {
		return new Promise( ( resolve, reject ) => {
			this.getAll().then( records => {
				if ( ! records || ! records.length ) {
					debug( 'No records stored' );
					return resolve( [] );
				}

				// filter records by the given key
				records = records.filter( item => {
					if ( item.key === key ) {
						debug( '%o exists. Removing ...', key );
					}
					return item.key !== key;
				} );

				resolve( records );
			} ).catch( reject );
		} );
	}

	/**
	 * Calling this method all records will be removed.
	 * It's a cleaning method and it should be used to re-sync the whole data.
	 *
	 * @return {Promise} promise
	 */
	clearAll() {
		return new Promise( ( resolve, reject ) => {
			localforage.keys().then( keys => {
				const syncHandlerKeys = keys.filter( isSyncRecordKey );

				if ( ! syncHandlerKeys.length ) {
					debug( 'No records to remove' );
					return resolve( [] );
				}

				debug( 'Removing %o records', syncHandlerKeys.length );
				syncHandlerKeys.forEach( key => {
					localforage.removeItem( key ).then( () => {
						debug( '%o has been removed', key );
					} ).catch( removeErr => {
						if ( removeErr ) {
							return warn( removeErr );
						}
						return reject( removeErr );
					} );
				} );

				localforage.removeItem( RECORDS_LIST_KEY ).then( () => {
					debug( '%o has been removed as well', RECORDS_LIST_KEY );
				} ).catch( removeListErr => {
					if ( removeListErr ) {
						warn( removeListErr );
					}
					return reject( removeListErr );
				} );
			} ).catch( reject );
		} );
	}

	/**
	 * Prune old records depending of the given lifetime
	 *
	 * @param {Number|String} lifetime - lifetime (ms or natural string)
	 * @return {Promise} promise
	 */
	pruneRecordsFrom( lifetime = LIFETIME ) {
		return new Promise( ( resolve, reject ) => {
			lifetime = typeof lifetime === 'number'
				? lifetime
				: ms( lifetime );

			debug( 'start to prune records older than %s', ms( lifetime, { long: true } ) );

			this.getAll().then( records => {
				if ( ! records || ! records.length ) {
					debug( 'Records not found' );
					return resolve( [] );
				}

				const filteredRecords = records.filter( item => {
					const reference = Date.now() - lifetime;
					const timeago = moment( item.timestamp ).from();

					if ( item.timestamp < reference ) {
						debug( '%o is too old (%s). Removing ...', item.key, timeago );
						localforage.removeItem( item.key );
						return false;
					}

					return true;
				} );

				if ( filteredRecords.length === records.length ) {
					debug( 'No records to prune' );
					resolve( records );
				} else {
					debug( 'updating %o list', RECORDS_LIST_KEY );
					localforage
						.setItem( RECORDS_LIST_KEY, filteredRecords )
						.then( resolve ).catch( reject );
				}
			} ).catch( reject );
		} );
	}
}
