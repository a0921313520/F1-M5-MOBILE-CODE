import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import React, { Component } from 'react';
import Layout from '@/components/Layout';
/* 简洁游戏模板  */
import View from '@/components/Games/';
import { connect } from "react-redux";
import { gamePage } from "@/lib/data/DataList";

import { getStaticPropsFromStrapiSEOSetting } from '@/lib/seo';

export async function getStaticProps(context){
	return await getStaticPropsFromStrapiSEOSetting(`/games/${context.params.productType}`); //參數帶本頁的路徑
}

export async function getStaticPaths(){
	return {
		fallback:false,
		paths:[
			{params:{productType:"the-thao"}}, //Sports
			{params:{productType:"esports"}}, //E-Sports
			{params:{productType:"arcade-games"}}, //Acrade
			{params:{productType:"live-casino"}}, //LiveCasino
			{params:{productType:"P2P"}},  //P2P
			{params:{productType:"slots"}}, //Slot
			{params:{productType:"xo-so"}}, //Lottery
		]
	} 
}

function ProductLobby(props){
  const router = useRouter();
  const productType = router.query.productType
  const gameName = gamePage.find(item=>item.name === productType)
  console.log(gameName, 'gameName')
  useEffect(()=>{
  },[])

  return (
    <Layout
      title="FUN88乐天堂官网｜2022卡塔尔世界杯最佳投注平台"
      Keywords="乐天堂/FUN88/2022 世界杯/世界杯投注/卡塔尔世界杯/世界杯游戏/世界杯最新赔率/世界杯竞彩/世界杯竞彩足球/足彩世界杯/世界杯足球网/世界杯足球赛/世界杯赌球/世界杯体彩app"
      Description="乐天堂提供2022卡塔尔世界杯最新消息以及多样的世界杯游戏，作为13年资深品牌，安全有保障的品牌，将是你世界杯投注的不二选择。"
      BarTitle={gameName.title}
      status={2}
      barFixed={true}
      seoData={props.seoData}
      backEvent={()=>{
        // Pushgtagdata(`${selectedProduct.piwikName}_Listing`, `Go to Home`, `${selectedProduct.piwikName}_Listing_C_Home`);
        history.length ? history.go(-1) : router.push('/');
      }}
    >
      <div>
        <View GameType={gameName.productCode} />
      </div>
    </Layout>
  );

}

const mapStateToProps = (state) => ({
	//游戏列表
	ProvidersSequence: state.GamesList.GameDetailsDescAndBanner
});

export default connect(mapStateToProps)(ProductLobby)