/*
 * @Author: Alan
 * @Date: 2023-01-09 04:04:53
 * @LastEditors: Alan
 * @LastEditTime: 2023-02-02 14:52:20
 * @Description: 错误页面
 * @FilePath: \Mobile\src\components\ErrorBoundary\index.js
 */
import React from "react";
import Layout from "@/components/Layout";
import ReactIMG from "@/components/View/ReactIMG";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    // Define a state variable to track whether is an error or not
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI

    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can use your own error logging service here
    this.setState({ hasError: true });
    console.log({ error, errorInfo });
  }


  handleOnClick(){
    this.setState({hasError:false});
  }

  render() {
    // Check if the error is thrown
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div>
          <Layout
            title="FUN88乐天堂官网｜2022卡塔尔世界杯最佳投注平台"
            Keywords="乐天堂/FUN88/2022 世界杯/世界杯投注/卡塔尔世界杯/世界杯游戏/世界杯最新赔率/世界杯竞彩/世界杯竞彩足球/足彩世界杯/世界杯足球网/世界杯足球赛/世界杯赌球/世界杯体彩app"
            Description="乐天堂提供2022卡塔尔世界杯最新消息以及多样的世界杯游戏，作为13年资深品牌，安全有保障的品牌，将是你世界杯投注的不二选择。"
            BarTitle="Lỗi Hệ Thống"
            status={5}
            hasServer={true}
          >
            <div className="main-maintain" key="RestrictAccess">
              <div className="illegal-body" style={{ alignItems: "center" }}>
                <ReactIMG className="restrict-img" src="/img/svg/Rederror.svg" />
                <div className="maintain-desc">Không thể tải dữ liệu</div>
                <button
                  style={{ width: "40%" }}
                  className="sportBtn"
                  type="button"
                  onClick={() => this.handleOnClick()}
                >
                  Làm Mới Trang
                </button>
              </div>
            </div>
          </Layout>
        </div>
      );
    }

    // Return children components in case of no error

    return this.props.children;
  }
}

export default ErrorBoundary;
