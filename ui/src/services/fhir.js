import api from "./api";

class fhirService {
  // CREATE
  addItem = (data) => api.post("/fhir/", data);
  addItems = (data) => api.post("/fhir/all", data);

  // READ
  getFields = (data) => api.get(`/fhir/${data}/fields`);
  getAll = (data) => api.post(`/fhir/search/`, data);
  getOne = ({ resourceType, options }) => api.post(`/fhir/patients/${options.id}/${resourceType}`, {options: options});
  // getOne = (data) => api.post(`/fhir/search/`, data);


  // Patients
  getDetails = (data) => api.get(`/fhir/Patients/${data.id}`);

  getCategories = () => api.get(`/fhir/categories`);
  getCategoryDetails = (data) =>
    api.get(`/fhir/${data.resourceType}/${data.id}`);
}

export default new fhirService();
