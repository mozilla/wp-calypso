/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import DomainPrimaryFlag from 'my-sites/upgrades/domain-management/components/domain/primary-flag';
import Notice from 'components/notice';
import { type as domainTypes } from 'lib/domains/constants';

var Gridicon = require( 'components/gridicon' );

const ListItem = React.createClass( {
	render() {
		return (
			<CompactCard className="domain-management-list-item">
				<div className="domain-management-list-item__link" onClick={ this.props.onClick }>
					<Gridicon className='card__link-indicator' icon='chevron-right' />
					<div className="domain-management-list-item__title">
						{ this.props.domain.name }
					</div>

					<div className="domain-management-list-item__meta">
						<span className="domain-management-list-item__type">{ this.getDomainTypeText() }</span>
						{ this.props.domain.type !== 'WPCOM' ? this.isDomainExpired( this.props.domain ) : null }
						<DomainPrimaryFlag domain={ this.props.domain } />
					</div>
				</div>
			</CompactCard>
		);
	},

	isDomainExpired( domain ) {
		var expirationTime = domain.expirationMoment.startOf( 'day' ).diff( this.moment().startOf( 'day' ), 'days' );

		if ( domain.expired ) {
			if ( expirationTime === 0 || -1 || 1 ) {
				return (
					<Notice isCompact status="is-error" icon="spam">
						{ this.translate( 'Expired a day ago' ) }
					</Notice>
				);
			}

			return (
				<Notice isCompact status="is-error" icon="spam">
					{ this.translate( 'Expired %(timeSinceExpiry)s days ago', {
						args: {
							timeSinceExpiry: -( expirationTime )
						},
					} ) }
				</Notice>
			);
		}

		if ( expirationTime < 30 ) {
			if ( expirationTime === 0 || 1 ) {
				return (
					<Notice isCompact status="is-error" icon="spam">
						{ this.translate( 'Expires today' ) }
					</Notice>
				);
			}

			return (
				<Notice isCompact status="is-error" icon="spam">
					{ this.translate( 'Expires in %(timeUntilExpiry)s days', {
						args: {
							timeUntilExpiry: expirationTime
						},
					} ) }
				</Notice>
			);
		}
	},

	getDomainTypeText() {
		switch ( this.props.domain.type ) {
			case domainTypes.MAPPED:
				return this.translate( 'Mapped Domain' );

			case domainTypes.REGISTERED:
				return this.translate( 'Registered Domain' );

			case domainTypes.SITE_REDIRECT:
				return this.translate( 'Site Redirect' );

			case domainTypes.WPCOM:
				return this.translate( 'Included with Site' );
		}
	}
} );

export default ListItem;
