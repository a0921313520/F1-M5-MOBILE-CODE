function Loading(props) {
  return (
    <div className={`loading_Container ${props.className}`}>
        {props.isLoading && (
          <div className='loading_overlap'>
            <div className='loader' />
          </div>
        )}
        <div>{props.children}</div>
    </div>
  );
}

export default Loading;
