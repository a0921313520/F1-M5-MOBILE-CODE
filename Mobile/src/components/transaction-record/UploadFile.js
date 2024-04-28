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
				Đang Tải Tài Liệu
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
						visible: false,
					});

					Toast.destroy();
					this.props.uploadedSlip();
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
		const { menuName, type } = this.props;
		return (
			<React.Fragment>
				<Button
					size="large"
					type="primary"
					ghost
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
						Pushgtagdata(`Transaction`, 'Upload Slip', `Transaction_C_Upload_slip`);
					}}
				>
					{type == '2' ? 'Đăng Tải Chứng Từ' : 'Đăng Tải Biên Lai' }
				</Button>
				<Modal
					closable={false}
					className="commonModal UploadFileModal"
					title={type == '2' ? 'Đăng Tải Chứng Từ' : 'Đăng Tải Biên Lai'}
					visible={this.state.visible}

					// onCancel={this.props.onClose}
				>
					<div className="btn-content-set">
						<p>Kích thước tệp tối đa: 4MB | Loại tệp: JPG, JPEG, PNG, GIF, PDF, HEIC, HEIF | Số tệp tối đa: 1</p>
						<label>Biên Lai Gửi Tiền</label>
						<div className="btn-content-file " id="updataset">
							<span className="imgname">{this.state.fileName}</span>
							<Button id="setbtn">
								Tải Lên
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
						{this.state.uploadSizeFlag && <span className="red-set">Loại tệp hoặc kích thước tệp không hợp lệ. Vui lòng kiểm tra và tải lại</span>}
						{this.state.filestatus == 2 && <span className="red-set">Rất tiếc đã xảy ra lỗi trong quá trình đăng tải biên lai, vui lòng thử lại.</span>}
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
								Hủy
							</Button>
							{this.state.fileName &&
							this.state.fileName !== '' &&
							!this.state.uploadSizeFlag && (
								<Button
									onClick={() => {
										this.UploadAttachment();
									}}
								>
									Gửi
								</Button>
							)}
							{(this.state.fileName == '' || this.state.uploadSizeFlag) && (
								<Button className="filebtn">Gửi</Button>
							)}
						</div>
					</div>
				</Modal>
			</React.Fragment>
		);
	}
}

export default uploadFile;
