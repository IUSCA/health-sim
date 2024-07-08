import api from "./api";



class OmopService {
  getAll() {

    return api.get("/omop/persons")
  }

}

export default new OmopService();