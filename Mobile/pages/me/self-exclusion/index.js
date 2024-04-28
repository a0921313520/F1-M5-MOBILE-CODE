import React from "react";
import Layout from "@/components/Layout";
import { amountReg, nonNumericWithoutDecimal } from "@/lib/SportReg";
import Toast from "@/components/View/Toast";
import Flexbox from "@/components/View/Flexbox/";
import Router from "next/router";
import {
  SelfExclusionsInfo,
  UpdateSelfExclusionsInfo,
} from "@/api/selflimiting";
import { checkIsLogin } from "@/lib/js/util";
import ReactIMG from "@/components/View/ReactIMG";
import DropDownSingle from "@/components/Common/DropDownSingle/";
import { getStaticPropsFromStrapiSEOSetting } from '@/lib/seo';

export async function getStaticProps() {
	return await getStaticPropsFromStrapiSEOSetting('/me/self-exclusion'); //參數帶本頁的路徑
}
class _Selfrestriction extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      amount: '',
      radioValue: "0",
      selItem: { id: "0", label: "Vui lòng chọn thời gian giới hạn" },
      Checkedvalue: [],
      isCheckedAmount: false,
      isCheckedLogin: false,
      submitIsdisband: false,
      isCheckDayRange: false,
    };

    this.radioList = [
      {
        id: "7",
        label: "Tự loại trừ trong vòng 7 ngày tiếp theo",
        piwikId: "7days_selfexclusion_profilepage",
      },
      {
        id: "90",
        label: "Tự loại trừ trong vòng 90 ngày tiếp theo",
        piwikId: "90days_selfexclusion_profilepage",
      },
      {
        id: "-1",
        label: "Tự loại trừ vĩnh viễn",
        piwikId: "Permanentdays_selfexclusion_profilepage",
      },
    ];
  }

  componentDidMount() {
    if (checkIsLogin()) {
      this.GETSelfExclusions();
    } else {
      Router.push("/register_login");
    }
  }

  changeRadio = (e) => {
    console.log(e);
    // globalGtag(e.piwikId);
    this.setState({
      radioValue: e.id,
    });
  };

  GETSelfExclusions = () => {
    Toast.loading("Đang tải...");
    SelfExclusionsInfo((res) => {
      Toast.destroy();
      if (res.isSuccess && res.result) {
        const {transferLimit, selfExcludeDuration, transferLimitDayRange, status } =
          res.result;
        let check = [];
        if (transferLimit) {
          check.push("CheckedAmount");
        }
        if (transferLimitDayRange) {
          check.push("CheckedLogin");
        }
        console.log("GETSelfExclusions res=== : ", res.result);
        if (status) {

          this.setState({
            resultInfo: res.result,
            amount: transferLimit, // 轉帳限額
            HaveAmount: transferLimit == "" ? false : true,
            radioValue: selfExcludeDuration + "",
            isCheckedAmount: transferLimit ? true : false,
            Checkedvalue: check, // 轉帳限額，轉帳限額時間
            isCheckedLogin: transferLimitDayRange ? true : false,
            submitIsdisband:
              transferLimit || transferLimitDayRange != 0 ? true : false,
            isCheckDayRange:
              transferLimit && transferLimitDayRange != 0 ? true : false,
            selItem:
              transferLimitDayRange == 7
                ? this.radioList[0]
                : transferLimitDayRange == 90
                ? this.radioList[1]
                : transferLimitDayRange == -1
                ? this.radioList[2]
                : this.radioList[0],
          });
        }
        if (!this.state.isCheckDayRange) {
          this.setState({
            selItem: { id: "0", label: "Vui lòng chọn thời gian giới hạn" },
          });
        }
      }
    });
  };

  amountChg = (e) => {
    // globalGtag("Amount_selfexclusion_profilepage");
    this.setState({
      amount: e.target.value.replace(nonNumericWithoutDecimal,""),
    });
  };

  SetSelfExclusions = () => {
    // globalGtag("Confirm_selfexclusion_profilepage");
    const { amount, radioValue, Checkedvalue } = this.state;
    let items = this.state.Checkedvalue.slice();
    let CheckedAmount = items.indexOf("CheckedAmount") != -1;
    let CheckedLogin = items.indexOf("CheckedLogin") != -1;
    if (Checkedvalue == "") {
      Toast.error("请选择限制类型！");
      return;
    }
    if (!amountReg.test(amount) && CheckedAmount) {
      Toast.error("金额格式错误");
      return;
    }
    // if (Number(amount) > 99999 && CheckedAmount) {
    //   Toast.error("最大金额不能超过99999");
    //   return;
    // }
    let daex;
    /** NotAvailable,SevenDays,NinetyDays,Permanent ***/

    if (radioValue === "0") {
      daex = "NotAvailable";
    } else if (radioValue === "7") {
      daex = "SevenDays";
    } else if (radioValue === "90") {
      daex = "NinetyDays";
    } else if (radioValue === "-1") {
      daex = "Permanent";
    }
    const MemberData = {
      IsEnabled: true,
      setting: CheckedLogin ? daex : "NotAvailable",
      limitAmount: CheckedAmount ? Number(amount) : "", //限制转账金额
      betLimitDayRange: CheckedLogin ? radioValue : 0, //限制登录的天数
    };
    Toast.loading();
    UpdateSelfExclusionsInfo(MemberData, (res) => {
      Toast.destroy();
      if (res.isSuccess == true) {
        Toast.success("Thiết Lập Thành Công");
        setTimeout(() => {
          this.GETSelfExclusions();
        }, 3000)
      } else {
        Toast.error('Thiết Lập Không Thành Công');
      }
    });
  };

  handleChange = (event) => {
    let item = event.target.value;
    let items = this.state.Checkedvalue.slice();
    let index = items.indexOf(item);
    index === -1 ? items.push(item) : items.splice(index, 1);
    console.log(items);
    this.setState({
      Checkedvalue: items,
      isCheckedAmount: items.indexOf("CheckedAmount") !== -1,
      isCheckedLogin: items.indexOf("CheckedLogin") !== -1,
    });
  };

  render() {
    const {
      HaveAmount,
      amount,
      selItem,
      isCheckedAmount,
      isCheckedLogin,
      submitIsdisband,
      isCheckDayRange,
      radioValue
    } = this.state;

    return (
      <Layout
        title="FUN88乐天堂官网｜2022卡塔尔世界杯最佳投注平台"
        Keywords="乐天堂/FUN88/2022 世界杯/世界杯投注/卡塔尔世界杯/世界杯游戏/世界杯最新赔率/世界杯竞彩/世界杯竞彩足球/足彩世界杯/世界杯足球网/世界杯足球赛/世界杯赌球/世界杯体彩app"
        Description="乐天堂提供2022卡塔尔世界杯最新消息以及多样的世界杯游戏，作为13年资深品牌，安全有保障的品牌，将是你世界杯投注的不二选择。"
        BarTitle="Tự Loại Trừ"
        status={2}
        hasServer={true}
        barFixed={true}
        seoData={this.props.seoData}
      >
        <div id="selfSet" className="selfSet">
          <ReactIMG className="topBg" src="/img/about/limit.jpg" />
          <div className="selfSet-container">
            <div className="shadow-wrapper selfSet-introduce">
              <center className="title">
                <h2>Tự Loại Trừ</h2>
              </center>
              <p style={{lineHeight: 'normal'}}>
                Nếu bạn cảm thấy rằng bạn đang gặp khó khăn trong việc kiểm soát hoạt động đánh bạc của bạn, có lẽ bạn nên tự loại trừ mình khỏi việc này trong vòng 7 ngày hoặc 3 tháng. Bạn có thể liên lạc với dịch vụ khách hàng của chúng tôi để có sự hỗ trợ và tư vấn.
              </p>
            </div>
            <div className="shadow-wrapper">
              <Flexbox flexWrap="wrap">
                <h3>
                  <input
                    type="radio"
                    value="CheckedAmount"
                    onChange={this.handleChange}
                    checked={isCheckedAmount}
                  />
                    Giới Hạn Số Tiền Chuyển{this.state.CheckedAmount}
                </h3>
                <input
                  className="selfSet-input"
                  placeholder="Vui lòng nhập vào hạn mức chuyển tiền"
                  value={amount}
                  onChange={(e) => this.amountChg(e)}
                  maxLength={6}
                  disabled={HaveAmount || !isCheckedAmount}
                />
                <p className="red">
                  Lưu ý: Tổng số tiền bạn chuyển trong vòng 7 ngày sẽ dựa trên số tiền bạn điền.
                </p>
              </Flexbox>
              <Flexbox flexWrap="wrap" className="settime">
                <h3>
                  <input
                    type="radio"
                    value="CheckedLogin"
                    checked={isCheckedLogin}
                    onChange={this.handleChange}
                  />
                  Giới Hạn Đăng Nhập
                </h3>
                <DropDownSingle
                  disabled={isCheckDayRange}
                  data={this.radioList}
                  selItem={selItem}
                  changeSel={this.changeRadio}
                  needBuleTick = {true}
                  radioValue={radioValue}
                />
                <p
                  style={{
                    color: isCheckedLogin ? "red" : "#BCBEC3",
                    lineHeight: 'normal'
                  }}
                >
                  Sau khi mở, bạn sẽ không thể gửi tiền, chuyển khoản và chơi trong thời gian đã chọn.
                </p>
              </Flexbox>
            </div>

            {!submitIsdisband && (
              <Flexbox className="submit">
                <span
                  className="selfSet-button  color-white"
                  onClick={this.SetSelfExclusions}
                >
                  Lưu
                </span>
              </Flexbox>
            )}
          </div>
        </div>
      </Layout>
    );
  }
}

export default _Selfrestriction;
