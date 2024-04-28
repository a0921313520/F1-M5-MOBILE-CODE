export const gamePage = [
	{
		productCode: 'Sportsbook',
		name: 'the-thao',
		title: 'Thể Thao'
	},
	{
		productCode: 'ESports',
		name: 'esports',
		title: "E-Sports"
	},
	{
		productCode: 'LiveCasino',
		name: 'live-casino',
		title: 'Casino',
	},
	{
		productCode: 'P2P',
		name: 'P2P',
		title: '3D Casino'
	},
	{
		productCode: 'Slot',
		name: 'slots',
		title: 'Trò Chơi/Bắn Cá'
	},
	{
		productCode: 'KenoLottery',
		name: 'xo-so',
		title: "Xổ Số"
	},
	{
		productCode: 'InstantGames',
		name: 'arcade-games',
		title: 'Game Siêu Tốc'
	},
	{
		productCode: 'Instant Games',
		name: 'arcade-games',
		title: 'Game Siêu Tốc'
	},
]

export const WalletProviderMapping = {
	SLOT: [
		  {provider: "SPX", gameType:"Slot"},
		  {provider: "HBN", gameType:"Slot"},
		  {provider: "EVP", gameType:"Slot"},
		  {provider: "NGS", gameType:"Slot"},
		  {provider: "AMB", gameType:"Slot"},
		  {provider: "JIR", gameType:"Slot"},
		  {provider: "MGP", gameType:"Slot"},
		  {provider: "BSG", gameType:"Slot"},
		  {provider: "CQG", gameType:"Slot"},
		  {provider: "SPG", gameType:"Slot"},
		  {provider: "LX", gameType:"Slot"},
		  {provider: "SWF", gameType:"Slot"},
		  {provider: "JKR", gameType:"Slot"},
		  {provider: "TG", gameType:"Slot"},
		  {provider: "TGP", gameType:"Slot"},
		  {provider: "IMOJDB", gameType:"Slot"},
		  {provider: "IMONET", gameType:"Slot"},
		  {provider: "PGS", gameType:"Slot"},
		  {provider: "PNG", gameType:"Slot"},
	],
	LD: [
		  {provider: "WEC", gameType:"LiveCasino"},
		  {provider: "BGG", gameType:"LiveCasino"},
		  {provider: "ABT", gameType:"LiveCasino"},
		  {provider: "NLE", gameType:"LiveCasino"},
		  {provider: "SAL", gameType:"LiveCasino"},
		  {provider: "TG", gameType:"LiveCasino"},
		  {provider: "SXY", gameType:"LiveCasino"},
		  {provider: "YBL", gameType:"LiveCasino"},
		  {provider: "TGP", gameType:"LiveCasino"},
		  {provider: "WMC", gameType:"LiveCasino"},
		  {provider: "GPI", gameType:"LiveCasino"},
		  {provider: "EVO", gameType:"LiveCasino"},
		  {provider: "AGL", gameType:"LiveCasino"},
	],
	LBK: [
		  {provider: "LBK", gameType:"KenoLottery"},
	],
	IMOPT: [
		  {provider: "IMOPT", gameType:"Slot"},
	],
	KENO: [
		  {provider: "SGW", gameType:"KenoLottery"},
		  {provider: "GPK", gameType:"KenoLottery"},
		  {provider: "TCG", gameType:"KenoLottery"},
	],
	SLC: [
		  {provider: "SLC", gameType:"KenoLottery"},
	],
	SB: [
		  {provider: "SBT", gameType:"Sportsbook"},
		  {provider: "CML", gameType:"Sportsbook"},
		  {provider: "IPSB", gameType:"Sportsbook"},
		  {provider: "OWS", gameType:"Sportsbook"},
		  {provider: "VTG", gameType:"Sportsbook"},
		  {provider: "YBS", gameType:"Sportsbook"},
		  {provider: "SB", gameType:"Sportsbook"},
		  {provider: "CMD", gameType:"Sportsbook"},
		  {provider: "TFG", gameType:"ESports"},
		  {provider: "IPES", gameType:"ESports"},
		  {provider: "TFG", gameType:"ESports"},
	],
	P2P: [
		  {provider: "KPK", gameType:"P2P"},
		  {provider: "IPK", gameType:"P2P"},
		  {provider: "JKR", gameType:"P2P"},
		  {provider: "TGP", gameType:"P2P"},
		  {provider: "JBP", gameType:"P2P"},
		  {provider: "SPR", gameType:"InstantGames"},
	],
	KYG: [
		  {provider: "KYG", gameType:"P2P"},
	],
	YBP: [
		  {provider: "YBP", gameType:"P2P"},
	],
	YBF: [
		  {provider: "YBF", gameType:"Slot"},
	],
	FISH: [
		  {provider: "JIF", gameType:"Slot"},
	],
	YBK: [
		  {provider: "YBK", gameType:"KenoLottery"},
	],
  }

export const homeGamePiwik = {
	"OWS": {
		eventCat: 'Sports',
		eventAction: 'Launch Saba',
		eventName: 'Sports_C_SaBa'
	},
	"IPSB": {
		eventCat: 'Sports',
		eventAction: 'Launch IM',
		eventName: 'Sports_C_IM'
	},
	"SBT": {
		eventCat: 'Sports',
		eventAction: 'Launch BTi',
		eventName: 'Sports_C_BTi'
	},
	"CML": {
		eventCat: 'Sports',
		eventAction: 'Launch CMD',
		eventName: 'Sports_C_CMD'
	},
	"VTG": {
		eventCat: 'Sports',
		eventAction: 'Launch V2',
		eventName: 'Sports_C_V2'
	},
	"TFG": {
		eventCat: 'Esports',
		eventAction: 'Launch TF',
		eventName: 'Esports_C_TF'
	},
	"IPES": {
		eventCat: 'Esports',
		eventAction: 'Launch Fun88 Esports',
		eventName: 'Esports_C_Fun88'
	},
	"GPI": {
		eventCat: 'LiveDealer',
		eventAction: 'Launch Fun88 Palace',
		eventName: 'LiveDealer_C_Fun88_Palace'
	},
	"EVO": {
		eventCat: 'LiveDealer',
		eventAction: 'Launch EVO Palace',
		eventName: 'LiveDealer_C_EVO_Palace'
	},
	"AGL": {
		eventCat: 'LiveDealer',
		eventAction: 'Launch ROYAL Palace',
		eventName: 'LiveDealer_C_ROYAL_Palace'
	},
	"SXY": {
		eventCat: 'LiveDealer',
		eventAction: 'Launch S Palace',
		eventName: 'LiveDealer_C_S_Palace'
	},
	"NLE": {
		eventCat: 'LiveDealer',
		eventAction: 'Launch HAPPY Palace',
		eventName: 'LiveDealer_C_HAPPY_Palace'
	},
	"WMC": {
		eventCat: 'LiveDealer',
		eventAction: 'Launch WM Palace',
		eventName: 'LiveDealer_C_WM_Palace'
	},
	"SPR": {
		eventCat: 'InstantGame',
		eventAction: 'Go to InstantGame Lobby',
		eventName: 'InstantGame_C_Spribe'
	},
	"AVIATOR": {
		eventCat: 'InstantGame',
		eventAction: 'Launch HotGame',
		eventName: `InstantGame_C_Hotgame_AVIATOR`
	},
	"JIR": {
		eventCat: 'SlotFishing',
		eventAction: 'Launch Jili Fishing',
		eventName: 'SlotFishing_C_JiliFishing'
	},
	"TG": {
		eventCat: 'SlotFishing',
		eventAction: 'Launch PP',
		eventName: 'SlotFishing_C_PP'
	},
	"PGS": {
		eventCat: 'SlotFishing',
		eventAction: 'Launch PG',
		eventName: 'SlotFishing_C_PG'
	},
	"MGP": {
		eventCat: 'SlotFishing',
		eventAction: 'Launch MGS',
		eventName: 'SlotFishing_C_MGS'
	},
	"PNG": {
		eventCat: 'SlotFishing',
		eventAction: 'Launch PNG',
		eventName: 'SlotFishing_C_PNG'
	},
	"SPG": {
		eventCat: 'SlotFishing',
		eventAction: 'Launch SPG',
		eventName: 'SlotFishing_C_SPG'
	},
	"SWF": {
		eventCat: 'SlotFishing',
		eventAction: 'Launch SW',
		eventName: 'SlotFishing_C_SW'
	},
	"CQG": {
		eventCat: 'SlotFishing',
		eventAction: 'Launch CQ9',
		eventName: 'SlotFishing_C_CQ9'
	},
	"BSG": {
		eventCat: 'SlotFishing',
		eventAction: 'Launch BSG',
		eventName: 'SlotFishing_C_BSG'
	},
	"IMOPT": {
		eventCat: 'SlotFishing',
		eventAction: 'Launch PT',
		eventName: 'SlotFishing_C_PT'
	},
	"TGP": {
		eventCat: 'P2P',
		eventAction: 'Launch Game Việt',
		eventName: 'P2P_C_King_Marker'
	},
	"KPK": {
		eventCat: 'P2P',
		eventAction: 'Launch Game Poker',
		eventName: 'P2P_C_King_Poker'
	},
	"TCG": {
		eventCat: 'Lottery',
		eventAction: 'Launch TC',
		eventName: 'Lottery_C_TC'
	},
	"SGW": {
		eventCat: 'Lottery',
		eventAction: 'Launch SGW',
		eventName: 'Lottery_C_SGW'
	},
	"GPK": {
		eventCat: 'Lottery',
		eventAction: 'Launch FUN88',
		eventName: 'Lottery_C_FUN88'
	},
	"SLC": {
		eventCat: 'Lottery',
		eventAction: 'Launch SLC',
		eventName: 'Lottery_C_SLC'
	},
	"Sportsbook": {
		eventCat: 'Sports',
		eventAction: 'Go to Sports Listing',
		eventName: 'Sports_C_Listing'
	},
	"ESports": {
		eventCat: 'Esports',
		eventAction: 'Go to Esports Listing',
		eventName: 'Esports_C_Listing'
	},
	"LiveCasino": {
		eventCat: 'LiveDealer',
		eventAction: 'Go to LiveDealer Listing',
		eventName: 'LiveDealer_C_Listing'
	},
	"InstantGames": {
		eventCat: 'InstantGame',
		eventAction: 'Go to InstantGame Listing',
		eventName: 'InstantGame_C_Listing'
	},
	"Slot": {
		eventCat: 'SlotFishing',
		eventAction: 'Go to SlotFishing Listing',
		eventName: 'SlotFishing_C_Listing'
	},
	"P2P": {
		eventCat: 'P2P',
		eventAction: 'Go to P2P Listing',
		eventName: 'P2P_C_Listing'
	},
	"KenoLottery": {
		eventCat: 'Lottery',
		eventAction: 'Go to Lottery Listing',
		eventName: 'Lottery_C_Listing'
	},
};

export const detailGamePiwik = {
	"OWS": {
		eventCat: 'SportsListing',
		eventAction: 'Launch Saba',
		eventName: 'SportsListing_C_SaBa'
	},
	"IPSB": {
		eventCat: 'SportsListing',
		eventAction: 'Launch IM',
		eventName: 'SportsListing_C_IM'
	},
	"SBT": {
		eventCat: 'SportsListing',
		eventAction: 'Launch BTi',
		eventName: 'SportsListing_C_BTi'
	},
	"CML": {
		eventCat: 'SportsListing',
		eventAction: 'Launch CMD',
		eventName: 'SportsListing_C_CMD'
	},
	"VTG": {
		eventCat: 'SportsListing',
		eventAction: 'Go to V2 Lobby',
		eventName: 'SportsListing_C_V2'
	},
	"TFG": {
		eventCat: 'Esports_Listing',
		eventAction: 'Launch TF',
		eventName: 'Esports_Listing_C_TF'
	},
	"IPES": {
		eventCat: 'Esports_Listing',
		eventAction: 'Launch Fun88 Esports',
		eventName: 'Esports_Listing_C_Fun88'
	},
};

export const gameLobbyPiwik = {
	"Sportsbook": {
		eventCat: 'Sports',
		eventAction: '',
		eventName: 'Sports_Lobby_V2Sports'
	},
	"LiveCasino": {
		eventCat: 'LiveDealer',
		eventAction: '',
		eventName: 'LiveDealer_Lobby'
	},
	"Live Dealer": {
		eventCat: 'LiveDealer',
		eventAction: '',
		eventName: 'LiveDealer_Lobby'
	},
	"Instant Games": {
		eventCat: 'InstantGame',
		eventAction: '',
		eventName: 'InstantGame_Lobby'
	},
	"Slot": {
		eventCat: 'SlotFishing',
		eventAction: '',
		eventName: 'SlotFishing_Lobby'
	},
	"P2P": {
		eventCat: 'P2P',
		eventAction: '',
		eventName: 'P2P_Lobby'
	},
	"KenoLottery": {
		eventCat: 'Lottery',
		eventAction: '',
		eventName: 'Lottery_Lobby'
	},
}
export const GamesGtag = {
	//体育
	IPSB: 'IM_Sports',
	OWS: 'OW_Sports',
	SBT: 'BTi_Sports',
	//电竞
	TFG: 'TF_Esports',
	IPES: 'IM_Esports',
	//真人
	LiveCasino:'LiveDealer',
	WEC:'WEC_LiveDealer',
	YBL: 'YBL_LiveDealer',
	EVO: 'EVO_LiveDealer',
	BGG: 'BG_LiveDealer',
	AG: 'AG_LiveDealer',
	GPI: 'GPI_LiveDealer',
	NLE: 'N2_LiveDealer',
	EBT: 'eBET_LiveDealer',
	ABT: 'Allbet_LiveDealer ',
	//棋牌
	YBP: 'ANG_P2P',
	JBP: 'JBP_P2P',
	KYS: 'KYS_P2P',
	//老虎机
	PGS: 'PG_Slots',
	MGSQF: 'MG_Slots',
	IMOPT: 'PT_Slots',
	TG_SLOT: 'PP_Slots',
	IMONET: 'NET_Slots',
	SWF: 'SW_Slots',
	CQG: 'CQ9_Slots',
	SPG: 'SG_Slots',
	BSG: 'BSG_Slots',
	FISHING: 'FISHING_Slots',
	//彩票.
	YBK: 'OBG_Lottery',
	SGW: 'SGW_Lottery',
	LBK: 'LB_Lottery',
	VTG: 'V2G_Sports'
};

export const ProvidersList = [
	{
		subProviders: [
			{
				type: 'Game',
				name: 'IM 体育',
				code: 'IPSB',
				imageUrl: 'https://cache.jiadingyeya.com/Assets/images/P5/Providers/Sportsbook/IPSB.jpg',
				isMaintenance: false,
				isTournament: false,
				isHot: false,
				isNew: false
			},
			{
				type: 'Game',
				name: '沙巴体育',
				code: 'OWS',
				imageUrl: 'https://cache.jiadingyeya.com/Assets/images/P5/Providers/Sportsbook/OWS_CN.jpg',
				isMaintenance: false,
				isTournament: false,
				isHot: false,
				isNew: false
			},
			{
				type: 'Game',
				name: 'BTI 体育',
				code: 'SBT',
				imageUrl: 'https://cache.jiadingyeya.com/Assets/images/P5/Providers/Sportsbook/SBT_CN.jpg',
				isMaintenance: false,
				isTournament: false,
				isHot: false,
				isNew: false
			}
		],
		type: 'Category',
		name: '体育',
		code: 'Sportsbook',
		isMaintenance: false,
		isTournament: false,
		isHot: false,
		isNew: false
	},
	{
		subProviders: [
			{
				type: 'Game',
				name: 'TF 电竞',
				code: 'TFG',
				imageUrl: 'https://cache.jiadingyeya.com/Assets/images/P5/Providers/ESports/TFG_CN.jpg',
				isMaintenance: false,
				isTournament: false,
				isHot: false,
				isNew: false
			},
			{
				type: 'Game',
				name: '乐天堂电竞',
				code: 'IPES',
				imageUrl: 'https://cache.jiadingyeya.com/Assets/images/P5/Providers/ESports/IPES_CN.jpg',
				isMaintenance: false,
				isTournament: false,
				isHot: false,
				isNew: false
			}
		],
		type: 'Category',
		name: '电竞',
		code: 'ESports',
		isMaintenance: false,
		isTournament: false,
		isHot: false,
		isNew: false
	},
	{
		subProviders: [
			{
				type: 'Category',
				name: '易天堂 (EVO)',
				code: 'EVO',
				imageUrl: 'https://cache.jiadingyeya.com/Assets/Images/P5/Providers/Casino/EVO_CN.jpg',
				isMaintenance: false,
				isTournament: false,
				isHot: false,
				isNew: false
			},
			{
				type: 'Category',
				name: '大游堂(BG)',
				code: 'BGG',
				imageUrl: 'https://cache.jiadingyeya.com/Assets/Images/P5/Providers/Casino/BGG_CN.jpg',
				isMaintenance: false,
				isTournament: false,
				isHot: false,
				isNew: false
			},
			{
				type: 'Category',
				name: '至尊堂（AG）',
				code: 'AG',
				imageUrl: 'https://cache.jiadingyeya.com/Assets/Images/P5/Providers/Casino/AG_CN.jpg',
				isMaintenance: false,
				isTournament: false,
				isHot: true,
				isNew: false
			},
			{
				type: 'Category',
				name: '乐天堂 (GPI)',
				code: 'GPI',
				imageUrl: 'https://cache.jiadingyeya.com/Assets/Images/P5/Providers/Casino/GPI_CN.jpg',
				isMaintenance: false,
				isTournament: false,
				isHot: false,
				isNew: false
			},
			{
				type: 'Category',
				name: '双赢堂N2 (EA)',
				code: 'NLE',
				imageUrl: 'https://cache.jiadingyeya.com/Assets/Images/P5/Providers/Casino/NLE_CN.jpg',
				isMaintenance: false,
				isTournament: false,
				isHot: false,
				isNew: false
			},
			{
				type: 'Category',
				name: '易博堂（eBET)',
				code: 'EBT',
				imageUrl: 'https://cache.jiadingyeya.com/Assets/Images/P5/Providers/Casino/EBT_CN.jpg',
				isMaintenance: false,
				isTournament: false,
				isHot: false,
				isNew: false
			},
			{
				type: 'Category',
				name: '隆运堂（欧博）',
				code: 'ABT',
				imageUrl: 'https://cache.jiadingyeya.com/Assets/Images/P5/Providers/Casino/ABT_CN.jpg',
				isMaintenance: false,
				isTournament: false,
				isHot: false,
				isNew: false
			}
		],
		type: 'Category',
		name: '真人',
		code: 'LiveCasino',
		isMaintenance: false,
		isTournament: false,
		isHot: true,
		isNew: false
	},
	{
		subProviders: [
			{
				type: 'Category',
				name: '乐天使棋牌',
				code: 'YBP',
				imageUrl: 'https://cache.jiadingyeya.com/Assets/Images/P5/Providers/P2P/YBP_CN.jpg',
				isMaintenance: false,
				isTournament: false,
				isHot: false,
				isNew: false
			},
			{
				type: 'Category',
				name: '双赢棋牌',
				code: 'JBP',
				imageUrl: 'https://cache.jiadingyeya.com/Assets/Images/P5/Providers/P2P/JBP_CN.jpg',
				isMaintenance: false,
				isTournament: false,
				isHot: false,
				isNew: false
			},
			{
				type: 'Category',
				name: '开元棋牌',
				code: 'KYG',
				imageUrl: 'https://cache.jiadingyeya.com/Assets/Images/P5/Providers/P2P/KYG_CN.jpg',
				isMaintenance: false,
				isTournament: false,
				isHot: false,
				isNew: false
			}
		],
		type: 'Category',
		name: '棋牌',
		code: 'P2P',
		isMaintenance: false,
		isTournament: false,
		isHot: false,
		isNew: false
	},
	{
		subProviders: [
			{
				type: 'Category',
				name: 'MG 老虎机',
				code: 'MGSQF',
				imageUrl: 'https://cache.jiadingyeya.com/Assets/Images/P5/Providers/Slot/MGSQF_CN.jpg',
				isMaintenance: false,
				isTournament: false,
				isHot: false,
				isNew: false
			},
			{
				type: 'Category',
				name: 'PT 老虎机',
				code: 'IMOPT',
				imageUrl: 'https://cache.jiadingyeya.com/Assets/Images/P5/Providers/Slot/IMOPT_CN.jpg',
				isMaintenance: false,
				isTournament: false,
				isHot: false,
				isNew: false
			},
			{
				type: 'Category',
				name: 'PP 老虎机',
				code: 'TG_SLOT',
				imageUrl: 'https://cache.jiadingyeya.com/Assets/Images/P5/Providers/Slot/TG_SLOT_CN.jpg',
				isMaintenance: false,
				isTournament: false,
				isHot: true,
				isNew: false
			},
			{
				type: 'Category',
				name: 'NET 老虎机',
				code: 'IMONET',
				imageUrl: 'https://cache.jiadingyeya.com/Assets/Images/P5/Providers/Slot/IMONET_CN.jpg',
				isMaintenance: false,
				isTournament: false,
				isHot: false,
				isNew: false
			},
			{
				type: 'Category',
				name: 'SW 老虎机',
				code: 'SWF',
				imageUrl: 'https://cache.jiadingyeya.com/Assets/Images/P5/Providers/Slot/SWF_CN.jpg',
				isMaintenance: false,
				isTournament: false,
				isHot: false,
				isNew: false
			},
			{
				type: 'Category',
				name: 'CQ9 老虎机',
				code: 'CQG',
				imageUrl: 'https://cache.jiadingyeya.com/Assets/Images/P5/Providers/Slot/CQG_CN.jpg',
				isMaintenance: false,
				isTournament: false,
				isHot: false,
				isNew: false
			},
			{
				type: 'Category',
				name: 'SG 老虎机',
				code: 'SPG',
				imageUrl: 'https://cache.jiadingyeya.com/Assets/Images/P5/Providers/Slot/SPG_CN.jpg',
				isMaintenance: false,
				isTournament: false,
				isHot: false,
				isNew: false
			},
			{
				type: 'Category',
				name: 'BSG 老虎机',
				code: 'BSG',
				imageUrl: 'https://cache.jiadingyeya.com/Assets/Images/P5/Providers/Slot/BSG_CN.jpg',
				isMaintenance: false,
				isTournament: false,
				isHot: false,
				isNew: false
			},
			{
				type: 'Category',
				name: '捕鱼游戏',
				code: 'FISHING',
				imageUrl: 'https://cache.jiadingyeya.com/Assets/Images/P5/Providers/Slot/FISHING.jpg',
				isMaintenance: false,
				isTournament: false,
				isHot: false,
				isNew: false
			}
		],
		type: 'Category',
		name: '老虎机',
		code: 'Slot',
		isMaintenance: false,
		isTournament: false,
		isHot: true,
		isNew: false
	},
	{
		subProviders: [
			{
				type: 'Game',
				name: '双赢彩票',
				code: 'SGW',
				imageUrl: 'https://cache.jiadingyeya.com/Assets/images/P5/Providers/Keno/SGW.jpg',
				isMaintenance: false,
				isTournament: false,
				isHot: false,
				isNew: false
			},
			{
				type: 'Game',
				name: 'LB 快乐彩',
				code: 'LBK',
				imageUrl: 'https://cache.jiadingyeya.com/Assets/images/P5/Providers/Keno/LBK.jpg',
				isMaintenance: false,
				isTournament: false,
				isHot: false,
				isNew: false
			}
		],
		type: 'Category',
		name: '彩票',
		code: 'KenoLottery',
		isMaintenance: false,
		isTournament: false,
		isHot: false,
		isNew: false
	}
];

export const walletIconColor = {
	TotalBal: '#E0E0E0',
	Main: '#E0E0E0',
	Sportsbook: '#C1E0FF',
	LiveDealer: '#97D8A5',
	P2P: '#F5E496',
	Slots: '#AE96F6',
	Fishing:'#AE96F6',
	Keno: '#FCA6A7'
  };
