import React from "react";
import Layout from '$SBTWO/Layout';
import Search from '$SBTWO/Search';
import VendorBTI from '$SBTWOLIB/vendor/bti/VendorBTI';
export default class SearchPageBTI extends React.PureComponent {
  render() {
    return (
      <Layout status={0}>
        <Search Vendor={VendorBTI}/>
      </Layout>
    );
  }
}
