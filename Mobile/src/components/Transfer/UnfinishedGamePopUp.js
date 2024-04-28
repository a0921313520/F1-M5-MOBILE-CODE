/*
 * @Author: Alan
 * @Date: 2022-07-28 10:59:58
 * @LastEditors: Alan
 * @LastEditTime: 2022-08-16 11:48:34
 * @Description: 正在游戏弹窗提示
 * @FilePath: \Mobile\src\components\Transfer\UnfinishedGamePopUp.js
 */
import React from 'react';
import Button from '@/components/View/Button';
import Modal from '@/components/View/Modal';
import Tag from '@/components/Games/Tag';
import LaunchGameImg from '@/components/Games/LaunchGame';
import Toast from '@/components/View/Toast';
import Router from 'next/router';
import { ReactSVG } from '@/components/View/ReactSVG';
import Flexbox from '@/components/View/Flexbox/';
class UnfinishedGamePopUp extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
		this.GameSet = React.createRef();
	}
	componentDidMount() {}

	Game(props) {
		this.gameOpen = props;
	}

	render() {
		const { visible, unfinishedGames, CloseVisible, unfinishedGamesMessages } = this.props;
		return (
			<React.Fragment>
				<Modal
					closable={true}
					onCancel={() => {
						CloseVisible();
					}}
					className="commonModal UnfinishedGamePopUp"
					title="温馨提醒"
					visible={visible}
					center={true}
				>
					{unfinishedGames ? (
						<div className="Modal-content">
							<ReactSVG src="/img/svg/note.svg" className="note" />
							<div className="Modal-text">
								<b style={{ fontSize: '16px' }}>交易申请失败</b>
							</div>
							<div className="modal-info">
								系统侦测到您的账号正在进行游戏, <br />请联系在线客服, 为您提供最贴心的服务
							</div>
							<div className="GameMiniLogo">
								{unfinishedGames.map((item, index) => {
									let gameInfo = {};
									Object.assign(gameInfo, item);
									gameInfo.imageUrl = item.imgGameName;
									return (
										<Flexbox alignItems="center" key={index + 'list'}>
											<div className="ItemList">
												<Tag provider={item.provider} />
												<div className="list">
													<LaunchGameImg
														item={gameInfo}
														height={'auto'}
														Game={(props) => {
															this.Game(props);
														}}
													/>
												</div>
												<label>{item.gameName}</label>
											</div>
											<Button
												ghost
												onClick={() => {
													this.gameOpen.OpenGame(gameInfo);
												}}
											>
												<small>立即游戏</small>
											</Button>
										</Flexbox>
									);
								})}
							</div>
						</div>
					) : (
						<p>{unfinishedGamesMessages}</p>
					)}
					<br />
					<Button
						size="large"
						type="primary"
						onClick={() => {
							CloseVisible();
						}}
					>
						我知道了
					</Button>
				</Modal>
			</React.Fragment>
		);
	}
}
export default UnfinishedGamePopUp;
