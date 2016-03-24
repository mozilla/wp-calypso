/**
 * External dependencies
 */
var React = require( 'react' );
var request = require( 'superagent' );

/**
 * Internal dependencies
 */
var SidebarItem = require( 'layout/sidebar/item' ),
	config = require( 'config' );
	// [MozNote] We don't wanna show WP's custom post page, e.g., Testimonials, Portfolio.
	//           Let's remove code related to postTypesList = require( 'lib/post-types-list' )();

var PublishMenu = React.createClass( {

	propTypes: {
		site: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ),
		sites: React.PropTypes.object.isRequired,
		siteSuffix: React.PropTypes.string,
		isSingle: React.PropTypes.oneOfType( [
			React.PropTypes.string,
			React.PropTypes.bool
		] ),
		itemLinkClass: React.PropTypes.func,
		onNavigate: React.PropTypes.func,
	},

	getInitialState: function() {
		return { 
			mozmakerPartialsLoaded: false 
		};
	},

	// We default to `/my` posts when appropriate
	getMyParameter: function( selectedSite ) {
		var sites = this.props.sites;
		if ( ! sites.initialized ) {
			return '';
		}
		if ( selectedSite ) {
			return ( selectedSite.single_user_site || selectedSite.jetpack ) ? '' : '/my';
		}
		return ( sites.allSingleSites ) ? '' : '/my';
	},

	getNewPageLink: function( site ) {
		if ( config.isEnabled( 'post-editor/pages' ) ) {
			return site ? '/page/' + site.slug : '/page';
		}
		return site ? '//wordpress.com/page/' + site.ID + '/new' : '//wordpress.com/page';
	},

	getDefaultMenuItems: function( site ) {
		var newPostLink;

		if ( config.isEnabled( 'post-editor' ) ) {
			newPostLink = site ? '/post/' + site.slug : '/post';
		} else {
			newPostLink = site ? '//wordpress.com/post/' + site.ID + '/new' : '//wordpress.com/post';
		}

		return [
			{
				name: 'post',
				label: this.translate( 'Blog Posts' ),
				className: 'posts',
				capability: 'edit_posts',
				config: 'manage/posts',
				link: '/posts' + this.getMyParameter( site ),
				paths: [ '/posts', '/posts/my' ],
				buttonLink: newPostLink,
				wpAdminLink: 'edit.php',
				showOnAllMySites: true,
			},
			{
				name: 'page',
				label: this.translate( 'Pages' ),
				className: 'pages',
				capability: 'edit_pages',
				config: 'manage/pages',
				link: '/pages',
				// buttonLink: this.getNewPageLink( site ),
				wpAdminLink: 'edit.php?post_type=page',
				showOnAllMySites: true,
			}
		];
	},

	renderMenuItem: function( menuItem ) {
		var className = this.props.itemLinkClass(
				menuItem.paths ? menuItem.paths : menuItem.link,
				menuItem.className
			),
			isEnabled = config.isEnabled( menuItem.config ),
			link,
			icon;

		if ( this.props.site.capabilities && ! this.props.site.capabilities[ menuItem.capability ] ) {
			return null;
		}

		// Hide the sidebar link for media
		if ( 'attachment' === menuItem.name ) {
			return null;
		}

		// Hide the sidebar link for multiple site view if it's not in calypso, or
		// if it opts not to be shown.
		if ( ! this.props.isSingle && ( ! isEnabled || ! menuItem.showOnAllMySites ) ) {
			return null;
		}

		if ( ! isEnabled && this.props.site.options ) {
			link = this.props.site.options.admin_url + menuItem.wpAdminLink;
		} else {
			link = menuItem.link + this.props.siteSuffix;
		}

		if ( menuItem.mozCustomPageType ) {
			link = link + '/?pageType=' + menuItem.name
		}

		let preload;

		if ( menuItem.name === 'post' ) {
			icon = 'posts';
			preload = 'posts-pages';
		} else if ( menuItem.name === 'page' || menuItem.mozCustomPageType ) {
			icon = 'pages';
			preload = 'posts-pages';
		} else if ( menuItem.name === 'jetpack-portfolio' ) {
			icon = 'folder';
		} else if ( menuItem.name === 'jetpack-testimonial' ) {
			icon = 'quote';
		} else {
			icon = 'custom-post-type';
		}

		return (
			<SidebarItem key={ menuItem.name }
				label={ menuItem.label }
				className={ className }
				link={ link }
				buttonLink={ menuItem.buttonLink }
				onNavigate={ this.props.onNavigate }
				icon={ icon }
				preloadSectionName={ preload }
				mozCustomPageType={ menuItem.mozCustomPageType }
			/>
		);
	},

	getMozmakerPartials: function(callback) {
		var self = this;
		request
			.get("http://mozilla.github.io/mozmaker-templates/api/partials")
			.accept('json')
			.end(function(err, res) {
			  var ifError;
			  var partialTypes;
			  if ( err || res.status !== 200 ) {
			    ifError = true;
			  } else {
			    partialTypes = JSON.parse(res.text);
			  }
			  partialTypes = partialTypes.map(function(partialType) {
			  	return {
			  		name: partialType,
			  		label: partialType.replace("-", " ").toUpperCase()
			  	}
			  });
			  self.mozmakerParitialTypes = partialTypes;
			  if ( !self.state.mozmakerPartialsLoaded ) {
			  	self.setState( { mozmakerPartialsLoaded: true } );
			  }
			});
	},

	mozmakerParitialTypes: null,

	componentWillMount: function() {
		this.getMozmakerPartials();
	},

	render: function() {

		console.log("*********** this.mozmakerParitialTypes *** ", this.mozmakerParitialTypes);
		var menuItems = this.getDefaultMenuItems( this.props.site );
		var blankPage = [{
			name: 'blank',
			label: this.translate( 'Blank' ).toUpperCase()
		}];
		// [MozNote] These are the all the page templates we have available in mozmaker-template
		var customPostTypes = !this.state.mozmakerPartialsLoaded ? [] : this.mozmakerParitialTypes;
		var customMenuItems = blankPage.concat(customPostTypes).map( function( postType ) {
			return {
				name: postType.name,
				label: postType.labels ? postType.labels.menu_name : postType.label,
				className: 'pages ' + postType.name,
				capability: 'edit_pages',
				config: 'manage/pages',
				// [Notes from Calypso] Required to build the menu item class name. Must be discernible from other
				// items' paths in the same section for item highlighting to work properly.
				link: '/page', // [MozNote] this prevents highlighting from working properly but we can't really fix this problem
				wpAdminLink: 'edit.php?post_type=page',
				showOnAllMySites: true,
				mozCustomPageType: true
			};
		} );

		menuItems = menuItems.concat( customMenuItems );

		return (
			<ul>
				{ menuItems.map( this.renderMenuItem ) }
			</ul>
		);
	}
} );

module.exports = PublishMenu;
