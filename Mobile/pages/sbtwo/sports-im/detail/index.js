import React from "react";
import Layout from '$SBTWO/Layout';
import Bettingetail from '$SBTWO/Games/Betting-detail/'; /* 游戏详情 */
import VendorIM from '$SBTWOLIB/vendor/im/VendorIM';
export default class Gametype extends React.PureComponent {
	static getInitialProps({ query }) {
		return { query };
	}
	render() {
		return (
			<Layout landscape={true} status={0}>
				<Bettingetail className="vendor-detail" Vendor={VendorIM} FullScreenstatus={false} />
			</Layout>
		);
	}
}
