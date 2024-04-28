/* sb log 分類*/

// api_category和對應的api url
export const apiCategoryToApiMapping = {
  "SB2.0_Others": [
    "LiveChat/Url",
    "MaintenanceStatus",
    "InboxMessages",
    "GETANNOUNCEMENT",
    "Announcements",
    "AffiliateLM",
  ],
  "SB2.0_Vendor": ["Event", "SportsCount", "EventInfo"],
  "SB2.0_Search": ["Search"],
  "SB2.0_Analytic": ["Analytic"],
  "SB2.0_LiveStream": ["LiveStream"],
  "SB2.0_Bet": [
    "GETBETINFO",
    "placeBets",
    "PlaceBet",
    "calculateBets",
    "GETPENDINGWAGERSTATUS",
    "SUBMITBUYBACK",
    "cashout/getInfo",
    "PLACEBET",
    "SellBack",
    "PlaceParlayBet",
    "PlaceOutrightBet",
    "place"
  ],
  "SB2.0_Transaction": ["Transfer/Application", "Deposit"],
  "SB2.0_Preference": ["NotificationSetting/SBS"],
};

