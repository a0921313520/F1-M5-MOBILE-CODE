/*
 * @Author: Alan
 * @Date: 2022-04-11 23:02:39
 * @LastEditors: Alan
 * @LastEditTime: 2022-12-29 13:04:47
 * @Description: 上传文件
 * @FilePath: \Mobile\pages\Me\Uploadfiles\index.js
 */

import React, { Component } from 'react';
import Layout from '@/components/Layout';
import { ReactSVG } from '@/components/View/ReactSVG';
import Toast from '@/components/View/Toast';
import { GetDocumentApprovalStatus, GetVerificationMemberDocuments, UploadDocument } from '@/api/uploader';
import Flexbox from '@/components/View/Flexbox/';
import Uploadfiles from '@/components/Me/Uploadfiles/';
import { BiIdCard, BiUserCircle } from 'react-icons/bi';
import { RiBankLine } from 'react-icons/ri';
import { BsHouseDoor, BsReceipt } from 'react-icons/bs';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import Router from 'next/router';
import { getStaticPropsFromStrapiSEOSetting } from '@/lib/seo';

export async function getStaticProps() {
	return await getStaticPropsFromStrapiSEOSetting('/me/upload-files'); //參數帶本頁的路徑
}
export default class Upload extends Component {
	constructor(props) {
		super(props);
		this.state = {
			name: '',
			imageList: [],
			showIDCardModal: false,
			maxFileSize: false,
			RemoveConfirm: false,
			FrontmaxFileSize: false,
			BackimageList: [],
			FrontimageList: [],
			ShowType: null,
			imageRestriction: {
				extension: [ '.jpg', '.png', '.jpeg' ],
				size: '5MB'
			},
			documents: [],
			loading: true
		};
	}

	componentDidMount() {
		this.DocumentApprovalStatus();
		this.VerificationMemberDocuments();
	}

	/**
	 * @description: 是否需要上传资料
	 * @param {*}
	 * @return {*}
  	*/

	DocumentApprovalStatus() {
		GetDocumentApprovalStatus((res) => {
			console.log(res);
			if (res.isSuccess && res.result) {
				this.setState({
					isDifferentRealNamePending: res.result.isDifferentRealNamePending,
					isPending: res.result.isPending
				});
			}
		});
	}

	/**
	 * @description: 查看上传资料的进度
	 * @param {*}
	 * @return {*}
  	*/

	VerificationMemberDocuments() {
		GetVerificationMemberDocuments((res) => {
			if (res.isSuccess && res.result) {
				this.setState({
					documents: res.result.documents,
					imageRestriction: res.result.imageRestriction,
					loading: false
				});
			}
		});
	}

	onChange = (imageList) => {
		console.log(imageList);
		this.setState(imageList);
	};

	render() {
		const { documents, loading } = this.state;
		/**
		*@param {docTypeId}
		*@type {1}  @description 身份证明	如果货币代码 = “CNY”，显示正面和背面 如果货币代码 = “THB”，仅显示正面
		*@type {2}  @description 地址证明	如果货币代码 = “CNY”，仅显示正面 如果货币代码 = “THB”，则显示正面和背面
		*@type {3}  @description 实时人脸识别	默认
		*@type {4}  @description 存款证明	默认
		*@type {5}  @description 银行账户证明	默认
		*/
		let Doc1 = documents.find((item) => item.docTypeId == 1);
		let Doc2 = documents.find((item) => item.docTypeId == 2);
		let Doc3 = documents.find((item) => item.docTypeId == 3);
		let Doc4 = documents.find((item) => item.docTypeId == 4);
		let Doc5 = documents.find((item) => item.docTypeId == 5);
		console.log('文档------------------->', documents);
		console.log('Doc1------------------->', Doc1);
		return (
			<Layout
				title="FUN88乐天堂官网｜2022卡塔尔世界杯最佳投注平台"
				Keywords="乐天堂/FUN88/2022 世界杯/世界杯投注/卡塔尔世界杯/世界杯游戏/世界杯最新赔率/世界杯竞彩/世界杯竞彩足球/足彩世界杯/世界杯足球网/世界杯足球赛/世界杯赌球/世界杯体彩app"
				Description="乐天堂提供2022卡塔尔世界杯最新消息以及多样的世界杯游戏，作为13年资深品牌，安全有保障的品牌，将是你世界杯投注的不二选择。"
				BarTitle="Đăng Tải Chứng Từ"
				status={2}
				hasServer={true}
				barFixed={true}
				seoData={this.props.seoData}
			>
				<Flexbox className="Uploadfiles" flexFlow="column">
					{documents.length == 0 &&
					!loading && (
						<Flexbox className="No-Uploadfiles" flexFlow="column">
							<ReactSVG src="/img/svg/upload.svg" />
							<p style={{textAlign: "center"}}>Tài khoản của bạn hiện không yêu cầu <br/> xác thực chứng từ</p>
						</Flexbox>
					)}
					{documents.length != 0 && (
						<React.Fragment>
							<p className="note">Tải lên các tài liệu cần thiết để xác minh thông tin tài khoản của bạn</p>
							{Doc1 && (
								<Uploadfiles
									Documents={Doc1}
									DocData={{
										name: 'Ảnh chụp căn cước công dân',
										docTypeId: 1,
										docStatusId: this.state['TryAgain1'] ? 0 : Doc1.docStatusId,
										frontback: true, //正反两面上传
										icon: <ReactSVG style={{width: '30px'}} src="/img/svg/idIcon.svg" />
									}}
									VerificationMemberDocuments={(TryAgainUploadTries) => {
										if (TryAgainUploadTries) {
											this.setState(TryAgainUploadTries);
										} else {
											this.setState({
												TryAgain1: false
											});
										}
										this.VerificationMemberDocuments();
									}}
								/>
							)}
							{Doc2 && (
								<Uploadfiles
									Documents={Doc2}
									DocData={{
										name: 'Địa chỉ nhà',
										docTypeId: 2,
										docStatusId: this.state['TryAgain2'] ? 0 : Doc2.docStatusId,
										icon: <ReactSVG style={{width: '30px'}} src="/img/svg/homeIcon.svg" />
									}}
									VerificationMemberDocuments={(TryAgainUploadTries) => {
										console.log(TryAgainUploadTries);
										if (TryAgainUploadTries) {
											this.setState(TryAgainUploadTries);
										} else {
											this.setState({
												TryAgain2: false
											});
										}
										this.VerificationMemberDocuments();
									}}
								/>
							)}
							{Doc3 && (
								<Uploadfiles
									Documents={Doc3}
									DocData={{
										name: 'Ảnh chụp nhận dạng khuôn mặt',
										docTypeId: 3,
										docStatusId: this.state['TryAgain3'] ? 0 : Doc3.docStatusId,
										frontback: false, //正反两面上传
										icon: <ReactSVG style={{width: '30px'}} src="/img/svg/profileIcon.svg" />
									}}
									VerificationMemberDocuments={(TryAgainUploadTries) => {
										if (TryAgainUploadTries) {
											this.setState(TryAgainUploadTries);
										} else {
											this.setState({
												TryAgain3: false
											});
										}
										this.VerificationMemberDocuments();
									}}
								/>
							)}
							{Doc4 && (
								<Uploadfiles
									Documents={Doc4}
									DocData={{
										name: 'Chứng từ gửi tiền',
										docTypeId: 4,
										docStatusId: this.state['TryAgain4'] ? 0 : Doc4.docStatusId,
										icon: <ReactSVG style={{width: '30px'}} src="/img/svg/receiptIcon.svg" />
									}}
									VerificationMemberDocuments={(TryAgainUploadTries) => {
										if (TryAgainUploadTries) {
											this.setState(TryAgainUploadTries);
										} else {
											this.setState({
												TryAgain4: false
											});
										}
										this.VerificationMemberDocuments();
									}}
								/>
							)}
							{Doc5 && (
								<Uploadfiles
									Documents={Doc5}
									DocData={{
										name: 'Tài khoản ngân hàng',
										docTypeId: 5,
										docStatusId: this.state['TryAgain5'] ? 0 : Doc5.docStatusId,
										icon: <ReactSVG style={{width: '30px'}} src="/img/svg/bankIcon.svg" />
									}}
									VerificationMemberDocuments={(TryAgainUploadTries) => {
										if (TryAgainUploadTries) {
											this.setState(TryAgainUploadTries);
										} else {
											this.setState({
												TryAgain5: false
											});
										}
										this.VerificationMemberDocuments();
									}}
								/>
							)}
						</React.Fragment>
					)}

					{loading && (
						<SkeletonTheme baseColor="#dbdbdb" highlightColor="#ffffff">
							<Skeleton count={5} height="50px" />
						</SkeletonTheme>
					)}
					<Flexbox
						className="Help"
						justifyContent="center"
						onClick={() => {
							Router.push('/me/Uploadfiles/Help');
						}}
					>
						Hướng Dẫn Đăng Tải
					</Flexbox>
				</Flexbox>
			</Layout>
		);
	}
}
