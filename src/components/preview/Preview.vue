<template>
    <PreviewImage
        v-if="fileInfo.fileType === FILE_TYPE['image'].type"
        ref="imageViewRef"
        :imageList="[imageUrl]"
    >
    </PreviewImage>
    <Window
        v-else
        :show="windowShow"
        :width="fileInfo.fileType === FILE_TYPE['video'].type ? 1500 : 900"
        :title="fileInfo.fileName"
        :align="fileInfo.fileType === FILE_TYPE['video'].type ? 'center' : 'top'"
        @close="closeWindow"
    >
        <PreviewVideo v-if="fileInfo.fileType === FILE_TYPE['video'].type" :url="url"></PreviewVideo>
        <PreviewExcel v-if="fileInfo.fileType === FILE_TYPE['excel'].type" :url="url"></PreviewExcel>
        <PreviewDoc v-if="fileInfo.fileType === FILE_TYPE['word'].type" :url="url"></PreviewDoc>
        <PreviewPdf v-if="fileInfo.fileType === FILE_TYPE['pdf'].type" :url="url"></PreviewPdf>
        <PreviewTxt 
            v-if="fileInfo.fileType === FILE_TYPE['txt'].type || fileInfo.fileType === FILE_TYPE['program'].type"
            :url="url"
            :fileName="fileInfo.fileName"
        >
        </PreviewTxt>
        <PreviewMusic
            v-if="fileInfo.fileType === FILE_TYPE['music'].type"
            :url="url"
            :fileName="fileInfo.fileName"
        >
        </PreviewMusic>
        <PreviewDownload
            v-if="fileInfo.fileType === FILE_TYPE['zip'].type || fileInfo.fileType === FILE_TYPE['other'].type"
            :createDownloadUrl="createDownloadUrl"
            :downloadUrl="downloadUrl"
            :fileInfo="fileInfo"
        >
        </PreviewDownload>
    </Window>
</template>

<script setup>
import { inject,ref,reactive, computed, nextTick, defineExpose } from 'vue';
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
    videoUrl: "/file/ts/getVideoInfo",
    createDownloadUrl: "/file/createDownloadUrl",
    downloadUrl: "/file/download",
  },
  1: {
    fileUrl: "/admin/getFile",
    videoUrl: "/admin/ts/getVideoInfo",
    createDownloadUrl: "/admin/createDownloadUrl",
    downloadUrl: "/admin/download",
  },
  2: {
    fileUrl: "/showShare/getFile",
    videoUrl: "/showShare/ts/getVideoInfo",
    createDownloadUrl: "/showShare/createDownloadUrl",
    downloadUrl: "/showShare/download",
  },
};

/**文件信息 */
const fileInfo = ref({});
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
        globalInfo.imageUrl + fileInfo.value.fileCover.replaceAll('_.','.')
    );
});

/**window组件是否显示 */
let windowShow = ref(false);

const closeWindow = () => {
    windowShow.value = false;
};

const showPreview = (data, showPart) => {
    fileInfo.value = data;
    if(data.fileType === FILE_TYPE['image'].type) {
        nextTick(() => {
            imageViewRef.value.show(0);
        })
    } else {
        windowShow = true;
        let _url = FILE_URL_MAP[showPart].fileUrl;
        // 视频地址单独处理
        if(data.fileType === FILE_TYPE['video'].type) {
            _url = FILE_URL_MAP[showPart].videoUrl;
        }

        let _createDownloadUrl = FILE_URL_MAP[showPart].createDownloadUrl;
        let _downloadUrl = FILE_URL_MAP[showPart].downloadUrl;

        if(showPart === 0) {
            _url = _url + "/" + data.fileId;
            _createDownloadUrl = _createDownloadUrl + "/" + data.fileId;
        } else if(showPart === 1) {
            _url = _url + "/" + data.userId + "/" + data.fileId;
            _createDownloadUrl =  _createDownloadUrl + "/" + data.userId + "/" + data.fileId;
        } else if(showPart === 2) {
            _url = _url + "/" + data.shareId + "/" + data.fileId;
            _createDownloadUrl = _createDownloadUrl + "/" + data.shareId + "/" + data.fileId;
        }
        url.value = _url;
        createDownloadUrl.value = _createDownloadUrl;
        downloadUrl.value = _downloadUrl;
    }
}
defineExpose({showPreview});
</script>

<style lang="scss" scoped>
</style>