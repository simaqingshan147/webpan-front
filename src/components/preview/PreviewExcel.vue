<template>
    <div v-html="excelContent" class="table-info"></div>
</template>

<script setup>
import * as XLSX from 'xlsx';
import {ref, onMounted, inject } from 'vue';

const Request = inject('$request');

const props = defineProps({
    url: {
        type: String
    }
});

const excelContent = ref();
const initExcel = async () => {
    let result = await Request({
        url: props.url,
        responseType: "arraybuffer"
    });
    if(!result) {
        return;
    }
    let workbook = XLSX.read(new Uint8Array(result),{
        type: "array"
    });
    let worksheet = workbook.Sheets[workbook.SheetNames[0]];
    excelContent.value = XLSX.utils.sheet_to_html(worksheet);
}

onMounted(() => {
    initExcel();
})
</script>

<style lang="scss" scoped>
.table-info {
  width: 100%;
  padding: 10px;
  :deep(table) {
    width: 100%;
    border-collapse: collapse;
    td {
      border: 1px solid #ddd;
      border-collapse: collapse;
      padding: 5px;
      height: 30px;
      min-width: 50px;
    }
  }
}
</style>