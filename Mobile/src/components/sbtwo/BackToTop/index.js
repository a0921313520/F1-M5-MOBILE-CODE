import { useEffect, useState } from 'react';
import { ReactSVG } from '$SBTWO/ReactSVG';
import backTop from './backTop.module.scss';

export default function BackToTop(props) {
    // tagetWindow: 當scroll的畫面不是window，而是其他自訂義 例:fullscreen modal
    const {targetWindow} = props;
    const [show, setShow] = useState(false);
    const [baseWindow, setBaseWindow] = useState(null);
    
    useEffect(() => {
        const queryWindow = document.querySelector(targetWindow)
        if(queryWindow){
            setBaseWindow(queryWindow)
        } else{
            setBaseWindow(window)
        } 
        var supportPageOffset = window.pageYOffset !== undefined;
        var isCSS1Compat = ((document.compatMode || "") === "CSS1Compat");

        function handleScroll(e) {
            let y = supportPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;
            if(targetWindow){
                y = document.querySelector(targetWindow).scrollTop;
            }
            if (y > 20) {
                setShow(true);
            } else {
                setShow(false);
            }
        }
            if(!baseWindow) return
            baseWindow.addEventListener("scroll", handleScroll);
        return () => {
            baseWindow.removeEventListener("scroll", handleScroll);
        }
    }, [baseWindow]);

    const onClick = () => {
        baseWindow.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
    }

    return (
        <div className={`backTop ${backTop.backTopContainer} ${!show ? backTop.backTopHide : ''} ${props.className || ''}`} style={props.style}>
            <div className={backTop.backTopContent}>
                <ReactSVG
                    className={`backTop-icon ${backTop.backTop_icon}`}
                    src="/img/svg/backTop.svg"
                    onClick={onClick} />
            </div>
        </div>
    );
}
