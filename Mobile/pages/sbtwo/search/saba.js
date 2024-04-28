import React from "react";
import Layout from '$SBTWO/Layout';
import Search from '$SBTWO/Search';
import VendorSABA from '$SBTWOLIB/vendor/saba/VendorSABA';
export default class SearchPageSABA extends React.PureComponent {
  render() {
    return (
      <Layout status={0}>
        <Search Vendor={VendorSABA}/>
      </Layout>
    );
  }
}
