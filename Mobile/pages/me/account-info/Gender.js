import Flexbox from '@/components/View/Flexbox/';
import Toast from '@/components/View/Toast';
import { checkIsLogin } from '@/lib/js/util';
import Layout from '@/components/Layout';
import classNames from 'classnames';
import ConfirmModal from '@/components/Me/ConfirmModal';
import { setMemberInfo } from '@/api/userinfo';
import { ACTION_User_getDetails } from '@/lib/redux/actions/UserInfoAction';
import { connect } from 'react-redux';
import { withRouter } from 'next/router';
import { ReactSVG } from '@/components/View/ReactSVG';
import React from 'react';
import Router from 'next/router';
import { getStaticPropsFromStrapiSEOSetting } from '@/lib/seo';

export async function getStaticProps() {
	return await getStaticPropsFromStrapiSEOSetting('/me/account-info'); //參數帶本頁的路徑
}
class Gender extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showCofirmModal: false,
			gender: (props.userInfo.memberInfo && props.userInfo.memberInfo.gender) || 'Male'
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
		if (this.props.userInfo.memberInfo.gender !== prevProps.userInfo.memberInfo.gender) {
			this.setState({
				gender: this.props.userInfo.memberInfo.gender
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

	selectChg = (value) => {
		if (this.props.initialVal) {
			return;
		} else {
			// this.props.setValue('gender',value)
			this.setState({ gender: value });
		}
	};

	cofirmModalChg = () => {
		this.setState({
			showCofirmModal: !this.state.showCofirmModal
		});
	};

	submit = () => {
		const { initialVal } = this.props;
		const { gender } = this.state;

		if (initialVal) {
			return;
		}

		if (!gender) {
			Toast.error('请选择性别。');
			return;
		}
		if (initialVal) {
			Toast.error('性别只能修改一次，如有疑问请联系客服');
			return;
		}

		this.cofirmModalChg();
	};

	updateGender = () => {
		const { gender } = this.state;
		const params = {
			key: 'Gender',
			value1: gender
		};
		this.cofirmModalChg();
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

	render() {
		const { gender } = this.state;
		const { memberInfo } = this.props.userInfo;
		let disabled = memberInfo && memberInfo.gender ? true : false;
		console.log(disabled);
		return (
			<div>
				<Layout
					title="FUN88乐天堂官网｜2022卡塔尔世界杯最佳投注平台"
					Keywords="乐天堂/FUN88/2022 世界杯/世界杯投注/卡塔尔世界杯/世界杯游戏/世界杯最新赔率/世界杯竞彩/世界杯竞彩足球/足彩世界杯/世界杯足球网/世界杯足球赛/世界杯赌球/世界杯体彩app"
					Description="乐天堂提供2022卡塔尔世界杯最新消息以及多样的世界杯游戏，作为13年资深品牌，安全有保障的品牌，将是你世界杯投注的不二选择。"
					BarTitle="Giới Tính"
					status={2}
					hasServer={false}
					barFixed={true}
					seoData={this.props.seoData}
				>
					<Flexbox className="AccountinfoContent" style={{borderBottom: '0'}}>
						<Flexbox className="Wrapper Dataset">
							<label>Giới Tính</label>
							<Flexbox
								marginTop="10px !important"
								className="select"
								onClick={() => this.selectChg('Male')}
							>
								<ReactSVG src={`/img/svg/${gender === 'Male' ? 'true' : 'false'}.svg`} />
								<span style={{marginTop: '0.1rem'}}>Nam</span>
							</Flexbox>
							<Flexbox className="select" onClick={() => this.selectChg('Female')}>
								<ReactSVG src={`/img/svg/${gender === 'Female' ? 'true' : 'false'}.svg`} />
								<span style={{marginTop: '0.1rem'}}>Nữ</span>
							</Flexbox>

							<p className="note">Giới tính chỉ có thể được cập nhật 1 lần duy nhất.</p>
						</Flexbox>

						<Flexbox
							className={classNames({
								disabled: disabled || gender == '',
								submit: !disabled && gender,
								btn: true
							})}
							onClick={() => {
								if (disabled && (memberInfo.gender || gender == '')) {
									return;
								}
								// globalGtag('Submit_gender_personal');
								this.submit();
							}}
						>
							Gửi
						</Flexbox>
					</Flexbox>
				</Layout>

				{this.state.showCofirmModal ? (
					<ConfirmModal cancel={this.cofirmModalChg} submit={this.updateGender} />
				) : null}
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Gender));
