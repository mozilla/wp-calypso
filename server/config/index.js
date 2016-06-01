const configPath = require( 'path' ).resolve( __dirname, '..', '..', 'config' );
const data = require( './parser' )( configPath, {
	env: process.env.CALYPSO_ENV || process.env.NODE_ENV || 'development',
	includeSecrets: true,
	enabledFeatures: process.env.ENABLE_FEATURES,
	disabledFeatures: process.env.DISABLE_FEATURES
} );

/**
 * Return config `key`.
 * Throws an error if the requested `key` is not set in the config file.
 *
 * @param {String} key The key of the config entry.
 * @return {Mixed} Value of config or error if not found.
 * @api public
 */
function config( key ) {
	if ( key in data ) {
		return data[ key ];
	}
	throw new Error( 'config key `' + key + '` does not exist' );
}

function isEnabled( feature ) {
	return !! data.features[ feature ];
}

function anyEnabled() {
	var args = Array.prototype.slice.call( arguments );
	return args.some( function( feature ) {
		return isEnabled( feature );
	} );
}

function getMofoSite( siteID ) {
	var site;
	var mofo_apps = config( 'mofo_apps' );
	Object.keys( mofo_apps ).every( function( app ) {
		if ( mofo_apps[app].blogname === siteID ) {
			site = app;
			return false;
		}
		return true;
	} );
	return site;
}

function getPreviewURL( appname ) {
	return config( 'mofo_apps' )[appname].preview || '';
}

module.exports = config;
module.exports.isEnabled = isEnabled;
module.exports.getMofoSite = getMofoSite;
module.exports.getPreviewURL = getPreviewURL;
module.exports.anyEnabled = anyEnabled;
