/*
 * @Author: Alan
 * @Date: 2022-06-29 20:00:15
 * @LastEditors: Alan
 * @LastEditTime: 2022-06-30 13:19:33
 * @Description: 上传文件示例
 * @FilePath: \Mobile\src\components\Me\Uploadfiles\DemoExample.js
 */
import React, { Component } from 'react';
import Modal from '@/components/View/Modal';
import BackBar from '@/components/Header/BackBar';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';
import ReactIMG from '@/components/View/ReactIMG';
export default class DemoExample extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}
	render() {
		const Title = {
			1: 'Căn Cước Công Dân',
			2: 'Địa Chỉ Nhà',
			3: 'Ảnh Chụp Nhận Dạng Khuôn Mặt',
			4: 'Chứng Từ Gửi Tiền',
			5: 'Tài Khoản Ngân Hàng',
		};
		const { Demoexample, DocData } = this.props;
		return (
			<Modal
				visible={Demoexample}
				transparent
				maskClosable={false}
				closable={false}
				title={
					<BackBar
						key="main-bar-header"
						title={Title[Demoexample]}
						backEvent={() => {
							this.props.closeModal();
						}}
						hasServer={true}
					/>
				}
				className={'Fullscreen-Modal Uploadfiles-Modal'}
			>
				{/* 身份证明示例 */}
				{Demoexample == 1 && (
					<React.Fragment>
						<div className="UploadfilesContent">
							<ReactIMG src="/img/help/id_1.png" />
							<p className="note">
								<ul>
									<li>Ảnh chụp phải có độ sắc nét cao.</li>
									<li>Nền ảnh cần rõ ràng và được canh lề ở trên cùng.</li>
									<li>Nội dung, bố cục CCCD cần hiển thị rõ ràng.</li>
									<li>Điều kiện ánh sáng hoàn hảo, không bị phản chiếu bóng.</li>
								</ul>
							</p>
						</div>
						<div className="UploadfilesContent">
							<ReactIMG src="/img/help/id_2.png" />
							<p className="note">
								<ul>
									<li>Chữ và ảnh của CCCD bị mờ, không đọc được.</li>
									<li>Họa tiết hoa văn nền không rõ ràng‧</li>
									<li>Cần có đủ ánh sáng và không có bóng chiếu trên ảnh.</li>
								</ul>
							</p>
						</div>
					</React.Fragment>
				)}
				{/* 地址证明示例 */}
				{Demoexample == 2 && (
					<React.Fragment>
						<div className="UploadfilesContent">
							<ReactIMG src="/img/help/address_1.png" />
							<p className="note">
								<ul>
									<li>Hình ảnh rõ ràng và đầy đủ.</li>
									<li>Phải hiển thị thông tin đầy đủ cho tập tin.</li>
									<li>Giấy tờ phải hợp lệ và chưa hết hạn.</li>
								</ul>
							</p>
						</div>
						<div className="UploadfilesContent">
							<ReactIMG src="/img/help/address_2.png" />
							<p className="note">
								<ul>
									<li>Ảnh bị mờ hoặc không đầy đủ.</li>
									<li>Một số thông tin bị chặn.</li>
									<li>Ảnh đã bị ngược hoặc phản chiếu bóng.</li>
								</ul>
							</p>
						</div>
					</React.Fragment>
				)}
				{/* 实时人脸识别证明 */}
				{Demoexample == 3 && (
					<React.Fragment>
						<div className="UploadfilesContent">
							<ReactIMG src="/img/help/face_1.png" />
							<p className="note">
								<ul>
									<li>Thông tin khuôn mặt và ID rõ ràng, không bị cản trở.</li>
									<li>Tập trung tiêu điểm vào CCCD khi chụp ảnh.</li>
									<div className='remarks'>Lưu ý: Vui lòng nhấp vào màn hình điện thoại khi chụp ảnh để tập trung tiêu điểm canh chỉnh hình ảnh rõ nét khi chụp.</div>
									<li>Ánh sáng hoàn hảo.</li>
								</ul>
							</p>
						</div>
						<div className="UploadfilesContent">
							<ReactIMG src="/img/help/face_2.png" />
							<p className="note">
								<ul>
									<li>CCCD ở quá xa máy ảnh, thông tin nội dung không rõ ràng.</li>
									<li>Khuôn mặt bị mờ và hình ảnh bị lệch.</li>
									<li>Ảnh CCCD bị che khuất khuôn mặt.</li>
									<li>Không đảo ngược hình ảnh của CCCD khi đăng tải hoặc chụp.</li>
									<div className='remarks'>Lưu ý: Vui lòng nhấp vào màn hình điện thoại khi chụp ảnh để tập trung tiêu điểm canh chỉnh hình ảnh rõ nét khi chụp.</div>
								</ul>
							</p>
						</div>
					</React.Fragment>
				)}
				{/* 存款证明 */}
				{Demoexample == 4 && (
					<React.Fragment>
						<div className="UploadfilesContent">
							<ReactIMG src="/img/help/deposit_1.png" />
							<p className="note">
								<ul>
									<li>Hình ảnh rõ ràng và đầy đủ.</li>
									<li>Phải hiển thị thông tin đầy đủ cho tập tin.</li>
									<li>Giấy tờ phải hợp lệ và chưa hết hạn.</li>
								</ul>
							</p>
						</div>
						<div className="UploadfilesContent">
							<ReactIMG src="/img/help/deposit_2.png" />
							<p className="note">
								<ul>
									<li>Ảnh bị mờ hoặc không đầy đủ.</li>
									<li>Một số thông tin bị chặn.</li>
									<li>Ảnh đã bị ngược hoặc phản chiếu bóng.</li>
								</ul>
							</p>
						</div>
					</React.Fragment>
				)}
				{/* 银行账户证明 */}
				{Demoexample == 5 && (
					<React.Fragment>
						<div className="UploadfilesContent">
							<ReactIMG src="/img/help/bank_1.png" />
							<p className="note">
								<ul>
									<li>Hình ảnh rõ ràng và đầy đủ.</li>
									<li>Phải hiển thị thông tin đầy đủ cho tập tin.</li>
									<li>Giấy tờ phải hợp lệ và chưa hết hạn.</li>
								</ul>
							</p>
						</div>
						<div className="UploadfilesContent">
							<ReactIMG src="/img/help/bank_2.png" />
							<p className="note">
								<ul>
									<li>Ảnh bị mờ hoặc không đầy đủ.</li>
									<li>Một số thông tin bị chặn.</li>
									<li>Ảnh đã bị ngược hoặc phản chiếu bóng.</li>
								</ul>
							</p>
						</div>
					</React.Fragment>
				)}
			</Modal>
		);
	}
}
