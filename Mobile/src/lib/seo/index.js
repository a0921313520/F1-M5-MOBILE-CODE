//用環境變數判斷要使用哪個strapi domain
export const getDeployEnv = () => {
  const DEPLOYENV = process?.env['DEPLOYENV'];
  if (!DEPLOYENV && (process.env.NODE_ENV !== "production")) {
    return 'LOCAL';
  } else {
    return DEPLOYENV;
  }
}

export const getStrapiDomainByDeployEnv = (deployenv) => {
  //本地測試
  if (deployenv === 'LOCAL') {
    return 'https://cmsapistag1.fun88.biz/';
  }else if (deployenv === 'STAG') {
    //STAG環境，會被擋，要從SL proxy進去
    return 'https://cmsapisl.fun88.biz/stag1/';
  } else if (deployenv === 'SL') {
    return 'https://cmsapisl.fun88.biz/';
  } else { //LIVE
    return 'https://cache.huya66.cc/';
  }
}

//獲取Strapi上面的SEO配置，自帶緩存 (傳入的pathname只是用於log)
export const getStrapiSEOSettings = async (pathname) => {
  const isExportProcess = (process.env.NODE_ENV === "production");
  const cacheKey = 'CACHE_getStrapiSEOSettings';

  const deployEnv = getDeployEnv();
  const seoUrl = getStrapiDomainByDeployEnv(deployEnv) + 'cms/seo-m3';
  const logHead = `===getStrapiSEOSettings [${deployEnv}] [${seoUrl}] [${pathname}] `;

  //export使用緩存
  if (isExportProcess) {
    if (global && global[cacheKey]) {
      console.error(logHead, 'use cache', JSON.stringify(global[cacheKey]));
      return global[cacheKey];
    }
  }

  console.error(logHead, 'before request');

  const jsonResult = await fetch(seoUrl)
    .then(response => {
      return response.json();
    })
    .then(jsonResponse => {
      return { success: true, data: jsonResponse};
    })
    .catch(e => {
      console.error(logHead, e, e?.message);
      return { success: false, error: e , errorMessage: e?.message};
    });

  if (jsonResult.success) {
    console.error(logHead,'done request', JSON.stringify(jsonResult));
    if(isExportProcess && global) {
      global[cacheKey] = JSON.parse(JSON.stringify(jsonResult));
    }
  } else {
    if (isExportProcess) {
      //連不上，讓export失敗
      if (process) {
        process.exit(500);
        return;
      }
    }
  }

  return jsonResult;
}

//獲取單page的SEO配置
export const getStrapiSEOSettingForPage = async (pathname) => {
  const jsonResult = await getStrapiSEOSettings(pathname);
  //用pathname查對應數據
  if (jsonResult?.success && jsonResult?.data?.length > 0) {
    const target = jsonResult.data.find(d => d?.urlPath?.toLowerCase() ===  pathname?.toLowerCase() )
    if (target) {
      return { success: true, data: target}
    }
  }

  return { success: false, data: null}
}

//返回 seoData for getStaticProps
export const getStaticPropsFromStrapiSEOSetting = async (pathname) => {
  const seoResult = await getStrapiSEOSettingForPage(pathname); //配置此頁的路徑
  console.log('===getStaticProps', pathname, JSON.stringify(seoResult));
  if (seoResult.success) {
    return {props: { seoData: seoResult.data }}
  } else {
    return {props: { seoData: {} }};
  }
}
