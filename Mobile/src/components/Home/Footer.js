/*
 * @Author: Alan
 * @Date: 2022-01-25 20:48:48
 * @LastEditors: Alan
 * @LastEditTime: 2022-12-01 18:35:42
 * @Description: 底部
 * @FilePath: \Mobile\src\components\Home\Footer.js
 */
import React, { Component } from 'react';
import Flexbox from '@/components/View/Flexbox/';
import ReactIMG from '@/components/View/ReactIMG';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import DropDownSingle from '@/components/Common/DropDownSingle/';
import { checkIsLogin } from '@/lib/js/util';
import Router from 'next/router';

export default class HomeFooter extends Component {
	constructor(props) {
		super(props);
		this.state = {
		  displaySeo: false,
		  default: { id: '/vn/mobile/', label: 'Tiếng Việt', img: '/img/P5/Home/vn.svg' },
		};

		this.language = [
			{ id: '/cn/mobile/', label: '中文', img: '/img/P5/Home/cn.svg'},
			{ id: '/th/mobile/', label: 'ภาษาไทย', img: '/img/P5/Home/th.svg' },
			{ id: '/vn/mobile/', label: 'Tiếng Việt', img: '/img/P5/Home/vn.svg' },
		];
		
	}
	
	goSelect = (selItem) => { 
		console.log(selItem)
	}
	render() {
		return (
			<React.Fragment>
				{/* 底部合作伙伴 */}
				<Flexbox flexDirection="column" element="section" className="Footer-wrapper">
					{/* <div className='sponsorNew'>
						<p>Đối Tác</p>
						<ReactIMG
							src={`/img/P5/Home/partner.svg`}
						/>
						<p>Đại Sứ Thương Hiệu</p>
						<ReactIMG
							src={`/img/P5/Home/ambassador.svg`}
						/>
					</div> */}
					<br/>
					<Flexbox flex="1" justifyContent="space-between" alignItems="center">
						<label>Tài Trợ</label>
						{!checkIsLogin() &&
							<div className='languageDropDown'>
								<DropDownSingle
									data={this.language}
									selItem={this.state.default}
									changeSel={this.goSelect}
									link={true}
								/>
							</div>
						}
					</Flexbox>

					<Flexbox className="One" height="85px">
						<Flexbox flex="1" justifyContent="fkex" className="list">
							<LazyLoadImage
								src={`${process.env.BASE_PATH}/img/P5/Icon/Logo-NUFC-mobile.webp`}
								effect="blur"
								alt={'NUFC'}
								width="70px"
								height="66px"
							/>
							<p style={{width: '0.5rem'}}></p>
							<LazyLoadImage
								src={`${process.env.BASE_PATH}/img/P5/Icon/Logo-SPURS-mobile.webp`}
								effect="blur"
								alt={'SPURS'}
								width="40px"
								height="66px"
							/>
						</Flexbox>
						{/* <Flexbox flex="1" justifyContent="center">
							<ReactIMG
								style={{
									width: '47px',
									height: '66px'
								}}
								className="text"
								src={`/img/P5/Icon/Logo-OG-mobile.webp`}
							/>
						</Flexbox> */}
						<Flexbox flex="1" justifyContent="center">

						</Flexbox>
					</Flexbox>
					<Flexbox justifyContent="space-between" height="90px">
						<Flexbox flexDirection="column">
							<label>Về Chúng Tôi</label>
							<Flexbox justifyContent="space-around">
								<ReactIMG
									style={{marginTop: '5px', marginLeft: '0.4rem', width: '3.5rem'}}
									src={`/img/P5/Home/socialMedia.svg`}
								/>
							</Flexbox>
						</Flexbox>
						<Flexbox
							flexDirection="column"
							onClick={() => {
								window.open('https://www.gamcare.org.uk​', '_blank');
							}}
						>
							<label style={{padding: '0.4rem 0'}}>Trách nhiệm</label>
							<Flexbox justifyContent="space-around">
								<div className="item GameCareResponsibility" />
								<div className="item AboveAgeResponsibility" />
							</Flexbox>
						</Flexbox>
						<Flexbox flexDirection="column">
							<label style={{padding: '0.4rem 0'}}>Bảo mật</label>
							<Flexbox className="item IovationSecurity" />
						</Flexbox>
					</Flexbox>
					<Flexbox flexDirection="column" alignItems="left">
						<label>Phương Thức Thanh Toán</label>
						<Flexbox className="Payment">
							<ReactIMG
									src={`/img/P5/Home/payment.svg`}
								/>
						</Flexbox>
					</Flexbox>
					<Flexbox flexWrap="wrap" justifyContent="center" className="Footer-txt">
						<LazyLoadImage
							src={`${process.env.BASE_PATH}/img/P5/Home/Montenegro-Seal.webp`}
							effect="blur"
							alt={'Montenegro-Seal'}
							width="122px"
							height="118px"
						/>

						<small>
							<p>
								www.fun88.com is operated by E Gambling Montenegro d.o.o. (81000 Podgorica, Moskovska
								br. 65., reg. no.5-0615951) in cooperation with OG GLOBAL ACCESS LIMITED (P.O. Box 3340,
								Road Town, Tortola, British Virgin Islands.{' '}
							</p>
							<br />
							<p>
								E Gambling Montenegro d.o.o. (81000 Podgorica, Moskovska br. 65., reg. no.5-0615951)
								hereby certifies that under the concession (serial no. AA 001588, numeric no. 133-01/15
								4A and 1ER) and approval (no. 02/01-118/4), organize and operate games of chance in
								Montenegro on website www.fun88.com , in accordance with the Agreement, concluded
								between E Gambling Montenegro d.o.o. and OG GLOBAL ACCESS LIMITED (P.O. Box 3340, Road
								Town, Tortola, British Virgin Islands, reg. no. 1923130) on 07 October 2021
							</p>
						</small>
						{/* <Flexbox className="Action" flexDirection="row" flexWrap="wrap" justifyContent="space-between">
							{[
								{ name: '规则与条规', url: '/me/Help/Detail?id=137' },
								{ name: '免责声明', url: '/me/Help/Detail?id=137' },
								{ name: '隐私权政策', url: '/me/Help/Detail?id=1086' },
								{ name: '一般规则', url: '/me/Help/Detail?id=137' },
								{ name: '联盟合作', url: 'affUrl' },
								{ name: '帮助与常见问题', url: '/me/Help' }
							].map((item, index) => {
								return (
									<Flexbox
										key={index + 'list'}
										flex="0 0 30%"
										onClick={() => {
											if (item.url == 'affUrl') {
												window.open('https://www.luckyf86.com/zh-cn', `_blank`);
												return;
											}
											Router.push(item.url);
										}}
									>
										{item.name}
									</Flexbox>
								);
							})}
						</Flexbox> */}

						<center className="DisclaimerLine">
							<p>Fun88 được điều hành bởi OG GLOBAL ACCESS LIMITED</p>
							<p >FUN88 đã được ủy quyền và giám sát bởi chính phủ Philippines PAGCOR từ ngày 1 tháng 3 năm 2019</p>
							<p>© Bản quyền thuộc sử hữu của FUN88</p>
						</center>
						<div className='seo'>
							<div className='seoHeader'>
								Nhà cái uy tín FUN88 - Nhà Cái Trực Tuyến Số 1 Châu Á
							</div>
							<p>
							Fun88 đang là một trong những nhà cái được người chơi chơi cá cược tìm kiếm nhiều nhất trong thời gian qua. Với hơn 15 năm phát triển, Fun88 đã trở thành thương hiệu cá cược có tiếng tăm tại châu Á và cả Việt Nam. Vì thế nếu bạn đang muốn tìm kiếm một mảnh đất mới để thử sức với lĩnh vực cá cược thì nhất định không được bỏ qua nhà cái Fun88.
							</p>
							<div className='seoTitle'>I. Tổng quan về nhà cái Fun88</div>
							<p>Fun88 được thành lập từ năm 2008 và được điều hành bởi tổ chức OG Global Access Limited. Đây là nhà cái cá cược trực tuyến uy tín hàng đầu châu Á, với tiềm lực tài chính vững mạnh Fun88 cung cấp hệ thống trò chơi cá cược đa dạng từ cá cược thể thao, casino trực tuyến, đến xổ số, slot game… Sau hơn 10 năm hoạt động, nhà cái Fun88 đã khẳng định được thương hiệu của mình tại thị trường châu Á và mở rộng hoạt động sang nhiều quốc gia khác, trong đó có Việt Nam. </p>
							{this.state.displaySeo &&
								<div>
									<p>Khi tham gia chơi cá cược tại nhà cái này, các thành viên có thể hoàn toàn yên tâm về mức độ uy tín cũng như chất lượng sản phẩm, dịch vụ vì Fun88 được tổ chức quản lý trò chơi có thẩm quyền cấp phép hoạt động hợp pháp, tất cả các trò chơi được cung cấp tại Fun88 đều được kiểm duyệt kỹ càng, đảm bảo quyền lợi cho người chơi. Vì thế mà ngay từ khi xuất hiện ở Việt Nam, Fun88 đã thu hút được lượng lớn thành viên tham gia. Đến nay Fun88 đã trở thành thương hiệu quen thuộc đáng tin cậy với nhiều người. </p>
									<p>Tính minh bạch và uy tín của nhà cái Fun88 còn được khẳng định qua việc trở thành nhà tài trợ cho nhiều CLB bóng đá lớn ở Ngoại hạng Anh như Burnley, Tottenham Hotspur, Newcastle United,... Các đại sứ thương hiệu của Fun88 cũng đều là những cái tên nổi bật trong lĩnh vực thể thao đó là Steve Nash, Robbie Fowler,...</p>
									<p>Được biết trước khi xâm nhập sang thị trường cá cược Việt Nam, nhà cái Fun88 đã tìm hiểu rất kỹ sở thích và nhu cầu giải trí của người Việt để tập trung phát triển. Mặc dù gặp trở ngại vì pháp luật Việt Nam chưa hợp pháp hóa các hoạt động bài bạc nhưng nhà cái Fun88 vẫn tìm được con đường và địa điểm đặt chân chi nhánh tại Philippines. Do đó người chơi tại Việt Nam có thể đăng ký Fun88 chơi cá cược mà không sợ bị vi phạm pháp luật.</p>
									<p>Trong suốt hành trình hoạt động, nhà cái Fun88 còn nhận được nhiều giải thưởng có giá trị như: Nhà Điều hành Chơi game Trực Tuyến Châu Á của năm, Nhà Cái Châu Á của năm vào hai năm liên tiếp (2009 và 2010). Nếu như bạn chưa biết lựa chọn nhà cái nào để tham gia thì có thể tham khảo Fun88.</p>
									<div className='seoTitle'>II. Những ưu điểm nổi bật của nhà cái Fun88</div>
									<p>Việc số lượng thành viên tham gia vào nhà cái Fun88 ngày 1 tăng cao đã phần nào khẳng định được mức độ uy tín và chất lượng của nhà cái này. Sau đây là những ưu điểm nổi bật chỉ có tại nhà cái Fun88 mà các bạn có thể tìm hiểu:</p>
									<div className='seoSubTitle'>1. Thiết kế giao diện website đẹp mắt</div>
									<p>Website Fun88 là một điểm cộng lớn giúp nhà cái này thu hút được nhiều người tham gia bởi cách thiết kế hài hòa, màu sắc sáng dịu nhẹ tạo cảm giác dễ chịu cho người xem dù nhìn lâu.</p>
									<p>Các mục nội dung được sắp xếp khoa học, rõ ràng giúp người chơi dễ dàng hơn trong việc thực hiện các thao tác đăng nhập, nạp tiền, tham gia chơi cá cược. Đặc biệt Fun88 còn hỗ trợ nhiều ngôn ngữ khác nhau phục vụ mọi đối tượng khách hàng ở nhiều quốc gia.</p>
									<p>Hiện nay nhà cái Fun88 đã hỗ trợ ứng dụng cho cả điện thoại hệ điều hành IOS và Android mà vẫn đảm bảo mọi tính năng như khi dùng trên máy tính. Vì thế chỉ cần có 1 chiếc điện thoại thông minh có kết nối mạng là bạn có thể tham gia chơi cá cược bất cứ lúc nào, khi nào.</p>
									<div className='seoSubTitle'>2. Khuyến mãi và ưu đãi hấp dẫn</div>
									<p>Để tri ân khách hàng, nhà cái Fun88 thường xuyên đưa ra các chương trình khuyến mãi hấp dẫn cho cả khách hàng mới và khách hàng thân thiết. Truy cập vào nhà cái Fun88, các bạn sẽ thấy trên trang web tràn ngập các chương trình khuyến mãi được treo từ đầu đến cuối trang web. Điều này chứng tỏ nhà cái Fun88 có tiềm lực tài chính quá mạnh nên mới chịu chơi như vậy. Mỗi ngày có hơn 1000 giải thưởng khác nhau dành cho khách hàng, những thành viên mới đến với Fun88 sẽ nhận được nhiều quyền lợi hấp dẫn như sau:</p>
									<p>
										<li>Nhận thưởng 150% số tiền nạp lần đầu khi tham gia cá cược tại E-sport Fun88</li>
										<li>Tặng 100% số tiền khi người chơi tham gia cá cược tại Xổ số Fun88</li>
										<li>Khuyến mãi 30% số tiền nạp cho khách hàng lần đầu tham gia cá cược tại PT slot Fun88</li>
										<li>Chính sách hoàn trả 0.8% khi tham gia cá cược tại casino Fun88</li>
										<li>Hoàn trả 0.5% khi tham gia cá cược tại IBC-thể thao Fun88</li>
										<li>Ngoài ra còn nhiều chương trình ưu đãi theo sự kiện hàng tháng, hàng tuần</li>
										<li>Anh em giới thiệu bạn bè tham gia cũng sẽ nhận được thưởng từ nhà cái</li>
										<li>Với những thành viên lâu năm có cơ hội hoàn tiền lên tới 2% khi cá cược thể thao không giới hạn</li>
										<li>Tặng thưởng 38% tiền thưởng nạp lại lên tới 4 triệu đồng</li>
									</p> 
									<div className='seoSubTitle'>3. Thanh toán nhanh gọn, đơn giản</div>
									<p>Nhà cái Fun88 liên kết với nhiều ngân hàng lớn nhỏ ở Việt Nam như Sacombank, Vietcombank, Agribank, Techcombank, ACB nên các giao dịch thanh toán nạp tiền, rút tiền được thực hiện trong thời gian nhanh chóng và đảm bảo an toàn.</p>
									<p>Hiện tại nhà cái Fun88 cung cấp nhiều hình thức thanh toán khác nhau để người chơi lựa chọn như nạp tiền qua ngân hàng, tại ATM, nạp thẻ điện thoại, ví điện tử… các bạn có thể lựa chọn cách thanh toán phù hợp với mình. Hầu hết các giao dịch nạp tiền, rút tiền chỉ mất khoảng 10-15 phút, trong khi các nhà cái khác cần thời gian lâu hơn.</p>
									<div className='seoSubTitle'>4. Mức độ bảo mật tuyệt đối</div>
									<p>Nhà cái Fun88 liên kết với nhiều ngân hàng lớn nhỏ ở Việt Nam như Sacombank, Vietcombank, Agribank, Techcombank, ACB nên các giao dịch thanh toán nạp tiền, rút tiền được thực hiện trong thời gian nhanh chóng và đảm bảo an toàn.</p>
									<p>Hiện tại nhà cái Fun88 cung cấp nhiều hình thức thanh toán khác nhau để người chơi lựa chọn như nạp tiền qua ngân hàng, tại ATM, nạp thẻ điện thoại, ví điện tử… các bạn có thể lựa chọn cách thanh toán phù hợp với mình. Hầu hết các giao dịch nạp tiền, rút tiền chỉ mất khoảng 10-15 phút, trong khi các nhà cái khác cần thời gian lâu hơn.</p>
									<div className='seoSubTitle'>5. Dịch vụ chăm sóc khách hàng chu đáo</div>
									<p>Bộ phận chăm sóc khách hàng tại nhà cái Fun88 được đánh giá 5 sao bởi thái độ phục vụ nhiệt tình, trình độ chuyên môn cao, có thể xử lý mọi tình huống, sự cố xảy ra trong thời gian nhanh nhất. Đây là điều mà không phải nhà cái nào cũng có được.</p>
									<p>Khách hàng có thể chủ động liên hệ cho nhà cái Fun88 khi gặp sự cố hoặc có thắc mắc cần được giải đáp qua hotline, chat trực tuyến, gửi email.. Bộ phận chăm sóc khách hàng của Fun88 làm việc 24/7 nên sẽ giải đáp ngay lập tức nên bạn không cần phải chờ đợi lâu.</p>
									<div className='seoTitle'>III. Đánh giá chất lượng sản phẩm cá cược tại Fun88</div>
									<p>Fun88 được biết đến là nhà cái cá cược trực tuyến đa năng khi cung cấp hệ thống trò chơi cực kỳ đa dạng với nhiều sản phẩm hấp dẫn. Sau đây là các trò chơi cá cược được nhiều người yêu thích nhất khi tham gia vào nhà cái Fun88:</p>
									<div className='seoSubTitle'>1. Cá cược thể thao, bóng đá</div>
									<p>Thể thao được xem là điểm mạnh nhất của nhà cái Fun88. Với những ai yêu thích bóng đá thì Fun88 sẽ là một lựa chọn tuyệt vời. Nhà cái này thường xuyên cập nhật tỷ lệ kèo cá cược bóng đá của các giải đấu lớn trên thế giới như Ngoại hạng Anh, Cúp C1, C2, Ligue 1, La Liga, Serie A.. Các bạn có thể lựa chọn các mức cược phù hợp với khả năng tài chính của mình.</p>
									<p>Các bạn có thể tham gia vào 1 trong các sảnh cược thể thao như sảnh Fun88-thể thao, sảnh IBC-thể thao và IM-thể thao để có những trải nghiệm tốt nhất do hệ thống nhà cái mang lại.</p>
									<p>Ngoài ra nhà cái Fun88 còn cung cấp nhiều thể loại cá cược khác của các môn thể thao như bóng rổ, đua xe, esports, bida, cầu lông, tennis, đua xe, boxing…Hay thể thao điện tử Dota, LoL..</p>
									<p>Một số loại tỷ lệ kèo phổ biến nhất hay xuất hiện ở cá cược thể thao Fun88 đó là kèo tài xỉu, kèo trên dưới, kèo chấp, kèo tỷ số, kèo châu u, kèo châu Á…</p>
									<div className='seoSubTitle'>2. Casino trực tuyến</div>
									<p>Ngoài cá cược thể thao thì nhà cái uy tín Fun88 cũng đầu tư mạnh vào các sòng bài casino trực tuyến. Tại đây có hơn 100 trò chơi khác nhau tại mỗi sảnh casino mang đến cho người chơi những trải nghiệm không thể nào quên bởi các nhà cái khác chỉ có tối đa 30 trò/ sảnh. Hiện Fun88 đang có 4 sảnh casino phổ biến là Sảnh Palace, sảnh Hoàng Gia, sảnh EBET và một vài sảnh khác.</p>
									<p>Tham gia vào sòng bài Casino trực tuyến anh em có thể thỏa sức khám phá các trò chơi hấp dẫn như: Blackjack (xì dách), Baccarat (bài cào), Quay Roulette, Tài xỉu, Tôm cua cá…</p>
									<div className='seoSubTitle'>3. Cá cược thể thao ảo</div>
									<p>Riêng hệ thống trò chơi thể thao ảo anh em có thể tham gia đặt cược liên tục bất cứ khi nào mà không lo bị quá tải. Có 2 môn thể thao được anh em cá cược yêu thích nhất mà bạn có thể tham khảo đó là bóng đá ảo và bóng rổ ảo. Nói là ảo nhưng các trận đấu vẫn được diễn ra bình thường và các bạn vẫn cần phải theo dõi hết trận để biết kết quả.</p>
									<p>Khi tham gia cá cược thể thao ảo Esport tại Fun88, các bạn sẽ có cơ hội được hoàn trả lên đến 100% và nhận được nhiều phần quà hấp dẫn. Mỗi ngày nhà cái Fun88 đều tổ chức nhiều khuyến mãi và giành nhiều phần thưởng có giá trị cho cược thể thao ảo. Muốn giành chiến thắng cao thì anh em nên bổ sung kiến thức về cá cược thể thao ảo trước khi tham gia nhé.</p>
									<div className='seoSubTitle'>4. Cá cược lô đề online, xổ số</div>
									<p>Xổ số đang ngày càng phổ biến tại Việt Nam và được nhiều người lựa chọn tham gia. Vì thế mà Fun88 cũng đầu tư mạnh về lĩnh vực này. Nếu bạn không muốn phải đau đầu cân não với những tính toán, lựa chọn tỷ lệ kèo thì hãy tham gia chơi xổ số tại Fun88. Dù vậy bạn vẫn phải tìm hiểu kỹ thì mới có thể giành chiến thắng.</p>
									<p>Ở ngoài đời thật chơi xổ số người chơi không mấy khi nhận được tiền thưởng với tỷ lệ cao nhưng khi đến với nhà cái Fun88 các bạn sẽ có cơ hội nhận 100% giá trị thẻ nạp cực kỳ hấp dẫn.</p>
									<div className='seoSubTitle'>5. Cá cược slot game</div>
									<p>Mong muốn có thể gắn kết cộng đồng những game thủ trong làng huyền thoại Microgaming lại với nhau, Fun88 đã cho ra đời dòng game slot hấp dẫn với hơn 3000 trò chơi khác nhau, mỗi chủ đề đều có kỹ xảo đặc sắc riêng tạo nên sự sinh động.</p>
									<p>Tham gia chơi slot game các bạn có thể được tặng thưởng lên tới 30% khi nạp tiền. Các trò chơi tại đây cũng đa dạng nên anh em có thể thay đổi liên tục mỗi ngày để không bị nhàm chán.</p>
									<div className='seoTitle'>IV. Kết luận</div>
									<p>Fun88 là một nhà cái uy tín đáng để người chơi tin tưởng và lựa chọn. Nếu bạn cũng đang muốn tìm kiếm một nhà cái uy tín, minh bạch, có tỷ lệ đổi thưởng cao thì nhà cái Fun88 sẽ là địa điểm phù hợp. Chúc các bạn may mắn với lựa chọn của mình.</p>
								</div>
							}
						</div>
						{!this.state.displaySeo ? 
							<div className='seoBtnBackground'>
								<div className='seoBtn' onClick={()=> (this.setState({displaySeo: !this.state.displaySeo}))}>
									Xem Thêm
								</div>
							</div> 
							:
							<div onClick={()=> (this.setState({displaySeo: !this.state.displaySeo}))}>
								<ReactIMG src={`/img/P5/Home/arrowUp.svg`} />
							</div>
						}




					</Flexbox>
				</Flexbox>
			</React.Fragment>
		);
	}
}
