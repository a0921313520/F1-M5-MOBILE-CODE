/*
 * @Author: Alan
 * @Date: 2022-05-11 18:17:51
 * @LastEditors: Alan
 * @LastEditTime: 2022-07-28 12:55:58
 * @Description: 回到顶部
 * @FilePath: \Mobile\src\components\Common\BackTop\index.js
 */
import React from 'react';
class _BackToTop extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hidden: false
        };
    }

    componentDidMount() {
        // window.addEventListener("scroll", this.handleScroll,true);
    }
    // componentDidUpdate(preProps,preState) {
    //     if(preProps.contentDivId !== this.props.contentDivId){
    //         this.setHidden(20)
    //     }
        
    // }
    componentWillUnmount() {
        // window.removeEventListener("scroll", this.handleScroll,true);
    }

    getScrollTop=()=>{
        // let div = document.getElementById(this.props.contentDivId).parentNode;
        let div = document.getElementById(this.props.contentDivId).querySelector(".am-pull-to-refresh");
        return  div.scrollTop;
    }

    handleClick=(e)=>{
        e.preventDefault();
        // let div = document.getElementById(this.props.contentDivId).parentNode;
        let div = document.getElementById(this.props.contentDivId).querySelector(".am-pull-to-refresh");
        let scrollTop = div.scrollTop;
        scrollTop > 0 && (div.scrollTo(0, 0));
    }

    handleScroll=()=>{
       this.setHidden(50)
    }

    setHidden=(value)=>{
        let scrollTop = this.getScrollTop();
        if (scrollTop > value) {
            this.setState({hidden: false});
        } else {
            this.setState({hidden: true});
        }
    }

    render() {
        let btnStyle = {
            display: this.state.hidden ? "none": "block",
            position: "fixed",
            top:'70%',
            right:'20px',
            zIndex:'900',
            width:'50px'
        };
        return(
            <img src={`/static/images/svg/top.svg`} style={btnStyle} onClick={this.handleClick}  />
        )
    }
}

export default _BackToTop;