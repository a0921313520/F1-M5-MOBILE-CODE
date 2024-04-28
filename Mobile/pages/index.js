/*
 * @Author: Alan
 * @Date: 2022-01-22 14:20:23
 * @LastEditors: Alan
 * @LastEditTime: 2023-02-01 17:19:55
 * @Description: 首页
 * @FilePath: \Mobile\pages\index.js
 */
import React from 'react';
import dynamic from 'next/dynamic';
import Layout from '@/components/Layout';

const SwiperTab = dynamic(import('@/components/Home/GamesBoxTabs'), {ssr: false});
import Footer from '@/components/Home/Footer';
import SwiperBox from '@/components/Home/SwiperBox';
import {CmsBannerPosition, CmsFeatureBannerPosition, WelcomeCall} from '@/api/home';
import {GetAnnouncements} from '@/api/announcement';
import Router from 'next/router';
import {checkIsLogin, numberWithCommas} from '@/lib/js/util';
import {ReactSVG} from '@/components/View/ReactSVG';
import {ACTION_UserInfo_getBalance} from '@/lib/redux/actions/UserInfoAction';
import {connect} from 'react-redux';
import Flexbox from '@/components/View/Flexbox/';
import LazyLoad from 'react-lazyload';
import ReferModal from '@/components/Home/ReferModal';
import Modal from '@/components/View/Modal';
import Checkbox from '@/components/View/Checkbox';
import { BsCheckSquareFill } from 'react-icons/bs';
import  WelecomeBanner from '@/components/Home/WelcomeBanner';
import Toast from '@/components/View/Toast';

import { getStaticPropsFromStrapiSEOSetting } from '@/lib/seo';

export async function getStaticProps() {
  return await getStaticPropsFromStrapiSEOSetting('/'); //參數帶本頁的路徑
}

class Main extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            //顶部大轮播图
            CmsBanner: ['null', 'null', 'null'],
            //中间小轮播图
            FeatureBanner: ['null', 'null', 'null', 'null'],
            //检查是否已经登录
            checkLogin: false,
            //顶部跑马灯公告
            AnnouncementsByMember: [],
            DoneFeatureBanner: '100px',
            checkedFirstLogin: false,
            firstLoginModal: false
        };
    }

    componentDidMount() {
        //获取CMS 相关Banner
        this.GetFeatureBanner();
        this.setState(
            {
                // CmsBanner: [
                //     {
                //         title: '',
                //         body: '',
                //         category: '',
                //         cmsImageUrl: window.location.origin + process.env.BASE_PATH + '/img/usdtm.webp',
                //         action: {actionId: 9999}
                //     }
                // ]
            },
            () => {
                setTimeout(() => {
                    this.GetCmsBanne();
                }, 4000);
            }
        );
        //检查是否登录
        this.setState({
            checkLogin: checkIsLogin() ? true : false
        });

        // if (checkIsLogin()) {
            //获取顶部公告
            this.Announcements();
        // }

        //刷新钱包余额
        this.props.userInfo_getBalance(true);
        // window.Pushgtagdata && Pushgtagdata(window.location.origin, 'Launch', `home`);
        if (localStorage.getItem('isFirstLogin')) {
            this.setState({firstLoginModal: true})
            localStorage.removeItem("isFirstLogin");
        }
    }

    componentDidUpdate(prevProps,prevState) {
        if (prevProps.userInfo?.memberInfo?.userName !== this.props.userInfo?.memberInfo?.userName  && this.props.userInfo?.memberInfo?.userName) {
            // Toast.success(`Chào mừng bạn: ${this.props.userInfo.memberInfo.userName}`, 3);
        }
    }

    /**
     * @description: 公告
     * @param {*}
     * @return {*}
     */
    Announcements() {
        let params = {
            messageTypeOptionID: 10,
            pageSize: 8,
            pageIndex: 1,
            siteId: 38
        };

        GetAnnouncements(params, (res) => {
            if (res) {
                if (res.isSuccess && res.result) {
                    this.setState({
                        AnnouncementsByMember: res.result?.announcementsByMember ?? []
                    });
                }
            }
        });
    }

    /**
     * @description:  获取首页轮播图
     * @param {*}
     * @return {*}
     */
    GetCmsBanne = () => {
        let Status = checkIsLogin() ? '?login=after&displaying_webp' : undefined;
        let hasGetData;
        if (sessionStorage.getItem('CmsBannerlogin' + Status)) {
            hasGetData = true;
            let CmsBanner = JSON.parse(sessionStorage.getItem('CmsBannerlogin' + Status));
            this.setState({
                CmsBanner: CmsBanner
            });
        }

        CmsBannerPosition(Status, (res) => {
            if (res.message === 'data not found') {
                return;
            }
            if (res) {
                sessionStorage.setItem('CmsBannerlogin' + Status, JSON.stringify(res));
                if (!hasGetData) {
                    this.setState({
                        CmsBanner: res
                    });
                }
            }
        });
    };

	GetFeatureBanner() {
		let Status = checkIsLogin() ? '?login=after&displaying_webp' : undefined;
		let hasFeatureData;
		if (sessionStorage.getItem('FeatureBanner' + Status)) {
			hasFeatureData = true;
			let FeatureBanner = JSON.parse(sessionStorage.getItem('FeatureBanner' + Status));
			// 是否顯示特定活動Banner由後端api控制，不須前端判斷
			this.setState({FeatureBanner})
		}
		CmsFeatureBannerPosition(Status, (res) => {
			if (res) {
				sessionStorage.setItem('FeatureBanner' + Status, JSON.stringify(Array.isArray(res) ? res : []));

                if (!hasFeatureData) {
                    this.setState({
                        FeatureBanner: Array.isArray(res) ? res : []
                    });
                }
                this.setState({
                    DoneFeatureBanner: Array.isArray(res) && res.length != 0 ? '100px' : '0'
                });
            }
        });
    }

    callWelcomeCall(key) {
        this.setState({
            firstLoginModal: false
        })
        WelcomeCall(this.state.checkedFirstLogin,(res)=>{
            console.log(res, 'res')
        })
        if (key == 1) {
            Pushgtagdata(`Welcome_Deposit`, 'Go to Deposit', 'Welcome_Deposit_C_Deposit');
            Router.push('/deposit');
        } 
        if (key == 2) {
            Pushgtagdata(`Welcome_Deposit`, 'Skip Deposit', 'Welcome_Deposit_C_Skip'); 
        }
    }

	render() {
        const {CmsBanner, FeatureBanner, checkLogin, AnnouncementsByMember} = this.state;
		return (
			<Layout
				title="FUN88乐天堂官网｜2022卡塔尔世界杯最佳投注平台"
				Keywords="乐天堂/FUN88/2022 世界杯/世界杯投注/卡塔尔世界杯/世界杯游戏/世界杯最新赔率/世界杯竞彩/世界杯竞彩足球/足彩世界杯/世界杯足球网/世界杯足球赛/世界杯赌球/世界杯体彩app"
				Description="乐天堂提供2022卡塔尔世界杯最新消息以及多样的世界杯游戏，作为13年资深品牌，安全有保障的品牌，将是你世界杯投注的不二选择。"
				BarTitle="嗨FUN双旦 惠不可挡"
				status={3}
				hasServer={true}
				barFixed={true}
                seoData={this.props.seoData}
			>
				<div className="Home container">
					{/* 跑马灯公告 */}
                    <SwiperBox Announcements={AnnouncementsByMember} Type={'Announcements'}/>
					{/*轮播图 */}
                    <div style={{minHeight: '180px'}}>
                        <SwiperBox TopBanner={CmsBanner} Type={'TopBanner'}/>
					</div>
					<div className="Content">
						{/* 区分未登录/登录 余额与快捷入口 充值 提款 按钮 */}
						{!checkLogin && (
							<div className="BlancButtonBox LoginBefore">
								<div className="Left">
									<span>
                                    Chào mừng bạn đến với  <br/>Fun88!
									</span>
                                </div>
                                <div className="Right">
                                    <Flexbox className="LoginBox" flexWrap="nowrap">
                                        <button
                                            className="Login"
                                            onClick={() => {
                                                Router.push('/register_login');
                                                Pushgtagdata('Home','Go to Login','Home_C_Login');
                                            }}
                                        >
                                            Đăng Nhập
                                        </button>
                                        <button
                                            className="Register"
                                            onClick={() => {
                                                Router.push('/register_login?type=Register');
                                                Pushgtagdata('Home','Go to Register','Home_C_Register');
                                            }}
                                        >
                                            Đăng Ký
                                        </button>
                                    </Flexbox>
                                </div>
                            </div>
                        )}
                        {/* 已登录 */}
                        {checkLogin && (
                            <div className="BlancButtonBox LoginAfter">
                                <div className="Left">
                                    <small>Tổng Số Dư {this.props.userInfo.isGettingBalance}</small>
                                    <div className="Number">
                                       <span>{numberWithCommas(this.props.userInfo.Balance.TotalBal)} {!this.props.userInfo.Balance.TotalBal || this.props.userInfo.isGettingBalance ? '' : ' đ'}</span>
                                        <ReactSVG
                                            className={
                                                this.props.userInfo.isGettingBalance ? 'refresh-loading ' : 'refresh'
                                            }
                                            src="/img/P5/svg/refresh.svg"
                                            onClick={() => {
                                                Pushgtagdata('Home','Refresh Balance','Home_C_RefreshBalance');
                                                this.props.userInfo_getBalance(true);
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="Right">
                                    <div className="ActionBox ">
                                        <div
                                            className="Btn"
                                            onClick={() => {
                                                Router.push('/deposit');
                                                Pushgtagdata('Home','Go to Deposit','Home_C_Deposit');
                                            }}
                                        >
                                            <ReactSVG src="/img/P5/svg/deposit.svg"/>
                                            <span className="TargetName">Gửi Tiền</span>
                                        </div>
                                        <div
                                            className="Btn"
                                            onClick={() => {
                                                Router.push('/Transfer');
                                                Pushgtagdata('Home','Go to Transfer','Home_C_Transfer');
                                            }}
                                        >
                                            <ReactSVG src="/img/P5/svg/transfer.svg"/>
                                            <span className="TargetName">Chuyển Quỹ</span>
                                        </div>
                                        <div
                                            className="Btn"
                                            onClick={() => {
                                                Router.push('/withdrawal');
                                                Pushgtagdata('Home','Go to Withdraw','Home_C_Withdraw');
                                            }}
                                        >
                                            <ReactSVG src="/img/P5/svg/withdraw.svg"/>
                                            <span className="TargetName">Rút Tiền</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div style={{height: this.state.DoneFeatureBanner}} key={JSON.stringify(FeatureBanner)}>
                            {/* Mini 轮播图 */}
                            <SwiperBox CenterBanner={FeatureBanner} Type={'CenterBanner'}/>
                        </div>
                    </div>
                    {/* 游戏区块 */}
                    <div
                        className="GameBox"
                        style={{
                            minHeight: '280px',
                            marginTop: FeatureBanner && FeatureBanner.length == 0 ? '30px' : 'unset'
                        }}
                    >
                        <SwiperTab/>
                    </div>
                    {/* 合作伙伴 */}
                    <LazyLoad height={300} offset={-150}>
                        <Footer/>
                    </LazyLoad>
                </div>
                <Modal
                visible={this.state.firstLoginModal}
                className="firstLoginModal"
                transparent
                maskClosable={false}
                closable={false}
                >
                    <div className='firstLoginContent'>
                        <div className='firstContent'>
                            Thưởng Đăng Ký 100%<br/>Thể Thao/ E-sports
                        </div>
                        <div className='firstContent'>
                            Thưởng Đăng Ký 100%<br/>Mọi Sảnh Casino
                        </div>
                        <div className='firstContent'>
                            Thưởng Đăng Ký 100%<br/>Tất Cả Trò Chơi Slot
                        </div>
                        <div style={{marginTop: '0.5rem', marginBottom: '0.5rem'}}>
                            <Checkbox
                                icon={<BsCheckSquareFill color="#00A6FF" size={18} />}
                                checked={this.state.checkedFirstLogin}
                                onChange={(value) => {
                                    Pushgtagdata(`Welcome_Deposit`, `${value ? 'Agree' : 'Disagree'} Receive Call`, `Welcome_Deposit_C_${value ? 'Agree' : 'Disagree'}`);
                                    this.setState({
                                        checkedFirstLogin: value
                                    });
                                }}
                                label={
                                    <div style={{color: 'black'}}>
                                        Tôi đồng ý nhận cuộc gọi tư vấn
                                    </div>
                                }
                            />
                            {this.state.checkedFirstLogin && 
                                <div style={{color: '#666666', marginTop: '0.2rem'}}>
                                    Bộ phận chăm sóc khách hàng của chúng tôi sẽ liên hệ bạn qua số điện thoại bạn đã đăng ký trong vòng 24 giờ tới qua đầu số +852 hoặc 00852. Xin cám ơn!
                                </div>
                            }
                        </div>
                        <div
							className={`firstLoginBtn`}
							onClick={() => {
                                this.callWelcomeCall(1);
							}}
						>
							Gửi Tiền Ngay
						</div>
                        <div className='firstLoginSkip' onClick={()=> {this.callWelcomeCall(2);}}>
                            Gửi Tiền Sau 
                        </div>
                    </div>
                </Modal>
                {/* 推荐好友弹窗 */}
                <ReferModal Page="Home"/>
                
                {/* 欢迎新人 */}
                <WelecomeBanner/>
            </Layout>
        );
    }
}

const mapStateToProps = (state) => ({
    userInfo: state.userInfo
});

const mapDispatchToProps = {
    userInfo_getBalance: (forceUpdate = false) => ACTION_UserInfo_getBalance(forceUpdate)
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
