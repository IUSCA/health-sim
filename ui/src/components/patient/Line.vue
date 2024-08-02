<script setup>
import { BarChart, LineChart } from "echarts/charts";
import {
  DataZoomComponent,
  GridComponent,
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
} from "echarts/components";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import VChart from "vue-echarts";

use([
  TooltipComponent,
  TitleComponent,
  ToolboxComponent,
  GridComponent,
  DataZoomComponent,
  LineChart,
  BarChart,
  CanvasRenderer,
]);

/*
This comoponent expect the data to be in the following format:
{
  dateRange: [date1, date2, ...],
  dataRange: [data1, data2, ...],
  title: "Title",
  label: "Label",
}
*/

const { dateRange, dataRange, title, label } = defineProps({
  dateRange: Array,
  dataRange: Array,
  title: String,
  label: String,
});

// highest and lowest data points
// const dataRange = computed(() => [
//   Math.min(...chartData),
//   Math.max(...chartData),
// ]);

const dates = computed(() => {
  return dateRange.map((date) => new Date(date).toLocaleDateString());
});

const data = dataRange;

const chartOptions = ref({
  tooltip: {
    trigger: "axis",
    position: function (pt) {
      return [pt[0], "100%"];
    },
  },

  xAxis: {
    type: "category",
    data: dates,
  },
  yAxis: {
    type: "value",
  },
  series: [
    {
      name: label,
      type: "bar",
      symbol: "none",

      itemStyle: {},
      areaStyle: {},
      data: data,
    },
  ],
});

if (dataRange && dataRange.length > 10) {
  chartOptions.value.dataZoom = [
    {
      type: "inside",
      start: 65,
      end: 100,
    },
    {
      start: 0,
      end: 10,
    },
  ];
}
</script>

<template>
  <div
    v-if="parseInt(dataRange[0]) !== NaN || dataRange[0] !== null"
    class="h-48"
  >
    <div v-if="dataRange.length === 1 && parseInt(dataRange[0]) !== NaN">
      <p class="text-center text-2xl font-bold">{{ title }}</p>
      <p class="text-center text-2xl">
        {{ dataRange[0] }} <b>{{ label }}</b>
      </p>
      <p class="text-center">{{ new Date(dates[0]).toLocaleDateString() }}</p>
    </div>
    <div v-else class="h-48">
      <p class="text-center text-2xl font-bold">{{ title }}</p>
      <VChart class="chart" autoresize :option="chartOptions" />
    </div>
  </div>
</template>
