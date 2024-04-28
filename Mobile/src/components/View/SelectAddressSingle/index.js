import DragSelectDrawer from "@/components/View/DragSelectDrawer"
import Toast from '@/components/View/Toast';
import { GetProvinces, GetDistricts, GetTowns } from '@/api/promotions';
import classNames from 'classnames';
import { BsChevronDown } from 'react-icons/bs';
import { useState, useEffect } from "react"

function SelectAddressSingle(props){
  const {setParentAddressState, addressBeforeEdit}= props
 
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [addressLists, setAddressLists] = useState({
    province:{},
    district:{},
    town:{}
  })
  const [drawerOptions, setDrawerOptions]= useState([])
  const [isCurrentAddressLoaded, setIsCurrentAddressLoaded]= useState(false)
  const [type, setType] = useState("province")  //province distrcit town
  const [selectedAddresses, setSelectedAddresses] = useState({
    province:{},
    district:{},
    town:{}
  })

  const addressType = [
    {level:1,type:"province", disabledText:"Tỉnh/Thành"},
    {level:2,type:"district", disabledText:"Quận/Huyện"},
    {level:3,type:"town", disabledText:"Phường/Xã"},
  ]

  // 抓Province資料
  useEffect(()=>{
    Toast.loading();
    GetProvinces((res) => {
      Toast.destroy();
			if (res.isSuccess) {
        setAddressLists({...addressLists, province:res.result})
        setDrawerOptions(res.result)
			}
		});
  },[])


  // 抓District資料
  useEffect(()=>{
    if(selectedAddresses.province?.id && addressLists.province?.length ){
      Toast.loading();
      GetDistricts(selectedAddresses.province.id, (res) => {
        Toast.destroy();
        if (res.isSuccess) {
          setAddressLists({...addressLists, district:res.result})
        }
      });
    }
    if(addressBeforeEdit && !isCurrentAddressLoaded){
      setSelectedAddresses({
        ...selectedAddresses,
        district:{id:addressBeforeEdit?.districtID, name:addressBeforeEdit?.districtName}
      })
    }
  },[selectedAddresses.province.id,addressLists.province])

  // 抓Town資料
  useEffect(()=>{
    if(selectedAddresses.district?.id && addressLists.district?.length){
      Toast.loading();
      GetTowns(selectedAddresses.district.id, (res) => {
        Toast.destroy();
        if (res.isSuccess) {
          setAddressLists({...addressLists, town:res.result})
        }
      });
      if(addressBeforeEdit && !isCurrentAddressLoaded){
        setSelectedAddresses({
          ...selectedAddresses,
          town:{id:addressBeforeEdit?.townID, name:addressBeforeEdit?.townName}
        })
        setIsCurrentAddressLoaded(true)
      }
    }
  },[selectedAddresses.district.id, ,addressLists.district])

  // 觸發current Address loading
  useEffect(()=>{
    if(!isCurrentAddressLoaded){
      setSelectedAddresses({
        ...selectedAddresses,
        province:{id:addressBeforeEdit?.provinceID, name:addressBeforeEdit?.provinceName}
      })
    }
  },[addressBeforeEdit])

  return (
    <div className="addressContainer">
      <div className="selectorBox">
        {addressType.map(item=>{ return (
          <div
            className={classNames({
              addressInput:true,
              disabled:item.type==="province" ? !addressLists.province.length : !addressLists[item.type].length,
              selected:selectedAddresses[item.type]?.name
            })}
            onClick={()=>{
              if(!addressLists[item.type].length){
                return
              }
              setType(item.type)
              setDrawerOptions(addressLists[item.type])
              setIsDrawerOpen(true)
           }}
          >
            <p>{selectedAddresses[item.type].name|| item.disabledText}</p>
            <BsChevronDown color="#999" />
          </div>
        )
        })}
      </div>
        <DragSelectDrawer
          visible={isDrawerOpen}
          title={type==="province" ? "Tỉnh/Thành Phố" : type==="district" ? "Quận/Huyện" : "Phường/Xã"}
          onClose={()=>{setIsDrawerOpen(false)}}
          options={drawerOptions}
          selectedOption={selectedAddresses[type]}
          onSave={(addressItem)=>{
            const selectedResult = {
              province: type === "province" ? addressItem : selectedAddresses.province,
              district:type === "province" ? {} : type==="district" ? addressItem : selectedAddresses.district,
              town:type!=="town" ? {} : addressItem
            }

            setSelectedAddresses(selectedResult)
            setParentAddressState(selectedResult)
            if(type==="province"){
              setAddressLists({...addressLists, district:[], town:[]})
            }
            if(type==="district"){
              setAddressLists({...addressLists, town:[]})
            }
          }}
        
        />
    </div>
  )

}

export default SelectAddressSingle