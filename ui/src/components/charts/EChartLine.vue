<script setup>
import { LineChart } from "echarts/charts";
import {
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
} from "echarts/components";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import VChart from "vue-echarts";

use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  ToolboxComponent,
  GridComponent,
  LineChart,
  CanvasRenderer,
  DataZoomComponent,
]);

use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  ToolboxComponent,
  DataZoomComponent,
]);

const { labels, title, chartData } = defineProps({
  labels: Array,
  title: String,
  chartData: Array,
});

const chartOptions = ref({
  title: {
    text: title,
  },
  tooltip: {
    trigger: "axis",
  },

  toolbox: {
    feature: {
      saveAsImage: {},
    },
  },
  grid: {
    left: "3%",
    right: "4%",
    bottom: "3%",
    containLabel: true,
  },
  xAxis: {
    type: "category",
    boundaryGap: false,
    data: labels,
    axisLabel: {
      formatter: function (value) {
        return value;
      },
    },
  },
  yAxis: {
    type: "value",
  },
  series: [
    {
      name: "Data",
      type: "line",
      areaStyle: {},
      data: chartData.map((item) => ({
        name: item.name,
        value: [item.name, item.value[1]],
      })),
    },
  ],
});
</script>

<template>
  <div class="h-48">
    <VChart class="chart" autoresize :option="chartOptions" />
  </div>
</template>
