import React from "react";
import LazyImage from "$SBTWO/LazyLoad/LazyImage";
import HostConfig from '@/server/Host.config';
import { vendorImageList } from "@/lib/js/vendorImageList";

const defaultImageNameMap = {
  'BTI': 'fun88',
  'IM': 'IM',
  'SABA': 'saba'
}

const LazyImageForTeam = ({ Vendor, TeamId, thisClassName='', overflow=false, IconUrl=null}) => {

  const imgDomain = HostConfig.Config.SportImageUrl;
  const folderName = Vendor.configs.VendorName.toLowerCase() + '-icon';

  const defaultImgUrl = imgDomain + `/${folderName}/` + (defaultImageNameMap[Vendor.configs.VendorName] ? defaultImageNameMap[Vendor.configs.VendorName] : 'IM') + '.png';

  let imgurl = imgDomain + `/${folderName}/TeamImageFile/${TeamId}.png`;
  let noLazy = false
  if (!Vendor.configs.HasTeamIcon) {
    imgurl = defaultImgUrl;
    noLazy = true;
  } else {
    if (IconUrl) {
      imgurl = IconUrl;
    } else {
      //查看圖片清單有沒有
      const propName = Vendor.configs.VendorName.toLowerCase() + '-teams';
      if (vendorImageList[propName] && !vendorImageList[propName]['i_' + TeamId]) {
        imgurl = defaultImgUrl;
        noLazy = true;
      }
    }
  }

  //首屏(IM)隊伍圖固定寬高
  if (Vendor.configs.VendorName === 'IM'
    && thisClassName === 'Game-logo') {
    thisClassName = 'Game-logo IM'
  }

  return (
    <LazyImage src={imgurl} defaultSrc={defaultImgUrl} thisClassName={thisClassName} noLazy={noLazy} overflow={overflow}/>
  );
};

export default LazyImageForTeam;
