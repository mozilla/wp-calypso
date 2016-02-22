import React, { PropTypes } from 'react';

import Main from 'components/main';
import SiteURLInput from './site-url-input';
import ConnectHeader from './connect-header';
import LoggedOutForm from 'components/logged-out-form';
import LoggedOutFormLinks from 'components/logged-out-form/links';
import LoggedOutFormLinkItem from 'components/logged-out-form/link-item';

export default React.createClass( {
	displayName: 'JetpackConnectSiteURLEntry',

	render() {
		return (
			<Main className="jetpack-connect__main">
				<div className="jetpack-connect__site-url-entry-container">
					<ConnectHeader
						headerText={ this.translate( 'Install Jetpack' ) }
						subHeaderText={ this.translate( 'Get WordPress.com connected to your self-hosted site.' ) }
						step={ 1 }
						steps={ 3 } />
					<SiteURLInput />

					<LoggedOutFormLinks>
						<LoggedOutFormLinkItem href="http://jetpack.com">{ this.translate( 'Install Jetpack Manually' ) }</LoggedOutFormLinkItem>
						<LoggedOutFormLinkItem href="/start">{ this.translate( 'Start a new site on WordPress.com' ) }</LoggedOutFormLinkItem>
					</LoggedOutFormLinks>
				</div>
			</Main>

		);
	}
} );
