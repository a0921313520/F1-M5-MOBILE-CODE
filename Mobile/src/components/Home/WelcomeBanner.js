
import React,{useState, useEffect } from 'react';
import Modal from '@/components/View/Modal/';
import ReactIMG from '@/components/View/ReactIMG';
import Button from "@/components/View/Button";

const WelecomeBanner =()=> {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        !localStorage.getItem(`WelcomeBanne`) &&
        setVisible(true);
    }, [])
    return(
        <Modal
            visible={visible}
            className="commonModal welcomeBanner"
            transparent
            maskClosable={false}
            closable={false}
        >
            <ReactIMG className="welcomeBanner" src="/img/P5/home/WelcomeBanner.png" alt="WelcomeBanner"/>
            <Button
                onClick={() => {
                    localStorage.setItem(`WelcomeBanne`,true)
                    setVisible(false);
                }}
                className="welcomeBanner-btn"
            >
                Trải Nghiệm Ngay
            </Button>
        </Modal>
    )
}  

export default WelecomeBanner;