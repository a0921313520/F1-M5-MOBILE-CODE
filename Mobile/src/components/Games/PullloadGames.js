import ReactPullLoad, { STATS } from 'react-pullload';
import React, { Component } from 'react';
import LaunchGameImg from '@/components/Games/LaunchGame';
import Tag from '@/components/Games/Tag';
import { getUrlVars } from '@/lib/js/Helper';
import HostConfig from '@/server/Host.config';
class PullloadGames extends Component {
	constructor(props) {
		super(props);
		this.state = {
			hasMore: true,
			data: [],
			action: STATS.init,
			index: 0, //滑动的次数
			count: 0,
			size: 10
		};
	}

	componentDidMount() {
		// global.Pushgtagpiwikurl && global.Pushgtagpiwikurl(`Games/Details/${window.location.search}`);
		this.handRefreshing();
		const {vendor} = this.props;
		this.setState({
			GameType: vendor
		});
	}

	handleAction = (action) => {
		//new action must do not equel to old action
		if (action === this.state.action) {
			return false;
		}

		if (action === STATS.refreshing) {
			this.handRefreshing();
		} else if (action === STATS.loading) {
			this.handLoadMore();
		} else {
			//DO NOT modify below code
			this.setState({
				action: action
			});
		}
	};

	handRefreshing = () => {
		if (STATS.refreshing === this.state.action) {
			return false;
		}
		this.setState({
			data: this.Pagedata(this.props.data, this.state.size)[0]
		});
		setTimeout(() => {
			this.setState({
				hasMore: true,
				action: STATS.refreshed,
				index: parseInt(this.props.data.length / this.state.size)
			});
			console.log(parseInt(this.props.data.length / this.state.size));
		}, 1000);
		this.setState({
			action: STATS.refreshing
		});
	};

	handLoadMore = () => {
		if (STATS.loading === this.state.action) {
			return false;
		}
		//无更多内容则不执行后面逻辑
		if (!this.state.hasMore) {
			return;
		}

		setTimeout(() => {
			if (this.state.index === 0) {
				this.setState({
					action: STATS.reset,
					hasMore: false
				});
			} else {
				this.setState({
					data: [
						...this.state.data,
						...(this.Pagedata(this.props.data, this.state.size)[this.state.count + 1] || [])
					],
					action: STATS.reset,
					index: this.state.index - 1,
					count: this.state.count + 1
				});
			}
		}, 1000);

		this.setState({
			action: STATS.loading
		});
	};

	Pagedata = (sourceData, pageSize) => {
		const pageNum = Math.ceil(sourceData.length / pageSize); //页数
		return new Array(pageNum)
			.fill([])
			.map((item, index) => sourceData.slice(index * pageSize, (index + 1) * pageSize));
	};

	render() {
		const { data, hasMore, GameType } = this.state;
		let heightImg = GameType == 'P2P' ? '120px' : '106px';
		return (
			<ReactPullLoad
				downEnough={150}
				action={this.state.action}
				handleAction={this.handleAction}
				hasMore={hasMore}
				style={{ paddingTop: 0 }}
				distanceBottom={1000}
			>
				<div className="GameMiniLogo">
					{data &&
						data.map((item, index) => {
							if (HostConfig.Config.isGameLive) {
								if (!item.isLive) {
									return;
								}
							}
							return (
								<div className="ItemList" key={index + 'list'}>
									<Tag provider={item.provider} />

									<div className="list">
										<LaunchGameImg
											item={item}
											height={heightImg}
											location="DetailsPage"
											GameType={GameType}
										/>
									</div>
									<label>{item.gameName}</label>
								</div>
							);
						})}
				</div>
			</ReactPullLoad>
		);
	}
}
export default PullloadGames;
