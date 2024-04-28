import React from "react";
import EventListing from '$SBTWO/Games/EventListing';
import VendorSABA from '$SBTWOLIB/vendor/saba/VendorSABA';
import {vendorStorage} from '../../src/lib/sbtwo/vendor/vendorStorage';
import { ApiPort } from '$SBTWOLIB/SPORTAPI';

export default class Sportsim extends React.PureComponent {
	static getInitialProps({ query }) {
		return { query };
	}
	constructor(props) {
		super(props);
		this.state = {
			reload: 1
		};
	}

	componentDidMount() {
		const isLoggedIn = vendorStorage.getItem("loginStatus") === 1;

		// 未登入才使用新data
		if (isLoggedIn && VendorSABA.configs.VL !== false) {
			VendorSABA.configs.VL = false;
			this.setState({ reload: Math.random() });
		} else if (!isLoggedIn) {
			this.CheckDataVersion();
		}
	}
	componentWillUnmount() {}

	CheckDataVersion() {
		const switchApiVersion = (useNewApi) => {
			if (VendorSABA.configs.VL !== useNewApi) {
				VendorSABA.configs.VL = useNewApi;
				this.setState({ reload: Math.random() });
			}
		};

		fetch(ApiPort.sbDataVersion)
			.then(res => {
				if (!res.ok) throw new Error(res.statusText);
				return res.json();
			})
			.then(data => {
				// 如果明確返回1.0，則切換到 vendor API (舊)模式，
				// 其他狀況(包含API獲取不到)，則保持 Data API (新)模式
				if (!data.version) throw new Error("Version empty");
				switchApiVersion(data.version !== "1.0");
			})
			.catch(error => {
				console.log(`Error: ${error}. Defaulting to version 2.0`);
				switchApiVersion(true);
			});
	}

	
	render() {
		return <EventListing Vendor={VendorSABA} key={this.state.reload} />;
	}
}
