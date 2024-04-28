import Drawer from '@/components/View/Drawer';
import { useState, useEffect } from 'react';
import classNames from 'classnames';


function DragSelectDrawer(props){
  const top = 160;
  const optionHeight = 48;
  const selectorHeight = 330;
  const {visible, title, onClose, options, onSave, selectedOption} = props;
  const [dragDistance, setDragDistance] = useState(0)
  const [initialY, setInitalY] = useState(0)
  const [hasMovedY, setHasMovedY] = useState(-top)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(()=>{
    if(!visible){
      setInitalY(0);
      setActiveIndex(0)
    }
    if(visible){
        const selectedIndex = options.findIndex(item=>item.id===selectedOption.id) === -1 ? 0 : options.findIndex(item=>item.id===selectedOption.id)
        setDragDistance(-144 + selectedIndex * 48);
        setActiveIndex(selectedIndex)
    }
  },[visible])

  return (
    <Drawer
      direction="bottom"
      onClose={onClose}
      visible={visible}
      className="drag_selector"
    >
      <div className='drag_selector_container'>
        <div className='drag_selector_header'>
          <span onClick={onClose}>Đóng</span>
          <label>{title||""}</label>
          <span 
            className='blue' 
            style={{fontWeight:700}} 
            onClick={()=>{
              onSave(options[activeIndex])
              onClose()
            }}
          >
            Chọn
          </span>
        </div>
        <div className='drag_selector_content' style={{height:selectorHeight}} >
          <div className='selected' />
          <ul 
            onTouchStart={(e)=>{
              setInitalY(e.targetTouches[0].clientY)
            }} 
            onTouchMove={(e)=>{
              const distance = hasMovedY + ((initialY) - e.targetTouches[0].clientY) ;
              if(distance < -top|| distance > options.length * optionHeight - top){
                return
              }

              const formatDistance = Math.floor(distance) - (distance % optionHeight);

              setDragDistance(formatDistance)
              setActiveIndex(Math.floor((formatDistance+top)/optionHeight))
            }}
              
            onTouchEnd={(e)=>{setHasMovedY(dragDistance)}}
            style={{transform:`translateY(${(-dragDistance - (-dragDistance % optionHeight))}px)`}} 
          >
            {options.map((opt,i)=> {
              return <li 
                style={{height:optionHeight}}
                className={classNames({
                  active:activeIndex ===i,
                  neighbour_1st:Math.abs(activeIndex-i) ===1 ,
                  neighbour_2nd:Math.abs(activeIndex-i) ===2,
                  noShow:Math.abs(activeIndex-i) >2
                })}
                >
                  {opt.name}
                </li>
            }
            )}
          </ul>
        </div>
      </div>
    </Drawer>
  )

}

export default DragSelectDrawer