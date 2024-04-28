/*
 * @Author: Alan
 * @Date: 2022-06-07 07:47:26
 * @LastEditors: Alan
 * @LastEditTime: 2022-09-18 19:23:29
 * @Description:游戏标签
 * @FilePath: \Mobile\src\components\Games\Tag.js
 */
import React, { Component } from 'react';
import classNames from 'classnames';
class Tag extends Component {
	constructor(props) {
		super(props);
		this.state = {
			hasMore: true
		};
	}

	componentDidMount() {}

	ChangeTag(tag) {
		switch (tag) {
			case 'PGS':
				return <span style={{ backgroundColor: '#45E4D3' }}>PG</span>;
				break;
			case 'MGSQF':
				return <span style={{ backgroundColor: '#2CCB8E' }}>MG</span>;
				break;
			case 'IMOPT':
				return <span style={{ backgroundColor: '#00A6FF' }}>PT</span>;
				break;
			case 'TG_SLOT':
				return <span style={{ backgroundColor: '#F49239' }}>PP</span>;
				break;
			case 'IMONET':
				return <span style={{ backgroundColor: '#78BD1F' }}>NET</span>;
				break;
			case 'SWF':
				return <span style={{ backgroundColor: '#6978DF' }}>SW</span>;
				break;
			case 'CQG':
				return <span style={{ backgroundColor: '#FFFFFF', color: '#FF7700' }}>CQ9</span>;
				break;
			case 'SPG':
				return <span style={{ backgroundColor: '#F30000' }}>SPG</span>;
				break;
			case 'BSG':
				return <span style={{ backgroundColor: '#000000' }}>BSG</span>;
				break;
			case 'FISHING':
				return <span style={{ backgroundColor: '#00A6FF' }}>FISHING</span>;
				break;
			case 'YBF':
				return <span style={{ backgroundColor: '#B14221' }}>ZUI</span>;
				break;
            case "TG":
                return <span style={{ backgroundColor: "#f9994c" }}>PP</span>;
                break;
			/* 棋牌 */
			case 'YBP':
				return <span style={{ backgroundColor: '#00A6FF' }}>ANG</span>;
				break;
			case 'JBP':
				return <span style={{ backgroundColor: '#D1941B' }}>JBP</span>;
				break;
			case 'KYS':
				return <span style={{ backgroundColor: '#E96450' }}>KYS</span>;
				break;
			/* 真人娱乐 */
			case 'YBL':
				return <span style={{ backgroundColor: '#B14221' }}>ZUI</span>;
				break;
			case 'EVO':
				return <span style={{ backgroundColor: '#679DB9' }}>EVO</span>;
				break;
			case 'BGG':
				return <span style={{ backgroundColor: '#2424B4' }}>BG</span>;
				break;
			case 'AG':
				return <span style={{ backgroundColor: '#F98436' }}>AG</span>;
				break;
			case 'GPI':
				return <span style={{ backgroundColor: '#00A6FF' }}>FUN</span>;
				break;
			case 'NLE':
				return <span style={{ backgroundColor: '#EA177A' }}>N2</span>;
			case 'EBT':
				return <span style={{ backgroundColor: '#2E67B1' }}>EBT</span>;
				break;
			case 'ABT':
				return <span style={{ backgroundColor: '#B18F21' }}>ABT</span>;
				break;
			case 'VTG':
				return <span style={{ backgroundColor: '#009A23' }}>VTG</span>;
				break;
			case 'SPR':
				return <span style={{ backgroundColor: '#CF5EEA' }}>SPR</span>;
				break;
			case 'WEC':
				return <span style={{ backgroundColor: '#00A6FF' }}>WE</span>;
				break;
			default:
				return <span style={{ backgroundColor: '#00A6FF' }}>{tag}</span>;
		}
	}
	render() {
		const { provider, position } = this.props;
		return (
			<div
				style={{ position: position ? position : 'absolute' }}
				className={classNames({
					DefaultTag: true
				})}
			>
				{this.ChangeTag(provider)}
			</div>
		);
	}
}
export default Tag;
