import { checkTranslate } from "./translater";

const language = localStorage.getItem("language") || "th"
const translate = checkTranslate.check[language];

export function checkSubmit(data, toast) {
  for (let i = 0; i < data.length; i++) {
    const item = data[i]
    if (item.name == "" || item.name == undefined) {
      toast.current.show({ severity: "warn", summary: translate.chkSumary, detail: `${translate.chkDetail} ${item.detail}` })
      return false
    }
  }
  return true
}
