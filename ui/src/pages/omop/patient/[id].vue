<script setup>
import Overview from "@/components/patient/Overview.vue";
import omopService from "@/services/omop";
import { useNavStore } from "@/stores/nav";

const nav = useNavStore();
nav.setNavItems([], true);

const { id } = defineProps({ id: String });

nav.setNavItems([
  {
    label: `OMOP Patients`,
    to: "/omop",
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
    const detailData = (await omopService.getDetails(id)).data;
    details.value = detailData;

    overview.value = (await omopService.getOverview(id)).data;
    console.log(overview.value);
  } catch (err) {
    console.error(err);
  }
});

const age = computed(() => {
  if (details.value.birth_datetime === undefined) return "";
  const dob = new Date(details.value.birth_datetime);
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
        <div class="ml-3">
          <h1 class="text-xl font-bold">
            {{ capitalizeFirstLetter(details.gender_source_value) }}
          </h1>
          <h2 class="text-base">
            Age: {{ age }} ({{
              new Date(details.birth_datetime).toLocaleDateString()
            }})
          </h2>
        </div>
      </div>
      <div v-if="details.race_source_value">
        <h2 class="text-lg font-bold">Race</h2>
        <p>{{ details.race_source_value }}</p>
      </div>
      <div v-if="details.ethnicity_source_value">
        <h2 class="text-lg font-bold">Ethnicity</h2>
        <p>{{ details.ethnicity_source_value }}</p>
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
      <Overview :overview="overview" :birth-date="details.birth_datetime" />
    </div>
    <div v-else>
      <p class="text-center font-bold mb-2">
        {{ new Date(details.birth_datetime).toLocaleDateString() }} -
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
        <!-- <DateLine /> -->
      </div>
    </div>
  </div>
</template>

<style>
.line-chart-container {
  width: 100%;
}
</style>
