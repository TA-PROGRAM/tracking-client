import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import Play from "../../assets/trafficlight/play.png";
import Eyes from "../../assets/trafficlight/eyes.png";
import Lightred from "../../assets/trafficlight/red.png";
import Lightgreen from "../../assets/trafficlight/green.png";
import Camera from "../../assets/trafficlight/camera.png"
import Camerared from "../../assets/trafficlight/camerared.png"

import "./smart.css";

const View = () => {
  const [expandedRows, setExpandedRows] = useState([]);
  const [iframeContent, setIframeContent] = useState("");
  const [showQuantityColumn, setShowQuantityColumn] = useState(false);
  const [data, setData] = useState([
    {
      id: 1,
      name: "ชลประทาน",
      status: "",
      quantity: "",
      datata: {
        sub_name: [""],

        sub_status: [""],
      },
    },
    {
      id: 2,
      name: "รุ่งเรือง",
      status: "1",
      quantity: "",
      datata: {
        sub_name: [
          "ไฟจราจรต้นที่ 1",
          "ไฟจราจรต้นที่ 2",
          "ไฟจราจรต้นที่ 3",
          "ไฟจราจรต้นที่ 4",
        ],
        sub_status: ["0", "1", "1", "0"],
      },
    },
    {
      id: 3,
      name: "ประสพสุข",
      status: "",
      quantity: "",
      datata: {
        sub_name: [""],

        sub_status: [""],
      },
    },
    {
      id: 4,
      name: "มุขมนตรี",
      status: "",
      quantity: "",
      datata: {
        sub_name: [""],

        sub_status: [""],
      },
    },
    {
      id: 5,
      name: "สืบศิริวัฒนา",
      status: "",
      quantity: "",
      datata: {
        sub_name: [""],

        sub_status: [""],
      },
    },
    {
      id: 6,
      name: "บ้านพักทหารหนองไผ่ล้อม",
      status: "",
      quantity: "",
      datata: {
        sub_name: [""],

        sub_status: [""],
      },
    },
    {
      id: 7,
      name: "เดชอุดมสามัคคี",
      status: "",
      quantity: "",
      datata: {
        sub_name: [""],

        sub_status: [""],
      },
    },
    {
      id: 8,
      name: "เสาสูง",
      status: "",
      quantity: "",
      datata: {
        sub_name: [""],

        sub_status: [""],
      },
    },
    {
      id: 9,
      name: "หนองไผ่ล้อม",
      status: "",
      quantity: "",
      datata: {
        sub_name: [""],

        sub_status: [""],
      },
    },
    {
      id: 10,
      name: "พานิชเจริญ",
      status: "",
      quantity: "",
      datata: {
        sub_name: [""],

        sub_status: [""],
      },
    },
    {
      id: 11,
      name: "กศน พัฒนา",
      status: "",
      quantity: "",
      datata: {
        sub_name: [""],

        sub_status: [""],
      },
    },
    {
      id: 12,
      name: "หนองแก้ช้าง",
      status: "",
      quantity: "",
      datata: {
        sub_name: [""],

        sub_status: [""],
      },
    },
    {
      id: 13,
      name: "บ้านพักรถไฟ",
      status: "",
      quantity: "",
      datata: {
        sub_name: [""],

        sub_status: [""],
      },
    },
    {
      id: 14,
      name: "เอ็ทแบ็คสามัคคี",
      status: "",
      quantity: "",
      datata: {
        sub_name: [],

        sub_status: [],
      },
    },
    {
      id: "15",
      name: "อัพวันพัฒนา",
      status: "",
      quantity: "",
      datata: {
        sub_name: [""],

        sub_status: [""],
      },
    },
  ]);

  const updateDataStatus = (items) => {
    return items.map((item) => {
      const hasStatusOne = item.datata.sub_status.includes("1");
      const count = item.datata.sub_status.filter(
        (status) => status === "1"
      ).length;
      return {
        ...item,
        status: hasStatusOne ? "1" : "0",
        quantity: count.toString(),
      };
    });
  };

  const getBase64Image = (img) => {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL("image/png");
  };

  const createIframeContent = () => {
    const img = new Image();
    img.onload = () => {
      const base64Image = getBase64Image(img);
      const content = `
        <html>
          <head>
            <style>
              body, html {
                margin: 0;
                padding: 0;
                overflow: hidden;
              }
              img {
                max-width: 100%;
                max-height: 100%;
                width: 100px;
                height: auto;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                object-fit: contain;
              }
            </style>
          </head>
          <body>
            <img src="${base64Image}" alt="Play Image">
          </body>
        </html>
      `;
      setIframeContent(content);
    };
    img.src = Play;
  };

  const initMap = () => {
    const map = new window.google.maps.Map(document.getElementById("map"), {
      center: { lat: 14.9738583, lng: 102.0836808 },
      zoom: 15,
      zoomControl: false,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: false,
    });

    const trafficLayer = new window.google.maps.TrafficLayer();
    trafficLayer.setMap(map);

    const locations = [
      // {
      //   lat: 14.9738583,
      //   lng: 102.0836808,
      //   title: "Nakhon Ratchasima Municipality",
      // },
    ];

    locations.forEach((location) => {
      new window.google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map: map,
        title: location.title,
      });
    });
  };

  const loadGoogleMapsScript = () => {
    if (window.google && window.google.maps) {
      initMap();
    } else {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_APP_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=visualization`;
      script.async = true;
      script.defer = true;
      script.onload = () => initMap();
      document.head.appendChild(script);
    }
  };

  useEffect(() => {
    const updatedData = updateDataStatus(data);
    setData(updatedData);
    createIframeContent();
    loadGoogleMapsScript();
  }, []);

  const rowExpansionTemplate = (data) => {
    return (
      <div>
        {data.datata.sub_name.map((sub, index) => {
          const subStatus = data.datata.sub_status[index];
          if (subStatus !== "") {
            return (
              <div
                key={index}
                className="flex items-center justify-between border-b border-gray-200"
              >
                <div className="text-sm ml-12  text-black">{sub}</div>
                <div>
                  <img
                    src={subStatus === "0" ? Lightgreen : Lightred}
                    alt="sub status"
                    className="h-6 ml-10 inline"
                  />
                </div>
                <div>
                  <a href="">
                    <img src={Eyes} className="h-9 mr-11 inline" alt="eyes" />
                  </a>
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>
    );
  };

  const quantityBodyTemplate = (rowData) => {
    const hasValue = rowData.quantity !== "" && rowData.quantity !== "0";
    const isExpanded = expandedRows[rowData.id];

    if (!isExpanded) {
      return null;
    }

    return (
      <div
        className={`flex items-center justify-center w-5 h-5  mx-7 text-base rounded-full ${
          hasValue ? "border-2 border-red-500" : ""
        }`}
      >
        {hasValue ? rowData.quantity : ""}
      </div>
    );
  };

  const onRowToggle = (event) => {
    setExpandedRows(event.data);
    setShowQuantityColumn(Object.keys(event.data).length > 0);
  };

  return (
    <div className="grid lg:grid-cols-4 gap-5 mx-auto">
      <div className="lg:col-span-3">
        <div
          id="map"
          className="h-[54rem] w-full border-gray-400 rounded-xl"
        ></div>
      </div>
      <div>
        <div className="h-[14rem]">
          {iframeContent && (
            <iframe
              srcDoc={iframeContent}
              width="100%"
              height="90%"
              className="border border-black rounded-xl"
            />
          )}
        </div>
        <div className="overflow-hidden">
          <DataTable
            value={data}
            dataKey="id"
            expandedRows={expandedRows}
            onRowToggle={onRowToggle}
            rowExpansionTemplate={rowExpansionTemplate}
            className="h-[35.2rem] custom-row-height custom-cell-padding overflow-auto"
          >
            <Column
              header="ชื่อแยก"
              className="lg:text-[1.1rem] text-black"
              field="name"
            />
            <Column
              field="status"
              body={(rowData) => (
                <img
                  src={rowData.status === "0" ? Lightgreen : Lightred}
                  alt="status"
                  className="h-7 ml-5"
                />
              )}
              header="สถานะ"
            />
            {showQuantityColumn && (
              <Column
                header="จำนวน"
                field="quantity"
                body={quantityBodyTemplate}
              />
            )}
            <Column expander header="View" />
          </DataTable>
          <div className=" justify-center flex-wrap ">
            <div className="flex justify-center">
              <div className="w-24 h-1.5 mt-3  bg-[#24FF00] " />
              <div className="text-lg ml-5 ">การจราจรคล่องตัว</div>
            </div>
            <div className="flex justify-center mr-1.5">
              <div className="w-24 h-1.5 mt-3 bg-[#DBFF00]" />
              <div className="text-lg ml-5">การจราจรชะลอตัว</div>
            </div>
            <div className="flex justify-center mr-[1.2rem]">
              <div className="w-24 h-1.5 mt-3 bg-[#FD3B3B] " />
              <div className="text-lg ml-5 mb-10">การจราจรติดขัด</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default View;
