import { addLocale, locale, updateLocaleOptions  } from "primereact/api";

const dateFormat = {
  toDate: (date, instead = '') => _validateDate(date) ? new Date(date) : instead,
  toFormat: (value, ftxt, instead = '') => {
    const date = _validateDate(value)

    if (date && ftxt) {
      if (ftxt.search("MName")) ftxt = ftxt.replace("MName", monthNames[+date.format('MM') - 1])

      return date.format(ftxt)
    } else {
      return instead
    }
  },
  showDateTimeTH: (date) => {

    if (date && moment(date).isValid()) {
      const day = moment.utc(date).tz("Asia/Bangkok").format('DD')
      const month = moment.utc(date).tz("Asia/Bangkok").format('MM')
      const year = moment.utc(date).tz("Asia/Bangkok").format('YYYY')
      const time = moment.utc(date).tz("Asia/Bangkok").format('HH:mm')

      return `${day}/${month}/${year} ${time}`
    } else {
      return ''
    }

  },
}

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
  today: "เดือนนี้",
  // today: "วันนี้",
  clear: "ล้าง",
  dateFormat: "dd/mm/yy",
});

export default dateFormat