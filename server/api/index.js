/**
 * External dependencies
 */
var express = require( 'express' );

/**
 * Internal dependencies
 */
var version = require( '../../package.json' ).version,
	config = require( 'config' ),
	request = require( 'request' ),
	cookie = require( 'cookie' ),
	cors = require( 'cors' ),
	oauth = require( './oauth' ),
	urlParser = require( 'url' );

var mofoApps = config( 'mofo_apps' );
let whitelist = Object.keys( mofoApps ).map( domain => {
	var URL = urlParser.parse( mofoApps[domain].preview );
	return `${URL.protocol}//${URL.host}`;
} );

let corsOptions = {
	origin: function( origin, callback ) {
		let originIsWhitelisted = whitelist.indexOf( origin ) !== -1;
		callback( null, originIsWhitelisted );
	},
	credentials: true
};

const TOKEN_NAME = 'wpcom_token';
const URL = 'https://public-api.wordpress.com/rest/v1.1/sites/';

function getToken( cookies ) {
	if ( cookies ) {
		cookies = cookie.parse( cookies );
	}
	if ( cookies && typeof cookies[TOKEN_NAME] !== 'undefined' ) {
		return cookies[TOKEN_NAME];
	}
	return false;
}

module.exports = function() {
	var app = express();

	app.use( function( req, res, next ) {
		let token = getToken( req.headers.cookie );
		if ( !token && ( req.path !== '/authorize' && req.path !== '/sites' && req.path !== '/api/oauth/token' ) ) {
			return res.redirect( '/authorize' );
		}
		next();
	} );

	app.get( '/version', function( req, res ) {
		res.json( {
			version: version
		} );
	} );

	app.get( '/proxy/:blogname/:post', cors( corsOptions ), function( req, res ) {
		let cookies = getToken( ( req.headers.cookie ) );
		if ( cookies && typeof cookies[TOKEN_NAME] !== 'undefined' ) {
			let post = req.params.post;
			let blogname = mofoApps[req.params.blogname].blogname;
			if ( !blogname ) {
				return res.sendStatus( 404 );
			}
			let url = `${URL}${blogname}/posts/`;
			if ( isNaN( post * 1 ) ) {
				url = `${url}slug:${post}`;
			} else {
				url = `${url}${post}`;
			}
			request.get( url, {
				auth: {
					bearer: cookies[TOKEN_NAME]
				}
			}, function( err, data ) {
				if ( err ) {
					return res.send( `Oops ${err}` );
				}
				if ( data.statusCode === 200 ) {
					return res.json( JSON.parse( data.body ) );
				}
				res.sendStatus( 404 );
			} );
		} else {
			res.sendStatus( 403 );
		}
	} );

	if ( config.isEnabled( 'oauth' ) ) {
		oauth( app );
	}

	return app;
};
