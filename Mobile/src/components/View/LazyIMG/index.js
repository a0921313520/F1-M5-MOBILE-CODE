/*
 * @Author: Alan
 * @Date: 2022-02-24 03:59:21
 * @LastEditors: Alan
 * @LastEditTime: 2022-02-28 11:01:04
 * @Description: 图片加载占位
 * @FilePath: \Mobile\src\components\LazyIMG\index.js
 */
import React, { Component } from 'react';
import Images from 'react-async-image';
export default class LazyLd extends Component {
	constructor() {
		super();
		this.state = {
			done: false
		};
	}
	componentWillMount() {
		// 创建一个虚拟图片
		const img = new Image();
		// 发出请求，请求图片
		img.src = this.props.src;
		// 当图片加载完毕
		img.onload = () => {
			this.setState({
				done: true
			});
		};
	}
	render() {
		return (
			<div className="image-loading">
				{this.state.done ? (
					<Images
						src={this.props.src}
						style={{
							width: this.props.width,
							height: this.props.height
						}}
						className="image"
						placeholder={<div className="placeholder">oops</div>}
					/>
				) : (
					<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAE8AAAAkCAMAAAD/2ZctAAAAVFBMVEUAAAD///////////////////////////////////////////////////////////////////////////////////////////////////////////8wXzyWAAAAG3RSTlMAgMBAP+DQYBAvkLAgUKDwz3DvqMWfh2VfukqrpqS7AAAClUlEQVRIx8WV3ZLbIAyFQQQbbOzE3u3utnr/96x+sLA3nQ6dyUy/i0Q24XCEBHEH+Xbb/BzdC5iwUV6g50knAsDklzzCBbchOECfeKV+vYE+SWl0bsUzMGPD9+cL6jKQqmdINfL3CAiVAZdePRA9ED0lIE51qL0KvfZ23AFgR3wAqL8flKoEGxpDv70T3qL6GL1AQXc5BBaiz191syoTPm4KvrleRtk5xDsla/un0dxf3kbkemQqKQnrG6rv3LxH2cyvXrkPsieW9sCRGq4FvmOjT61sbC99PciS6iVPqQ9U4U/zt1IrdrbLQitnckcaOUnLUBhz0qq/A8FviT69DI8PyXbNVBPh7hMnPeAV9w8kzWaDd3j7tKX8zzdvjO6/k6hvXb4RSUolUbJnieS9Yq8PilYkYiPq8cvHvYgl8OfKzxwNrjyw4a+38SNpgRvgpAztcNTxUtsS9K3xbfqoLduYXaslSOTttHkZb9nYcGOr+quvBGd3kziFOmFPqudlfNJLl5B0B8+wseC8ujKKZs1oNNtOgXzZchqBqDDQ9LwzQtPXQgCqQZ0wZltOI7A/RYme9ew5azTYVkc2ELSMxCYLD0c3lJ3TV70IB6ZvyuKSfyNRKHhmuZZ7lqvuuV6L9KXMV5WVDXJ0nbB+a7eiWTfu+vNg7RyyfUofq+sBAKL2feRZQNQ7E3S8MjkwPVFOMt+WjdIfY6tnsHIvUp5jvjHbs6ys+ehmWj3DSc+qqdFxXA1ffadJ5/tqAJ70uLLFm9520nPG03n0onIYnMQ1yH++lW/nx2mX42bH1RiwEZObDwNQ2+dvxzf8QS81wSGrzGbtuFyvj9n0Wr8w7sI4AUSq9XLYDcfOTjR4tp9diadmG93L+Q1Yc25H+uU6dgAAAABJRU5ErkJggg==" />
				)}
			</div>
		);
	}
}
