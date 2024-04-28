//公告信息
export default class AnnouncementData {
  /**
   * @param AnnouncementId 公告Id
   * @param AnnouncementText 公告文字
   * @param PostingDate 發布日期
   * @param ExtraInfo 其他補充數據
   */
  constructor(
              AnnouncementId,
              AnnouncementText,
              PostingDate,
              ExtraInfo,
              )
  {
    Object.assign(this, {
      AnnouncementId,
      AnnouncementText,
      PostingDate,
      ExtraInfo,
    });
  }
}