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
	oauth = require( './oauth' );

var mofoApps = config( 'mofo_apps' );
let whitelist = Object.keys( mofoApps );

let corsOptions = {
	origin: function( origin, callback ) {
		let originIsWhitelisted = whitelist.indexOf( origin ) !== -1;
		callback( null, originIsWhitelisted );
	},
	credentials: true
};

const TOKEN_NAME = 'wpcom_token';
const URL = 'https://public-api.wordpress.com/rest/v1.1/sites/';

module.exports = function() {
	var app = express();

	app.get( '/version', function( req, res ) {
		res.json( {
			version: version
		} );
	} );

	app.get( '/proxy/:blogname/:post', cors( corsOptions ), function( req, res ) {
		let cookies;
		if ( req.headers.cookie ) {
			cookies = cookie.parse( req.headers.cookie );
		}
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
