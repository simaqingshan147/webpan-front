<template>
    <div class="share">
        <div class="header">
            <div class="header-content">
                <div class="logo" @click="jump">
                    <span class="iconfont icon-pan"></span>
                    <span class="name">webpan</span>
                </div>
            </div>
        </div>
        <div class="share-body">
            <template v-if="Object.keys(shareInfo).length == 0">
                <div
                    v-loading="Object.keys(shareInfo).length == 0"
                    class="loading"
                >
                </div>
            </template>
            <template v-else>
                <!-- 操作栏 -->
                <div class="share-panel">
                    <div class="share-user-info">
                        <div class="avatar">
                            <Avatar
                                :userId="shareInfo.userId"
                                :avatar="shareInfo.avatar"
                                :width="50"
                            >
                            </Avatar>
                        </div>
                        <div class="share-info">
                            <div class="user-info">
                                <span class="nick-name">
                                    {{ shareInfo.nickName }}
                                </span>
                                <span class="share-time">
                                    分享于 {{ shareInfo.shareTime }}
                                </span>
                            </div>
                            <div class="file-name">
                                分享文件: {{ shareInfo..fileName }}
                            </div>
                        </div>
                        <div class="share-op-btn">
                            <el-button
                                v-if="shareInfo.currentUser"
                                type="primary"
                                @click="cancelShare"
                            >
                                <span class="iconfont icon-cancel"></span>取消分享
                            </el-button>
                            <el-button
                                v-else
                                type="primary"
                                :disabled="selected"
                                @click="save2MyPanBatch"
                            >
                                <span class="iconfont icon-import"></span>保存到我的网盘
                            </el-button>
                        </div>
                    </div>
                </div>
                <!--导航-->
                <Navigation
                    ref="navigationRef"
                    @navChange="navChange"
                    :shareId="shareId"
                >
                </Navigation>
                <!-- 分享文件列表 -->
                <div class="file-list">
                    <Table
                        :columns="columns"
                        :showPagination="true"
                        :dataSource="tableData"
                        :fetch="loadDataList"
                        :options="tableOptions"
                        @rowSelected="rowSelected"
                    >
                        <template #fileName = "{index,row}">
                            <div class="file-item" @mouseenter="showOp(row)" @mouseleave="cancelShowOp(row)">
                                <!-- 文件/目录封面 -->
                                <template v-if="(row.type == TYPE['image'].type || row.type == TYPE['video'].type)">
                                    <Icon :cover="row.cover" :width="32"></Icon>
                                </template>
                                <template v-else>
                                    <Icon v-if="row.folderType === true" :fileType="0"></Icon>
                                    <Icon v-else :fileType="row.type"></Icon>
                                </template>
                                <!-- 文件名 -->
                                <span class="file-name" v-if="!row.showEdit" :title="row.name">
                                    <span @click="preview(row)">{{ row.name }}</span>
                                </span>
                                <!-- 文件操作 -->
                                <span class="op">
                                    <template v-if="row.showOp && row.id">
                                        <span
                                            v-if="row.folderType === false"
                                            class="iconfont icon-download"
                                            @click="copy(row.id)">
                                            下载
                                        </span>
                                        <span
                                            v-if="shareInfo.currentUser === false"
                                            class="iconfont icon-cancel"
                                            @click="save2MyPan(row)"
                                        >
                                            保存到我的网盘
                                        </span>
                                    </template>
                                </span>
                            </div>
                        </template>
                        <template #fileSize="{index,row}">
                            <span v-if="row.fileSize">
                                {{ Utils.size2Str(row.fileSize) }}
                            </span>
                        </template>
                    </Table>
                </div>   
            </template>
            <!-- 目录选择组件 -->
            <FolderSelect
                ref="folderSelectRef"
                @folderSelect="save2MyPanDone"
            >
            </FolderSelect>
            <!-- 预览组件 -->
            <Preview ref="previewRef"></Preview>
        </div>
    </div>
</template>

<script setup>
    import { computed } from '@vue/reactivity';
    import { ref, reactive, inject } from 'vue';
    import { useRouter, useRoute } from "vue-router";
    const Message = inject("$message");
    const Request = inject("$request");
    const Confirm = inject("$confirm");
    const Utils = inject("$utils");
    const Cookies = inject('$cookies');
    const router = useRouter();
    const route = useRoute();
    /**文件类型 */
    const TYPE = Utils.FILE_TYPE;

    /**列表数据项 */
    const columns = [
        {
            label: "文件名",
            prop: "fileName",
            scopedSlots: "fileName",
        },
        {
            label: "修改时间",
            prop: "updateTime",
            width: 200,
        },
        {
            label: "大小",
            prop: "fileSize",
            scopedSlots: "fileSize",
            width: 200,
        }
    ];

    const api = {
        getShareLoginInfo: "/webShare/getShareLoginInfo",
        loadFileList: "/webShare/loadFileList",
        createDownloadUrl: "/webShare/createDownloadUrl/",
        download: "/api/api/download/",
        cancelShare: "/share/cancelShare",
        saveShare: "/webShare/saveShare",
    };

    const tableOptions = {
        extHeight: 80,
        selectType: "checkbox"
    };

    /**文件(夹)列表,PagedResult<List<Document>>对象*/
    const tableData = ref({
        pageNo: 1,
        pageSize: 15,
        list: []
    });

    /**当前目录的id */
    const currentFolder = reactive({
        dirId : 0
    });

    /**当前分享id */
    const shareId = route.URLSearchParams.shareId;

    /**按照条件搜索并返回文件信息 */
    const loadDataList = async ()=>{
        const params = {
            pageNo: tableData.value.pageNo,
            pageSize: tableData.value.pageSize,
            shareId: shareId,
            pid: currentFolder.dirId,
        };
        let result = await Request({
            url: api.loadFileList,
            showLoading: showLoading,
            params
        });
        if(!result){
            return;
        }
        console.log(result.data);
        tableData.value = result.data;
    };

    const shareInfo = ref({});

    const getShareInfo = async () => {
        let result = await Request({
            url: api.getShareLoginInfo,
            showLoading: false,
            params: {
                shareId
            }
        });
        if(!result) {
            return;
        }
        if(result.data == null) {
            router.push("/shareCheck/" + shareId);
            return;
        }
        shareInfo.value = result.data;
    };
    getShareInfo();

    /*****************批量文件操作**********************/
    
    /**多选文件的id列表 */
    const selectedFileIdList = ref([]);
    /**多选文件夹的id列表 */
    const selectedDirIdList = ref([]);

    /**目标文件夹显示组件的ref */
    const folderSelectRef = ref();

    /**是否多选 */
    let selected = computed( () => {
        return selectedDirIdList.value.length == 0 && selectedFileIdList.value.length == 0;
    });

    /**处理多选选中文件(夹)
    * @param 选中文件(夹)的Document类实例对象数组
    */
    const rowSelected = (rows)=>{
        selectedDirIdList.value = []
        selectedFileIdList.value = []
        rows.forEach((document)=>{
            if(document.folderType)
                selectedDirIdList.value.push(document.id);
            else
                selectedFileIdList.value.push(document.id);
        });
    };

    let saveDocuments = []

    /**批量保存的我的网盘 */
    const save2MyPanBatch = () => {
        if(!selected) {
            return;
        }
        if(Cookies.get("userInfo") == null){
            Message.error("请登录访问");
            router.push("/login?redirectUrl=" + route.path);
        }
        saveDocuments = []
        selectedDirIdList.value.forEach((document) => {
            saveDocuments.push({
                folderType: 1,
                id: document.id
            });
        });
        selectedFileIdList.value.forEach((document) => {
            saveDocuments.push({
                folderType: 0,
                id: document.id
            });
        });
        folderSelectRef.value.showFolderDialog(selectedDirIdList.value);
    };

    /**取消分享 */
    const cancelShare = () => {
        Confirm("你确定要取消分享吗?",
            async () => {
                let list = [shareId];
                let result = await Request({
                    url: api.cancelShare,
                    params:{
                        shareIds: list
                    }
                });
                if(!result) {
                    return;
                }
                Message.success("取消分享成功");
                //刷新文件界面
                loadDataList();
            }
        );
    };

    /****************单个文件操作*********************/

    //展示操作按钮
    const showOp = (row) => {
        tableData.value.list.forEach((element) => {
            element.showOp = false;
        });
        row.showOp = true;
    };

    const cancelShowOp = (row) => {
        row.showOp = false;
    };


    /**单个文件保存到我的网盘 */
    const save2MyPan = (document) => {
        if(!selected) {
            return;
        }
        if(Cookies.get("userInfo") == null){
            Message.error("请登录访问");
            router.push("/login?redirectUrl=" + route.path);
        }
        let excludeDirIdList = []
        if(document.folderType == true){
            excludeDirIdList.push(document.id);
        }
        saveDocuments = []
        saveDocuments.push({
            folderType: document.folderType,
            id: document.id
        });
        folderSelectRef.value.showFolderDialog(excludeDirIdList);
    }

    const download = async (id) => {
        let result = await Request({
            url: api.createDownloadUrl + shareId + "/" + id
        });
        if(!result) {
            return;
        }
        window.location.href = api.download + result.data;
    }

    const previewRef = ref();
    const navigationRef = ref();

    /**预览文件 */
    const preview = (document) => {
        if(document.folderType) {
            navigationRef.value.openFolder(document);
        }
        document.shareId = shareId;
        previewRef.value.showPreview(document,2);
    }   

    /******其他页面操作 **********/

    const jump = () => {
        router.push("/");
    }

    /**保存到网盘：选中目录后的回调 */
    const save2MyPanDone = async (dirId) => {
        let result = await Request({
            url: api.saveShare,
            params: {
                shareId: shareId,
                documents: saveDocuments,
                dirId: dirId
            }
        });
        if(!result) {
            return;
        }
        if(result.code === 404 && result.data === null) {
            Message.error("分享码不正确");
            router.push("/shareCheck/" + shareId);
            return;
        }
        loadDataList();
        Message.success("保存成功");
        folderSelectRef.value.close();
    }

</script>

<style lang="scss" scoped>
@import "@/assets/file.list.scss";
.header {
  width: 100%;
  position: fixed;
  background: #0c95f7;
  height: 50px;
  .header-content {
    width: 70%;
    margin: 0px auto;
    color: #fff;
    line-height: 50px;
    .logo {
      display: flex;
      align-items: center;
      cursor: pointer;
      .icon-pan {
        font-size: 40px;
      }
      .name {
        font-weight: bold;
        margin-left: 5px;
        font-size: 25px;
      }
    }
  }
}
.share-body {
  width: 70%;
  margin: 0px auto;
  padding-top: 50px;
  .loading {
    height: calc(100vh / 2);
    width: 100%;
  }
  .share-panel {
    margin-top: 20px;
    display: flex;
    justify-content: space-around;
    border-bottom: 1px solid #ddd;
    padding-bottom: 10px;
    .share-user-info {
      flex: 1;
      display: flex;
      align-items: center;
      .avatar {
        margin-right: 5px;
      }
      .share-info {
        .user-info {
          display: flex;
          align-items: center;
          .nick-name {
            font-size: 15px;
          }
          .share-time {
            margin-left: 20px;
            font-size: 12px;
          }
        }
        .file-name {
          margin-top: 10px;
          font-size: 12px;
        }
      }
    }
  }
}

.file-list {
  margin-top: 10px;
  .file-item {
    .op {
      width: 170px;
    }
  }
}
</style>