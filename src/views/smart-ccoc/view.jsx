import React, { useEffect, useMemo, useState } from "react";
import { Card } from "primereact/card";
import Camera from "../../assets/trafficlight/camera.png";
import Camerared from "../../assets/trafficlight/camerared.png";
import Eyes from "../../assets/trafficlight/eyes.png";
import CloseEyes from "../../assets/trafficlight/close-eyes.png";
import { DeviceModel } from "../../models";
import MapLeaflet from "./map.leaflet";
import axios from "axios";
import md5 from "md5";

const device_model = new DeviceModel();

const CCTV = () => {
  const [state, setState] = useState({
    projects: [], // แยก project
    sites: [], // แยก site
    deviceData: [],
    online: 0,
    offline: 0,
  });

  const [selectedSite, setSelectedSite] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [expandedSites, setExpandedSites] = useState({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await device_model.getDeviceByProject();

      // 🔹 แยก project -> site -> device ชัดเจน
      const projects = data.map((project) => ({
        project_table_uuid: project.project_table_uuid,
        project_name: project.project_name,
        sites: (project.site || []).map((site) => ({
          ...site,
          project_table_uuid: project.project_table_uuid,
          project_name: project.project_name,
        })),
      }));

      const sites = projects.flatMap((p) => p.sites);

      const devices = sites.flatMap((site) =>
        (site.device || []).map((device) => ({
          ...device,
          site_table_uuid: site.site_table_uuid,
          project_table_uuid: site.project_table_uuid,
          site_name: site.site_name,
          project_name: site.project_name,
        })),
      );

      const onlineDevices = devices.filter(
        (d) => Number(d.active_device) === 1,
      );
      const offlineDevices = devices.filter(
        (d) => Number(d.active_device) !== 1,
      );

      setState({
        projects,
        sites,
        deviceData: devices,
        online: onlineDevices.length,
        offline: offlineDevices.length,
      });

      // 🔹 ไม่ force เลือก site ตอนเริ่ม เพื่อให้ default = ทุกไซต์
      if (sites.length > 0) {
        setSelectedSite(null);
        setSelectedSiteUuid("");
      }
    } catch (error) {
      console.error("Failed to fetch CCTV data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const initPlayer = (cameraURL) => {
    const video = document.getElementById("video");
    if (!video) return;

    while (video.firstChild) {
      video.removeChild(video.firstChild);
    }

    const source = document.createElement("source");
    source.src = cameraURL;
    source.type = "video/webm";
    video.appendChild(source);
    video.load();
    video.play().catch(() => {
      console.warn("Autoplay prevented by browser.");
    });
  };

  const generateVideoUrl = (authKey, deviceId, serverAddress) => {
    const cameraURL = `${serverAddress}/media/${deviceId}.webm?lo&auth=${authKey}`;
    initPlayer(cameraURL);
  };

  const generateKey = async (device) => {
    try {
      setSelectedDevice(device);
      const deviceId = device.mac_address;
      const username = import.meta.env.VITE_APP_NX_USER;
      const password = import.meta.env.VITE_APP_NX_PASS;
      const maxRetries = 3;
      const retryDelay = 2000;

      const fetchNonceWithRetry = async (retryCount = 0) => {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_APP_SERVER_NX_CLOUD_URL}/api/getNonce`,
            { withCredentials: true },
          );
          return response.data.reply;
        } catch (error) {
          if (
            error.response &&
            error.response.status === 503 &&
            retryCount < maxRetries
          ) {
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
            return fetchNonceWithRetry(retryCount + 1);
          }
          throw error;
        }
      };

      const { realm, nonce } = await fetchNonceWithRetry();
      const digest = md5(`${username}:${realm}:${password}`);
      const partial_ha2 = md5("GET:");
      const simplified_ha2 = md5(`${digest}:${nonce}:${partial_ha2}`);
      const authKey = btoa(`${username}:${nonce}:${simplified_ha2}`);

      generateVideoUrl(
        authKey,
        deviceId,
        import.meta.env.VITE_APP_SERVER_NX_CLOUD_URL,
      );
    } catch (error) {
      console.error("Failed to generate streaming key:", error);
      alert("Failed to open camera stream. Please try again later.");
    }
  };

  const handleMapSelect = (device) => {
    if (!device) return;

    setSelectedDevice(device);

    const matchedSite = state.sites.find(
      (site) => site.site_table_uuid === device.site_table_uuid,
    );

    if (matchedSite) {
      setSelectedSite(matchedSite);
      setExpandedSites((prev) => ({
        ...prev,
        [matchedSite.site_table_uuid]: true,
      }));
    }

    generateKey(device);
  };
  // default = ทุกโปรเจกต์
  const [selectedProject, setSelectedProject] = useState(null);
  // default = ทุกไซต์
  const [selectedSiteUuid, setSelectedSiteUuid] = useState("");

  // 🔹 filter ตาม project + site + status
  const filteredSites = useMemo(() => {
    return state.sites.filter((site) => {
      const keyword = search.toLowerCase();

      const matchKeyword =
        !keyword ||
        site.site_name?.toLowerCase().includes(keyword) ||
        site.project_name?.toLowerCase().includes(keyword);

      const matchProject =
        !selectedProject ||
        site.project_table_uuid === selectedProject.project_table_uuid;

      const matchSite =
        !selectedSiteUuid || site.site_table_uuid === selectedSiteUuid;

      const matchStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "online"
            ? Number(site.offlineCount || 0) === 0
            : Number(site.offlineCount || 0) > 0;

      return matchKeyword && matchProject && matchSite && matchStatus;
    });
  }, [state.sites, search, statusFilter, selectedProject, selectedSiteUuid]);

  const summary = useMemo(() => {
    const totalSites = state.sites.length;
    const totalProjects = state.projects.length;
    const problemSites = state.sites.filter(
      (s) => Number(s.offlineCount || 0) > 0,
    ).length;

    return {
      totalSites,
      totalProjects,
      problemSites,
      totalCameras: state.deviceData.length,
    };
  }, [state]);

  const getSiteDevices = (site) => site?.device || [];

  const selectSite = (site) => {
    setSelectedSite(site);
    setSelectedSiteUuid(site.site_table_uuid || "");
    setExpandedSites((prev) => ({
      ...prev,
      [site.site_table_uuid]: !prev[site.site_table_uuid],
    }));
  };

  const selectedSiteDevices = selectedSite ? getSiteDevices(selectedSite) : [];
  const selectedSiteOnline = selectedSiteDevices.filter(
    (d) => Number(d.active_device) === 1,
  ).length;
  const selectedSiteOffline = selectedSiteDevices.filter(
    (d) => Number(d.active_device) !== 1,
  ).length;

  return (
    <div className="min-h-screen bg-slate-100 p-4 lg:p-6">
      <div className="mx-auto max-w-[1800px] space-y-4">
        <div className="overflow-hidden rounded-3xl bg-slate-950 text-white shadow-2xl">
          <div className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-2xl font-semibold tracking-tight">
                CCTV Smart Monitoring Dashboard
              </div>
              <div className="text-sm text-slate-300">
                ระบบรวมกล้อง CCTV หลายไซต์ พร้อมแผนที่และ live streaming
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-400" />
                Online {state.online}
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-rose-400" />
                Offline {state.offline}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <div className="xl:col-span-8">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
              <SummaryCard
                title="Project"
                value={summary.totalProjects}
                tone="blue"
              />
              <SummaryCard
                title="Sites"
                value={summary.totalSites}
                tone="slate"
              />
              <SummaryCard
                title="Cameras"
                value={summary.totalCameras}
                tone="blue"
              />
              <SummaryCard
                title="Problem Sites"
                value={summary.problemSites}
                tone="rose"
              />
              <SummaryCard
                title="Online Cameras"
                value={state.online}
                tone="emerald"
              />
            </div>

            <Card
              pt={{
                root: {
                  className:
                    "mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm",
                },
                body: { className: "p-0" },
                content: { className: "p-0" },
              }}
            >
              <div className="border-b border-slate-200 px-5 py-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="text-lg font-semibold text-slate-900">
                      Site Map
                    </div>
                    <div className="text-sm text-slate-500">
                      คลิก marker เพื่อเปิดดูกล้องหรือเลือกไซต์จากรายการด้านล่าง
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-[420px] overflow-hidden bg-slate-200 lg:h-[520px]">
                <MapLeaflet
                  marker={state.deviceData}
                  show={handleMapSelect}
                  selectedProjectUuid={
                    selectedProject?.project_table_uuid || ""
                  }
                  selectedSiteUuid={selectedSiteUuid || ""}
                />
              </div>
            </Card>

            <Card
              pt={{
                root: {
                  className:
                    "mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm",
                },
                body: { className: "p-0" },
                content: { className: "p-0" },
              }}
            >
              <div className="border-b border-slate-200 px-5 py-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <div className="text-lg font-semibold text-slate-900">
                      Sites
                    </div>
                    <div className="text-sm text-slate-500">
                      รายการไซต์และกล้องในแต่ละไซต์
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <select
                      value={selectedProject?.project_table_uuid || ""}
                      onChange={(e) => {
                        const project = state.projects.find(
                          (p) => p.project_table_uuid === e.target.value,
                        );
                        setSelectedProject(project || null);
                        setSelectedSiteUuid("");
                      }}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
                    >
                      <option value="">ทุกโปรเจกต์</option>
                      {state.projects.map((p) => (
                        <option
                          key={p.project_table_uuid}
                          value={p.project_table_uuid}
                        >
                          {p.project_name}
                        </option>
                      ))}
                    </select>

                    <select
                      value={selectedSiteUuid}
                      onChange={(e) => {
                        const siteUuid = e.target.value;
                        setSelectedSiteUuid(siteUuid);

                        const site =
                          state.sites.find(
                            (s) => s.site_table_uuid === siteUuid,
                          ) || null;
                        setSelectedSite(site);
                      }}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
                    >
                      <option value="">ทุกไซต์</option>
                      {state.sites
                        .filter((site) =>
                          !selectedProject
                            ? true
                            : site.project_table_uuid ===
                              selectedProject.project_table_uuid,
                        )
                        .map((site) => (
                          <option
                            key={site.site_table_uuid}
                            value={site.site_table_uuid}
                          >
                            {site.site_name}
                          </option>
                        ))}
                    </select>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
                    >
                      <option value="all">ทุกสถานะ</option>
                      <option value="online">ไซต์ปกติ</option>
                      <option value="offline">ไซต์มีออฟไลน์</option>
                    </select>

                    <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                      {filteredSites.length} ไซต์
                    </div>
                  </div>
                </div>
              </div>

              <div className="max-h-[700px] overflow-y-auto p-4">
                {isLoading ? (
                  <div className="py-14 text-center text-sm text-slate-500">
                    กำลังโหลดข้อมูล...
                  </div>
                ) : filteredSites.length === 0 ? (
                  <div className="py-14 text-center text-sm text-slate-500">
                    ไม่พบข้อมูลไซต์
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredSites.map((site) => {
                      const isExpanded = !!expandedSites[site.site_table_uuid];
                      const devices = getSiteDevices(site);
                      const onlineCount = devices.filter(
                        (d) => Number(d.active_device) === 1,
                      ).length;
                      const offlineCount = devices.filter(
                        (d) => Number(d.active_device) !== 1,
                      ).length;

                      return (
                        <div
                          key={site.site_table_uuid}
                          className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                        >
                          <button
                            type="button"
                            onClick={() => selectSite(site)}
                            className="flex w-full flex-col gap-4 px-4 py-4 text-left transition hover:bg-slate-50 lg:flex-row lg:items-center lg:justify-between"
                          >
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`inline-block h-2.5 w-2.5 rounded-full ${
                                    offlineCount > 0
                                      ? "bg-rose-500"
                                      : "bg-emerald-500"
                                  }`}
                                />
                                <div className="truncate text-base font-semibold text-slate-900">
                                  {site.site_name}
                                </div>
                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                  {site.project_name}
                                </span>
                              </div>
                              <div className="mt-1 text-sm text-slate-500">
                                {devices.length} กล้องทั้งหมด
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                Online {onlineCount}
                              </span>
                              <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                                Offline {offlineCount}
                              </span>
                              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                                {isExpanded
                                  ? "ซ่อนรายการกล้อง"
                                  : "ดูกล้องในไซต์"}
                              </span>
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="border-t border-slate-200 bg-slate-50/60 p-3">
                              <div className="space-y-2">
                                {devices.map((device, index) => {
                                  const isOnline =
                                    Number(device.active_device) === 1;
                                  const mergedDevice = {
                                    ...device,
                                    site_name: site.site_name,
                                    site_table_uuid: site.site_table_uuid,
                                    project_name: site.project_name,
                                  };

                                  return (
                                    <div
                                      key={`${site.site_table_uuid}-${index}`}
                                      className={`grid grid-cols-1 gap-3 rounded-2xl border px-4 py-3 md:grid-cols-[1.5fr_.6fr_.9fr] ${
                                        selectedDevice?.mac_address ===
                                        device.mac_address
                                          ? "border-blue-300 bg-blue-50"
                                          : "border-slate-200 bg-white"
                                      }`}
                                    >
                                      <div className="min-w-0">
                                        <div className="truncate text-sm font-semibold text-slate-900">
                                          {device.device_name}
                                        </div>
                                        <div className="mt-1 text-xs text-slate-500">
                                          MAC: {device.mac_address || "-"}
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <img
                                          src={isOnline ? Camera : Camerared}
                                          alt={isOnline ? "online" : "offline"}
                                          className="h-6 w-6 object-contain"
                                        />
                                        <span
                                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                            isOnline
                                              ? "bg-emerald-50 text-emerald-700"
                                              : "bg-rose-50 text-rose-700"
                                          }`}
                                        >
                                          {isOnline ? "Online" : "Offline"}
                                        </span>
                                      </div>

                                      <div className="flex items-center justify-start gap-2 md:justify-end">
                                        <button
                                          type="button"
                                          disabled={!isOnline}
                                          onClick={() => {
                                            setSelectedSite(site);
                                            setSelectedDevice(mergedDevice);
                                            if (isOnline)
                                              generateKey(mergedDevice);
                                          }}
                                          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
                                            isOnline
                                              ? "bg-slate-900 text-white hover:bg-slate-800"
                                              : "cursor-not-allowed bg-slate-200 text-slate-400"
                                          }`}
                                        >
                                          <img
                                            src={isOnline ? Eyes : CloseEyes}
                                            alt="view"
                                            className="h-4 w-4 object-contain"
                                          />
                                          Live View
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-4 xl:col-span-4">
            <Card
              pt={{
                root: {
                  className:
                    "overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm",
                },
                body: { className: "p-0" },
                content: { className: "p-0" },
              }}
            >
              <div className="border-b border-slate-200 px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-lg font-semibold text-slate-900">
                      Live Camera Feed
                    </div>
                    <div className="text-sm text-slate-500">
                      {selectedDevice?.device_name || "ยังไม่ได้เลือกกล้อง"}
                    </div>
                  </div>
                  <div
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      selectedDevice &&
                      Number(selectedDevice.active_device) === 1
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {selectedDevice
                      ? Number(selectedDevice.active_device) === 1
                        ? "Streaming Ready"
                        : "Offline"
                      : "No Camera Selected"}
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="overflow-hidden rounded-2xl bg-slate-950">
                  <video
                    id="video"
                    className="aspect-video w-full bg-black object-cover"
                    controls
                    playsInline
                  />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <InfoChip
                    label="ไซต์"
                    value={
                      selectedDevice?.site_name ||
                      selectedSite?.site_name ||
                      "-"
                    }
                  />
                  <InfoChip
                    label="โปรเจกต์"
                    value={
                      selectedDevice?.project_name ||
                      selectedSite?.project_name ||
                      "-"
                    }
                  />
                  <InfoChip
                    label="ชื่อกล้อง"
                    value={selectedDevice?.device_name || "-"}
                  />
                  <InfoChip
                    label="สถานะ"
                    value={
                      selectedDevice
                        ? Number(selectedDevice.active_device) === 1
                          ? "Online"
                          : "Offline"
                        : "-"
                    }
                  />
                </div>
              </div>
            </Card>

            <Card
              pt={{
                root: {
                  className:
                    "overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm",
                },
                body: { className: "p-0" },
                content: { className: "p-0" },
              }}
            >
              <div className="border-b border-slate-200 px-5 py-4">
                <div className="text-lg font-semibold text-slate-900">
                  Selected Site Info
                </div>
                <div className="text-sm text-slate-500">
                  สรุปสถานะของไซต์ที่เลือก
                </div>
              </div>

              <div className="space-y-4 p-4">
                <div>
                  <div className="text-base font-semibold text-slate-900">
                    {selectedSite?.site_name || "-"}
                  </div>
                  <div className="text-sm text-slate-500">
                    {selectedSite?.project_name || "-"}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <MiniStat
                    label="กล้องออนไลน์"
                    value={selectedSiteOnline}
                    color="emerald"
                  />
                  <MiniStat
                    label="กล้องออฟไลน์"
                    value={selectedSiteOffline}
                    color="rose"
                  />
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="mb-3 text-sm font-semibold text-slate-700">
                    Quick Camera List
                  </div>
                  <div className="space-y-2">
                    {selectedSiteDevices.length === 0 ? (
                      <div className="text-sm text-slate-500">
                        ไม่พบรายการกล้อง
                      </div>
                    ) : (
                      selectedSiteDevices.map((device, index) => {
                        const isOnline = Number(device.active_device) === 1;
                        const mergedDevice = {
                          ...device,
                          site_name: selectedSite?.site_name,
                          site_table_uuid: selectedSite?.site_table_uuid,
                          project_name: selectedSite?.project_name,
                        };

                        return (
                          <button
                            key={`${selectedSite?.site_table_uuid || "site"}-${index}`}
                            type="button"
                            disabled={!isOnline}
                            onClick={() =>
                              isOnline && generateKey(mergedDevice)
                            }
                            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition ${
                              isOnline
                                ? "bg-white hover:bg-slate-100"
                                : "cursor-not-allowed bg-slate-100 opacity-70"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={isOnline ? Camera : Camerared}
                                alt="status"
                                className="h-5 w-5 object-contain"
                              />
                              <div>
                                <div className="text-sm font-medium text-slate-800">
                                  {device.device_name}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {isOnline ? "พร้อมดูภาพสด" : "ออฟไลน์"}
                                </div>
                              </div>
                            </div>
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                isOnline
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-rose-50 text-rose-700"
                              }`}
                            >
                              {isOnline ? "Live" : "Off"}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ title, value, tone = "slate" }) => {
  const toneMap = {
    slate: "from-slate-900 to-slate-700 text-white",
    blue: "from-blue-600 to-indigo-600 text-white",
    emerald: "from-emerald-500 to-emerald-600 text-white",
    rose: "from-rose-500 to-rose-600 text-white",
  };

  return (
    <div
      className={`rounded-3xl bg-gradient-to-br p-5 shadow-sm ${toneMap[tone]}`}
    >
      <div className="text-sm opacity-90">{title}</div>
      <div className="mt-2 text-3xl font-bold tracking-tight">{value}</div>
    </div>
  );
};

const MiniStat = ({ label, value, color = "emerald" }) => {
  const colorMap = {
    emerald: "bg-emerald-50 text-emerald-700",
    rose: "bg-rose-50 text-rose-700",
    blue: "bg-blue-50 text-blue-700",
  };

  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="text-sm text-slate-500">{label}</div>
      <div
        className={`mt-2 inline-flex rounded-full px-3 py-1 text-lg font-bold ${colorMap[color]}`}
      >
        {value}
      </div>
    </div>
  );
};

const InfoChip = ({ label, value }) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
    <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
      {label}
    </div>
    <div className="mt-1 truncate text-sm font-semibold text-slate-800">
      {value}
    </div>
  </div>
);

export default CCTV;
