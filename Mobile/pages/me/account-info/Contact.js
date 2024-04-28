import React from 'react';
import Flexbox from '@/components/View/Flexbox/';
import Toast from '@/components/View/Toast';
import Layout from '@/components/Layout';
import classNames from 'classnames';
import { ReactSVG } from '@/components/View/ReactSVG';
import { setMemberInfo } from '@/api/userinfo';
import { ACTION_User_getDetails } from '@/lib/redux/actions/UserInfoAction';
import { connect } from 'react-redux';
import { withRouter } from 'next/router';
import { checkIsLogin } from '@/lib/js/util';
import Router from 'next/router';
import { getStaticPropsFromStrapiSEOSetting } from '@/lib/seo';

export async function getStaticProps() {
	return await getStaticPropsFromStrapiSEOSetting('/me/account-info'); //參數帶本頁的路徑
}
class ContactModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			offerContacts: (props.userInfo.memberInfo && props.userInfo.memberInfo.offerContacts) || ''
		};
	}

	componentDidMount() {
		if (checkIsLogin()) {
			this.GetUser();
		} else {
			Router.push('/register_login');
		}
	}

	componentDidUpdate(prevProps) {
		if (this.props.userInfo.memberInfo.offerContacts !== prevProps.userInfo.memberInfo.offerContacts) {
			this.setState({
				offerContacts: this.props.userInfo.memberInfo.offerContacts
			});
		}
	}

	/**
	 * @description: 获取会员详情
	 * @param {*}
	 * @return {*}
  	*/
	GetUser = () => {
		this.props.userInfo_getDetails();
	};

	updateContact = () => {
		const { offerContacts } = this.state;
		let count = Object.keys(offerContacts)
			.filter((ele) => ele == 'isCall' || ele == 'isSMS' || ele == 'isEmail')
			.filter((ele) => offerContacts[ele]).length;
		if (!offerContacts.IsNonMandatory && count < 2) {
			Toast.error('请至少选择两种联系方式');
			return;
		}
		const params = {
			key: 'offerContacts',
			value1: JSON.stringify(offerContacts)
		};
		Toast.loading('Đang gửi đi, xin vui lòng chờ...');
		setMemberInfo(params, (res) => {
			Toast.destroy();
			if (res.isSuccess == true) {
				Toast.success('Cập Nhật Thành Công', 3);
				this.GetUser();
				Router.push('/me/account-info');
			} else if (res.isSuccess == false) {
				Toast.error(res.result.message || 'Cập nhật không thành công!');
			} else {
				Toast.error('Cập nhật không thành công!');
			}
		});
	};

	selectChg = (Obj, key, value) => {
		this.setState({
			[Obj]: { ...this.state[Obj], [key]: value }
		});
	};

	render() {
		const { offerContacts } = this.state;
		let count = Object.keys(offerContacts)
			.filter((ele) => ele == 'isCall' || ele == 'isSMS' || ele == 'isEmail')
			.filter((ele) => offerContacts[ele]).length;
		let status = !offerContacts.IsNonMandatory && count < 2;
		return (
			<div>
				<Layout
					title="FUN88乐天堂官网｜2022卡塔尔世界杯最佳投注平台"
					Keywords="乐天堂/FUN88/2022 世界杯/世界杯投注/卡塔尔世界杯/世界杯游戏/世界杯最新赔率/世界杯竞彩/世界杯竞彩足球/足彩世界杯/世界杯足球网/世界杯足球赛/世界杯赌球/世界杯体彩app"
					Description="乐天堂提供2022卡塔尔世界杯最新消息以及多样的世界杯游戏，作为13年资深品牌，安全有保障的品牌，将是你世界杯投注的不二选择。"
					BarTitle="Phương Thức Liên Hệ"
					status={2}
					hasServer={false}
					barFixed={true}
					seoData={this.props.seoData}
				>
					<Flexbox className="AccountinfoContent">
						<Flexbox className="Wrapper Dataset" style={{ marginBottom: '10px' }}>
							<p style={{ marginBottom: '10px', lineHeight: '20px' }}>
								Chọn Phương Thức Liên Hệ
							</p>
							{Object.keys(offerContacts)
								.filter((ele) => ele == 'isCall' || ele == 'isSMS' || ele == 'isEmail')
								.map((val, index) => {
									return (
										<Flexbox
											key={val}
											className="select"
											onClick={() => {
												this.selectChg('offerContacts', val, !offerContacts[val]);
												// globalGtag(
												// 	val === 'isCall'
												// 		? 'Phone_contact_personal'
												// 		: val === 'isSMS'
												// 			? 'MSG_contact_personal'
												// 			: val === 'isEmail' ? 'Email_contact_personal' : ''
												// );
											}}
										>
											<ReactSVG src={`/img/svg/${offerContacts[val]}.svg`} />
											<span>
												{val === 'isCall' ? (
													'Gọi Điện'
												) : val === 'isSMS' ? (
													'Tin Nhắn'
												) : val === 'isEmail' ? (
													'Email'
												) : (
													''
												)}
											</span>
										</Flexbox>
									);
								})}
							{status && <p className="error">Vui lòng chọn ít nhất 2 phương thức liên hệ.</p>}
							<p style={{ marginTop: '10px', lineHeight: '20px' }}>
								Bạn có thể chọn ít nhất 2 phương thức để chúng tôi có thể liên hệ với bạn kịp thời để gửi quà tặng và thông báo các hoạt động mới!
							</p>
						</Flexbox>	

						<Flexbox
							className={classNames({
								disabled: status,
								submit: true,
								btn: true
							})}
							onClick={() => {
								this.updateContact();
								// globalGtag('Submit_contact_personal');
							}}
						>
							Gửi
						</Flexbox>
					</Flexbox>
				</Layout>
			</div>
		);
	}
}

const mapStateToProps = (state) => ({
	userInfo: state.userInfo
});

const mapDispatchToProps = {
	userInfo_getDetails: () => ACTION_User_getDetails()
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ContactModal));
