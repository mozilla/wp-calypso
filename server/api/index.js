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

var corsOptions = {
	origin: 'http://teach-cms-enabled.herokuapp.com',
	credentials: true
};
const TOKEN_NAME = 'wpcom_token';
const URL = 'https://public-api.wordpress.com/rest/v1.1/sites/';
const BLOG = 'teachmozillaorg.wordpress.com';

module.exports = function() {
	var app = express();

	app.get( '/version', function( req, res ) {
		res.json( {
			version: version
		} );
	} );

	app.get( '/proxy/:post', cors( corsOptions ), function( req, res ) {
		let cookies;
		if ( req.headers.cookie ) {
			cookies = cookie.parse( req.headers.cookie );
		}

		if ( cookies && typeof cookies[TOKEN_NAME] !== 'undefined' ) {
			let post = req.params.post;
			let url = `${URL}${BLOG}/posts/`;
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
				res.send( 404 );
			} );
		} else {
			res.send( 403 );
		}
	} );

	if ( config.isEnabled( 'oauth' ) ) {
		oauth( app );
	}

	return app;
};
