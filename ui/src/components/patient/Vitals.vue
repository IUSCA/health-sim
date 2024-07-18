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

const { dateRange, chartData, title, label } = defineProps({
  dateRange: Array,
  chartData: Array,
  title: String,
  label: String,
});

// highest and lowest data points
// const dataRange = computed(() => [
//   Math.min(...chartData),
//   Math.max(...chartData),
// ]);

const dates = computed(() =>
  dateRange.map((d) => new Date(d).toLocaleDateString()),
);

const data = chartData;

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

if (chartData.length > 100) {
  chartOptions.value.dataZoom = [
    {
      type: "inside",
      start: 0,
      end: 10,
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
    v-if="parseInt(chartData[0]) !== NaN || chartData[0] !== null"
    class="h-48"
  >
    <div v-if="chartData.length === 1 && parseInt(chartData[0]) !== NaN">
      <p class="text-center text-2xl font-bold">{{ title }}</p>
      <p class="text-center text-2xl">
        {{ chartData[0] }} <b>{{ label }}</b>
      </p>
      <p class="text-center">{{ dates[0] }}</p>
    </div>
    <div v-else class="h-48">
      <p class="text-center text-2xl font-bold">{{ title }}</p>
      <VChart class="chart" autoresize :option="chartOptions" />
    </div>
  </div>
</template>
