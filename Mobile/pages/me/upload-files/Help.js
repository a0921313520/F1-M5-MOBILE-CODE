/*
 * @Author: Alan
 * @Date: 2022-04-11 23:02:39
 * @LastEditors: Alan
 * @LastEditTime: 2022-04-19 08:06:36
 * @Description:如何上传文件？
 * @FilePath: \Mobile\pages\Me\Uploadfiles\help.js
 */
import React, { Component } from 'react';
import Layout from '@/components/Layout';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper';
import Flexbox from '@/components/View/Flexbox/';
import ReactIMG from '@/components/View/ReactIMG';
export default class Upload extends Component {
	constructor(props) {
		super(props);
		this.state = {
			Ddatalist: [
				{
					step: 'Bước 1',
					content: 'Chọn tệp để tải lên. Đảm bảo tệp của bạn nhỏ hơn 7MB và ở định dạng .JPG, JPEG hoặc .PNG. Vui lòng xem huớng dẫn đăng tải để xem tệp của bạn có được hỗ trợ không',
					img: '/img/help/doc1.svg'
				},
				{
					step: 'Bước 2',
					content: 'Sau khi tải tệp lên, nhấp vào Gửi. Bạn có thể gửi tệp tối đa 3 lần.',
					img: '/img/help/doc2.svg'
				},
				{
					step: 'Bước 3',
					content: 'Khi bạn gửi tài liệu của mình, hệ thống của chúng tôi sẽ xác minh chúng và bạn sẽ được thông báo khi hoàn tất.',
					img: '/img/help/doc3.svg'
				},
				{
					step: 'Bước 4',
					content: 'Khi bạn gửi tài liệu của mình, hệ thống của chúng tôi sẽ xác minh chúng và bạn sẽ được thông báo khi hoàn tất.',
					img: '/img/help/doc4.svg'
				}
			]
		};
	}

	componentDidMount() {}

	render() {
		const { Ddatalist } = this.state;
		return (
			<Layout
				title="FUN88乐天堂官网｜2022卡塔尔世界杯最佳投注平台"
				Keywords="乐天堂/FUN88/2022 世界杯/世界杯投注/卡塔尔世界杯/世界杯游戏/世界杯最新赔率/世界杯竞彩/世界杯竞彩足球/足彩世界杯/世界杯足球网/世界杯足球赛/世界杯赌球/世界杯体彩app"
				Description="乐天堂提供2022卡塔尔世界杯最新消息以及多样的世界杯游戏，作为13年资深品牌，安全有保障的品牌，将是你世界杯投注的不二选择。"
				BarTitle="Hướng Dẫn Đăng Tải"
				status={2}
				hasServer={false}
				barFixed={true}
			>
				<Swiper
					slidesPerView={1}
					spaceBetween={30}
					loop={true}
					pagination={{
						clickable: true
					}}
					navigation={true}
					modules={[ Pagination, Navigation ]}
					className="DocHelpSwiper"
				>
					{Ddatalist.map((item, index) => {
						return (
							<SwiperSlide key={index + 'doc'}>
								<Flexbox flexFlow="column" className="list">
									<h3>{item.step}</h3>
									<p>{item.content}</p>
									<ReactIMG src={item.img} />
								</Flexbox>
							</SwiperSlide>
						);
					})}
				</Swiper>
			</Layout>
		);
	}
}
