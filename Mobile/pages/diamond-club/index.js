import Layout from '@/components/Layout';
import Toast from '@/components/View/Toast';
import { GetDiamondClubDetail, GetVipFaqList } from '@/api/about';
import { Swiper, SwiperSlide } from 'swiper/react';
import Tabs, { TabPane } from 'rc-tabs';
import { ReactSVG } from '@/components/View/ReactSVG';
import { CmsBanner } from '@/api/home';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import Collapse, { Panel } from 'rc-collapse';
import ReactIMG from '@/components/View/ReactIMG';
import React from 'react';
import { getStaticPropsFromStrapiSEOSetting } from '@/lib/seo';

export async function getStaticProps() {
	return await getStaticPropsFromStrapiSEOSetting('/diamond-club'); //參數帶本頁的路徑
}
const content = {
	left: (
		<div className="">
			<ReactSVG
				className="back-icon"
				src="/img/svg/LeftArrow.svg"
				onClick={() => {
					history.go(-1);
				}}
			/>
		</div>
	),
	right: <div className="header-tools-wrapper">{/* <Service /> */}</div>
};
class AboutDetail extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			ContentData: {
				general_member: "<table>\t<tbody>\t\t<tr>\t\t\t<td>一般会员等级</td>\t\t</tr>\t</tbody></table>",
				VIP_Level: "<table>\t<tbody>\t\t<tr>\t\t\t<td>1. Hiệu lực từ ngày 11 tháng 1 năm 2018</td>\t\t</tr>\t\t<tr>\t\t\t<td>2. FUN88 chỉ tính doanh thu trên tiêu chuẩn thông thường (khuyến mãi sự kiện và khuyến mãi đăng ký sẽ không được tính)</td>\t\t</tr>\t</tbody></table>",
				VIP_special: "<table>\t<caption>VIP 专享权益</caption>\t<tbody>\t\t<tr>\t\t\t<td>\t\t\t<table>\t\t\t\t<tbody>\t\t\t\t\t<tr>\t\t\t\t\t\t<td> </td>\t\t\t\t\t\t<td>Kim cương Đồng</td>\t\t\t\t\t\t<td>Kim cương Bạc</td>\t\t\t\t\t\t<td>Kim cương Vàng</td>\t\t\t\t\t</tr>\t\t\t\t\t<tr>\t\t\t\t\t\t<td>Độc quyền</td>\t\t\t\t\t\t<td>&#10004;</td>\t\t\t\t\t\t<td>&#10004;</td>\t\t\t\t\t\t<td>&#10004;</td>\t\t\t\t\t</tr>\t\t\t\t\t<tr>\t\t\t\t\t\t<td>Đẳng cấp</td>\t\t\t\t\t\t<td>&#10004;</td>\t\t\t\t\t\t<td>&#10004;</td>\t\t\t\t\t\t<td>&#10004;</td>\t\t\t\t\t</tr>\t\t\t\t\t<tr>\t\t\t\t\t\t<td>Thưởng mừng</td>\t\t\t\t\t\t<td>2,999đ</td>\t\t\t\t\t\t<td>6,999đ</td>\t\t\t\t\t\t<td>12,999đ</td>\t\t\t\t\t</tr>\t\t\t\t\t<tr>\t\t\t\t\t\t<td>Quà ngày lễ</td>\t\t\t\t\t\t<td>&#10004;</td>\t\t\t\t\t\t<td>&#10004;</td>\t\t\t\t\t\t<td>&#10004;</td>\t\t\t\t\t</tr>\t\t\t\t\t<tr>\t\t\t\t\t\t<td>Quà sinh nhật</td>\t\t\t\t\t\t<td>888đ</td>\t\t\t\t\t\t<td>1888đ</td>\t\t\t\t\t\t<td>2888đ</td>\t\t\t\t\t</tr>\t\t\t\t</tbody>\t\t\t</table>\t\t\t</td>\t\t</tr>\t\t<tr>\t\t\t<td>1. Thành viên VIP được hưởng ưu đãi độc quyền.</td>\t\t</tr>\t\t<tr>\t\t\t<td>2. Thành viên VIP được mời tham gia các hoạt động quy mô lớn (như tiệc tùng, du lịch cao cấp) do FUN88 tổ chức</td>\t\t</tr>\t\t<tr>\t\t\t<td>3. Ngoài việc tận hưởng các khoản tiền thưởng mà các thành viên bình thường được hưởng, bạn cũng có thể được hưởng các khoản hoàn trả cao hơn và nhiều tùy chọn tiền thưởng hơn</td>\t\t</tr>\t\t<tr>\t\t\t<td>4. FUN88 có quyền sửa đổi, sửa đổi và giải thích cuối cùng về sự kiện này; và quyền thay đổi sự kiện này mà không cần thông báo trước</td>\t\t</tr>\t</tbody></table>"
			},
			ViPLevel: {VIP_special: "<table>\t<caption>Quyền lợi dành riêng cho VIP</caption>\t<tbody>\t\t<tr>\t\t\t<td>\t\t\t<table>\t\t\t\t<tbody>\t\t\t\t\t<tr>\t\t\t\t\t\t<td> </td>\t\t\t\t\t\t<td>Kim cương Đồn</td>\t\t\t\t\t\t<td>Kim cương Bạc</td>\t\t\t\t\t\t<td>Kim cương Vàng</td>\t\t\t\t\t</tr>\t\t\t\t\t<tr>\t\t\t\t\t\t<td>Độc quyền</td>\t\t\t\t\t\t<td>&#10004;</td>\t\t\t\t\t\t<td>&#10004;</td>\t\t\t\t\t\t<td>&#10004;</td>\t\t\t\t\t</tr>\t\t\t\t\t<tr>\t\t\t\t\t\t<td>Đẳng cấp</td>\t\t\t\t\t\t<td>&#10004;</td>\t\t\t\t\t\t<td>&#10004;</td>\t\t\t\t\t\t<td>&#10004;</td>\t\t\t\t\t</tr>\t\t\t\t\t<tr>\t\t\t\t\t\t<td>Thưởng mừng</td>\t\t\t\t\t\t<td>2,999đ</td>\t\t\t\t\t\t<td>6,999đ</td>\t\t\t\t\t\t<td>12,999đ</td>\t\t\t\t\t</tr>\t\t\t\t\t<tr>\t\t\t\t\t\t<td>Quà ngày lễ</td>\t\t\t\t\t\t<td>&#10004;</td>\t\t\t\t\t\t<td>&#10004;</td>\t\t\t\t\t\t<td>&#10004;</td>\t\t\t\t\t</tr>\t\t\t\t\t<tr>\t\t\t\t\t\t<td>Quà sinh nhật</td>\t\t\t\t\t\t<td>888đ</td>\t\t\t\t\t\t<td>1888đ</td>\t\t\t\t\t\t<td>2888đ</td>\t\t\t\t\t</tr>\t\t\t\t</tbody>\t\t\t</table>\t\t\t</td>\t\t</tr>\t\t<tr>\t\t\t<td>1. Thành viên VIP được hưởng ưu đãi độc quyền.</td>\t\t</tr>\t\t<tr>\t\t\t<td>2. Thành viên VIP được mời tham gia các hoạt động quy mô lớn (như tiệc tùng, du lịch cao cấp) do FUN88 tổ chức</td>\t\t</tr>\t\t<tr>\t\t\t<td>3. Ngoài việc tận hưởng các khoản tiền thưởng mà các thành viên bình thường được hưởng, bạn cũng có thể được hưởng các khoản hoàn trả cao hơn và nhiều tùy chọn tiền thưởng hơn</td>\t\t</tr>\t\t<tr>\t\t\t<td>4. FUN88 có quyền sửa đổi, sửa đổi và giải thích cuối cùng về sự kiện này; và quyền thay đổi sự kiện này mà không cần thông báo trước</td>\t\t</tr>\t</tbody></table>"},
			ViPDetails: {
				contact_us: "<table>\t<caption>FUN88 coin：Thể thao, Casino, Slot, Xổ Số</caption>\t<tbody>\t\t<tr>\t\t\t<td>\t\t\t<table>\t\t\t\t<tbody>\t\t\t\t\t<tr>\t\t\t\t\t\t<td> </td>\t\t\t\t\t\t<td>Số tiền</td>\t\t\t\t\t\t<td>FUN88 coin​</td>\t\t\t\t\t</tr>\t\t\t\t\t<tr>\t\t\t\t\t\t<td>Thành viên Đồng</td>\t\t\t\t\t\t<td>280</td>\t\t\t\t\t\t<td>1</td>\t\t\t\t\t</tr>\t\t\t\t\t<tr>\t\t\t\t\t\t<td>Thành viên Bạc</td>\t\t\t\t\t\t<td>280</td>\t\t\t\t\t\t<td>1.2</td>\t\t\t\t\t</tr>\t\t\t\t\t<tr>\t\t\t\t\t\t<td>Thành viên Vàng</td>\t\t\t\t\t\t<td>280</td>\t\t\t\t\t\t<td>1.5</td>\t\t\t\t\t</tr>\t\t\t\t\t<tr>\t\t\t\t\t\t<td>Thành viên kim cương<br />\t\t\t\t\t\t(Tất cả cấp kim cương)</td>\t\t\t\t\t\t<td>280</td>\t\t\t\t\t\t<td>2</td>\t\t\t\t\t</tr>\t\t\t\t</tbody>\t\t\t</table>\t\t\t</td>\t\t</tr>\t</tbody></table>",
				e_mail: "<table>\t<caption>FUN88 coin：Live Casino, Bắn Cá</caption>\t<tbody>\t\t<tr>\t\t\t<td>\t\t\t<table>\t\t\t\t<tbody>\t\t\t\t\t<tr>\t\t\t\t\t\t<td> </td>\t\t\t\t\t\t<td>Số tiền</td>\t\t\t\t\t\t<td>FUN88 coin​</td>\t\t\t\t\t</tr>\t\t\t\t\t<tr>\t\t\t\t\t\t<td>Thành viên Đồng</td>\t\t\t\t\t\t<td>500</td>\t\t\t\t\t\t<td>12</td>\t\t\t\t\t</tr>\t\t\t\t\t<tr>\t\t\t\t\t\t<td>Thành viên Bạc</td>\t\t\t\t\t\t<td>700</td>\t\t\t\t\t\t<td>17</td>\t\t\t\t\t</tr>\t\t\t\t\t<tr>\t\t\t\t\t\t<td>Thành viên Vàng</td>\t\t\t\t\t\t<td>900</td>\t\t\t\t\t\t<td>22</td>\t\t\t\t\t</tr>\t\t\t\t\t<tr>\t\t\t\t\t\t<td>Thành viên kim cương<br />\t\t\t\t\t\t(Tất cả cấp kim cương)</td>\t\t\t\t\t\t<td>1200</td>\t\t\t\t\t\t<td>30</td>\t\t\t\t\t</tr>\t\t\t\t</tbody>\t\t\t</table>\t\t\t</td>\t\t</tr>\t</tbody></table>",
				customer_care: "<table>\t<caption>Điều khoản và điều kiện</caption>\t<tbody>\t\t<tr>\t\t\t<td>1. Để tham gia Paradise King Club, bạn phải tuân thủ các quy tắc và điều khoản của nó, đồng thời hoàn toàn đồng ý với các điều khoản sau.</td>\t\t</tr>\t\t<tr>\t\t\t<td>2. Paradise có quyền quyết định chấm dứt hoặc sửa đổi tư cách và phần thưởng của các thành viên Câu lạc bộ Tianwang bất cứ lúc nào mà không cần thông báo trước.</td>\t\t</tr>\t\t<tr>\t\t\t<td>3. Để hiểu đầy đủ các quyền và lợi ích của bạn, chúng tôi khuyến khích bạn nên chủ động kiểm tra các quy tắc và điều khoản mới nhất, đồng thời chúng tôi sẽ cố gắng hết sức để cung cấp các điều khoản ưu đãi hơn.</td>\t\t</tr>\t\t<tr>\t\t\t<td>4. Le Paradise có quyền thường xuyên kiểm tra hồ sơ, nhật ký giao dịch, nếu phát hiện thành viên nào có hành vi gian lận, mở nhiều tài khoản để kiếm tiền thưởng và là dân cờ bạc chuyên nghiệp, Le Paradise có quyền thu hồi tư cách thành viên có vấn đề.</td>\t\t</tr>\t\t<tr>\t\t\t<td>5. Khi sản phẩm hết hàng, Lê Thiên có quyền thay thế sản phẩm quý khách đã đổi bằng sản phẩm có giá trị tương đương.</td>\t\t</tr>\t\t<tr>\t\t\t<td>6. Trong Tianwang Club, chỉ những tài khoản tên thật (tên tài khoản đã đăng ký giống với tên tài khoản ngân hàng) mới được coi là tài khoản hợp lệ và chỉ những tài khoản tên thật mới có thể đặt cược trong tài khoản.</td>\t\t</tr>\t\t<tr>\t\t\t<td>7. Leto sẽ cố gắng hết sức để trao giải thưởng, nhưng tốc độ cuối cùng vẫn bị hạn chế bởi hiệu quả và chất lượng dịch vụ của công ty hậu cần bên thứ ba.</td>\t\t</tr>\t\t<tr>\t\t\t<td>8. Nếu thông tin do thành viên cung cấp không đầy đủ hoặc không hợp lệ, giao dịch sẽ bị hủy hoặc bị từ chối và Le Coins sẽ được hoàn trả. Paradise sẽ thông báo cho bạn về lý do hủy quy đổi thông qua thông báo trên trang web. Thành viên Kim cương chỉ đủ điều kiện nâng cấp nếu họ được mời và mọi lý do vận động hành lang hoặc yêu cầu đăng ký sẽ không được chấp nhận</td>\t\t</tr>\t\t<tr>\t\t\t<td>9. Thành viên Kim cương chỉ đủ điều kiện nâng cấp nếu họ được mời, bất kỳ lý do vận động hành lang, yêu cầu đăng ký nào và sẽ không được giải trí.</td>\t\t</tr>\t\t<tr>\t\t\t<td>10. Paradise có quyền giải thích các quy tắc áp dụng cuối cùng của Tianwang Club.</td>\t\t</tr>\t</tbody></table>"
			},
			vipArr: [],
			title: '',
			VipFaqList: [
				{
					id: "8803",
					title: "Cách nào để nhận được FUN88 Coin ?",
					body: "<p>Miễn là bạn có tài khoản Le Paradise và đã đặt cược, thì bạn là thành viên của FUN88</p>"
				},
				{
					id: "8804",
					title: "Công dụng của FUN88 Coin ?",
					body: "<p>Nhận FUN88 Coin, bạn có thể sử dụng chúng để đổi lấy các sản phẩm yêu thích của mình. Vui lòng tham khảo nội dung chi tiết trong Câu lạc bộ FUN88 VIP.</p>"
				},
				{
					id: "8805",
					title: "Cách lên cấp thành viên kim cương ?​",
					body: "<p>Bạn sẽ được mời trở thành thành viên của FUN88 VIP tùy theo tình hình cụ thể của tài khoản. Đồng thời, chỉ các thành viên Star Diamond của FUN88 VIP mới được tham gia.</p>"
				},
				{
					id: "8806",
					title: "Cần thêm điểm để duy trì cấp VIP cao hơn ?",
					body: "<p>FUN88 VIP Club hiện được chia thành 6 cấp độ, theo thứ tự: Bạc, Vàng, Bạch kim, Kim cương Bạc, Kim cương Vàng và Thành viên Kim cương Ngôi sao. Mỗi khi bạn nâng cấp một cấp độ, bạn có thể nhận được nhiều phần thưởng hào phóng hơn.</p>"
				},
				{
					id: "8807",
					title: "Nếu điểm cấp độ không được duy trì/hoàn thành trong thời gian nhất định ?",
					body: "<p>Ngoài cấp độ ban đầu - thành viên Bạc, chúng tôi có một khoảng thời gian nhất định, bạn cần duy trì mức điểm cần thiết.</p>"
				},
				{
					id: "8808",
					title: "Cần thêm điểm để duy trì cấp VIP cao hơn ?",
					body: "<p>Bạn sẽ được mời trở thành thành viên của FUN88 VIP tùy theo tình hình cụ thể của tài khoản. Đồng thời, chỉ các thành viên Star Diamond của FUN88 VIP mới được tham gia.</p>"
				},
				{
					id: "8809",
					title: "Phải làm gì khi chưa nhận được quà tặng VIP từ FUN88 ?",
					body: "<p>Bạn có thể theo dõi trạng thái đơn đặt hàng bằng cách gửi email đến Rewards@fun88.com, phần thưởng của bạn sẽ sớm có hoặc liên hệ Live Chat</p>"
				}
			],
			vip_normalBanner: [
				{
					title: "白银会员",
					body: "",
					category: "vip_normal",
					cmsImageUrl: "/img/about/vip/VN_Member_Silver.png",
					action: {
						actionId: 0,
						actionName: "No Action"
					}
				},
				{
					title: "黄金会员",
					body: "",
					category: "vip_normal",
					cmsImageUrl: "/img/about/vip/VN_Member_Gold.png",
					action: {
						actionId: 0,
						actionName: "No Action"
					}
				},
				{
					title: "铂金会员",
					body: "",
					category: "vip_normal",
					cmsImageUrl: "/img/about/vip/VN_Member_Platinum.png",
					action: {
						actionId: 0,
						actionName: "No Action"
					}
				}
			],
			vip_highRollerBanner:[
				{
					title: "银钻会员",
					body: "",
					category: "vip_highRoller",
					cmsImageUrl: "/img/about/vip/VN_VIP_Silver.png",
					action: {
						actionId: 0,
						actionName: "No Action"
					}
				},
				{
					title: "金钻会员",
					body: "",
					category: "vip_highRoller",
					cmsImageUrl: "/img/about/vip/VN_VIP_Gold.png",
					action: {
						actionId: 0,
						actionName: "No Action"
					}
				},
				{
					title: "星钻会员",
					body: "",
					category: "vip_highRoller",
					cmsImageUrl: "/img/about/vip/VN_VIP_StarDiamond.png",
					action: {
						actionId: 0,
						actionName: "No Action"
					}
				}
			],
			vip_detailBanner:[
				{
					title: "VIP Banner Detail",
					body: "",
					category: "vip_detail",
					cmsImageUrl: "https://cache.f866u.com/sites/default/files/2022-06/VIP_Banner.jpg",
					action: {
						actionId: 0,
						actionName: "No Action"
					}
				},
				{
					title: "VIP test data -1",
					body: "",
					category: "vip_detail",
					cmsImageUrl: "https://cache.f866u.com/sites/default/files/2022-02/123_0.png",
					action: {
						actionId: 0,
						actionName: "No Action"
					}
				}
			]
		};
	}

	componentDidMount() {
		if (typeof window !== 'undefined') {
			let id = window.location.search ? window.location.search.split('?key=')[1] : '';
			this.setState({
				TypeID: id
			});
			// //CMS api轉Hardcode，未來可能會提供其他api fetch資料，先保留。
			// id && this.getHtml(id);
		}
		// //CMS api轉Hardcode，未來可能會提供其他api fetch資料，先保留。
		// this.GetCmsBanne();
	}

	/**
	 * @description:  获取相关banner
	 * @param {*}
	 * @return {*}
	*/
	// // CMS api轉Hardcode，未來可能會提供其他api fetch資料，先保留。
	// GetCmsBanne = () => {
	// 	let BannerArray = [ 'vip_normal', 'vip_highRoller', 'vip_detail' ];
	// 	BannerArray.map((type) => {
	// 		console.log(type);
	// 		CmsBanner(type, (res) => {
	// 			if (res.message === 'data not found') {
	// 				return;
	// 			}
	// 			if (res) {
	// 				this.setState({
	// 					[type + 'Banner']: res
	// 				});
	// 			}
	// 		});
	// 	});
	// };

	/**
	 * @description:  获取相关banner
	 * @param {*}
	 * @return {*}
	*/
	// // CMS api轉Hardcode，未來可能會提供其他api fetch資料，先保留。
	// GetVipFaq = () => {
	// 	GetVipFaqList((res) => {
	// 		if (res) {
	// 			if (res.message === 'data not found') {
	// 				return;
	// 			}
	// 			this.setState({
	// 				VipFaqList: res
	// 			});
	// 		}
	// 	});
	// };

	/**
	 * @description: 获取内容
	 * @param {*} id
	 * @return {*}
  	*/
	// // CMS api轉Hardcode，未來可能會提供其他api fetch資料，先保留。
	// getHtml = (id) => {
	// 	const hide = Toast.loading('加载中...');
	// 	GetDiamondClubDetail((res) => {
	// 		hide();
	// 		if (res.message === 'data not found') {
	// 			return;
	// 		}
	// 		if (res && res.length) {
	// 			for (let i = 0; i < res.length; i++) {
	// 				if (res[i].id == '5658') {
	// 					// vip
	// 					let ViPLevel = {};
	// 					let body = res[i].body;
	// 					for (let key in body) {
	// 						if (key !== 'VIP_Level' && key !== 'general_member') {
	// 							ViPLevel[key] = body[key];
	// 						}
	// 					}
	// 					this.setState({
	// 						ContentData: res[i].body,
	// 						title: res[i].title,
	// 						ViPLevel: ViPLevel
	// 					});
	// 				}
	// 				if (res[i].id == '5659') {
	// 					let ViPDetails = {};
	// 					let body = res[i].body;
	// 					for (let key in body) {
	// 						ViPDetails[key] = body[key];
	// 					}
	// 					console.log(body);
	// 					this.setState({
	// 						ViPDetails
	// 					});
	// 				}
	// 			}
	// 		}
	// 	});
	// };

	/**
	 * @description: 切换TAB
	 * @param {*} key
	 * @return {*}
  	*/
	onClickTabs = (key) => {
		if (key == 1) {
			this.setState(
				{
					TypeID: 5658
				},
				() => {
					// //CMS api轉Hardcode，未來可能會提供其他api fetch資料，先保留。
					// this.getHtml();
				}
			);
		} else {
			this.setState(
				{
					TypeID: 5659
				},
				() => {
					// // CMS api轉Hardcode，未來可能會提供其他api fetch資料，先保留。
					// this.getHtml();
					// this.GetVipFaq();
				}
			);
		}
	};

	generalMemberContentSpliter = (html)=>{
		const headerStartIndex = html.indexOf("<caption>") + "<caption>".length
		const headerEndIndex = html.indexOf("</caption>")
		const header = html.slice(headerStartIndex,headerEndIndex)
		const note = html.replace(`<caption>${header}</caption>`,"")
		return {header, note}
	}

	render() {
		const {
			ContentData,
			ViPLevel,
			VipFaqList,
			vip_detailBanner,
			ViPDetails,
			vip_normalBanner,
			vip_highRollerBanner
		} = this.state;
		console.log(ViPLevel);
		console.log(ViPDetails);
		return (
			<Layout
				title="FUN88乐天堂官网｜2022卡塔尔世界杯最佳投注平台"
				Keywords="乐天堂/FUN88/2022 世界杯/世界杯投注/卡塔尔世界杯/世界杯游戏/世界杯最新赔率/世界杯竞彩/世界杯竞彩足球/足彩世界杯/世界杯足球网/世界杯足球赛/世界杯赌球/世界杯体彩app"
				Description="乐天堂提供2022卡塔尔世界杯最新消息以及多样的世界杯游戏，作为13年资深品牌，安全有保障的品牌，将是你世界杯投注的不二选择。"
				status={0}
				seoData={this.props.seoData}
			>
				<div id="DiamondClub" className="information__main">
					<Tabs
						prefixCls="tabsOval"
						defaultActiveKey={'1'}
						tabBarExtraContent={content}
						onChange={this.onClickTabs}
					>
						<TabPane tab={<div className="notice_tab">VIP</div>} key="1">
							<div>
								<div className="tlc-about ViPLevel">
									<div className="Bannertitle">Diamond Club</div>
									<ReactIMG
										onClick={() => {
											window.open('https://www.fun66996.com/',`_blank`);
										}}
										style={{width: '100%', padding: '0 0.1rem'}}
										src="/img/about/vip/diamondclub.png"
									/>
								</div>
								{// 会员等级
								this.state.TypeID == '5658' ? (
									<div id={`tlc-vip`} className="tlc-about ViPLevel">
											<div className="Bannertitle">Cấp độ thành viên thường</div>
											<div className="GeneralCarouse">{<CarouselItem data={vip_normalBanner} />}</div>
											<div
												className="HeaderCarousel Bannertitle"
												dangerouslySetInnerHTML={{
													__html: ContentData.VIP_Level
												}}
											/>
										{/* <div
											className="HeaderCarousel Bannertitle"
											dangerouslySetInnerHTML={{
												__html: ContentData.VIP_Level
											}}
										/> */}
										{/* <div
											className="HeaderCarousel Bannertitle"
											dangerouslySetInnerHTML={{
												__html: ContentData.general_member
											}}
										/> */}

										<div className="Bannertitle">Cấp độ thành viên VIP</div>
										<CarouselItem data={vip_highRollerBanner} />
										<div className="content AboutItem">
											<AboutItem ContentData={ViPLevel} />
										</div>
									</div>
								) : (
									<div style={{ margin: '20px' }}>
										<SkeletonTheme baseColor="white" highlightColor="#ddd">
											<Skeleton count={1} height="30px" width="150px" borderRadius="25px" />
											<Skeleton count={1} height="200px" borderRadius="25px" />
											<Skeleton count={1} height="30px" width="150px" borderRadius="25px" />
											<Skeleton count={1} height="200px" borderRadius="25px" />
											<Skeleton count={10} height="30px" borderRadius="25px" />
										</SkeletonTheme>
									</div>
								)}
							</div>
						</TabPane>
						<TabPane tab={<div className="notice_tab">Chi Tiết</div>} key="2">
							{// 详情
							this.state.TypeID == '5659' ? (
								<React.Fragment>
									<div className="TopBanner">
										{/* <img src={vip_detailBanner && vip_detailBanner[0].cmsImageUrl} width="100%" /> */}
										<ReactIMG
											style={{width: '100%'}}
											src="/img/about/vip/banner.jpg"
										/>
									</div>
									<div id={`tlc-vip`} className="tlc-about ">
										<div
											className="tlc-vip-first"
											dangerouslySetInnerHTML={{
												__html: ViPDetails.contact_us
											}}
										/>
										<div
											className="tlc-vip-first"
											dangerouslySetInnerHTML={{
												__html: ViPDetails.e_mail
											}}
										/>
										<div className="FaqTitle">Vấn đề thường gặp</div>
										<Collapse accordion={true} onChange={() => {}}>
											{VipFaqList.map((item, index) => {
												return (
													<Panel header={item.title} key={index + 'list'}>
														<div
															className="FaqContent"
															dangerouslySetInnerHTML={{
																__html: item.body
															}}
														/>
													</Panel>
												);
											})}
										</Collapse>
										<div
											className="tlc-vip-first"
											dangerouslySetInnerHTML={{
												__html: ViPDetails.customer_care
											}}
										/>
									</div>
								</React.Fragment>
							) : null}
						</TabPane>
					</Tabs>
				</div>
			</Layout>
		);
	}
}

//列表
class AboutItem extends React.Component {
	state = { count: 0 };
	render() {
		return (
			<React.Fragment>
				{Object.keys(this.props.ContentData).map((item2, i2) => {
					return (
						<div
							key={i2}
							className={`tlc${item2}`}
							id={`tlc${item2}`}
							dangerouslySetInnerHTML={{
								__html: this.props.ContentData[item2]
							}}
						/>
					);
				})}
			</React.Fragment>
		);
	}
}

//幻灯片
class CarouselItem extends React.Component {
	render() {
		console.log(this.props.data);
		return (
			<Swiper
				slidesPerView="1.12"
				slidesOffsetAfter={document.body.clientWidth * 0.115}
				watchSlidesProgress={true}
			>
				{this.props.data &&
					this.props.data.length != 0 &&
					this.props.data.map((item, index) => {
						return (
							<SwiperSlide key={index + 'list'}>
								<ReactIMG
									src={item.cmsImageUrl}
									alt="Fun88"
									style={{ width: '100%', verticalAlign: 'top' }}
								/>
							</SwiperSlide>
						);
					})}
			</Swiper>
		);
	}
}

export default AboutDetail;
