<template>
    <PreviewImage
        v-if="document.type === FILE_TYPE['image'].type"
        ref="imageViewRef"
        :imageList="[imageUrl]"
    >
    </PreviewImage>
    <Window
        v-else
        :show="windowShow"
        :width="900"
        :title="document.name"
        :align="document.type === FILE_TYPE['video'].type ? 'center' : 'top'"
        @close="closeWindow"
    >
        <PreviewVideo v-if="document.type === FILE_TYPE['video'].type" :url="url"></PreviewVideo>
        <PreviewExcel v-if="document.type === FILE_TYPE['excel'].type" :url="url"></PreviewExcel>
        <PreviewDoc v-if="document.type === FILE_TYPE['word'].type" :url="url"></PreviewDoc>
        <PreviewPdf v-if="document.type === FILE_TYPE['pdf'].type" :url="url"></PreviewPdf>
        <PreviewTxt 
            v-if="document.type === FILE_TYPE['txt'].type || document.type === FILE_TYPE['program'].type"
            :url="url"
            :fileName="document.name"
        >
        </PreviewTxt>
        <PreviewMusic
            v-if="document.type === FILE_TYPE['music'].type"
            :url="url"
            :fileName="document.name"
        >
        </PreviewMusic>
        <PreviewDownload
            v-if="document.type === FILE_TYPE['zip'].type || document.type === FILE_TYPE['others'].type"
            :createDownloadUrl="createDownloadUrl"
            :downloadUrl="downloadUrl"
            :fileInfo="document"
        >
        </PreviewDownload>
    </Window>
</template>

<script setup>
import { inject,ref, computed, nextTick } from 'vue';
import PreviewImage from './PreviewImage.vue';
import PreviewVideo from './PreviewVideo.vue';
import PreviewExcel from './PreviewExcel.vue';
import PreviewDoc from './PreviewDoc.vue';
import PreviewPdf from './PreviewPdf.vue';
import PreviewMusic from './PreviewMusic.vue';
import PreviewTxt from './PreviewTxt.vue';
import PreviewDownload from './PreviewDownload.vue';
const Utils = inject("$utils");
const globalInfo = inject('globalInfo');
const FILE_TYPE = Utils.FILE_TYPE;

const FILE_URL_MAP = {
  0: {
    fileUrl: "/file/getFile",
    videoUrl: "/file/getVideoInfo",
    createDownloadUrl: "/file/createDownloadUrl",
    downloadUrl: "/file/download",
  },
  1: {
    fileUrl: "/admin/getFile",
    videoUrl: "/admin/getVideoInfo",
    createDownloadUrl: "/admin/createDownloadUrl",
    downloadUrl: "/admin/download",
  },
  2: {
    fileUrl: "/showShare/getFile",
    videoUrl: "/showShare/getVideoInfo",
    createDownloadUrl: "/showShare/createDownloadUrl",
    downloadUrl: "/showShare/download",
  },
};

/**文件信息 */
const document = ref({});
/**文件url */
const url = ref(null);
/**创建分享文件url */
const createDownloadUrl = ref(null);
/**文件下载url */
const downloadUrl = ref(null);

const imageViewRef = ref();

/**图片文件或文件封面url*/
const imageUrl = computed(() => {
    return (
        globalInfo.imageUrl + document.value.cover.replaceAll('_.','.')
    );
});

/**window组件是否显示 */
let windowShow = ref(false);

const closeWindow = () => {
    windowShow.value = false;
};

const showPreview = (data, showPart) => {
    document.value = data;
    if(data.type === FILE_TYPE['image'].type) {
        nextTick(() => {
            imageViewRef.value.show(0);
        })
    } else {
        windowShow.value = true;
        let _url = FILE_URL_MAP[showPart].fileUrl;
        // 视频地址单独处理
        if(data.type === FILE_TYPE['video'].type) {
            _url = FILE_URL_MAP[showPart].videoUrl;
        }

        let _createDownloadUrl = FILE_URL_MAP[showPart].createDownloadUrl;
        let _downloadUrl = FILE_URL_MAP[showPart].downloadUrl;

        if(showPart === 0) {
            _url = _url + "/" + data.id;
            _createDownloadUrl = _createDownloadUrl + "/" + data.id;
        } else if(showPart === 1) {
            _url = _url + "/" + data.userId + "/" + data.id;
            _createDownloadUrl =  _createDownloadUrl + "/" + data.userId + "/" + data.id;
        } else if(showPart === 2) {
            _url = _url + "/" + data.shareId + "/" + data.id;
            _createDownloadUrl = _createDownloadUrl + "/" + data.shareId + "/" + data.id;
        }
        url.value = _url;
        console.log(url.value);
        createDownloadUrl.value = _createDownloadUrl;
        downloadUrl.value = _downloadUrl;
    }
}
defineExpose({showPreview});
</script>

<style lang="scss" scoped>
</style>