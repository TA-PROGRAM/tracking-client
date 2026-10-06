import { BaseFetch } from "../main-model"
export default class PermissionModel extends BaseFetch {
    getPermissionBy = (data) =>
    this.authFetch({
      url: "permission/getPermissionBy",
      method: "POST",
      body: JSON.stringify(data),
    })
    getPermissionByid = (data) =>
    this.authFetch({
      url: "permission/getPermissionByid",
      method: "POST",
      body: JSON.stringify(data),
    })
    updatePermissionById = (data) =>
    this.authFetch({
      url: "permission/updatePermissionById",
      method: "POST",
      body: JSON.stringify(data),
    })
    insertPermission = (data) =>
    this.authFetch({
      url: "permission/insertPermission",
      method: "POST",
      body: JSON.stringify(data),
    })
    deletePermissionById = (data) =>
    this.authFetch({
      url: "permission/deletePermissionById",
      method: "POST",
      body: JSON.stringify(data),
    })
}
