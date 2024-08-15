<script setup>
import Bar from "./Bar.vue";
import Line from "./Line.vue";
import Pie from "./Pie.vue";

/*
This component expects the data to be in the following format:
data = {
  dateRange: [date1, date2, ...],
  dataRange: [data1, data2, ...],
  title: "Title",
  label: "Label",
}

*/
const { data } = defineProps({
  data: Object,
});

const type = ref("bar");

const dates = computed(() => {
  return data.dateRange.map((date) => new Date(date).toLocaleDateString());
});

const pieData = computed(() => {
  return data.dataRange.map((value, index) => ({
    value,
    name: data.dateRange[index],
  }));
});
</script>

<template>
  <VaCard class="m-2 h-96">
    <VaCardContent>
      <VaButtonToggle
        border-color="primary"
        size="small"
        preset="secondary"
        v-model="type"
        :options="[
          { value: 'bar', icon: 'bar_chart' },
          { value: 'line', icon: 'show_chart' },
          { value: 'pie', icon: 'pie_chart' },
        ]"
      />
      <Bar
        v-if="type === 'bar'"
        :title="data.title"
        :xData="dates"
        :yData="data.dataRange"
        :label="data.label"
      />
      <Pie v-else-if="type === 'pie'" :title="data.title" :data="pieData" />
      <Line
        v-else-if="type === 'line'"
        :title="data.title"
        :x-data="dates"
        :y-data="data.dataRange"
      />
    </VaCardContent>
  </VaCard>
</template>
