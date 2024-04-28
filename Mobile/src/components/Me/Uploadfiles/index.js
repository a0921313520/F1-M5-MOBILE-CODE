/*
 * @Author: Alan
 * @Date: 2022-04-11 23:02:39
 * @LastEditors: Alan
 * @LastEditTime: 2022-06-30 11:58:18
 * @Description: 上传文件
 * @FilePath: \Mobile\src\components\Me\Uploadfiles\index.js
 */
import React, { Component } from 'react';
import Modal from '@/components/View/Modal';
import Toast from '@/components/View/Toast';
import Button from '@/components/View/Button';
import { UploadDocument } from '@/api/uploader';
import Flexbox from '@/components/View/Flexbox/';
import { BiChevronRight } from 'react-icons/bi';
import BackBar from '@/components/Header/BackBar';
import { IoIosAddCircle, IoIosCloseCircle } from 'react-icons/io';
import ImageUploading from 'react-images-uploading';
import Status from './Status';
import classNames from 'classnames';
import Demoexample from './DemoExample';
import {GetVerificationMemberDocuments } from '@/api/uploader';

const maxNumber = 1;
export default class UploadDoc extends Component {
	constructor(props) {
		super(props);
		this.state = {
			name: '',
			imageList: [],
			showIDCardModal: false,
			maxFileSize: false,
			RemoveConfirm: false,
			FrontmaxFileSize: false,
			BackmaxFileSize:false,
			FrontInvalidFileType:false,
			BackInvalidFileType:false,
			BackimageList: [],
			FrontimageList: [],
			ShowType: null,
			imageRestriction: {
				extension: [ 'jpg', 'png', 'jpeg' ],
				size: '7MB'
			}
		};
	}

	onChange = (imageList) => {
		this.setState(imageList);
		const extension = Object.values(imageList)[0][0].file.type.split("/")[1];
		if(Object.values(imageList)[0][0].file.size > parseFloat(this.state.imageRestriction.size) * 1000000 ){
			const uploadFiledType = Object.keys(imageList)[0] === "FrontimageList" ? "FrontmaxFileSize" : "BackmaxFileSize"
			this.setState({[uploadFiledType]:true})
		}
		if(!this.state.imageRestriction.extension.includes(extension)){
			const uploadFiledType = Object.keys(imageList)[0] === "FrontimageList" ? "FrontInvalidFileType" : "BackInvalidFileType"
				this.setState({[uploadFiledType]:true})
		}
	};

	/**
     * @description: 上传资料
     * @param {String} docTypeId 上传资料的类型
     * @return {*}
    */
	ToUploadDocument(docTypeId) {
		const { BackimageList, FrontimageList } = this.state;
		const { DocData, VerificationMemberDocuments, Documents } = this.props;
		let data = DocData.frontback
			? [
					{
						imageType: `${docTypeId == 'Identification' || docTypeId == 'Address' ? 'Front' : 'Default' }`, //正面
						fileName: FrontimageList[0]['file'].name,
						fileBytes: FrontimageList[0]['data_url'].split(',')[1]
					},
					{
						imageType: 'Back', //反面
						fileName: BackimageList[0]['file'].name,
						fileBytes: BackimageList[0]['data_url'].split(',')[1]
					}
				]
			: [
					{
						imageType: `${docTypeId == 'Identification' || docTypeId == 'Address' ? 'Front' : 'Default' }`, //正面
						fileName: FrontimageList[0]['file'].name,
						fileBytes: FrontimageList[0]['data_url'].split(',')[1]
					}
				];

		let params = {
			docTypeId: docTypeId,
			numberOfTry: Documents.remainingUploadTries
		};

		Toast.loading('Đang Tải Tài Liệu');
		UploadDocument({ params: params, data: data }, (res) => {
			Toast.destroy();
			if (res.isSuccess) {
				Toast.success('Đăng Tải Thành Công')
				this.setState({
					showIDCardModal: false
				});
				VerificationMemberDocuments(false);
			}
			console.log(res);
		});
	}
	render() {
		const Title = {
			1: 'Căn Cước Công Dân',
			2: 'Địa Chỉ Nhà',
			3: 'Ảnh Chụp Nhận Dạng Khuôn Mặt',
			4: 'Chứng Từ Gửi Tiền',
			5: 'Tài Khoản Ngân Hàng',
		};
		const {
			showIDCardModal,
			FrontimageList,
			FrontmaxFileSize,
			RemoveConfirm,
			BackmaxFileSize,
			BackimageList,
			ShowType,
			imageRestriction,
			ShowDemoID,
			FrontInvalidFileType,
			BackInvalidFileType
		} = this.state;
		const { DocData, Documents } = this.props;
		console.log('审核状态-------------->', DocData.docStatusId);
		let StatusContent =
			DocData.docStatusId == 1 ? (
				<span className="yellow">Đang Xủ Lý</span>
			) : DocData.docStatusId == 2 ? (
				<span className="green">Thành Công</span>
			) : DocData.docStatusId == 3 ? (
				<span className="red">Thất Bại</span>
			) : (
				<span>Tải Lên</span>
			);
		const { docTypeId } = this.props.DocData;

		let Submit = DocData.frontback
			? !FrontmaxFileSize && !BackmaxFileSize && !FrontInvalidFileType && !BackInvalidFileType && FrontimageList.length !== 0 && BackimageList.length !== 0
			: !FrontmaxFileSize && !FrontInvalidFileType && FrontimageList.length !== 0;
		return (
			<React.Fragment>
				{/* 上传示例 */}
				<Demoexample
					DocData={DocData}
					Demoexample={ShowDemoID}
					closeModal={() => {
						this.setState({
							ShowDemoID: false
						});
					}}
				/>
				{/* 上传文件开始 */}
				<Flexbox flexFlow="column" width="100%">
					<Flexbox 
						className="List" 							
						onClick={() => {
							this.setState({
								showIDCardModal: true
							});
						}}
					>
						<Flexbox alignItems="center">
							{DocData.icon}
							<label>{DocData.name}</label>
						</Flexbox>
						<Flexbox
							className="ToUpload"
							alignItems="center"
						>
							<label>{StatusContent}</label> <BiChevronRight size="20" color="#707070" />
						</Flexbox>
					</Flexbox>
				</Flexbox>

				<Modal
					visible={showIDCardModal}
					transparent
					maskClosable={false}
					closable={false}
					wrapClassName="upload_modal"
					title={
						<BackBar
							key="main-bar-header"
							title={Title[DocData.docTypeId]}
							backEvent={() => {
								this.setState({
									showIDCardModal: false,
									BackimageList: [],
									FrontimageList: [],
								});
							}}
							hasServer={true}
						/>
					}
					className="Fullscreen-Modal"
				>
					{/* 审核资料状态 */}
					{Documents &&
					DocData.docStatusId != 0 && (
						<Status
							StatusId={DocData.docStatusId}
							RemainingUploadTries={Documents.remainingUploadTries}
							CloseStatus={(RemainingUploadTries) => {
								this.props.VerificationMemberDocuments({
									['TryAgain' + DocData.docTypeId]: RemainingUploadTries
								});
								if(RemainingUploadTries){
									this.setState({
										showIDCardModal: true
									});
								}else{
									this.setState({
										showIDCardModal: false
									});
								}
							}}
						/>
					)}

					{/* 没有上传过资料 == 0 */}
					{Documents &&
					DocData.docStatusId == 0 && (
						<Flexbox className="UploadBox" flexFlow="column">
							<p className="note">
								Đăng tải chứng từ theo đúng định dạng tệp .jpg, .png, .jpeg. Kích thước tệp là {imageRestriction.size}/tệp
								{/* Đăng tải chứng từ theo đúng định dạng tệp  */}
								{/* <span className="imgtype">
									{imageRestriction.extension.toString()}
								</span> Kích thước tệp là {imageRestriction.size}/tệp */}
							</p>
							<Flexbox className="UploadList" flexFlow="column">
								<Flexbox flexFlow="column">
									{DocData.docTypeId == 3 && (
										<p className="Ynote">Vui lòng cầm căn cước công dân (CCCD) mặt trước và mặt sau để chụp ảnh nhận dạng. Yêu cầu hình chụp khuôn mặt và thông tin trên CCCD phải rõ nét.</p>
									)}
									<Flexbox justifyContent="space-between">
										<label>
											{DocData.docTypeId == 1 ? (
												'Ảnh Mặt Trước'
											) : DocData.docTypeId == 3 ? (
												'Ảnh CCCD cầm tay'
											) : DocData.docTypeId == 4 ? (
												'Chứng Từ Gửi Tiền'
											) : DocData.docTypeId == 5 ? (
												'Ảnh Tài Khoản' 
											) : DocData.name }
											
										</label>
										<span
											className="blue"
											onClick={() => {
												this.setState({
													ShowDemoID: DocData.docTypeId
												});
											}}
										>
											<small style={{textDecoration: 'underline'}}>Hướng Dẫn Đăng Tải</small>
										</span>
									</Flexbox>
									<Uploading
										SetmaxFileSize={(errors) => {
											this.setState({
												FrontmaxFileSize: errors.maxFileSize
											});
										}}
										maxFileSize={FrontmaxFileSize}
										invalidFileType={FrontInvalidFileType}
										imageList={FrontimageList}
										onChange={(imageList, addUpdateIndex) => {
											this.onChange({ FrontimageList: imageList });
										}}
										OpenRemoveConfirm={() => {
											this.setState({
												RemoveConfirm: true,
												ShowType: 0
											});
										}}
										imageRestriction={imageRestriction}
									/>
								</Flexbox>
								
								{/* 目前只有含有的身份证需要反面 */}
								{DocData.frontback && (
									<>
									<hr />
									<Flexbox flexFlow="column">
										<Flexbox>
											<label>
												{DocData.docTypeId == 1 ? (
													'Ảnh Mặt Sau'
												) : DocData.docTypeId == 3 ? (
													<span>Ảnh CCCD<br/>cầm tay mặt sau</span>
												) : (
													DocData.name
												)}
												</label>
											</Flexbox>
											<Uploading
												SetmaxFileSize={(errors) => {
													this.setState({
														BackmaxFileSize: errors.maxFileSize
													});
												}}
												maxFileSize={BackmaxFileSize}
												invalidFileType={BackInvalidFileType}
												imageList={BackimageList}
												onChange={(imageList, addUpdateIndex) => {
													this.onChange({ BackimageList: imageList });
												}}
												OpenRemoveConfirm={() => {
													this.setState({
														RemoveConfirm: true,
														ShowType: 1
													});
												}}
												imageRestriction={imageRestriction}
												/>
										</Flexbox>
										</>
								)}
							</Flexbox>
							<center>
								<small>
								Còn (<span className="blue">{Documents.remainingUploadTries}</span>) lần thử
								</small>
							</center>
							<button
								onClick={() => {
									/**
									*@param {docTypeId}
									*@type {1}  @description 身份证明	如果货币代码 = “CNY”，显示正面和背面 如果货币代码 = “THB”，仅显示正面
									*@type {2}  @description 地址证明	如果货币代码 = “CNY”，仅显示正面 如果货币代码 = “THB”，则显示正面和背面
									*@type {3}  @description 实时人脸识别	默认
									*@type {4}  @description 存款证明	默认
									*@type {5}  @description 银行账户证明	默认
									*/

									let type =
										docTypeId == 1
											? 'Identification'
											: docTypeId == 2
												? 'Address'
												: docTypeId == 3
													? 'IdentificationWithRealTimeFace'
													: docTypeId == 4
														? 'Deposit'
														: docTypeId == 5 ? 'BankAccountOwner' : '';

									Submit && this.ToUploadDocument(type);
								}}
								className={classNames({
									active: Submit
								})}
							>
								Đăng Tải
							</button>
						</Flexbox>
					)}
				</Modal>
				<Modal
					transparent
					maskClosable={false}
					visible={RemoveConfirm}
					className="ConfirmModal"
					closable={false}
					title={<div>Xoá Tài Liệu</div>}
				>
					<Flexbox
						className="Content"
						alignItems="center"
						justifyContent="space-around"
						flexDirection="column"
					>
						<Flexbox margin="10px">Bạn có chắc chắn muốn xóa tệp này không?</Flexbox>
					</Flexbox>
					<Flexbox justifyContent="space-around">
						<Flexbox
							className="Cancel"
							onClick={() => {
								this.setState({ RemoveConfirm: false });
							}}
						>
							Không
						</Flexbox>
						<Flexbox
							className="Confirm"
							onClick={() => {
								this.setState({
									RemoveConfirm: false
								});
								if (ShowType == 0) {
									this.setState({
										FrontimageList: [],
										FrontmaxFileSize:false,
										FrontInvalidFileType:false,
									});
								} else {
									this.setState({
										BackimageList: [],
										BackmaxFileSize:false,
										BackInvalidFileType:false,
									});
								}
								Toast.success('Đăng Tải Thành Công')
							}}
						>
							Chắc Chắn
						</Flexbox>
					</Flexbox>
				</Modal>
			</React.Fragment>
		);
	}
}

/**
 * @description: 上传文件
 */
class Uploading extends React.Component {
	render() {
		const { imageList, maxFileSize, SetmaxFileSize, onChange, OpenRemoveConfirm, imageRestriction, invalidFileType } = this.props;
		return (
			<React.Fragment>
				<Flexbox className="select">
					<ImageUploading
						multiple
						value={imageList}
						onChange={onChange}
						maxNumber={maxNumber}
						dataURLKey="data_url"
						onError={(errors) => {
							SetmaxFileSize(errors);
						}}
					>
						{({ onImageUpload, dragProps }) => (
							<React.Fragment>
								<Flexbox className="select1" width="100%">
									{imageList.length == 0 ? (
										<Flexbox onClick={onImageUpload}>
											<IoIosAddCircle color="#00A6FF" size={20} {...dragProps} />Chọn Tệp
										</Flexbox>
									) : (
										imageList.map((image, index) => (
											<Flexbox
												key={index}
												className="image-item"
												width="100%"
												justifyContent="space-between"
												padding="10px"
											>
												<span className="name">{image['file'].name}</span>
												<IoIosCloseCircle
													color="#999999"
													fontSize={20}
													onClick={() => {
														OpenRemoveConfirm();
													}}
												/>
											</Flexbox>
										))
									)}
								</Flexbox>
							</React.Fragment>
						)}
					</ImageUploading>
				</Flexbox>
				{(invalidFileType || maxFileSize) && (
					<div className="error">
						{invalidFileType && (
							<span>Chỉ hỗ trợ dịnh dạng tệp .jng, .png, .jpeg</span>
						)}
						{maxFileSize && !invalidFileType && (
							<span>Kích thước tệp vượt quá {imageRestriction.size}</span>
						)}
					</div>
				)}
			</React.Fragment>
		);
	}
}
