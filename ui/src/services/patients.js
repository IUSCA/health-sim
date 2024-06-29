import { useAuthStore } from "@/stores/auth";
import api from "./api";



class PatientService {
  getAll() {
    console.log("Getting all patients")
    return api.get("/patients/all")
  }

}

export default new PatientService();