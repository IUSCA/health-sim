<script setup>
import patientService from "@/services/patients";

const patients = ref();

onMounted(async () => {
  const results = await patientService.getAll()
  console.log(results)
  patients.value = results.data

  
});


</script>

<template>
  <div>
    <el-table
      :data="patients"
      style="width: 100%"
      stripe
      border
      fit
      highlight-current-row
      ></el-table>


  </div>
</template>


