import React, { useState, useEffect } from "react"
import { ProgressBar } from "primereact"
import { DeviceModel } from "../../models"
const device_model = new DeviceModel()
const View = () => {
  const [state, setState] = useState({
    data: [1, 2, 3],
    device: [],
    online: 0,
    offline: 0,
    cctvPercent:0
  })
  useEffect(() => {
    const fetchData = async () => {
      const device = await device_model.getDeviceBy()
      const online = device.data.filter((item) => item.active_device == 1)
      const offline = device.data.filter((item) => item.active_device == 0)
      const cctvPercent = Math.ceil(device.data.length/online.length*100)
      setState({ ...state, device: device.data, online: online.length, offline: offline.length ?? 0,cctvPercent })
    }
    fetchData()
  }, [])
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 *:border-[#D9D9D9]">
      <div className="w-full h-full  border-4 p-4 ">
        <div className="divide-y-4 divide-dashed relative">
          {/* <div className="  h-full w-full absolute flex bg-black/30 backdrop-blur-[7px] text-4xl items-center justify-center  text-yellow-400"> อยู่ในระหว่างการพัฒนา</div> */}
          <div className="pb-10 ">
            <div className="flex gap-4 ">
              <img src="/img/map.png" className="h-14" alt="" />
              <p className="text-[clamp(48px,3vw,100px)] text-gray-400">Heat Map</p>
            </div>
            <div className="text-[clamp(20px,1.5vw,100px)]">
              <p>สองแยกเทอร์มินอล</p>
              <p>หน้าโรงเรียนสรุนารี</p>
              <p>หน้าโรงเรียนมารี</p>
              <p>ห้าแยกการไฟฟ้า</p>
            </div>
          </div>
          <div className="flex items-center py-6 2xl:py-10">
            <img src="/img/hot-temp.png" className="w-[clamp(100px,8vw,20vw)]" alt="" />
            <label className="text-[clamp(48px,4vw,100px)] font-bold">38 C ํ</label>
          </div>
          <div className="flex items-center py-6 2xl:py-10">
            <img src="/img/cold-temp.png" className="w-[clamp(100px,8vw,20vw)]" alt="" />
            <label className="text-[clamp(48px,4vw,100px)] font-bold text-sky-300">Low</label>
          </div>
          <label className="text-xl text-yellow-400"> อยู่ในระหว่างการพัฒนา</label>
        </div>
      </div>
      <div className="w-full border-x-4 sm:border-y-4  relative">
        <div className="divide-y-4 divide-solid">
          <div className="px-5 py-6">
            <div className="flex items-center font-bold">
              <img src="/img/traffic-light.png" className="w-[clamp(50px,4vw,80px)] " alt="" />
              <p className="text-[clamp(30px,2vw,48px)] pl-10 ">Smart Traffic</p>
            </div>
            <div className=" pt-10 gap-4 2xl:gap-10 grid grid-cols-2 justify-between text-[clamp(20px,1.5vw,50px)] ">
              <p className="text-right">45 </p>
              <p>จำนวนทั้งหมด </p>
              <p className="text-right text-red-500"> 8</p>
              <p className="text-red-500"> Loss</p>
            </div>
            <div className="flex justify-center mt-5">
              <ProgressBar value={100} showValue={false} color="#1EA507" className="w-11/12 rounded-none h-4"></ProgressBar>
            </div>
            <div className="flex justify-between  pt-2 px-8">
              <label>45/50</label>
              <label>85%</label>
            </div>
            <label className="text-xl text-yellow-400"> อยู่ในระหว่างการพัฒนา</label>
          </div>
          <div className="px-5 relative">
            {/* <div className="  h-full w-[90%] absolute bg-black/30 backdrop-blur-[7px] "></div> */}

            <div className="flex pt-10 items-center  ">
              <img src="img/water-level.png" className="w-[clamp(50px,4vw,80px)] " alt="" />
              <p className="text-[clamp(30px,2vw,48px)] font-bold  pl-10">Water Level</p>
            </div>
            <div
              className=" pt-10 gap-4 2xl:gap-10 grid grid-cols-2 
                              justify-between text-[clamp(20px,1.5vw,50px)] "
            >
              <p className="text-right">14 </p>
              <p>จำนวนทั้งหมด </p>
              <p className="text-right text-red-500"> 0</p>
              <p className="text-red-500"> Loss</p>
            </div>
            <div className="pt-4 flex justify-center mt-5">
              <ProgressBar value={100} showValue={false} color="#1EA507" className="w-11/12 rounded-none h-4"></ProgressBar>
            </div>
            <div className="flex justify-between py-2 px-8">
              <label>14/14</label>
              <label>100%</label>
            </div>
            <label className="text-xl text-yellow-400"> อยู่ในระหว่างการพัฒนา</label>

          </div>
        </div>
      </div>
      <div className="w-full  border-x-4 sm:border-y-4  relative">
        <div className="divide-y-4 divide-solid">
          <div className="px-5 py-6">
            <div className="flex items-center font-bold">
              <img src="/img/cctv.png" className="w-[clamp(50px,4vw,80px)] " alt="" />
              <p className="text-[clamp(30px,2vw,48px)]  pl-10 ">Smart CCTV</p>
            </div>
            <div className=" pt-10 gap-4 2xl:gap-10 grid grid-cols-2 justify-between text-[clamp(20px,1.5vw,50px)] ">
              <p className="text-right">{state.online} </p>
              <p>จำนวนทั้งหมด </p>
              <p className="text-right text-red-500">{state.offline}</p>
              <p className="text-red-500"> Loss</p>
            </div>
            <div className="flex justify-center mt-5">
              <ProgressBar value={state.cctvPercent} showValue={false} color="#1EA507" className="w-11/12 rounded-none h-4"></ProgressBar>
            </div>
            <div className="flex justify-between  pt-2 px-8">
              <label>{state.online}/{state.device.length}</label>
              <label>{state.cctvPercent}%</label>
            </div>
          </div>
          <div className="px-5">
            <div className="flex pt-10 items-center">
              <img src="img/street-light.png" className="w-[clamp(50px,4vw,80px)] " alt="" />
              <p className="text-[clamp(30px,2vw,48px)] font-bold  pl-4 text-ellipsis line-clamp-1">Solar street light</p>
            </div>
            <div
              className=" pt-10 gap-4 2xl:gap-10 grid grid-cols-2 
                              justify-between text-[clamp(20px,1.5vw,50px)] "
            >
              <p className="text-right">14 </p>
              <p>จำนวนทั้งหมด </p>
              <p className="text-right text-red-500"> 0</p>
              <p className="text-red-500"> Loss</p>
            </div>
            <div className="pt-4 flex justify-center mt-5">
              <ProgressBar value={100} showValue={false} color="#1EA507" className="w-11/12 rounded-none h-4"></ProgressBar>
            </div>
            <div className="flex justify-between py-2 px-8">
              <label>14/14</label>
              <label>100%</label>
            </div>
            <label className="text-xl text-yellow-400 "> อยู่ในระหว่างการพัฒนา</label>
          </div>
        </div>
      </div>
    </div>
  )
}
export default View
