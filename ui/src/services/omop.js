import api from "./api";

class OmopService {
  getAll({ currentPage, itemsPerPage, sortBy, sortingOrder }) {
    return api.post("/omop/persons", {
      currentPage,
      itemsPerPage,
      sortBy,
      sortingOrder,
    });
  }

  getDetails(id) {
    return api.get(`/omop/persons/${id}`);
  }

  getOverview(id) {
    return api.get(`/omop/persons/${id}/overview`);
  }

  getCategoryDetails({ id, category, view }) {
    return api.get(`/omop/persons/${id}/${category}/${view}`);
  }
}

export default new OmopService();
