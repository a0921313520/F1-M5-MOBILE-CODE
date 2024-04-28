/*
 * @Author: Alan
 * @Date: 2022-03-29 12:47:36
 * @LastEditors: Alan
 * @LastEditTime: 2022-05-12 13:26:21
 * @Description: 确认
 * @FilePath: \NextjsUp\src\components\Me\ConfirmModal.js
 */
import React from 'react';
import Modal from '@/components/View/Modal/';
import Flexbox from '@/components/View/Flexbox/';

class _ConfirmModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		return (
			<Modal
				className="ConfirmModal"
				visible={true}
				transparent
				maskClosable={false}
				title="Lưu Ý"
				closable={false}
			>
				<p>Vui lòng lưu ý một khi cập nhật thông tin thành công bạn sẽ không thể chỉnh sửa nữa.</p>
				<Flexbox className="SubmitBtn" justifyContent="space-between">
					<Flexbox onClick={this.props.cancel} className="Cancel">
						Để sau
					</Flexbox>
					<Flexbox onClick={this.props.submit} className="Sure">
						Xác Nhận
					</Flexbox>
				</Flexbox>
			</Modal>
		);
	}
}

export default _ConfirmModal;
