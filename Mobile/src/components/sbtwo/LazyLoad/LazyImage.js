import React from "react";
import PropTypes from "prop-types";
import LazyLoad from "react-lazyload";

const LazyImage = ({ src, alt = '' , defaultSrc, defaultAlt = '', thisClassName='', noLazy = false, overflow = false }) => {
  const refDefault = React.useRef();
  const refImg = React.useRef();

  const removeDefault = () => {
    refDefault.current.remove();
    refImg.current.style['display']  = 'inline';
  };

  const removeImg = () => {
    refImg.current.remove();
  }
  return (
    <>
      <img ref={refDefault} className={thisClassName} src={defaultSrc} alt={defaultAlt}/>
      { !noLazy ? //手動取消lazy 這樣對於bti來說會更快速
      <LazyLoad classNamePrefix="lazy-image" overflow={overflow}>
        <img
          style={{display:'none'}}
          className={thisClassName}
          ref={refImg}
          onLoad={removeDefault}
          onError={removeImg}
          src={src}
          alt={alt}
        />
      </LazyLoad>
        : null}
    </>
  );
};

LazyImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  defaultSrc: PropTypes.string.isRequired,
  defaultAlt: PropTypes.string,
  thisClassName: PropTypes.string,
};

export default LazyImage;