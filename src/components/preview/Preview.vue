<template>
    <PreviewImage
        v-if="fileInfo.fileType === FILE_TYPE['image'].type"
        ref="imageViewRef"
        :imageList="[imageUrl]"
    >
    </PreviewImage>
</template>

<script setup>
import { inject,ref,reactive } from 'vue';
import PreviewImage from './PreviewImage.vue';
const Utils = inject("$utils");
const FILE_TYPE = Utils.FILE_TYPE;
</script>

<style lang="scss" scoped>
</style>