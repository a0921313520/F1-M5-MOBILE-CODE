/**
 * resize並壓縮圖片為jpeg格式
 * 注意: 處理後圖片強制轉為jpeg格式，上傳時要自行修改文件名為.jpg
 *
 * @param fileSize 圖片大小(bytes)
 * @param dataURL 用FileReader讀到的圖片信息(result)
 * @param options 可配置參數
 *  options.maxSize 最大圖片大小(bytes)，默認1mb = 1024*1024
 *  options.maxWidth 最大長邊寬度(pixel), 默認1024，按長邊寬度進行等比例縮小
 *  options.quality jpeg壓縮率(0-1之間), 默認0.8
 *
 * @returns {Promise<{isCompressed: ture/false 是否有壓縮, dataURL: 圖片信息base64格式，和FileReader.Result的格式相同}>}
 */
const compressImage = (fileSize, dataURL, options = null) => {
  const maxSize = (options ? options.maxSize : null) || 1048576; //最大1mb
  const maxWidth = (options ? options.maxWidth : null) || 1024; //最大長邊寬度
  const quality = (options ? options.quality : null) || 0.8; //壓縮率
  const contentType = 'image/jpeg'; //統一壓成jpg

  console.log('compressImage options:','maxSize:',maxSize,'maxWidth',maxWidth,'quality:',quality);

  //工具函數，計算壓縮後大小
  const b64toByteArrays = (b64Data) => {
    const sliceSize = 512;

    let byteCharacters = atob(b64Data.split(',')[1]);
    let byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      let slice = byteCharacters.slice(offset, offset + sliceSize);

      let byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      let byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }
    return byteArrays;
  }
  //生成隨機文件名
  const randomFileName = () => {
    return (Math.random() + 1).toString(36).substring(2);
  }

  return new Promise((resolve, reject) => {
    if (fileSize < maxSize) {
      console.log('compressImage :','maxSize:',maxSize,' >= fileSize:',fileSize, ' no need to compress....');
      //檔案大小沒超過，直接用原圖
      resolve({ isCompressed: false, dataURL});
      return;
    }

    let img = new Image();
    img.src = dataURL;
    img.onload = function () {
      //===計算縮小長寬
      let iwidth = img.width;
      let iheight = img.height;
      let tmpWidth = iwidth;
      let tmpHeight = iheight;
      let isVertical = false; //是否直式
      if (iheight > iwidth) {
        isVertical = true;
        //直式取長邊為width,短邊為height
        tmpWidth = iheight;
        tmpHeight = iwidth;
      }

      if (tmpWidth > maxWidth) {
        //等比例縮小
        tmpHeight = Math.round((tmpHeight * maxWidth) / tmpWidth);
        tmpWidth = maxWidth;
      }

      let finalWidth = tmpWidth;
      let finalHeight = tmpHeight;
      if (isVertical) { //直式長寬要換回來
        finalWidth = tmpHeight;
        finalHeight = tmpWidth;
      }

      //===用canvas重畫壓縮圖片
      let canvas = document.createElement("canvas");
      canvas.width = finalWidth;
      canvas.height = finalHeight;
      canvas.getContext("2d").drawImage(img, 0, 0, finalWidth, finalHeight);
      let dataurl = canvas.toDataURL(contentType, quality);
      //檢查壓縮後大小
      const tmpByteArrays = b64toByteArrays(dataurl);
      const tmpFile = new File(tmpByteArrays, randomFileName(), { type: contentType, lastModified: new Date() });
      if (tmpFile.size > maxSize){
        console.log('error_compress',tmpFile.size,' > ',maxSize)
        reject('error_compress') //壓縮失敗(不夠小)
      } else {
        console.log('compressed image size(KB):',tmpFile.size / 1024)
        resolve({ isCompressed: false, dataURL:dataurl}) //壓縮成功
      }
    }
    img.onerror = e => {
      console.log('error_imgload')
      reject('error_imgload') //圖片加載失敗(不是正確格式)
    }
  })
}

export default compressImage;

//
// 使用例子
//
// import compressImage from 'compressImage.js';
//
// const uploadFile = (e) => {
//   let targetFile = e.target.files[0];
//   let targetFileName = targetFile.name;
//   let reader = new FileReader();
//   reader.onload = function(e) {
//       compressImage(targetFile.size, reader.result)
//         .then(cResult => {
//           //執行成功
//
//           //拿來上傳的數據
//           let fileBytes = cResult.dataURL.split(',')[1];
//
//           //有壓縮才修改文件名.jpg
//           let newFileName = targetFileName;
//           if (cResult.isCompressed) {
//             newFileName = targetFileName.substring(0, targetFileName.lastIndexOf('.')) + '.jpg';
//           }
//
//           //TODO: 自行保存數據 處理上傳
//
//         })
//         .catch(e => {
//           //錯誤處理
//           console.log('compressImage error',e)
//           if (e === 'error_compress') {
//             //壓縮失敗(不夠小) TODO:自行處理錯誤訊息展示
//           }
//           if (e === 'error_imgload') {
//             //圖片加載失敗(不是正確格式) TODO:自行處理錯誤訊息展示
//           }
//         });
//     };
//   reader.readAsDataURL(targetFile);
// };
