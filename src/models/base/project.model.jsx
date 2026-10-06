import { BaseFetch } from "../main-model"
export default class ProjectModel extends BaseFetch {
    getProjectBy = (data) =>
    this.authFetch({
      url: "project/getProjectBy",
      method: "POST",
      body: JSON.stringify(data),
    })
    getProjectById = (data) =>
    this.authFetch({
      url: "project/getProjectById",
      method: "POST",
      body: JSON.stringify(data),
    })
    updateProjectById = (data) =>
    this.authFetch({
      url: "project/updateProjectById",
      method: "POST",
      body: JSON.stringify(data),
    })
    insertProject = (data) =>
    this.authFetch({
      url: "project/insertProject",
      method: "POST",
      body: JSON.stringify(data),
    })
    deleteProjectById = (data) =>
    this.authFetch({
      url: "project/deleteProjectById",
      method: "POST",
      body: JSON.stringify(data),
    })
}
