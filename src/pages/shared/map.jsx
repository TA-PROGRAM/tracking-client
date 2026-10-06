// Leaflet map (OpenStreetMap tiles) — replaces the legacy Google Maps widgets
import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const pin = (color = "#e11d48") =>
  L.divIcon({
    className: "",
    html: `<div style="width:26px;height:26px;border-radius:50% 50% 50% 0;background:${color};transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35)"></div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
    popupAnchor: [0, -24],
  });

export const DEFAULT_CENTER = [14.970686, 102.098921];

// markers: [{ lat, lng, popup (html string), color }]
export const MapView = ({ markers = [], center, zoom = 10, height = 400, onPick, draggable }) => {
  const el = useRef(null);
  const map = useRef(null);
  const layer = useRef(null);

  useEffect(() => {
    if (!el.current || map.current) return;
    map.current = L.map(el.current).setView(center || DEFAULT_CENTER, zoom);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap", maxZoom: 19 }).addTo(map.current);
    layer.current = L.layerGroup().addTo(map.current);
    if (onPick) map.current.on("click", (e) => onPick({ lat: +e.latlng.lat.toFixed(6), lng: +e.latlng.lng.toFixed(6), zoom: map.current.getZoom() }));
    setTimeout(() => map.current?.invalidateSize(), 200);
    return () => {
      map.current?.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!layer.current) return;
    layer.current.clearLayers();
    const valid = markers.filter((m) => Number(m.lat) && Number(m.lng));
    valid.forEach((m) => {
      const mk = L.marker([m.lat, m.lng], { icon: pin(m.color), draggable: !!draggable, title: m.title }).addTo(layer.current);
      if (m.popup) mk.bindPopup(m.popup);
      if (draggable && onPick) mk.on("dragend", (e) => {
        const ll = e.target.getLatLng();
        onPick({ lat: +ll.lat.toFixed(6), lng: +ll.lng.toFixed(6), zoom: map.current.getZoom() });
      });
    });
    if (valid.length === 1 && draggable) map.current.setView([valid[0].lat, valid[0].lng], map.current.getZoom());
    else if (valid.length === 1) map.current.setView([valid[0].lat, valid[0].lng], Math.max(zoom, 13));
    else if (valid.length > 1) map.current.fitBounds(L.latLngBounds(valid.map((m) => [m.lat, m.lng])), { padding: [30, 30] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(markers)]);

  return <div ref={el} style={{ height }} className="z-0 w-full overflow-hidden rounded-2xl border border-slate-200" />;
};

export default MapView;
