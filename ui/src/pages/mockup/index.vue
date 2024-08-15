<script setup>
import Line from "@/components/charts/echarts/Line.vue";
import Pie from "@/components/charts/echarts/Pie.vue";

const data = ref([
  { value: 1048, name: "Search Engine" },
  { value: 735, name: "Direct" },
  { value: 580, name: "Email" },
  { value: 484, name: "Union Ads" },
  { value: 300, name: "Video Ads" },
]);

const xdata = ref(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
const ydata = ref([820, 932, 901, 934, 1290, 1330, 1320]);
</script>

<template>
  <div>
    <VaCard class="m-2">
      <VaCardContent>
        <Pie title="test" :data="data" />
      </VaCardContent>
    </VaCard>
    <VaCard class="m-2">
      <VaCardContent>
        <Line title="test" :x-data="xdata" :y-data="ydata" />
      </VaCardContent>
    </VaCard>
  </div>
</template>
