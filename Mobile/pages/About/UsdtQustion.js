/*
 * @Author: Alan
 * @Date: 2022-06-26 01:02:46
 * @LastEditors: Alan
 * @LastEditTime: 2022-07-26 17:02:26
 * @Description: 虚拟币问题
 * @FilePath: \Mobile\pages\About\UsdtQustion.js
 */
import Modal from '@/components/View/Modal';
import BackBar from '@/components/Header/BackBar';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';
export default function CTCDepositTutorial(props) {
	const { allQuestionList, nowOpen, Openset, closeModal, visible } = props;
	console.log(props)
	return (
		<Modal
			visible={visible}
			transparent
			maskClosable={false}
			closable={false}
			title={
				<BackBar
					key="main-bar-header"
					title={'常见问题'}
					backEvent={() => {
						closeModal();
					}}
					hasServer={false}
				/>
			}
			className={'Fullscreen-Modal Question-Modal'}
		>
			<div className="questionList Showlist">
				{allQuestionList && allQuestionList.length ? (
					allQuestionList.map((ele, index) => {
						return (
							<div className="item" key={index}>
								<div
									className={`${nowOpen === ele.id ? '' : 'borderRadius'} header`}
									onClick={() => {
										if (nowOpen === ele.id) {
											Openset({
												nowOpen: ''
											});
										} else {
											Openset({
												nowOpen: ele.id
											});
										}
									}}
								>
									<p>{ele.title}</p>

									{nowOpen === ele.id ? (
										<FiChevronRight size={17} color="#222222" />
									) : (
										<FiChevronDown size={17} color="#222222" />
									)}
								</div>
								{nowOpen === ele.id && (
									<div className="body" dangerouslySetInnerHTML={{ __html: ele.body }} />
								)}
							</div>
						);
					})
				) : null}
			</div>
		</Modal>
	);
}
