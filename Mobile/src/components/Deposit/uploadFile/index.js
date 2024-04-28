import Button from '@/components/View/Button';
import React from 'react';
import { PostUploadAttachment } from '@/api/wallet';
import Modal from '@/components/View/Modal';
import { fetchRequest } from '@/server/Request';
import { ApiPort } from '@/api/index';
import Toast from '@/components/View/Toast';
import ReactIMG from '@/components/View/ReactIMG';
import { getE2BBValue } from '@/lib/js/util';

class uploadFile extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			fileName: '',
			filestatus: '3',
			visible: false,
			uploadSizeFlag: false
		};
	}

	componentDidMount() {}
	//上传文件
	uploadFile = (e) => {
		let self = this;
		let fileName = e.target.files[0].name;
		var reader = new FileReader();
		reader.onload = (function(file) {
			return function(e) {
				let fileBytes = this.result.split(',')[1];
				self.setState(
					{
						fileName,
						fileBytes,
						uploadSizeFlag: !(
							file.size <= 4194304 &&
							[ 'png', 'jpg', 'jpeg' ].includes(fileName.split('.')[fileName.split('.').length - 1])
						)
					},
					() => {}
				);
			};
		})(e.target.files[0]);
		reader.readAsDataURL(e.target.files[0]);
	};

	UploadAttachment = () => {
		this.setState({
			filestatus: 0
		});
		let hide = null;
		hide = Toast.loading(
			<div className="upload-loading-set">
				文档上传中<br />请稍等...
			</div>
		);
		PostUploadAttachment(
			{
				DepositID: this.props.transactionId,
				PaymentMethod: this.props.PaymentMethod,
				FileName: this.state.fileName,
				byteAttachment: this.state.fileBytes,
				RequestedBy: this.props.RequestedBy,
				blackBoxValue: getE2BBValue(),
				e2BlackBoxValue: getE2BBValue()
			},
			(res) => {
				if (res.isSuccess == true) {
					this.setState({
						filestatus: 1
					});
					this.setState({
						filesuccess: true,
						visible: false
					});

					Toast.destroy();
					Toast.success('存款凭证已上传', 5);
				} else {
					this.setState({
						filestatus: 2
					});
					Toast.destroy();
				}
			}
		);
	};

	PopUpLiveChat = () => {
		this.FUN88Live && this.FUN88Live.close();
		this.FUN88Live = window.open(
			'about:blank',
			'chat',
			'toolbar=yes, location=yes, directories=no, status=no, menubar=yes, scrollbars=yes, resizable=no, copyhistory=yes, width=540, height=650'
		);
		fetchRequest(ApiPort.GETLiveChat).then((res) => {
			//console.log(res);
			if (res.isSuccess) {
				localStorage.setItem('serverUrl', res.result);
				this.openServer(res.result);
			}
		});
	};

	openServer = (serverUrl) => {
		this.FUN88Live.document.title = 'FUN88在线客服';
		this.FUN88Live.location.href = serverUrl;
		this.FUN88Live.focus();
	};
	render() {
		const { menuName } = this.props;
		return (
			<div>
				<div className="sport-deposit-upload">
					<div className="item-label">
						上传存款凭证<span className="TuiJian">推荐使用</span>
					</div>
					<div
						className="upload"
						onClick={() => {
							if (
								this.state.fileName &&
								this.state.fileName !== '' &&
								!this.state.uploadSizeFlag &&
								this.state.filestatus !== '3'
							)
								return;
							this.setState({
								visible: true
							});
						}}
					>
						{this.state.filesuccess ? (
							<span className="imgname">{this.state.fileName}</span>
						) : (
							<div className="setfixs">
								<ReactIMG src="/img/svg/plus.svg" />上传存款凭证以利款项快速到帐
							</div>
						)}
					</div>
					<div className="upload cscontent">
						若您无法上传凭证，请联系<span
							className="cs"
							onClick={() => {
								this.PopUpLiveChat();
							}}
						>
							<u>在线客服</u>。
						</span>
					</div>
				</div>
				<Modal
					closable={false}
					className="commonModal recommend-race-modal combo-bonus-modal"
					title="上传存款凭证"
					visible={this.state.visible}

					// onCancel={this.props.onClose}
				>
					<div className="btn-content-set" style={{ padding: '20px' }}>
						<p>请上传存款凭证，仅接受 jpg 及 png 档案，且档案大小不得超过4MB。</p>
						<label>存款凭证</label>
						<div className="btn-content-file " id="updataset">
							<span className="imgname">{this.state.fileName}</span>
							<Button id="setbtn">
								选择文档
								<input
									value=""
									type="file"
									accept=".jpg,.jpeg,.png"
									className="Modal_file_btn"
									onChange={(e) => {
										this.uploadFile(e);
									}}
								/>
							</Button>
						</div>
						{this.state.uploadSizeFlag && <span className="red-set">仅接受 jpg 及 png 档案，且档案大小不得超过4MB。</span>}
						{this.state.filestatus == 2 && <span className="red-set">上传失败由于未知的错误，请稍后再试</span>}
						<div className="btn-content-file">
							<Button
								className="left"
								onClick={() => {
									this.setState({
										visible: false,
										fileName: '',
										filestatus: '3',
										uploadSizeFlag: false
									});
								}}
							>
								关闭
							</Button>
							{this.state.fileName &&
							this.state.fileName !== '' &&
							!this.state.uploadSizeFlag && (
								<Button
									onClick={() => {
										this.UploadAttachment();
									}}
								>
									上传存款凭证
								</Button>
							)}
							{(this.state.fileName == '' || this.state.uploadSizeFlag) && (
								<Button className="filebtn">上传存款凭证</Button>
							)}
						</div>
					</div>
				</Modal>
			</div>
		);
	}
}

export default uploadFile;
