import { BaseFetch } from "../main-model"
export default class AttachmentModel extends BaseFetch {
    getAttachmentBy = (data) =>
    this.authFetch({
      url: "attachment/getAttachmentBy",
      method: "POST",
      body: JSON.stringify(data),
    })
    getAttachmentById = (data) =>
    this.authFetch({
      url: "attachment/getAttachmentById",
      method: "POST",
      body: JSON.stringify(data),
    })
    getAttachmentByRefId = (data) =>
    this.authFetch({
      url: "attachment/getAttachmentByRefId",
      method: "POST",
      body: JSON.stringify(data),
    })
    updateAttachmentById = (data) =>
    this.authFetch({
      url: "attachment/updateAttachmentById",
      method: "POST",
      body: JSON.stringify(data),
    })
    updateAttachmentByRefId = (data) =>
    this.authFetch({
      url: "attachment/updateAttachmentByRefId",
      method: "POST",
      body: JSON.stringify(data),
    })
    insertAttachment = (data) =>
    this.authFetch({
      url: "attachment/insertAttachment",
      method: "POST",
      body: JSON.stringify(data),
    })
    deleteAttachmentById = (data) =>
    this.authFetch({
      url: "attachment/deleteAttachmentById",
      method: "POST",
      body: JSON.stringify(data),
    })
}
