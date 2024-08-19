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

  getCategoryDetails({ id, category, view, dateRange }) {
    return api.post(`/omop/persons/${id}/${category}/${view}`, dateRange);
  }
}

export default new OmopService();
