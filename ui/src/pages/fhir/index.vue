<script setup>
import fhirService from "@/services/fhir";

import { useNavStore } from "@/stores/nav";
import { useRouter } from "vue-router";

const router = useRouter();
const nav = useNavStore();

nav.setNavItems([], true);

nav.setNavItems([
  {
    label: `FHIR Patients`,
  },
]);

const participants = ref([]);
const categories = ref([]);
const display = ref("Patients");

onMounted(async () => {
  try {
    categories.value = (await fhirService.getCategories()).data;
    await getData();
  } catch (err) {
    console.error(err);
  }
});

const getData = async () => {
  // Refresh Fields
  const fields = (await fhirService.getFields(display.value)).data;

  const results = await fhirService.getAll({
    fields: fields,
    resourceType: display.value,
    options: {
      search: "",
      sortBy: "NONE",
      sortingOrder: "asc",
      page: 1,
      numPerPage: 10,
    },
  });

  participants.value = results.data.data;
};

const selectPatient = (id) => {
  console.log(id);
  router.push(`/fhir/patient/${id}`);
};
</script>

<template>
  <div class="va-table-responsive">
    <table class="va-table w-full">
      <thead>
        <tr>
          <th>Name</th>
          <th>Address</th>
          <th>Telecom</th>
          <th>Gender</th>
          <th>Birthdate</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="patient in participants" :key="patient.id">
          <td>{{ patient["name"][0] }}</td>
          <td>{{ patient["address"][0] }}</td>
          <td>{{ patient["telecom"][0] }}</td>
          <td>{{ patient["gender"][0] }}</td>
          <td>{{ patient["birthDate"][0] }}</td>
          <td>
            <va-button @click="selectPatient(patient['id'][0])"
              ><i-clarity:details-line /> Details</va-button
            >
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
