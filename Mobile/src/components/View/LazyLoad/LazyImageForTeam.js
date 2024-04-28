import React from "react";
import LazyImage from "@/components/View/LazyLoad/LazyImage";
import HostConfig from '@/server/Host.config';
import { vendorImageList } from "@/lib/js/vendorImageList";

const LazyImageForTeam = ({ Vendor, TeamId, thisClassName='', overflow=false}) => {

  const imgDomain = HostConfig.Config.SportImageUrl;
  const folderName = Vendor.configs.VendorName.toLowerCase() + '-icon';

  const defaultImgUrl = imgDomain + `/${folderName}/` + (Vendor.configs.VendorName == 'BTI' ? 'fun88' : 'IM') + '.png';

  let imgurl = imgDomain + `/${folderName}/TeamImageFile/${TeamId}.png`;
  let noLazy = false
  if (!Vendor.configs.HasTeamIcon) {
    imgurl = defaultImgUrl;
    noLazy = true;
  } else {
    //查看圖片清單有沒有
    const propName = Vendor.configs.VendorName.toLowerCase() + '-teams';
    if (vendorImageList[propName] && !vendorImageList[propName]['i_' + TeamId]) {
      imgurl = defaultImgUrl;
      noLazy = true;
    }
  }

  return (
    <LazyImage src={imgurl} defaultSrc={defaultImgUrl} thisClassName={thisClassName} noLazy={noLazy} overflow={overflow}/>
  );
};

export default LazyImageForTeam;
