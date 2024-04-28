/*
 * @Author: Alan
 * @Date: 2022-04-20 22:45:27
 * @LastEditors: Alan
 * @LastEditTime: 2022-05-12 13:35:50
 * @Description: 问题列表
 * @FilePath: \NextjsUp\pages\Me\Help\index.js
 */
import React from 'react';
import Layout from '@/components/Layout';
import { CmsHelpList } from '@/api/help';
import Router from 'next/router';
import Collapse, { Panel } from 'rc-collapse';
import { BsChevronDown, BsChevronRight, BsChevronUp } from 'react-icons/bs';
import Flexbox from '@/components/View/Flexbox/';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { getStaticPropsFromStrapiSEOSetting } from '@/lib/seo';

export async function getStaticProps() {
	return await getStaticPropsFromStrapiSEOSetting('/help'); //參數帶本頁的路徑
}
class Help extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			questionList: [
				{
					id: "1",
					title: "Giới Thiệu Công Ty\r\n",
					menus: [
						{
							id: "11",
							title: "Về Fun88"
						},
						{
							id: "12",
							title: "Thông Tin Liên Hệ"
						}
					]
				},
				{
					id: "2",
					title: "Thông Tin Tài Khoản",
					menus: [
						{
							id: "21",
							title: "Quản Lý Tài Khoản"
						},
					]
				},
				{
					id: "3",
					title: "Khuyến Mãi\r\n",
					menus: [
						{
							id: "31",
							title: "Thưởng"
						},
						{
							id: "32",
							title: "Hoàn Trả"
						},
						{
							id: "33",
							title: "Khuyến Mãi Khác"
						}
					]
				},
				{
					id: "4",
					title: "Thông Tin Ngân Hàng",
					menus: [
						{
							id: "41",
							title: "Gửi Tiền"
						},
						{
							id: "42",
							title: "Hướng Dẫn Chuyển Qũy"
						},
						{
							id: "43",
							title: "Hướng Dẫn Rút Tiền"
						}
					]
				},
				{
					id: "5",
					title: "Thông Tin Điện Thoại",
					menus: [
						{
							id: "51",
							title: "Ứng Dụng Di Động Fun88"
						}
					]
				},
				{
					id: "6",
					title: "Thông Tin Giải Thưởng",
					menus: [
						{
							id: "61",
							title: "Trang Giải Thưởng"
						}
					]
				},
				{
					id: "7",
					title: "Đại Lý",
					menus: [
						{
							id: "71",
							title: "Chương Trình Đại Lý"
						}
					]
				},
				{
					id: "8",
					title: "Chính Sách Cược",
					menus: [
						{
							id: "81",
							title: "Đặt Cược Có Trách Nhiệm"
						},
						{
							id: "82",
							title: "Nguyên Tắc Và Quy Định Đặt Cược"
						},
						{
							id: "83",
							title: "Chính Sách Bảo Mật"
						},
						{
							id: "84",
							title: "Tuyên Bố Trách Nhiệm"
						}
					]
				}
			]
,
			loading: false
		};
	}

	componentDidMount() {
		// // CMS api轉Hardcode，未來可能會提供其他api fetch資料，先保留
		// this.GetQuestionList();
	}

	/**
     * @description: 获取帮助中心列表
     * @param {*}
     * @return {*}
    */
// // CMS api轉Hardcode，未來可能會提供其他api fetch資料，先保留
	// GetQuestionList = () => {
	// 	//Toast.loading();
	// 	CmsHelpList((res) => {
			
	// 		//Toast.destroy();
	// 		if (res && res.length) {
	// 			this.setState({
	// 				questionList: res
	// 			});
	// 		}
	// 		this.setState({
	// 			loading: false
	// 		});
	// 	});
	// };

	render() {
		const { questionList, loading } = this.state;
		return (
			<Layout
				title="FUN88乐天堂官网｜2022卡塔尔世界杯最佳投注平台"
				Keywords="乐天堂/FUN88/2022 世界杯/世界杯投注/卡塔尔世界杯/世界杯游戏/世界杯最新赔率/世界杯竞彩/世界杯竞彩足球/足彩世界杯/世界杯足球网/世界杯足球赛/世界杯赌球/世界杯体彩app"
				Description="乐天堂提供2022卡塔尔世界杯最新消息以及多样的世界杯游戏，作为13年资深品牌，安全有保障的品牌，将是你世界杯投注的不二选择。"
				BarTitle="Trợ Giúp"
				status={2}
				hasServer={false}
				barFixed={true}
				seoData={this.props.seoData}
			>
				<div id="HelpBox">
					<Collapse
						accordion={true}
						onChange={() => {}}
						expandIcon={(isActive) => {
							
							return (!isActive.isActive ? <BsChevronDown size={12} color="#222222" /> : <BsChevronUp size={12} color="#222222" />)
						}}
					>
						{questionList.map((item, index) => {
							return (
								<Panel header={item.title} key={index + 'list'}>
									{item.menus.map((listItem, index) => {
										return (
											<Flexbox
												key={index + 'list'}
												className="list-item"
												onClick={() => {
													Router.push(`/help/Detail?id=${listItem.id}`);
												}}
											>
												<span>{listItem.title}</span>
												<BsChevronRight size={12} color="#CCCCCC" />
											</Flexbox>
										);
									})}
								</Panel>
							);
						})}
					</Collapse>
					{loading && (
						<SkeletonTheme baseColor="#dbdbdb" highlightColor="#ffffff">
							<Skeleton count={8} height="50px" />
						</SkeletonTheme>
					)}
				</div>
			</Layout>
		);
	}
}

export default Help;
