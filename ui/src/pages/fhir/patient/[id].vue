<script setup>
import { stringToRGB } from "@/services/colors";
import fhirService from "@/services/fhir";
import { useNavStore } from "@/stores/nav";

import DateLine from "@/components/charts/DateLine.vue";
import { initials } from "@/services/utils";

const nav = useNavStore();
nav.setNavItems([], true);

const { id } = defineProps({ id: String });

nav.setNavItems([
  {
    label: `FHIR Patients`,
    to: "/fhir",
  },
  {
    label: `Patient ${id}`,
  },
]);

const details = ref({});
const vitals = ref({});
const overview = ref({});

onMounted(async () => {
  try {
    const detailData = (await fhirService.getDetails({ id })).data;
    details.value = parseDetails(detailData);

    vitals.value = (
      await fhirService.getCategoryDetails({ id, resourceType: "Vitals" })
    ).data;

    overview.value = (await fhirService.getOverview(id)).data;
  } catch (err) {
    console.error(err);
  }
});

const parseDetails = (d) => {
  let parsedDetails = {};
  for (const detail of Object.keys(d)) {
    parsedDetails[detail] = d[detail][0] === undefined ? "" : d[detail][0];
  }
  return parsedDetails;
};

const age = computed(() => {
  if (details.value.birthDate === undefined) return "";
  const dob = new Date(details.value.birthDate);
  const diff_ms = Date.now() - dob.getTime();
  const age_dt = new Date(diff_ms);
  return Math.abs(age_dt.getUTCFullYear() - 1970);
});

const capitalizeFirstLetter = (string) => {
  if (string === undefined) return "";
  console.log(string);
  const firstLetter = string.length > 0 ? string[0] : "";
  return firstLetter.toUpperCase();
};

const dateRange = ref([55, 100]);
const category = ref("Overview");
const categories = ref(["Overview", "Vitals", "Conditions", "Medications"]);

const views = ref(["Graph", "Data"]);
const view = ref("Graph");
</script>

<template>
  <div>
    <VaDivider orientation="center">
      <span class="px-2">Details</span>
    </VaDivider>

    <div class="flex justify-between">
      <div class="flex">
        <va-avatar
          :color="stringToRGB(details.name || '')"
          size="small"
          class="mt-3"
        >
          <span class="text-sm uppercase">{{ initials(details.name) }}</span>
        </va-avatar>
        <div class="ml-3">
          <h1 class="text-xl font-bold">
            {{ details.name }} ({{ capitalizeFirstLetter(details.gender) }})
          </h1>
          <h2 class="text-base">Age: {{ age }} ({{ details.birthDate }})</h2>
        </div>
      </div>

      <div v-if="details.address">
        <h2 class="text-lg font-bold">Address</h2>
        <p>{{ details.address }}</p>
      </div>
      <div v-if="details.telecom">
        <h2 class="text-lg font-bold">Telecom</h2>
        <p>{{ details.telecom }}</p>
      </div>
    </div>
    <VaDivider orientation="center" class="mt-6"> </VaDivider>
    <div class="flex flex-col mt-4 mb-2">
      <div class="flex justify-between">
        <VaButtonToggle
          preset="secondary"
          border-color="primary"
          v-model="category"
          :options="categories"
        />

        <VaButtonToggle
          border-color="primary"
          preset="secondary"
          v-model="view"
          :options="views"
        />
      </div>
    </div>

    <div v-if="category === 'Overview'">
      <Overview :overview="overview" :birthDate="details.birthDate" />
    </div>
    <div v-else>
      <p class="text-center font-bold mb-2">
        {{ new Date(details.birthDate).toLocaleDateString() }} -
        {{ new Date(Date.now()).toLocaleDateString() }}
      </p>
      <div class="w-full mb-4">
        <VaSlider v-model="dateRange" range :track-label="processTrackLabel" />
      </div>
      <div class="grid grid-cols-3">
        <div v-for="vital in Object.keys(vitals)" :key="vital">
          <VaCard class="m-2">
            <VaCardContent>
              <Vitals
                :title="vital"
                :date-range="vitals[vital].date"
                :chart-data="vitals[vital].value"
                :label="vitals[vital].unit"
              />
            </VaCardContent>
          </VaCard>
        </div>
        <DateLine />
      </div>
    </div>
  </div>
</template>

<style>
.line-chart-container {
  width: 100%;
}
</style>
