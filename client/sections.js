var config = require( 'config' ),
	readerPaths;

var sections, editorPaths;

sections = [
	{
		name: 'customize',
		paths: [ '/customize' ],
		module: 'my-sites/customize'
	},
	{
		name: 'me',
		paths: [ '/me' ],
		module: 'me'
	},
	{
		name: 'media',
		paths: [ '/media' ],
		module: 'my-sites/media'
	},
	{
		name: 'menus',
		paths: [ '/menus' ],
		module: 'my-sites/menus'
	},
	{
		name: 'posts-pages',
		paths: [ '/pages' ],
		module: 'my-sites/pages'
	},
	{
		name: 'posts-pages',
		paths: [ '/posts' ],
		module: 'my-sites/posts'
	},
	{
		name: 'settings',
		paths: [ '/settings' ],
		module: 'my-sites/site-settings'
	}
];

if ( config.isEnabled( 'manage/drafts' ) ) {
	sections.push( {
		name: 'posts-pages',
		paths: [ '/drafts' ],
		module: 'my-sites/drafts'
	} );
}

if ( config.isEnabled( 'post-editor' ) ) {
	editorPaths = [ '/post' ];

	if ( config.isEnabled( 'post-editor/pages' ) ) {
		editorPaths.push( '/page' );
	}

	sections.push( {
		name: 'post-editor',
		paths: editorPaths,
		module: 'post-editor'
	} );
}

if ( config.isEnabled( 'oauth' ) ) {
	sections.push( {
		name: 'auth',
		paths: [ '/login' ],
		module: 'auth',
		enableLoggedOut: true
	} );
}

module.exports = sections;
