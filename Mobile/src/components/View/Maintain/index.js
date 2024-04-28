/*
 * @Author: Alan
 * @Date: 2022-09-08 17:11:50
 * @LastEditors: Alan
 * @LastEditTime: 2022-10-14 16:09:18
 * @Description: 
 * @FilePath: \Mobile\src\components\View\Maintain\index.js
 */
import Button from "@/components/View/Button";
import { ReactSVG } from "@/components/View/ReactSVG";
import { Refresh } from '@/lib/js/util';
import { useEffect, useState } from "react";
import Router from 'next/router';
import { PopUpLiveChat } from '@/lib/js/util';

const Maintain = () => {
    const [countDownMA, setCountDownMA] = useState(null)
    useEffect(()=>{
        makeNumInterval();
    },[])

    function makeNumInterval(){
        let countDown = Math.floor((new Date(localStorage.getItem("maintenanceCountdown")).getTime() - Date.now()) / 1000);
		setCountDownMA(countDown)

		countdown();
		const maintenance_IntervalNum = setInterval(countdown, 1000);
		
		function countdown(){
			if (countDown > 0) {
                --countDown
                setCountDownMA(countDown)
			} else {
                setCountDownMA(0)
				clearInterval(maintenance_IntervalNum);
				localStorage.removeItem(`maintenanceCountdown`)
                // Router.push("/")
			}
		}
	};
    const hours = Math.floor(countDownMA / 60 / 60)
    const mins = Math.floor(countDownMA / 60 ) % 60
    const secs = countDownMA % 60;

    return (
        <div className="main-maintain" key="main-maintain">
            <div className="page404__header header-wrapper">
                <ReactSVG className="logo" src="/img/headerLogo.svg" />
            </div>
            <div className="maintain-body">
                <div className="countDown">
                    <div className="countDown_item">
                        <span className="countDown_value">{hours}</span>
                        <label data-CN="時">Giờ</label>
                    </div>
                    <div className="countDown_item">
                        <span className="countDown_value">{mins}</span>
                        <label data-CN="分">Phút</label>
                    </div>
                    <div className="countDown_item">
                        <span className="countDown_value">{secs}</span>
                        <label CN="秒">Giây</label>
                    </div>
                </div>
                <div className="maintain-heading">Bảo Trì Hệ Thống</div>
                <div className="maintain-desc">
                Hệ thống của chúng tôi đang được bảo trì, vui lòng thử đăng nhập sau hoặc liên hệ với dịch vụ khách hàng trực tuyến theo các cách sau
                </div>
                {/* <Button className="main__refresh" onClick={Refresh}>Làm Mới Ứng Dụng</Button> */}
                <Button className="main__refresh" onClick={PopUpLiveChat}>Liên Hệ Live Chat</Button>
                <a className="maintain-contact" href="mailto: cs.viet@fun88.com">
                    Email: cs.viet@fun88.com
                </a>
                <a className="maintain-contact" href="tel:+84400842891">
                    Điện Thoại: +84 400 842 891
                </a>
                {/* <a
                    style={{ marginBottom: "16px" }}
                    className="maintain-contact"
                    href="tel:+86 400 842 891"
                >
                    热线电话: +86 400 842 891
                </a> */}
            </div>
        </div>
    )
}

export default Maintain;
