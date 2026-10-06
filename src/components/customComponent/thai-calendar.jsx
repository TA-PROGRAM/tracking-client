import { addLocale, locale, } from "primereact/api";

const ThaiCanlendar = () => {
    addLocale("th", {
        firstDayOfWeek: 0,
        dayNames: [
          "อาทิตย์",
          "จันทร์",
          "อังคาร",
          "พุธ",
          "พฤหัสบดี",
          "ศุกร์",
          "เสาร์",
        ],
        dayNamesShort: ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"],
        dayNamesMin: ["อ", "จ", "อ", "พ", "พฤ", "ศ", "ส"],
        monthNames: [
          "มกราคม",
          "กุมภาพันธ์",
          "มีนาคม",
          "เมษายน",
          "พฤษภาคม",
          "มิถุนายน",
          "กรกฎาคม",
          "สิงหาคม",
          "กันยายน",
          "ตุลาคม",
          "พฤศจิกายน",
          "ธันวาคม",
        ],
        monthNamesShort: [
          "ม.ค.",
          "ก.พ.",
          "มี.ค.",
          "เม.ย.",
          "พ.ค.",
          "มิ.ย.",
          "ก.ค.",
          "ส.ค.",
          "ก.ย.",
          "ต.ค.",
          "พ.ย.",
          "ธ.ค.",
        ],
        // today: "เดือนนี้",
        today: "วันนี้",
        clear: "ล้าง",
        dateFormat: "dd/mm/yy",
      });
    return (
        locale("th")
        
    );
  }
  
  export default ThaiCanlendar