import { BaseFetch } from "../main-model";
export default class HistoryOfflineModel extends BaseFetch {
  getHistoryOfflineBy = (data) =>
    this.authFetch({
      url: "history-offline/getHistoryOfflineBy",
      method: "POST",
      body: JSON.stringify(data),
    });
}
