<script setup>
import fhirService from "@/services/fhir";

import { useNavStore } from "@/stores/nav";
import { useRouter } from "vue-router";

const router = useRouter();
const nav = useNavStore();


nav.setNavItems([], true);

const options = ref({
  search: "",
  sortBy: "NONE",
  sortingOrder: "asc",
  page: 1,
  numPerPage: 10,
});

const participants = ref([]);

const column_options = ref([]);
const columns = computed(() => {
  var cols = [];


  if (participants.value.length > 0)
    for (const key of Object.keys(participants.value[0])) {
      cols.push({
        key: key,
        sortable: true,
        sortingOptions: ["desc", "asc", null],
      });
    }

  return cols;
});

const categories = ref([]);
const display = ref("Patients");

const count = ref(0);
const pageOptions = [1, 5, 10, 25, 50, 100];
const participant_count = ref(0);
const pages = computed(() =>
  Math.floor(participant_count.value / options.value.numPerPage),
);

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
  column_options.value = (await fhirService.getFields(display.value)).data;

  const results = await fhirService.getAll({
    fields: column_options.value,
    resourceType: display.value,
    options: options.value,
  });

  participants.value = results.data.data;

  // set counts
  count.value = results.data.count;
  participant_count.value = results.data.count;
};



const selectPatient = (rowData) => {
  console.log(rowData);
  router.push(`/patients/${rowData.item.id}`);
};




</script>

<template>
<div class="va-table-responsive">
  <table class="va-table">
    <thead>
      <tr>
        <th>Name</th>
        <th>Address</th>
        <th>Telecom</th>
        <th>Gender</th>
        <th>Birthdate</th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="patient in participants"
        :key="patient.person_id"
      >
        <td>{{ patient.name }}</td>
        <td>{{ patient.address }}</td>
        <td>{{ patient.telecom }}</td>
        <td>{{ patient.gender }}</td>
        <td>{{ patient.birthDate }}</td>
      </tr>
    </tbody>
  </table>
</div>
</template>
