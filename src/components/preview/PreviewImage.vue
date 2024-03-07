<template>
    <div class="image-viewer">
        <el-image-viewer
            v-if="preivewImgIndex !== null"
            :initial-index="preivewImgIndex"
            hide-on-click-modal
            :url-list="imageList"
            @close="closeImgViewer"
        >
        </el-image-viewer>
    </div>
</template>

<script setup>
import {ref} from 'vue';

/**暴露给外界的属性:imageList */
defineProps({
    imageList:{
        type: Array
    }
});

const preivewImgIndex = ref(null);

/**禁止滚动 */
const stopScroll = () => {
    document.body.style.overflow = "hidden";
};

const startScroll = () => {
    document.body.style.overflow = "auto";
};

/**暴露给外界的事件:show */
const show = (index) => {
    stopScroll();
    preivewImgIndex.value = index;
};

const closeImgViewer = () => {
    startScroll();
    preivewImgIndex.value = null;
};
</script>

<style lang="scss" scoped>
.image-viewer {
  .el-image-viewer__mask {
    opacity: 0.7;
  }
}
</style>