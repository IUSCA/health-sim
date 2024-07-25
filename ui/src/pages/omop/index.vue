<script setup>
import omopService from "@/services/omop";
import { useNavStore } from "@/stores/nav";
import { useRouter } from "vue-router";

const router = useRouter();
const nav = useNavStore();
const patients = ref();

nav.setNavItems([
  {
    label: `OMOP Patients`,
  },
]);

onMounted(async () => {
  const results = await omopService.getAll();
  console.log(results);
  patients.value = results.data;
});

const selectPatient = (id) => {
  router.push(`/omop/patient/${id}`);
};
</script>

<template>
  <div class="va-table-responsive">
    <table class="va-table w-full">
      <thead>
        <tr>
          <th>Person ID</th>
          <th>Gender</th>
          <th>Ethnicity</th>
          <th>Race</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="patient in patients" :key="patient.person_id">
          <td>{{ patient.person_id }}</td>
          <td>{{ patient.gender_source_value }}</td>
          <td>{{ patient.ethnicity_source_value }}</td>
          <td>{{ patient.race_source_value }}</td>
          <td>
            <va-button @click="selectPatient(patient['person_id'])"
              ><i-clarity:details-line /> Details</va-button
            >
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
