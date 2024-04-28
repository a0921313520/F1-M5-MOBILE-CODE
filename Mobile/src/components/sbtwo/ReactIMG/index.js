import React from "react";
import PropTypes from "prop-types";

//處理圖片路徑問題(放在public目錄的本地圖片才需要換成ReactIMG，外部圖片直接使用img即可)
const Image = ({ src, alt = '', className = '', style = {}, innerRef, onClick }) => {

  return (
    <img
      ref={innerRef}
      style={style}
      className={className}
      src={`${process.env.BASE_PATH}` + src}
      alt={alt}
      onClick={onClick}
    />
  );
};

Image.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  className: PropTypes.string,
};

export default Image;
