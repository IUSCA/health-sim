<script setup>
import { CustomChart } from "echarts/charts";
import {
  DataZoomComponent,
  GridComponent,
  TitleComponent,
  TooltipComponent,
} from "echarts/components";
import { graphic, use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { default as VChart } from "vue-echarts";

use([
  TooltipComponent,
  TitleComponent,
  DataZoomComponent,
  GridComponent,
  CustomChart,
  CanvasRenderer,
]);

const { overview, birthDate } = defineProps({
  overview: Array,
  birthDate: String,
});

// var data = [
//   {
//     name: "Listeners",
//     value: [0, 1721228090275, 1721228091517, 1242],
//     itemStyle: {
//       normal: {
//         color: "#e0bc78",
//       },
//     },
//   },
// ];

var startTime = +new Date();
const colors = ref(["#7b9ce1", "#bd6d6c", "#75d874", "#e0bc78"]);

// // Generate mock data
// categories.value.forEach(function (category, index) {
//   var baseTime = startTime;
//   for (var i = 0; i < dataCount; i++) {
//     var typeItem = types[Math.round(Math.random() * (types.length - 1))];
//     var duration = Math.round(Math.random() * 10000);
//     data.push({
//       name: typeItem.name,
//       value: [index, baseTime, (baseTime += duration), duration],
//       itemStyle: {
//         normal: {
//           color: categories.value[index].color,
//         },
//       },
//     });
//     baseTime += Math.round(Math.random() * 2000);
//   }
// });

const categories = computed(() => {
  return Object.keys(overview).map(
    (category) => category[0].toLocaleUpperCase() + category.slice(1),
  );
});

const data = computed(() => {
  let arr = [];
  console.log(overview);
  let x = 0;
  for (const category of Object.keys(overview)) {
    for (const categoryData of overview[category]) {
      console.log(category, categoryData);
      const endDate =
        "endDate" in categoryData
          ? categoryData.endDate
          : categoryData.startDate;
      arr.push({
        name: categoryData.label,
        value: [
          x,
          new Date(categoryData.startDate),
          new Date(endDate),
          new Date(categoryData.startTime) - new Date(endDate),
        ],
        itemStyle: {
          normal: {
            color: colors.value[x],
          },
        },
      });
    }
    x = x + 1;
  }

  return arr;
});

console.log("DATA", data);

function renderItem(params, api) {
  var categoryIndex = api.value(0);
  var start = api.coord([api.value(1), categoryIndex]);
  var end = api.coord([api.value(2), categoryIndex]);
  var height = api.size([0, 1])[1] * 0.6;
  var rectShape = graphic.clipRectByRect(
    {
      x: start[0],
      y: start[1] - height / 2,
      width: end[0] - start[0],
      height: height,
    },
    {
      x: params.coordSys.x,
      y: params.coordSys.y,
      width: params.coordSys.width,
      height: params.coordSys.height,
    },
  );
  return (
    rectShape && {
      type: "rect",
      transition: ["shape"],
      shape: rectShape,
      style: api.style(),
    }
  );
}
const chartOptions = ref({
  tooltip: {
    formatter: function (params) {
      return params.marker + params.name + ": " + params.value[3] + " ms";
    },
  },

  dataZoom: [
    {
      type: "slider",
      filterMode: "weakFilter",
      showDataShadow: false,
      top: 400,
      labelFormatter: "",
    },
    {
      type: "inside",
      filterMode: "weakFilter",
    },
  ],
  grid: {
    height: 300,
  },
  xAxis: {
    min: new Date(birthDate).getTime(),
    max: startTime,
    scale: true,
    axisLabel: {
      formatter: function (val) {
        return new Date(val).toLocaleDateString();
      },
    },
  },
  yAxis: {
    data: categories,
  },
  series: [
    {
      type: "custom",
      renderItem: renderItem,
      itemStyle: {
        opacity: 0.8,
      },
      encode: {
        x: [1, 2],
        y: 0,
      },
      data: data,
    },
  ],
});
</script>

<template>
  <div class="h-[1200px]">
    <p class="text-center text-2xl font-bold">Timeline</p>
    <VChart class="chart" autoresize :option="chartOptions" />
  </div>
</template>
