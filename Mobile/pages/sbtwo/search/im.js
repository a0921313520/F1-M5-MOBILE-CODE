import React from "react";
import Layout from '$SBTWO/Layout';
import Search from '$SBTWO/Search';
import VendorIM from '$SBTWOLIB/vendor/im/VendorIM';
export default class SearchPageIM extends React.PureComponent {
  render() {
    return (
      <Layout status={0}>
        <Search Vendor={VendorIM}/>
      </Layout>
    );
  }
}
