/*
 * @Author: Alan
 * @Date: 2022-05-11 18:17:51
 * @LastEditors: Alan
 * @LastEditTime: 2022-06-28 00:51:51
 * @Description: 提示
 * @FilePath: \Mobile\src\components\View\Popover\index.js
 */
import React from 'react';
import { ReactSVG } from '@/components/View/ReactSVG'
import popover from './popover.module.scss'

/*
 * className[type String]: Support
 * direction[type StringSingle[top,left,right,bottom,topleft,topright,bottomleft,bottomright]]: 窗口弹出方向，默认左侧
 * closePosition[type StringSingle[topClose,bottomClose]]: 關閉按鈕位置 默認置中
 */

export default class Popover extends React.Component {
    static defaultProps = {
        direction: "left",
        closePosition: '',
    }
    constructor (props) {
        super(props)
        this.state = {
            hasAnimate: false,
            visible: this.props.visible // 移除初始动画备份State
        }
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        if ((nextProps.visible !== prevState.visible && !prevState.hasAnimate) || nextProps.visible) {
            return {
                hasAnimate: true
            }
        }
        return null;
    }
    componentDidMount () {
    }
    render() {
        const { visible, children, onClose } = this.props
        return <div style={this.props.style} className={`${popover.popoverPlacement} ${this.state.hasAnimate ? (visible ? popover.popoverOpen : popover.popoverClose) : null } ${this.props.className ? this.props.className : ""} ${popover[this.props.direction]}`}>
            <div className={popover.popoverContent}>
                <div className={popover.popoverArrow}></div>
                <div className={popover.popoverInner} role="tooltip">
                    <div className={popover.popoverInnerContent}>
                        { children }
                        <ReactSVG
                            src="/img/svg/close.svg"
                            onClick={(e) => {
                                onClose();
                                e.stopPropagation();
                            }}
                            className={`${popover.popoverClose} ${popover[this.props.closePosition]}`}
                        />
                    </div>
                </div>
            </div>
        </div>
    }
}
