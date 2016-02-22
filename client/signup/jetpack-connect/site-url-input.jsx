import React, { PropTypes } from 'react';


import Card from 'components/card';
import FormTextInput from 'components/forms/form-text-input';
import FormLabel from 'components/forms/form-label';
import Gridicon from 'components/gridicon';
import Button from 'components/button';
import Dialog from 'components/dialog';
const pluginURL = '/wp-admin/plugin-install.php?tab=plugin-information&plugin=jetpack';

export default React.createClass( {
	displayName: 'JetpackConnectSiteURLInput',

	getInitialState() {
		return {
			value: null,
			buttonEnabled: false,
			showDialog: false
		}
	},

	onCloseDialog() {
		this.setState( { showDialog: false } );
	},

	onShowDialog() {
		this.setState( { showDialog: true } );
	},

	goToPluginInstall() {
		console.log( pluginURL );
		window.location = 'http://' + this.state.value + pluginURL;
	},

	handleChange( event ) {
		this.setState( {
			value: event.target.value
		} );

		if( this.state.value != null ) {
			this.setState( {
				buttonEnabled: true
			} );
		}
	},

	render() {
		const dialogButtons = [ {
				action: 'cancel',
				label: this.translate( 'Cancel' )
			},
			{
				action: 'install',
				label: this.translate( 'Install Now' ),
				onClick: this.goToPluginInstall,
				isPrimary: true
			}
		];

		return (
			<Card className="jetpack-connect__site-url-input-container">

				<Dialog
					isVisible={ this.state.showDialog }
					onClose={ this.onCloseDialog }
					additionalClassNames="jetpack-connect__wp-admin-dialog"
					buttons={ dialogButtons } >

					<h1>{ this.translate( 'Hold on there, Sparky.' ) }</h1>
					<img
						className="jetpack-connect__install-wp-admin"
						src="/calypso/images/jetpack/install-wp-admin.svg"
						width={ 400 }
						height={ 294 } />
					<p>{ this.translate( 'We need to send you to your WordPress install so you can approve the Jetpack installation. Click the button in the bottom-right corner on the next screen to continue.' ) }</p>
				</Dialog>

				<FormLabel>{ this.translate( 'Site Address' ) }</FormLabel>
				<div className="site-address-container">
					<Gridicon
						size={ 24 }
						icon="globe" />
					<FormTextInput
						value={ this.state.value }
						onChange={ this.handleChange }
						placeholder={ this.translate( 'http://www.yoursite.com' ) } />
				</div>
				<Button
					primary
					disabled={ !Boolean( this.state.value ) }
					onClick={ this.onShowDialog }>{ this.translate( 'Get Jepack Now' ) }</Button>
			</Card>

		);
	}

} );
