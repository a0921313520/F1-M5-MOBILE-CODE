import moment from 'moment';
import Flexbox from '@/components/View/Flexbox/';
import DatePicker from '@/components/View/DatePicker';
import Toast from '@/components/View/Toast';
import Layout from '@/components/Layout';
import classNames from 'classnames';
import { now } from '@/lib/js/datePickerUtils';
import { ReactSVG } from '@/components/View/ReactSVG';
import ConfirmModal from '@/components/Me/ConfirmModal';
import { setMemberInfo } from '@/api/userinfo';
import { ACTION_User_getDetails } from '@/lib/redux/actions/UserInfoAction';
import { connect } from 'react-redux';
import { withRouter } from 'next/router';
import { checkIsLogin } from '@/lib/js/util';
import React from 'react';
import Router from 'next/router';
import { getStaticPropsFromStrapiSEOSetting } from '@/lib/seo';

export async function getStaticProps() {
	return await getStaticPropsFromStrapiSEOSetting('/me/account-info'); //參數帶本頁的路徑
}
class Birthday extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			date: '',
			showCofirmModal: false,
			birthday: (props.userInfo.memberInfo && props.userInfo.memberInfo.dob) || ''
		};
	}

	componentDidMount() {
		if (checkIsLogin()) {
			this.GetUser();
		} else {
			Router.push('/register_login');
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

	componentDidUpdate(prevProps) {
		if (this.props.userInfo.memberInfo.dob !== prevProps.userInfo.memberInfo.dob) {
			this.setState({
				birthday: this.props.userInfo.memberInfo.dob
			});
		}
	}

	cofirmModalChg = () => {
		this.setState({
			showCofirmModal: !this.state.showCofirmModal
		});
	};

	submit = () => {
		const { birthday } = this.state;

		if (!birthday) {
			Toast.error('请选择出生日期！');
			return;
		}

		this.cofirmModalChg();
	};

	/**
	 * @description: 更新生日资料
	 * @param {*} 
	 * @return {*}
	*/
	updateBirthday = () => {
		const { birthday } = this.state;
		const params = {
			key: 'DOB',
			value1: birthday
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
		const minDate = moment(new Date('1930-01-01'))._d;
		const maxDate = moment(new Date()).subtract(21, 'y')._d;
		const { birthday } = this.state;
		const { memberInfo } = this.props.userInfo;
		let disabled = memberInfo && memberInfo.dob && memberInfo.dob !== '' ? true : false;
		return (
			<React.Fragment>
				<Layout
					title="FUN88乐天堂官网｜2022卡塔尔世界杯最佳投注平台"
					Keywords="乐天堂/FUN88/2022 世界杯/世界杯投注/卡塔尔世界杯/世界杯游戏/世界杯最新赔率/世界杯竞彩/世界杯竞彩足球/足彩世界杯/世界杯足球网/世界杯足球赛/世界杯赌球/世界杯体彩app"
					Description="乐天堂提供2022卡塔尔世界杯最新消息以及多样的世界杯游戏，作为13年资深品牌，安全有保障的品牌，将是你世界杯投注的不二选择。"
					BarTitle="Ngày Sinh"
					status={2}
					hasServer={false}
					barFixed={true}
					seoData={this.props.seoData}
				>
					<Flexbox className="AccountinfoContent">
						<Flexbox className="Wrapper Dataset">
							<label>Ngày Sinh</label>
							<DatePicker
								datePickerProps={{
									defaultDate: maxDate,
									mode: 'date',
									maxDate: maxDate,
									minDate: minDate
								}}
								title="Chọn Ngày"
								isOpen={this.state.isOpen}
								onChange={(v) => {
									this.setState({
										birthday: moment(v).format('YYYY-MM-DD')
									});
								}}
								onClose={() => {
									this.setState({ isOpen: false });
								}}
							>
								<Flexbox
									onClick={() => {
										this.setState({
											isOpen: !this.state.isOpen
										});
									}}
									className="CenterDown"
								>
									<span>
										{birthday ? moment(new Date(birthday)).format('DD-MM-YYYY') : 'DD-MM-YYYY'}
									</span>
									<ReactSVG src="/img/svg/d.svg" />
								</Flexbox>
							</DatePicker>

							<p className="note">Ngày sinh chỉ có thể được cập nhật 1 lần duy nhất.</p>
						</Flexbox>
						<Flexbox
							className={classNames({
								disabled: disabled || !birthday,
								submit: !disabled && birthday,
								btn: true
							})}
							onClick={() => {
								if (disabled || !birthday) {
									return;
								}
								// globalGtag('Submit_BOD_personal');
								this.submit();
							}}
						>
							Gửi
						</Flexbox>
					</Flexbox>

					{this.state.showCofirmModal ? (
						<ConfirmModal cancel={this.cofirmModalChg} submit={this.updateBirthday} />
					) : null}
				</Layout>
			</React.Fragment>
		);
	}
}

const mapStateToProps = (state) => ({
	userInfo: state.userInfo
});

const mapDispatchToProps = {
	userInfo_getDetails: () => ACTION_User_getDetails()
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Birthday));
