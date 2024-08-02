import api from "./api";

class fhirService {
  // CREATE
  addItem = (data) => api.post("/fhir/", data);
  addItems = (data) => api.post("/fhir/all", data);

  // READ
  getFields = (data) => api.get(`/fhir/${data}/fields`);
  getAll = (data) => api.post(`/fhir/patients/`, data);
  getOne = ({ resourceType, options }) =>
    api.post(`/fhir/patients/${options.id}/${resourceType}`, {
      options: options,
    });
  // getOne = (data) => api.post(`/fhir/search/`, data);

  // Patients
  getDetails = (data) => api.get(`/fhir/Patients/${data.id}`);

  getCategories = () => api.get(`/fhir/categories`);
  getCategoryDetails = ({ id, category }) =>
    api.post(`/fhir/patients/${id}/${category}`);

  getOverview = (id) => api.get(`/fhir/patients/${id}/overview`);
}

export default new fhirService();
