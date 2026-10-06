import { BaseFetch } from "../main-model";
export default class UploadModel extends BaseFetch {
  insertUpload = (data) =>
    this.authUpload({
      url: "upload/insertUpload",
      method: "POST",
      body: data,
    })
    deleteUploadVdo = (data) =>
    this.authUpload({
      url: "upload/deleteUploadVdo",
      method: "POST",
      body: data,
    })
  getUpload = (data) =>
    this.authParamsUpload({
      url: "upload/getUpload",
      method: "POST",
      body: data,
      redirect: "follow",
    });
  deleteUpload = (data) =>
    this.authDeleteUpload({
      url: "upload/deleteUpload",
      method: "POST",
      body: data,
      redirect: "follow",
    });
}

