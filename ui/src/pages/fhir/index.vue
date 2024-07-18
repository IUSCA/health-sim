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

const count = ref(0);
const pageOptions = [1, 5, 10, 25, 50, 100];

const pages = computed(() =>
  Math.floor(count.value / options.value.numPerPage),
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
  const fields = (await fhirService.getFields(display.value)).data;

  const results = await fhirService.getAll({
    fields: fields,
    resourceType: display.value,
    options: options.value,
  });

  participants.value = results.data.data;
  count.value = results.data.count;
};

const selectPatient = (id) => {
  console.log(id);
  router.push(`/fhir/patient/${id}`);
};

const options = ref({
  sortBy: "NONE",
  sortingOrder: "asc",
  numPerPage: 10,
  page: 1,
});

watch(
  () => [
    options.value.sortBy,
    options.value.sortingOrder,
    options.value.numPerPage,
    options.value.page,
  ],
  () => {
    console.log("sorting...");
    getData();
  },
  { deep: true },
);
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
    <div class="mt-2 flex flex-row content-end">
      <va-select
        class="w-2 w-full rounded"
        v-model="options.numPerPage"
        :options="pageOptions"
        label="Number Per Page"
      />
      <b class="pt-2 ml-2">Total: {{ count }}</b>
      <va-pagination input v-model="options.page" :pages="pages" />
    </div>
  </div>
</template>
