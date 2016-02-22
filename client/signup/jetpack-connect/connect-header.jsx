import React, { PropTypes } from 'react';

import StepHeader from '../step-header';

export default React.createClass( {
	displayName: 'JetpackConnectHeader',

	propTypes: {
		showLogo: PropTypes.bool,
		label: PropTypes.string
	},

	getDefaultProps() {
		return {
			showLogo: true,
			label: ''
		}
	},

	renderJetpackLogo() {
		return (
			<img className="jetpack-logo" src="/calypso/images/jetpack/jetpack-manage.svg" width={ 150 } height={ 150 } />
		);
	},

	render() {
		return (
			<div className="jetpack-connect__header-container">
				{ this.props.showLogo
				 	? this.renderJetpackLogo()
					: null }
				<div className="flow-progress-indicator">
					{ this.translate( 'Step %(stepNumber)d of %(stepTotal)d', {
						args: {
							stepNumber: this.props.step,
							stepTotal: this.props.steps
						}
					} ) }
				</div>
				<StepHeader { ...this.props }/>
			</div>
		);
	}
} );
