import ReactDOM from 'react-dom'

function FloatButton(props){
  return ReactDOM.createPortal(
    <button 
      className={`float-botton ${props.className}`}
      onClick={props.onClick}
    >
      {props.children}
    </button>,
    (props.wrapDom && props.wrapDom.current) || document.body
  );
  
}

export default FloatButton;