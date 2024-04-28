import React, { Component } from 'react';
import Videojs from 'video.js';

// import Sportsbti from './../../../pages/sports-bti/detail/index';
// 添加hls插件，以保证播放m3u8格式的视频
import 'videojs-contrib-hls';
// import '@videojs/http-streaming';

// 给window上添加videojs, zh-CN.js 语言注册依赖 videojs.addLanguage()方法
// 配置了不生效的话  把public/index.html  里的标签  <html lang="en">  </html>   lang设置为 "zh-CN"
// window.videojs = Videojs;
// import("video.js/dist/lang/zh-CN.js");

class VideoPlayer extends Component {
	// 默认的props
	static defaultProps = {
		src: '',
		height: 360,
		width: 640
	};

	constructor(props) {
		super(props);
		this.state = {
			videoId: 'custom-video-live'
		};
	}

	componentDidUpdate(prevProps) {
		if (this.state.src !== this.props.src && this.props.src) {
			this.setState({src: this.props.src}, () => {
				this.initVideo(this.props.src);
			})
		}
	}

	componentWillUnmount() {
		// 销毁播放器
		if (this.player) {
			this.player.dispose();
		}
	}

	// 初始化
	initVideo(src) {
		const { videoId } = this.state;
		const { height, width, autoPlay } = this.props;

		this.player = Videojs(videoId, {
			autoplay: autoPlay ? 'any' : false, //縮小窗要自動播放
			controls: false,
			preload: 'auto',
			playsinline: true,
		});

		this.player.src({ src });
		this.props.setPlayer(this.player);
	}

	render() {
		const { videoId } = this.state;
		return (
			<div
				className="custom-video-warpper"
				style={{
					display: this.props.display ? 'block' : 'none'
				}}
			>
				<div data-vjs-player style={{width: '100%',height: '100%'}}>
					<video id={videoId} className="video-js" style={{width: '100%', height: '100%', objectFit:'fill'}} />
				</div>
			</div>
		);
	}
}

export default VideoPlayer;
