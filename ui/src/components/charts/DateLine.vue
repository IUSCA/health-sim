<script setup>
import { LineChart } from "echarts/charts";
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
  title: {
    left: "center",
    text: title,
  },

  xAxis: {
    type: "category",
    boundaryGap: false,
    data: dates,
  },
  yAxis: {
    type: "value",
  },
  series: [
    {
      name: label,
      type: "line",
      symbol: "none",
      sampling: "lttb",
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
  <div class="h-48">
    <VChart class="chart" autoresize :option="chartOptions" />
  </div>
</template>
