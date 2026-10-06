import React, { useState, useEffect } from "react";
import "./smart.css";
import { Calendar } from "primereact/calendar";

export default function Cctv() {
  const [date, setDate] = useState(null);
  return (
    <div>
      <div className="grid lg:grid-cols-5 gap-5 mx-auto ">
        <main className="lg:col-span-4">
          <div className="grid grid-cols-2 gap-4 ">
            {[1, 2, 3, 4].map((item, index) => (
              <div
                key={index}
                className="bg-white p-1 border-[3px] border-gray-200 rounded shadow"
              >
                <div className="text-lg bg-gray-200 font-semibold mb-2">
                  <p className="p-1 pl-5">
                    CCTV-{item.toString().padStart(3, "0")}
                  </p>
                </div>
                <div className="relative">
                  <div className="absolute top-3 left-3 w-12 h-12 border-l-[7px] border-t-[7px] border-gray-200"></div>
                  <div className="absolute bottom-3 right-3 w-12 h-12 border-b-[7px] border-r-[7px] border-gray-200"></div>
                  <div className="bg-transparent  h-[20rem] flex items-center justify-center">
                    <p className="text-4xl text-sky-500 opacity-40">รูปภาพ</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
        <div>
          <div className="bg-gray-200 mt-2 h-[6rem]"></div>
          <div className="bg-gray-200 mt-2 h-[6rem]"></div>
          <div className="bg-gray-200 mt-2 h-[6rem]"></div>
          <div className="bg-gray-200 mt-2 h-[6rem]"></div>
          <div className="card mt-6 h-[22rem]  flex justify-content-center">
            <Calendar
              value={date}
              onChange={(e) => setDate(e.value)}
              inline
              showWeek
              className="custom-calendar"
            />
          </div>
        </div>
      </div>
      <div className="max-w-screen-2xl  bg-white mx-auto text-4xl mt-2 font-bold whitespace-nowrap text-center">
        <p className="drop-shadow-xl">
          {" "}
          ข้อมูลสัญญาณไฟจราจร ในเขตพื้นที่เทศบาลนครราชสีมา
        </p>
      </div>
    </div>
  );
}
