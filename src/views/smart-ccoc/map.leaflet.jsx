import React, { useEffect, useRef } from "react";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./style.css";
import koratGeoData from "./geoTHA.json";
import cctvIcon from "/img/cctv-camera.png";

const MapComponent = ({
  marker: markerData = [],
  show,
  selectedProjectUuid = "",
  selectedSiteUuid = "",
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const geojsonLayerRef = useRef(null);

  const getDistrictStyle = (feature) => {
    const districtColors = [
      "#4f46e5",
      "#0ea5e9",
      "#10b981",
      "#f59e0b",
      "#ef4444",
    ];
    const name = feature.properties.adm2_name1 || "";
    const charCodeSum = name
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colorIndex = charCodeSum % districtColors.length;

    return {
      fillColor: districtColors[colorIndex],
      weight: 1.5,
      opacity: 1,
      color: "#ffffff",
      dashArray: "4",
      fillOpacity: 0.16,
      pane: "districtPane",
      interactive: true,
    };
  };

  const getDynamicSize = (zoom) => {
    if (zoom <= 12) return 18;
    if (zoom <= 14) return 22;
    if (zoom <= 16) return 28;
    if (zoom <= 17) return 34;
    return 40;
  };

const createMarkerIcon = (item, zoom) => {
  const size = getDynamicSize(zoom);
  const isOnline = Number(item.active_device) === 1;

  return L.divIcon({
    className: "custom-camera-marker-wrapper",
    html: `
      <div 
        class="custom-camera-marker ${isOnline ? "online" : "offline"}"
        style="width:${size}px;height:${size}px;"
      >
        <div class="camera-pulse"></div>
        <div class="camera-core">
          <img 
            src="${cctvIcon}" 
            style="width:70%;height:70%;object-fit:contain;transform:rotate(-15deg);" 
          />
        </div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

  const getPopupHtml = (item) => {
    const isOnline = Number(item.active_device) === 1;

    return `
      <div class="camera-popup">
        <div class="camera-popup-title">${item.device_name || "-"}</div>
        <div class="camera-popup-row">
          <span class="camera-popup-label">สถานะ</span>
          <span class="camera-popup-badge ${isOnline ? "online" : "offline"}">
            ${isOnline ? "ออนไลน์" : "ออฟไลน์"}
          </span>
        </div>
        <div class="camera-popup-row">
          <span class="camera-popup-label">ไซต์</span>
          <span class="camera-popup-value">${item.site_name || "-"}</span>
        </div>
        <div class="camera-popup-row">
          <span class="camera-popup-label">โปรเจกต์</span>
          <span class="camera-popup-value">${item.project_name || "-"}</span>
        </div>
      </div>
    `;
  };

  const updateMarkerIcons = () => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    const zoom = mapInstanceRef.current.getZoom();

    markersLayerRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        const item = layer.options.deviceData;
        layer.setIcon(createMarkerIcon(item, zoom));
      }
    });
  };

  useEffect(() => {
    if (!mapInstanceRef.current && mapContainerRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomSnap: 0.5,
        zoomControl: true,
      }).setView([14.979816, 102.090713], 14);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      map.createPane("districtPane");
      map.getPane("districtPane").style.zIndex = 350;

      map.createPane("markerPaneCustom");
      map.getPane("markerPaneCustom").style.zIndex = 650;

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;

      map.on("zoomend", updateMarkerIcons);
    }

    if (mapInstanceRef.current && koratGeoData && !geojsonLayerRef.current) {
      const koratFeatures = koratGeoData.features.filter(
        (f) => f.properties.adm1_pcode === "TH30",
      );

      if (koratFeatures.length > 0) {
        geojsonLayerRef.current = L.geoJSON(
          { type: "FeatureCollection", features: koratFeatures },
          {
            style: getDistrictStyle,
            onEachFeature: (feature, layer) => {
              layer.on({
                mouseover: (e) => {
                  const current = e.target;
                  current.setStyle({
                    fillOpacity: 0.3,
                    weight: 2.5,
                  });
                },
                mouseout: (e) => {
                  geojsonLayerRef.current.resetStyle(e.target);
                },
              });

              layer.bindTooltip(feature.properties.adm2_name1, {
                sticky: true,
                direction: "auto",
                className: "district-tooltip",
              });
            },
          },
        ).addTo(mapInstanceRef.current);
      }
    }

    if (markersLayerRef.current && mapInstanceRef.current) {
      markersLayerRef.current.clearLayers();

      const filteredMarkerData = markerData.filter((item) => {
        const matchProject =
          !selectedProjectUuid ||
          item.project_table_uuid === selectedProjectUuid;

        const matchSite =
          !selectedSiteUuid || item.site_table_uuid === selectedSiteUuid;

        return matchProject && matchSite;
      });

      if (filteredMarkerData.length > 0) {
        const zoom = mapInstanceRef.current.getZoom();

        filteredMarkerData.forEach((item) => {
          const normalizedItem = {
            ...item,
            mac_address: item.mac_address || item.device_id || item.id || "",
          };

          const lat = parseFloat(normalizedItem.latitude);
          const lng = parseFloat(
            normalizedItem.longitude || normalizedItem.longtitude,
          );

          if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
            const marker = L.marker([lat, lng], {
              icon: createMarkerIcon(normalizedItem, zoom),
              pane: "markerPaneCustom",
              deviceData: normalizedItem,
            })
              .bindPopup(getPopupHtml(normalizedItem), {
                closeButton: false,
                className: "modern-leaflet-popup",
              })
              .on("click", () => show(normalizedItem));

            markersLayerRef.current.addLayer(marker);
          }
        });
      }
    }
  }, [markerData, selectedProjectUuid, selectedSiteUuid]);

  return (
    <div
      ref={mapContainerRef}
      className="modern-map-container"
      style={{
        height: "100%",
        width: "100%",
      }}
    />
  );
};

export default MapComponent;
