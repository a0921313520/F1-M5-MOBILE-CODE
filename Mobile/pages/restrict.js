/*
 * @Author: Alan
 * @Date: 2022-06-28 14:40:26
 * @LastEditors: Alan
 * @LastEditTime: 2022-12-06 15:16:17
 * @Description: 地区限制
 * @FilePath: \Mobile\pages\restrict.js
 */
import { ReactSVG } from '@/components/View/ReactSVG';
import { PopUpLiveChat, Refresh } from '@/lib/js/util';
import Button from '@/components/View/Button';
import ReactIMG from '@/components/View/ReactIMG';
// import RestrictAccess from "@/components/RestrictAccess"

export default function restrict() {
	return (
		<div className="main-maintain" key="RestrictAccess">
			<div className="page404__header header-wrapper">
				<ReactSVG className="logo" src="/img/headerLogo.svg" />
			</div>
			<div className="restrict-body">
				<ReactIMG className="restrict-img" src="/img/restrict.png" />
				<div className="maintain-heading">Truy Cập Hạn Chế</div>
				<div className="maintain-desc">
				Chào Quý Khách. Chúng tôi nhận thấy Quý Khách đang truy cập từ quốc gia không được phép hỗ trợ và sử dụng dịch vụ. Vui lòng liên hệ Bộ phận Chăm sóc Khách hàng để được hỗ trợ hoặc Làm Mới Ứng Dụng.
				</div>
				{/* <Button
					className="main__refresh"
					onClick={()=> Refresh()}
				>
					Làm Mới Ứng Dụng
				</Button> */}
				<Button
					className="main__refresh"
					onClick={() => {
						PopUpLiveChat();
					}}
				>
					Liên Hệ Live Chat
				</Button>
				<a className="maintain-cs" href="mailto: cs.viet@fun88.com">
                            Email: cs.viet@fun88.com
            	</a>
			</div>
		</div>
	);
}
