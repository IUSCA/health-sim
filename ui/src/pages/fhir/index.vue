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

const calculateAge = (birthDate) => {
  if (birthDate === undefined) return "";
  const dob = new Date(birthDate);
  const diff_ms = Date.now() - dob.getTime();
  const age_dt = new Date(diff_ms);
  return Math.abs(age_dt.getUTCFullYear() - 1970);
};

const capitalizeFirstLetter = (string) => {
  if (string === undefined) return "";
  const firstLetter = string.length > 0 ? string[0] : "";
  return firstLetter.toUpperCase();
};

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
  sortBy: "name",
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
    console.log("updating...");
    getData();
  },
  { deep: true },
);

const sortBy = (col) => {
  console.log("sorting...");
  options.value.sortBy = col;
  options.value.sortingOrder =
    options.value.sortingOrder === "asc" ? "desc" : "asc";
};
</script>

<template>
  <div class="va-table-responsive">
    <table class="va-table w-full va-table--striped">
      <thead>
        <tr>
          <th>
            <button class="text-base" @click="sortBy('name')">
              Name &nbsp;<i-mdi-arrow-up
                v-if="
                  options.sortBy === 'name' && options.sortingOrder === 'asc'
                "
              />
              <i-mdi-arrow-down
                v-if="
                  options.sortBy === 'name' && options.sortingOrder === 'desc'
                "
              />
            </button>
          </th>

          <th>
            <button class="text-base" @click="sortBy('gender')">
              Gender &nbsp;<i-mdi-arrow-up
                v-if="
                  options.sortBy === 'gender' && options.sortingOrder === 'asc'
                "
              />
              <i-mdi-arrow-down
                v-if="
                  options.sortBy === 'gender' && options.sortingOrder === 'desc'
                "
              />
            </button>
          </th>
          <th>
            <button class="text-base" @click="sortBy('ethnicity')">
              Ethnicity &nbsp;<i-mdi-arrow-up
                v-if="
                  options.sortBy === 'ethnicity' &&
                  options.sortingOrder === 'asc'
                "
              />
              <i-mdi-arrow-down
                v-if="
                  options.sortBy === 'ethnicity' &&
                  options.sortingOrder === 'desc'
                "
              />
            </button>
          </th>
          <th>
            <button class="text-base" @click="sortBy('race')">
              Race &nbsp;<i-mdi-arrow-up
                v-if="
                  options.sortBy === 'race' && options.sortingOrder === 'asc'
                "
              />
              <i-mdi-arrow-down
                v-if="
                  options.sortBy === 'race' && options.sortingOrder === 'desc'
                "
              />
            </button>
          </th>
          <th>
            <button class="text-base" @click="sortBy('age')">
              Age &nbsp;<i-mdi-arrow-up
                v-if="
                  options.sortBy === 'age' && options.sortingOrder === 'asc'
                "
              />
              <i-mdi-arrow-down
                v-if="
                  options.sortBy === 'age' && options.sortingOrder === 'desc'
                "
              />
            </button>
          </th>
          <th><button class="text-base" disabled>Actions</button></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="patient in participants" :key="patient.id">
          <td>{{ patient["name"] }}</td>
          <td>{{ capitalizeFirstLetter(patient["gender"]) }}</td>
          <td>{{ patient["ethnicity"] }}</td>
          <td>{{ patient["race"] }}</td>

          <td>{{ calculateAge(patient["birthDate"]) }}</td>
          <td>
            <va-button
              preset="secondary"
              border-color="primary"
              @click="selectPatient(patient['id'])"
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
