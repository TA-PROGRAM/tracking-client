import React from "react"
import { GoogleMap, Marker, useJsApiLoader, TrafficLayer  } from "@react-google-maps/api"
import axios from "axios"
import md5 from "md5"

const mapContainerStyle = {
  width: "100%",
  height: "100%",
}
const center = {
  lat: 14.9788739,
  lng: 102.0846441,
}

const MyMapComponent = ({ marker, show }) => {
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
    show(cameraURL)
  }

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_APP_PUBLIC_GOOGLE_MAPS_API_KEY, 
  })

  if (loadError) return <div>Error loading maps: {loadError.message}</div>
  if (!isLoaded) return <div>Loading Maps...</div>

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      zoom={13.5}
      center={center}
    >
      <TrafficLayer />
      {marker.map((device) => {
        const latitude = parseFloat(device.latitude)
        const longitude = parseFloat(device.longtitude)

        return (
          <Marker
            key={device.device_table_uuid}
            position={{
              lat: latitude,
              lng: longitude,
            }}
            icon={{
              url: device.active_device === 1 ? "img/camera.png" : "img/camerared.png",
              scaledSize: new window.google.maps.Size(40, 40),
            }}
            onClick={() => generateKey(device)}
            title={device.device_name}
          />
        )
      })}
    </GoogleMap>
  ) : (
    ""
  )
}

export default MyMapComponent
