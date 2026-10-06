import React, { useState, useEffect, useRef } from "react"
import { DataTable, Column } from "primereact"
import Camera from "../../assets/trafficlight/camera.png"
import Camerared from "../../assets/trafficlight/camerared.png"
import { DeviceModel } from "../../models"
import Map from "./map.component"
import axios from "axios"
import md5 from "md5"
const device_model = new DeviceModel()

const CCTV = (props) => {
  const [state, setState] = useState({
    deviceData: [],
    defaultCenter: { lat: 14.9788739, lng: 102.0846441 },
    markerPosition: { lat: 14.9788739, lng: 102.0846441 },
    showAlert: false,
    online: 0,
    offline: 0,
  })
  const containerRef = useRef(null)
  useEffect(() => {
    _fetchData()
  }, [])

  const _fetchData = async () => {
    let device = await device_model.getDeviceBy()
    let online = device.data.filter((item) => item.is_active == 1)
    let offline = device.data.filter((item) => item.is_active != 1)

    setState({
      ...state,
      deviceData: device.data,
      online: online.length,
      offline: offline.length,
    })
  }

  const initPlayer = (cameraURL) => {
    const video = document.getElementById("video")
    while (video.firstChild) {
      video.removeChild(video.firstChild)
    }
    const source = document.createElement("source")
    source.src = cameraURL
    source.type = "video/webm"
    video.appendChild(source)
    video.load()
    video.play()
  }

  const generateKey = async (data) => {
    const deviceId = data.mac_address
    const username = "devteam@thaiakitech.com"
    const password = "@dm1nt@Dev"
    const maxRetries = 3
    const retryDelay = 2000

    const fetchNonceWithRetry = async (retryCount = 0) => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_APP_SERVER_NX_CLOUD_URL}/api/getNonce`, { withCredentials: true })
        return response.data.reply
      } catch (error) {
        if (error.response && error.response.status === 503 && retryCount < maxRetries) {
          console.warn(`503 error, retrying... (${maxRetries - retryCount} retries left)`)
          await new Promise((resolve) => setTimeout(resolve, retryDelay))
          return fetchNonceWithRetry(retryCount + 1)
        } else {
          console.error("Error generating key:", error)
          throw error
        }
      }
    }

    try {
      const { realm, nonce } = await fetchNonceWithRetry()
      const digest = md5(`${username}:${realm}:${password}`)
      const partial_ha2 = md5(`GET:`)
      const simplified_ha2 = md5(`${digest}:${nonce}:${partial_ha2}`)
      const authKey = btoa(`${username}:${nonce}:${simplified_ha2}`)
      generateVideoUrl(authKey, deviceId, import.meta.env.VITE_APP_SERVER_NX_CLOUD_URL)
    } catch (error) {
      console.error("Failed to generate key after retries:", error)
      alert("Failed to generate key. Please try again later.")
    }
  }
  const generateVideoUrl = (authKey, deviceId, serverAddress) => {
    const cameraURL = `${serverAddress}/media/${deviceId}.webm?lo&auth=${authKey}`
    initPlayer(cameraURL)
  }
  return (
    <>
      <div className="grid lg:grid-cols-4 gap-5">
        {/* Content Left */}
        <div className="lg:col-span-3">
          <div className="relative w-full h-[80vh]">
            <Map marker={state.deviceData} show={initPlayer}></Map>
          </div>
        </div>

        {/* Content Right */}
        <div>
          <div className="border-dashed border-4 mb-auto px-2">
            <div>
              <video id="video" className="h-[15rem] w-full" controls></video>
            </div>

            <div className="mt-5">
              <DataTable
                value={state.deviceData}
                dataKey="device_table_uuid"
                className="h-[30.2rem] custom-row-height custom-cell-padding overflow-auto"
                size="small"
              >
                <Column header="ชื่อจุด" headerClassName="bg-[#d9d9d9]" field="device_name" />
                <Column
                  field="สถานะ"
                  headerClassName="bg-[#d9d9d9] border-top"
                  body={(rowData) => <img src={rowData.is_active == "1" ? Camera : Camerared} alt="status" className="h-7 ml-5" />}
                  header="สถานะ"
                />
                <Column
                  header="View"
                  headerClassName="bg-[#d9d9d9] flex justify-center  "
                  className=" text-black text-center"
                  field="view"
                  body={(row) => <i className="pi pi-eye cursor-pointer" onClick={() => generateKey(row)}></i>}
                />
              </DataTable>
            </div>
          </div>
          <div className=" justify-center flex mt-10">
            <div className="flex justify-center mr-6">
              <img src={Camera} alt="Camera" />
              <div className="flex flex-col items-center">
                <label className="text-xl ml-5 mt-2 ">ทำงาน</label>
                <label className="text-lg ml-5 mt-2 text-blue-600">{state.online}</label>
              </div>
            </div>
            <div className="flex justify-center ">
              <img src={Camerared} alt="Camerared" />
              <div className="flex flex-col items-center">
                <label className="text-xl ml-5 mt-2">ไม่ทำงาน</label>
                <label className="text-lg ml-5 mt-2 text-red-400">{state.offline}</label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default CCTV
