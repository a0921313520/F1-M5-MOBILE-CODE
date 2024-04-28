import stylesheet from '../../../styles/components/_Pagination.scss';
import React from 'react';
class _Pagination extends React.Component {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
	}

	componentWillUnmount() {
	}

	create=()=>{
        const { totalPage,pageCurr,groupCount,startPage } = this.props.config;
        let pages = [];
        if( totalPage <= 6){
            pages.push(<li onClick = {this.goPrev } className = { pageCurr === 1? 'pagination-nomore':"" } key={0}>{'<'}</li>)
            for(let i = 1;i <= totalPage; i++){
                pages.push(<li onClick = { ()=>this.go(i) } className = { pageCurr === i ? 'pagination-active' : "" } key={i}>{i}</li>)
            }
            pages.push(<li onClick = { this.goNext } className = { pageCurr === totalPage? 'pagination-nomore' :"" } key={totalPage + 1}>{'>'}</li>)
        }else{
            pages.push(<li className = { pageCurr === 1?'pagination-nomore':"" } key={ 0 } onClick = { this.goPrev }>{'<'}</li>)
            for(let i = startPage;i < startPage + groupCount ;i++){
                if(i <= totalPage - 2){
                    pages.push(<li className = { pageCurr === i? 'pagination-active' :""} key={i} onClick = { ()=>this.go(i) }>{i}</li>)
                }
            }

            // 分页中间的省略号
            if(totalPage - startPage >= 6){
                pages.push(<li className = 'pagination-ellipsis' key={ -1 }>……</li>)
            }else{
                pages.push(<li className = { pageCurr === totalPage -1 ? 'pagination-active':""} key={ totalPage - 1 } onClick = { ()=>this.go(totalPage - 1) }>{ totalPage -1 }</li>)
            }
            //最后一页
            pages.push(<li className = { pageCurr === totalPage ? 'pagination-active':""} key={ totalPage } onClick = { ()=>this.go(totalPage) }>{ totalPage }</li>)

            // 下一页
            pages.push(<li className = { pageCurr === totalPage ? 'pagination-nomore':"" } key={ totalPage + 1 } onClick = { this.goNext }>{'>'}</li>)
        }
        return pages;
    }
    
     // 更新 state
	go=(page)=>{
        let { totalPage ,groupCount,startPage } = this.props.config;
        this.props.setPage('pageCurr',page)
        if(totalPage<=6){
            return
        }else{
            // 设置起始页
            if( page % groupCount === 1){
                if( totalPage-page < 6 ){
                    startPage = totalPage - groupCount - 1
                }else{
                    startPage = page
                }
            }
            
            if( page % groupCount === 0 ){
                startPage = page - groupCount + 1
            }

            // 点击最后一页
            if( totalPage === page ){
                startPage = totalPage - groupCount - 1
            }

            if(page < startPage){
                startPage = page -  page % groupCount+1
            }
            //console.log('statpage:',startPage)
            this.props.setPage('startPage',startPage)
        }
       
    }

    // 前一页
    goPrev=()=>{
        let { pageCurr } = this.props.config;

        if(--pageCurr === 0){
            return;
        }

        this.go(pageCurr)
    }

    // 后一页
    goNext=()=>{
        let { totalPage,pageCurr } = this.props.config;

        if(++pageCurr > totalPage){
            return;
        }

        this.go(pageCurr)
    }

	render() {
		const Pages = this.create();

		return (
			<div className ='pagination-main'>
                <ul className = 'pagination-page'>
                    { Pages }
                </ul>
                <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
            </div>
		);
	}
}

export default _Pagination;
