<script setup>
import Line from "@/components/patient/Line.vue";
import Timeline from "@/components/patient/Timeline.vue";
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
const data = ref({});

const category = ref("Overview");
const categories = ref([
  "Overview",
  "Medications",
  "Procedures",
  "Vitals",
  "Conditions",
]);

const views = ref(["Graph", "Data"]);
const view = ref("Graph");

const getData = async () => {
  data.value = {};

  data.value = (
    await omopService.getCategoryDetails({ id, category: category.value })
  ).data;
  console.log(data.value);
};

onMounted(async () => {
  try {
    const detailData = (await omopService.getDetails(id)).data;
    details.value = detailData;

    await getData();
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

watch(
  () => category.value,
  () => {
    getData();
  },
  { deep: true },
);
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

    <div v-if="category === 'Overview' || category === 'Medications'">
      <Timeline
        :overview="data"
        :birth-date="details.birth_datetime"
        v-if="Object.keys(data).length > 0"
      />
      <VaInnerLoading loading :size="60" v-else />
    </div>
    <div v-else>
      <div class="grid grid-cols-3" v-if="Object.keys(data).length > 0">
        <div v-for="chart in Object.keys(data)" :key="chart">
          <VaCard class="m-2">
            <VaCardContent>
              <Line
                :title="chart"
                :date-range="data[chart].date"
                :data-range="data[chart].value"
                :label="data[chart].unit"
              />
            </VaCardContent>
          </VaCard>
        </div>
      </div>
      <div v-else class="mt-12">
        <VaInnerLoading loading :size="60" />
      </div>
    </div>
  </div>
</template>

<style>
.line-chart-container {
  width: 100%;
}
</style>
