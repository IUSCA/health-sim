import api from "./api";

class OmopService {
  getAll() {
    return api.get("/omop/persons");
  }

  getDetails(id) {
    return api.get(`/omop/persons/${id}`);
  }

  getOverview(id) {
    return api.get(`/omop/persons/${id}/overview`);
  }
}

export default new OmopService();
