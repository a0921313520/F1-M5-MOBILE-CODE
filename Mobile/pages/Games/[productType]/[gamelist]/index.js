import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { gamePage } from '@/lib/data/DataList';
import GameList from '@/components/Games/GameList';
import GameIframe from '@/components/Games/GameIframe';
import { ACTION_GameDetailsDescAndBanner } from '@/lib/redux/actions/GamesInfoAction';

const gameProviderMap = [
  {
    code: "Sportsbook",
    providers: [
      "OWS",
      "CML",
      "IPSB",
      "SBT",
      "VTG",
    ]
  },
  {
    code: "ESports",
    providers: [
      "TFG",
      "IPES",
    ]
  },
  {
    code: "InstantGames",
    providers: [
      "SPR",
      "AVIATOR",
    ]
  },
  {
    code: "LiveCasino",
    providers: [
      "WEC",
      "GPI",
      "EVO",
      "SXY",
      "SAL",
      "NLE",
      "AGL",
      "WMC",
      "TG",
      "gamelist"
    ]
  },
  {
    code: "Slot",
    providers: [
      "TG",
      "SPX",
      "AMB",
      "PGS",
      "JKR",
      "MGP",
      "JIR",
      "SPG",
      "BSG",
      "JIF",
      "SWF",
      "CQG",
      "PNG",
      "IMOPT",
      "IMONET",
      "EVP",
      "HBN",
      "BNG",
      "NGS",
      "gamelist"
    ]
  },
  {
    code: "P2P",
    providers: [
      "TGP",
      "KPK",
      "JKR",
      "gamelist"
    ]
  },
  {
    code: "KenoLottery",
    providers: [
      "TCG",
      "GPK",
      "SLC",
      "gamelist"
    ]
  }
]


export async function getStaticProps(context){
	return {
		props:{query:context.params},
	}
}


export async function getStaticPaths(){
    const paths = gameProviderMap.reduce((acc, item)=>{
      const singleGameTypeProviders = item.providers.map(provider=> {
        return {params: {productType:gamePage.find(cate=>cate.productCode===item.code).name, gamelist:provider }}
      })
      acc.push(singleGameTypeProviders)
      return acc
    },[]).flat()
	return {
		fallback:false,
		paths
	} 
}


function GameListRoute(props){
  const router = useRouter();
  const dispatch = useDispatch();
  const {category} = router.query;
  const {productType ,gamelist} = props.query ;
  const {gameid} = router.query;
 
 
  const [renderFor, setRenderFor] = useState("")
  const [provider, setProvider] = useState(null)
  const [gameId, setGameId] = useState(router.query.gameid)
  const [gameCategory, setGameCategory] = useState(null)
  
  
  const GamesData = useSelector(state=>state.GamesList)
  const {GameDetailsDescAndBanner} = GamesData;
  const selectedProductItem = gamePage.find(item=>item.name===productType)
  const selectedProductCode = selectedProductItem.productCode
  
  useEffect(()=>{
    if(!GameDetailsDescAndBanner.length){
      dispatch(ACTION_GameDetailsDescAndBanner())
    }
  },[])
  
  useEffect(()=>{
    setGameId(gameid)
  },[gameid])

  useEffect(()=>{
    const GameDetails = GameDetailsDescAndBanner.result
    if(gamelist && GameDetails.length){
      const productDetail = GameDetails.find(item=>item.code && item.code===selectedProductCode)
      if(productDetail?.subProviders.some(provider=>provider.code==gamelist)){
        if(!gameId){
          switch(selectedProductCode){
            case "Sportsbook":
            case "ESports":
              if(gamelist!=="VTG"){
                setRenderFor("openGame")
                return
              }else{
                setRenderFor("gamelist")
                setProvider(gamelist)
              }
            default:
              setRenderFor("gamelist")
              setProvider(gamelist)
          }
        }else{
          setRenderFor("openGame")
          setProvider(gamelist)
        }
      }else if(gamelist==="gamelist"){
        setRenderFor("gamelist")
        setGameCategory(category)
      }else{
        router.replace("/404")
      }
    }
  },[gamelist, GameDetailsDescAndBanner, gameId])

  switch(renderFor){
    case "gamelist":
      return <GameList provider={provider} vendor={selectedProductCode} vendorName={productType} category={gameCategory} />
    case "openGame":
      return <GameIframe vendor={selectedProductItem} provider={provider} gameId={gameId}  />
    default:
      return null
  }
}

export default GameListRoute