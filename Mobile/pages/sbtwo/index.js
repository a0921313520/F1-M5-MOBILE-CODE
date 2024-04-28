import React from "react";
import Layout from '$SBTWO/Layout';
import Skeleton from '$SBTWO/Skeleton/';
export default class Main extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
		};
	}
	render() {
		return (
			<Layout status={999}>
				<Skeleton />
			</Layout>
		);
	}
}
