import Toast from '@/components/View/Toast';
import Layout from '@/components/Layout';
import React from 'react';
import { nameReg } from '@/lib/SportReg';
import { setMemberInfo, getQuestion } from '@/api/userinfo';
import Modal from '@/components/View/Modal/';
import Flexbox from '@/components/View/Flexbox/';
import InputItem from '@/components/View/Input';
import { ReactSVG } from '@/components/View/ReactSVG';
import classNames from 'classnames';
import { ACTION_User_getDetails } from '@/lib/redux/actions/UserInfoAction';
import { connect } from 'react-redux';
import Router from 'next/router';
import { getStaticPropsFromStrapiSEOSetting } from '@/lib/seo';

export async function getStaticProps() {
	return await getStaticPropsFromStrapiSEOSetting('/me/account-info'); //參數帶本頁的路徑
}
class _SafeQuestionModal extends React.Component {
	constructor(props) {
		super(props);
		let securityAnswer = props.userInfo.memberInfo.securityAnswer;
		this.state = {
			questionList: [],
			showCofirmModal: false,
			SecretQID: props.userInfo.memberInfo.secretQID || '',
			SecurityAnswer: securityAnswer && securityAnswer != '' ? securityAnswer.replace(/.{2}$/, '**') : ''
			// answer:''
		};
	}

	componentDidMount() {
		this.props.userInfo_getDetails();
		this.getSaftQuestion();
	}

	componentDidUpdate(prevProps) {
		if (this.props.userInfo.memberInfo.secretQID !== prevProps.userInfo.memberInfo.secretQID) {
			this.setState({
				SecretQID: this.props.userInfo.memberInfo.secretQID,
				SecurityAnswer: this.props.userInfo.memberInfo.securityAnswer
			});
		}
	}

	getSaftQuestion = () => {
		 Toast.loading();
		getQuestion((data) => {
			Toast.destroy();
			console.log(data);
			if (data.isSuccess) {
				this.setState({
					questionList: data.result
				});
			} else {
				Toast.error('请求失败，请稍后再试！', 2);
			}
		});
	};

	setSecretQuestion = (SecretQID) => {
		if (this.props.userInfo.memberInfo.secretQID) {
			return;
		}
		this.setState({
			SecretQID
		});
	};

	submit = () => {
		const { SecretQID, SecurityAnswer } = this.state;

		if (this.props.userInfo.memberInfo.secretQID) {
			return;
		}
		if (!SecretQID) {
			Toast.error('请选择一个安全问题', 2);
			return;
		}
		if (!SecurityAnswer.trim()) {
			Toast.error('请填写安全问题答案', 2);
			return;
		}
		if (!/[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(SecurityAnswer)) {
			Toast.error('安全问题答案只能输入数字字母中文', 2);
			return;
		}

		const params = {
			key: 'SecretQuestionAnswer',
			value1: String(SecretQID),
			value2: SecurityAnswer.trim()
		};

		Toast.loading('Đang gửi đi, xin vui lòng chờ...');
		setMemberInfo(params, (res) => {
			Toast.destroy();
			if (res.isSuccess == true) {
				this.props.userInfo_getDetails();
				Toast.success(res.result.message || 'Cập Nhật Thành Công', 3);
				this.setState({
					showCofirmModal: true
				});
			} else if (res.isSuccess == false) {
				Toast.error(res.result.message || 'Cập nhật không thành công!');
			} else {
				Toast.error('Cập nhật không thành công!');
			}
		});
		// globalGtag('Submit_securityquestion_personal');
	};

	render() {
		const { questionList, SecretQID, SecurityAnswer } = this.state;
		const { initialID, userInfo } = this.props;
		let GetsecretQID = userInfo.memberInfo.secretQID;
		return (
			<div>
				<Layout
					title="FUN88乐天堂官网｜2022卡塔尔世界杯最佳投注平台"
					Keywords="乐天堂/FUN88/2022 世界杯/世界杯投注/卡塔尔世界杯/世界杯游戏/世界杯最新赔率/世界杯竞彩/世界杯竞彩足球/足彩世界杯/世界杯足球网/世界杯足球赛/世界杯赌球/世界杯体彩app"
					Description="乐天堂提供2022卡塔尔世界杯最新消息以及多样的世界杯游戏，作为13年资深品牌，安全有保障的品牌，将是你世界杯投注的不二选择。"
					BarTitle="Câu Hỏi Bảo Mật"
					status={2}
					hasServer={false}
					barFixed={true}
					seoData={this.props.seoData}
				>
					<Flexbox className="AccountinfoContent">
						<Flexbox className="Left-Txt Wrapper Dataset">
							<label style={{ marginBottom: '10px', textAlign: 'center' }}>Câu Hỏi Bảo Mật</label>
							{GetsecretQID &&
								GetsecretQID != 0 &&
								questionList.length != 0 ?
								questionList.filter((item) => item.id == SecretQID).map((item, i) => {
									return (
										<Flexbox
											key={item.id}
											className="select"
											marginTop="10px"
											onClick={() => {
												this.setSecretQuestion(item.id);
											}}
										>
											<ReactSVG src={`/img/svg/${SecretQID === item.id ? 'true' : 'false'}.svg`} />
											<span>{item.localizedName}</span>
										</Flexbox>
									);
								}): null}
							{!GetsecretQID &&
								questionList.length != 0 ?
								questionList.map((item, i) => {
									return (
										<Flexbox
											key={item.id}
											className="select"
											marginTop="10px"
											onClick={() => {
												this.setSecretQuestion(item.id);
											}}
										>
											<ReactSVG src={`/img/svg/${SecretQID === item.id ? 'true' : 'false'}.svg`} />
											<span>{item.localizedName}</span>
										</Flexbox>
									);
								}) : null}
						</Flexbox>

						<Flexbox className="Left-Txt Wrapper Dataset" marginTop="10px">
							<label>Câu Trả Lời</label>
							<br />
							<InputItem
								type="text"
								value={SecurityAnswer}
								placeholder=""
								onChange={(v) => {
									this.setState({
										SecurityAnswer: v.target.value.trim()
									});
								}}
							/>
						</Flexbox>
						{/* <p className="note">安全提问只允许修改一次。</p> */}

						<Flexbox
							className={classNames({
								disabled:
									this.props.userInfo.memberInfo.secretQID || SecretQID == '' || SecurityAnswer == '',
								submit: SecretQID != '' && SecurityAnswer != '',
								btn: true
							})}
							onClick={() => {
								this.submit();
							}}
						>
							Gửi
						</Flexbox>
					</Flexbox>
				</Layout>

				{this.state.showCofirmModal ? (
					<Modal
						visible={true}
						transparent
						maskClosable={false}
						closable={false}
						className="ConfirmModal"
						title="Thiết lập Thành Công"
					>
						<p className="note">Xin chúc mừng, câu hỏi bảo mật đã được thiết lập thành công.  Bạn có thể sử dụng để xác minh và giải quyết vấn đề bảo mật trong tương lai.</p>
						<div
							onClick={() => {
								this.setState({
									showCofirmModal: false
								});
								Router.push('/me/account-info/')
							}}
							className="Btn"
						>
							Xác Nhận
						</div>
					</Modal>
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

export default connect(mapStateToProps, mapDispatchToProps)(_SafeQuestionModal);
