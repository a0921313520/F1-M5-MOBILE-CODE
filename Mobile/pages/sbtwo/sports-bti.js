import React from "react";
import EventListing from '$SBTWO/Games/EventListing';
import VendorBTI from '$SBTWOLIB/vendor/bti/VendorBTI';

export default class Sportsbti extends React.PureComponent {
	static getInitialProps({ query }) {
		return { query };
	}
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentDidMount() {}
	componentWillUnmount() {}

	render() {
		return <EventListing Vendor={VendorBTI} />;
	}
}
