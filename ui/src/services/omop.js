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

  getCategoryDetails({ id, category }) {
    return api.get(`/omop/persons/${id}/${category}`);
  }
}

export default new OmopService();
