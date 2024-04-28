const languageMapping = {'HOME':'เจ้าบ้าน','AWAY':'ทีมเยือน','TIE':'เสมอ','BIG':'สูง','SMALL':'ต่ำ','ODD':'คี่','EVEN':'คู่','YES':'ใช่','NO':'ไม่','NOT_HAVE':'ไม่มี','HOME_YES':'เจ้าบ้าน ใช่','HOME_YES2':'เจ้าบ้าน  ใช่','HOME_NO':'เจ้าบ้าน ไม่','HOME_NO2':'เจ้าบ้าน  ไม่','AWAY_YES':'ทีมเยือน ใช่','AWAY_YES2':'ทีมเยือน  ใช่','AWAY_NO':'ทีมเยือน ไม่','AWAY_NO2':'ทีมเยือน  ไม่','HOME_ODD':'เจ้าบ้าน คี่','HOME_EVEN':'เจ้าบ้าน คู่','AWAY_ODD':'ทีมเยือน คี่','AWAY_EVEN':'ทีมเยือน คู่','HOME_WIN_YES':'เจ้าบ้านชนะ ใช่','HOME_WIN_NO':'เจ้าบ้านชนะ ไม่','AWAY_WIN_YES':'ทีมเยือนชนะ ใช่','AWAY_WIN_NO':'ทีมเยือนชนะ ไม่','HOME_WIN':'เจ้าบ้านชนะ','AWAY_WIN':'ทีมเยือนชนะ','ANY_WIN_YES':'ทีมใดๆที่ชนะ','ANY_WIN_NO':'ทีมใดๆที่ชนะ','HOME_PERFECT_WIN_YES':'เจ้าบ้าน ชนะโดยไม่เสียประตู ใช่','HOME_PERFECT_WIN_NO':'เจ้าบ้าน ชนะโดยไม่เสียประตู ไม่','AWAY_PERFECT_WIN_YES':'ทีมเยือน ชนะโดยไม่เสียประตู ใช่','AWAY_PERFECT_WIN_NO':'ทีมเยือน ชนะโดยไม่เสียประตู ไม่','NEUTRAL_GROUND':'N','BIG_OR_SMALL':'สูง/ต่ำ','BIG_SMALL':'สูงต่ำ','WORDWIDTH':'1','HANDICAP':'แฮนดิแคป','BIGSMALL':'สูงต่ำ','VendorConfigs':{'TIMEZONE':'7','TIMEZONEFULL':'+07:00'},'VendorMarketNames':{'1':'ตารางแข่งขันล่วงหน้า','2':'ตารางแข่งขันวันนี้','3':'กำลังแข่งขัน','4':'ตารางแข่งขันที่ชื่นชอบ','5':'ทายผลผู้ชนะ'},'VendorPeriodName':{'1':'เต็มเวลา','2':'ครึ่งแรก','3':'ครึ่งหลัง'},'VendorErrorMsg':{'10010':'กรุณารีเฟรช หรือเข้าสู่ระบบอีกครั้ง','11010':'ข้อผิดพลาดของผู้ให้บริการ โปรดรีเฟรช และลองใหม่อีกครั้ง','11020':'ผู้ให้บริการอยู่ในระหว่างการปรับปรุงระบบ','11030':'ผู้ให้บริการไม่อนุญาตให้เข้าถึงที่อยู่ IP','12010':'ข้อผิดพลาดข้อมูลผู้ให้บริการ โปรดรีเฟรช และลองใหม่อีกครั้ง','13010':'การเลือกเดิมพันเกินขีดจำกัด','13011':'โปรดเลือกการเดิมพันเพียง 1 รายการต่อการแข่งขัน','13020':'การเลือกเดิมพันไม่ถูกต้อง โปรดรีเฟรช และลองใหม่อีกครั้ง','13030':'การแข่งขันหรือการเดิมพันไม่ถูกต้อง','13040':'การเลือกเดิมพันไม่ถูกต้อง','13050':'การเดิมพันล้มเหลว กรุณาลองใหม่อีกครั้งภายหลัง','13051':'การเดิมพันของคุณยังอยู่ระหว่างดำเนินการ โปรดตรวจสอบรายการเดิมพัน','13060':'กำลังอัปเดตราคาต่อรอง','13070':'ยอดเงินในบัญชีไม่เพียงพอ','13080':'จำนวนเงินวางเดิมพันเกินกว่าลิมิตเงินเดิมพันสูงสุด','13090':'จำนวนเงินเดิมพันต่ำกว่าลิมิตเงินเดิมพันขั้นต่ำ','13100':'จำนวนเงินเดิมพันทั้งหมดของการแข่งขันเกินขีดจำกัดของการเดิมพัน','13110':'อัตราต่อรองมีการเปลี่ยนแปลง','13111':'อัตราต่อรองมีการเปลี่ยนแปลง กรุณาลองใหม่อีกครั้งภายหลัง','13120':'การแข่งขันที่เลือกไม่รองรับการเดิมพันแบบพาร์เลย์','13121':'ไม่สามารถใช้โบนัสพาร์เลย์ร่วมกับการเดิมพันฟรีได้','13130':'จำนวนเงินเดิมพันไม่ถูกต้อง','13140':'การเดิมพันกีฬาเสมือนจริงยังไม่เปิดให้บริการ','14010':'新的兑现价格','99999':'ข้อผิดพลาดของเครือข่าย โปรดรีเฟรช และลองใหม่อีกครั้ง'},'SelectionStatusNames':{'100':'สำเร็จ','350':'ข้อมูลการเดิมพันมีข้อผิดพลาด','380':'การเลือกเดิมพันไม่ถูกต้อง','1001':'กำลังอัปเดตราคาต่อรอง','99997':'下注时最少需要选3种组合','99998':'请使用欧洲盘投注','99999':'เกิดข้อผิดพลาด'},'IM':{'SYSTEM_PARLAY':'ระบบการเดิมพันพาร์เลย์','CORRECT_SCORE_OTHER_FILTER':'其它','BetRadar':{'LANG':'th','TIMZONE':'Asia:Jakarta'},'IMLineGroupNames':{'1':'แฮนดิแคป & สูง / ต่ำ','3':'1x2','5':'คี่ / คู่','6':'ทายสกอร์','7':'ทายผลสกอร์รวม','8':'สองโอกาส'},'IMOddsTypeName':{'1':'อัตราต่อรองแบบมาเลย์','2':'อัตราต่อรองแบบฮ่องกง','3':'อัตราต่อรองแบบยูโร(เดซิมอล)','4':'อัตราต่อรองแบบอินโด'},'IMWagerStatusName':{'1':'รอดำเนินการ','2':'ยืนยัน','3':'ยกเลิก','4':'ยกเลิก'},'IMWagerConfirmStatusName':{'0':'ไม่ได้รับการยืนยัน','1':'การยืนยันปกติ','2':'การยืนยันอันตราย'},'IMWagerCancelStatusName':{'1':'ไม่มีการยกเลิก','2':'ยกเลิกการเดิมพันแล้ว','3':'ยกเลิกกิจกรรมแล้ว'},'IMWagerCancelReasonName':{'0':'ไม่มีเหตุผล','1':'ใบแดงอันตราย','2':'การทำประตูอันตราย','101':'ยกเลิก'},'IMComboTypeNames':{'0':'เดิมพันเดี่ยว','1':'เดิมพันแบบชุด 3x4','2':'เดิมพันแบบชุด 4x11','3':'เดิมพันแบบชุด 5x26','4':'เดิมพันแบบชุด 6x57','5':'เดิมพันแบบชุด 7x120','6':'เดิมพันแบบชุด 8x247','7':'เดิมพันแบบชุด 9x502','8':'เดิมพันแบบชุด 10x1013','9':'เดิมพันแบบชุด 2 คู่','10':'เดิมพันแบบชุด 3 คู่','11':'เดิมพันแบบชุด 4 คู่','12':'เดิมพันแบบชุด 5 คู่','13':'เดิมพันแบบชุด 6 คู่','14':'เดิมพันแบบชุด 7 คู่','15':'เดิมพันแบบชุด 8 คู่','16':'เดิมพันแบบชุด 9 คู่','17':'เดิมพันแบบชุด 10 คู่','18':'เดิมพันแบบชุด'},'IMRBPeriodNames':{'!LIVE':'ถ่ายทอดสด','HT':'พักครึ่ง','1H':'ครึ่งแรก','2H':'ครึ่งหลัง','Q1':'ควอเตอร์ 1','Q2':'ควอเตอร์ 2','Q3':'ควอเตอร์ 3','Q4':'ควอเตอร์ 4','OT':'ต่อเวลา','S1':'เซต 1','S2':'เซต 2','S3':'เซต 3','S4':'เซต 4','S5':'เซต 5','G1':'เกม 1','G2':'เกม 2','G3':'เกม 3','G4':'เกม 4','G5':'เกม 5','G6':'เกม 6','G7':'เกม 7'},'IMEventGroupTypeNames':{'1':'ทายผลหลัก','2':'ทายผลลูกเตะมุม','3':'ทายผลพิเศษ','4':'ควอเตอร์ 1','5':'ควอเตอร์ 2','6':'ควอเตอร์ 3','7':'ควอเตอร์ 4','8':'เกมต่อแต้ม','9':'เซต 1','10':'เซต 2','11':'เซต 3','12':'เซต 4','13':'เซต 5','14':'แต้มต่อ','15':'เกม 1','16':'เกม 2','17':'เกม 3','18':'เกม 4','19':'เกม 5','20':'เกม 6','21':'เกม 7'}},'BTI':{'SEARCH_NOTICE':'请输入不少于3个字','PARLAY':'串','CANCELLED':'已取消','NOT_CANCELLED':'未取消','BTIWagerOddsTypeName':{'notset':'','Malaysian':'马来盘','HongKong':'香港盘','Decimal':'欧洲盘','Indonesian':'印尼盘'},'BTIWagerStatusName':{'Open':'待处理','Lost':'输','Won':'赢','Placed':'已下注','WonDeadHeat':'死热赢','PlacedDeadHeat':'死热已下注','Draw':'和','Cancelled':'已取消','NonRunner':'投注无效','HalfLost':'输半','HalfWon':'嬴半','CashOut':'提前结算','PartialCashOut':'部分提前结算'},'BTIMarketGroupTypeNames':{'Main':'主要盘口','Goals':'进球','Halves':'半场','Corners':'角球','Period':'时间阶段','Specials':'特别盘口','Players':'球员','Cards':'罚牌','Fast markets':'快速投注','Pulse Bet':'脉冲投注','Fulltime':'全场','Full Time':'全场','Quarters':'节','Set':'节','Match':'盘口','Match Specials':'特别盘口','General':'盘口','Regular Time':'正规时间','Full Time [Incl. OT]':'全场 [包括加时]','Totals':'总进球','1st Period':'第1节','Frames':'局','Handicaps & Margins':'让球'},'BTIComboTypeNames':{'Single':'单注','Combo':'N串1','SystemXfromY':'系统混合过关 X/Y','Lucky15':'4串15(幸运15)','Lucky31':'5串31(幸运31)','Lucky63':'6串63(幸运63)','Trixie':'3串4','Patent':'3串7','Yankee':'4串11(洋基)','SuperYankee':'5串26(超级洋基)','Heinz':'6串57(亨氏)','SuperHeinz':'7串120(超级亨氏)','Goliath':'8串247(大亨)'},'BTIBetTypeNames':{'2_0':'让球','2_1':'让球','2_2':'让球','2_39':'让球','3_0':'大小','3_1':'大小','3_2':'大小','3_39':'大小'},'BTIRBPeriodNames':{'FirstHalf':'上半场','BreakAfterFirstHalf':'中场休息','SecondHalf':'下半场','Finished':'终场','FirstOvertime':'第一次加时','BreakAfterFirstOvertime':'第一次加时节间休息','SecondOvertime':'第二次加时','BreakAfterSecondOvertime':'第二次加时节间休息','PenaltyShootout':'点球大战','FirstQuarter':'第一节','BreakAfterFirstQuarter':'第一节间休息','SecondQuarter':'第二节','BreakAfterSecondQuarter':'第二节间休息','ThirdQuarter':'第三节','BreakAfterThirdQuarter':'第三节间休息','FourthQuarter':'第四节','BreakAfterFourthQuarter':'第四节间休息','FirstSet':'第一盘','SecondSet':'第二盘','ThirdSet':'第三盘','FourthSet':'第四盘','FifthSet':'第五盘','FirstInning':'第一局','SecondInning':'第二局','ThirdInning':'第三局','FourthInning':'第四局','FifthInning':'第五局','SixthInning':'第六局','SeventhInning':'第七局','EighthInning':'第八局','NinthInning':'第九局','TenthInning':'第十局','EleventhInning':'第十一局','TwelfthInning':'第十二局','ThirteenthInning':'第十三局','FourteenthInning':'第十四局','FifteenthInning':'第十五局','BreakAfterFirstInning':'第一局间休息','BreakAfterSecondInning':'第二局间休息','BreakAfterThirdInning':'第三局间休息','BreakAfterFourthInning':'第四局间休息','BreakAfterFifthInning':'第五局间休息','BreakAfterSixthInning':'第六局间休息','BreakAfterSeventhInning':'第七局间休息','BreakAfterEighthInning':'第八局间休息','BreakAfterNinthInning':'第九局间休息','BreakAfterTenthInning':'第十局间休息','BreakAfterEleventhInning':'第十一局间休息','BreakAfterTwelfthInning':'第十二局间休息','BreakAfterThirteenthInning':'第十三局间休息','BreakAfterFourteenthInning':'第十四局间休息','FirstPeriod':'第一局','BreakAfterFirstPeriod':'第一局间休息','SecondPeriod':'第二局','BreakAfterSecondPeriod':'第二局间休息','ThirdPeriod':'第三局','BreakAfterThirdPeriod':'第三局间休息','Overtime':'加时赛'}},'SABA':{'CORRECT_SCORE_OTHER_FILTER':'AOS','ISLUCKY':'来自幸运选择','SABARBPeriodNames':{'Delayed':'延迟开赛','1H':'ครึ่งแรก','2H':'ครึ่งหลัง','HT':'พักครึ่ง','1Q':'ควอเตอร์ 1','2Q':'ควอเตอร์ 2','3Q':'ควอเตอร์ 3','4Q':'ควอเตอร์ 4','QT':'ต่อเวลา','1S':'เซต 1','2S':'เซต 2','3S':'เซต 3','4S':'เซต 4','5S':'เซต 5','1G':'เกม 1','2G':'เกม 2','3G':'เกม 3','1MS':'地图1准备中','1MG':'地图1进行中','2MS':'地图2准备中','2MG':'地图2进行中','3MS':'地图3准备中','3MG':'地图3进行中'},'SABALineGroupNames':{'0':'ทายผลหลัก','1':'全场','2':'半场','3':'角球/罚牌','4':'区间','5':'特别产品','6':'选手','7':'快速盘口','8':'节','9':'加时','10':'点球','11':'Map 1','12':'Map 2','13':'Map 3','14':'Map 4','15':'Map 5','16':'Map 6','17':'Map 7','18':'Map 8','19':'Map 9'},'SABABetTypeNames':{'1':'แฮนดิแคป','3':'สูง/ต่ำ','7':'แฮนดิแคป','8':'สูง/ต่ำ','17':'แฮนดิแคป','18':'สูง/ต่ำ'},'SABAComboTypeNames':{'Doubles':'二串一','Trebles':'三串一','Trixie':'三串四','Lucky7':'幸运 7','Fold4':'四串一','Yankee':'洋基','Lucky15':'幸运 15','Fold5':'五串一','Canadian':'超级美国佬','Lucky31':'幸运 31','Fold6':'六串一','Heinz':'亨氏','Lucky63':'幸运 63','Fold7':'七串一','SuperHeinz':'超级亨氏','Lucky127':'幸运 127','Fold8':'八串一','Goliath':'大亨','Lucky255':'幸运 255','FoldN':'N串一'},'SABAOddsTypeName':{'1':'อัตราต่อรองแบบมาเลย์','2':'อัตราต่อรองแบบฮ่องกง','3':'อัตราต่อรองแบบยูโร(เดซิมอล)','4':'อัตราต่อรองแบบอินโด'},'SABAWagerStatusName':{'half won':'赢半','half lose':'输半','won':'赢','lose':'输','void':'无效','running':'投注成功','draw':'和','reject':'ยกเลิก','refund':'退款','waiting':'待确认'}}};export default languageMapping;