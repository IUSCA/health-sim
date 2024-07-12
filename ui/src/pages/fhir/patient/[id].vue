<script setup>
import fhirService from "@/services/fhir";
import { useNavStore } from "@/stores/nav";

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

onMounted(async () => {
  try {
    const detailData = (await fhirService.getDetails({ id })).data;
    details.value = parseDetails(detailData);

    vitals.value = (
      await fhirService.getCategoryDetails({ id, resourceType: "Vitals" })
    ).data;
    console.log(vitals.value);
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
</script>

<template>
  <div>
    <VaCard>
      <VaCardContent>
        <VaCollapse v-model="value">
          <template #header="{ value, attrs, iconAttrs }">
            <div
              v-bind="attrs"
              class="w-full flex border-[var(--va-background-border)] border-2 p-2 bg-[var(--va-background-element)]"
            >
              <VaIcon
                name="va-arrow-down"
                :class="value ? '' : 'rotate-[-90deg]'"
                v-bind="iconAttrs"
              />

              <div class="ml-4">
                <h1 class="text-xl font-bold">
                  {{ details.name }} ({{ details.gender }})
                </h1>
                <h2 class="text-base">
                  Age: {{ age }} ({{ details.birthDate }})
                </h2>
              </div>
            </div>
          </template>
          <template #body>
            <div
              class="p-2 border-[var(--va-background-border)] border-2 border-t-0"
            >
              <div class="flex flex-wrap">
                <div class="w-1/2">
                  <h2 class="text-lg font-bold">Address</h2>
                  <p>{{ details.address }}</p>
                </div>
                <div class="w-1/2">
                  <h2 class="text-lg font-bold">Telecom</h2>
                  <p>{{ details.telecom }}</p>
                </div>
              </div>
            </div>
          </template>
        </VaCollapse>
      </VaCardContent>
    </VaCard>
    <VaCard>
      <VaCardContent>
        <div>
          <h1 class="text-xl font-bold">Vitals</h1>
          <div v-for="vital in Object.keys(vitals)" :key="vital">
            <DateLine
              :title="vital"
              :date-range="vitals[vital].date"
              :chart-data="vitals[vital].value"
              :label="vitals[vital].unit"
            />
          </div>
          <Vitals />
        </div>
      </VaCardContent>
    </VaCard>
  </div>
</template>

<style>
.line-chart-container {
  width: 100%;
}
</style>
