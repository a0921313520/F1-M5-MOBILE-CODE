import React from "react";
import LazyImage from "$SBTWO/LazyLoad/LazyImage";
import HostConfig from '@/server/Host.config';
import { vendorImageList } from '@/lib/js/vendorImageList';

const defaultImageNameMap = {
  'BTI': 'fun88',
  'IM': 'IM',
  'SABA': 'saba'
}

const LazyImageForLeague = ({ Vendor, LeagueId, thisClassName='',overflow=false}) => {

  const imgDomain = HostConfig.Config.SportImageUrl;
  const folderName = Vendor.configs.VendorName.toLowerCase() + '-icon';

  const defaultImgUrl = imgDomain + `/${folderName}/` + (defaultImageNameMap[Vendor.configs.VendorName] ? defaultImageNameMap[Vendor.configs.VendorName] : 'IM') + '.png';

  let imgurl = imgDomain + `/${folderName}/CompetitionImageFile/${LeagueId}.png`;
  let noLazy = false
  if (!Vendor.configs.HasLeagueIcon) {
    imgurl = defaultImgUrl;
    noLazy = true;
  } else {
    //查看圖片清單有沒有
    const propName = Vendor.configs.VendorName.toLowerCase() + '-leagues';
    if (vendorImageList[propName] && !vendorImageList[propName]['i_' + LeagueId]) {
      imgurl = defaultImgUrl;
      noLazy = true;
    }
  }

  return (
    <LazyImage src={imgurl} defaultSrc={defaultImgUrl} thisClassName={thisClassName} noLazy={noLazy} overflow={overflow}/>
  );
};

export default LazyImageForLeague;
