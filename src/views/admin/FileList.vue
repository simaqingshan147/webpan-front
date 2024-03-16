<template>
    <div class="top">
        <!-- 顶部操作栏 -->
        <div class="top-op">
            <!-- 批量删除 -->
            <el-button type="danger" @click="recycleBatch()" :disabled="selected">
                <span class="iconfont icon-del"></span>
                批量删除
            </el-button>
            <!-- 搜索 -->
            <div class="search-panel">
                <el-select
                    v-model="fileType"
                    clearable
                    placeHolder="请选择文件类型"
                    style="width: 150px;"
                    @change="search()"
                    >
                    <el-option
                        v-for="item in fileTypeOptions"
                        :label="item.label"
                        :key="item.key"
                        :value="item.value"
                    />
                </el-select>
                <el-input 
                    clearable
                    style="width: 240px;margin-left: 10px;"
                    placeholder="输入文件名搜索"
                    v-model="fileNameFuzzy"
                    @keyup.enter="search"
                >
                    <template #suffix>
                        <i class="iconfont icon-search" @click="search()"></i>
                    </template>
                </el-input>
            </div>
            <!-- 刷新 -->
            <div class="iconfont icon-refresh" @click="loadDataList"></div>
        </div>
        <!-- 导航 -->
        <Navigation ref="navigationRef" @navChange="navChange" :adminShow="true"></Navigation>
    </div>
    <!-- 文件列表 -->
    <div class="file-list" v-if="tableData.list && tableData.list.length > 0">
        <!-- 文件列表分页显示组件 -->
        <Table
            :columns="columns"
            :showPagination="true"
            :dataSource="tableData"
            :fetch="loadDataList"
            :initFetch="false"
            :options="tableOptions"
            @rowSelected="rowSelected"
        >
            <template #fileName = "{index,row}">
                <div class="file-item" @mouseenter="showOp(row)" @mouseleave="cancelShowOp(row)">
                    <!-- 文件/目录封面 -->
                    <template v-if="(row.type == TYPE['image'].type || row.type == TYPE['video'].type) && row.status == STATUS.using.code">
                        <Icon :cover="row.cover" :width="32"></Icon>
                    </template>
                    <template v-else>
                        <Icon v-if="row.folderType === true" :fileType="0"></Icon>
                        <Icon v-else :fileType="row.type"></Icon>
                    </template>
                    <!-- 文件名 -->
                    <span class="file-name" v-if="!row.showEdit" :title="row.name">
                        <span @click="preview(row)">{{ row.name }}</span>
                        <span v-if="row.status == STATUS.transfer.code" class="transfer-status">转码中</span>
                        <span v-if="row.status == STATUS.transfer_fail.code" class="transfer-status transfer-fail">转码失败</span>
                    </span>
                    <!-- 文件操作 -->
                    <span class="op">
                        <template v-if="row.showOp && row.id && row.status == STATUS.using.code">
                            <span class="iconfont icon-download" v-if="!row.folderType"
                                @click="download(row)">
                                下载
                            </span>
                            <span class="iconfont icon-del" @click="recycle(row)">
                                删除
                            </span>
                        </template>
                    </span>
                </div>
            </template>
            <template #fileSize="{index,row}">
                <span v-if="row.fileSize">
                {{ Utils.size2Str(row.fileSize) }}</span>
            </template>
        </Table>
    </div>
    <!-- 文件预览组件 -->
    <Preview ref="previewRef"></Preview>
</template>

<script setup>
    import { computed } from '@vue/reactivity';
    import { ref, reactive, inject } from 'vue';

    const Message = inject("$message");
    const Request = inject("$request");
    const Confirm = inject("$confirm");
    const Utils = inject("$utils");
    /**文件类型 */
    const TYPE = Utils.FILE_TYPE;
    /**文件状态 */
    const STATUS = Utils.FILE_STATUS;

    /**传递给Table组件的列表表头 */
    const columns = [
        {
            label:"文件名",
            prop:"fileName",
            scopedSlots: "fileName"
        },
        {
            label:"修改时间",
            prop:"updateTime",
            width:200
        },
        {
            label:"大小",
            prop: "fileSize",
            scopedSlots: "fileSize",
            width: 200
        }
    ];

    /**传递给文件列表子组件的选项 */
    const tableOptions = {
        extHeight: 50,
        selectType: "checkbox"
    };

    const api = {
        loadDataList: "/admin/loadFileList",
        delFile: "/admin/delFile",
        createDownloadUrl: "/admin/createDownloadUrl",
        download: "/api/api/download"
    };

    /**当前目录的id */
    const currentFolder = reactive({
        dirId : 0
    });

    /**是否显示加载画面 */
    const showLoading = ref(true);

    /**当前页面是否处于编辑中 */
    const editing = ref(false);

    /**文件(夹)列表,PagedResult<List<Document>>对象*/
    const tableData = ref({
        pageNo: 1,
        pageSize: 15,
        list: []
    });

    /************搜索并显示文件(夹)*********************/

    /**模糊搜索的文件(夹)名 */
    const fileNameFuzzy = ref();

    /**文件类型 */
    const fileType = ref();

    const fileTypeOptions = ref([]);

    const getFileTypeOptions = () => {
        fileTypeOptions.value = []
        for(let key of Object.keys(TYPE)){
            if(key !== 'folder') {
                fileTypeOptions.value.push({
                    key: TYPE[key].type,
                    label: TYPE[key].name,
                    value: TYPE[key].type
                });
            }
        }
    }
    getFileTypeOptions();

    /**按照条件搜索并返回文件信息 */
    const loadDataList = async ()=>{
        let params = {
            pageNo: tableData.value.pageNo,
            pageSize: tableData.value.pageSize,
            name: fileNameFuzzy.value,
            type: fileType.value
        };
        let result = await Request({
            url: api.loadDataList,
            showLoading: showLoading,
            params
        });
        if(!result){
            return;
        }
        console.log(result.data);
        tableData.value = result.data;
    };

    /**搜索按钮的响应 */
    const search = ()=> {
        showLoading.value = true;
        loadDataList();
    };

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

    /*****************批量文件操作**********************/
    
    /**多选文件的id列表 */
    const selectedFileIdList = ref([]);
    /**多选文件夹的id列表 */
    const selectedDirIdList = ref([]);

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

    /**批量移入回收站 */
    const recycleBatch = () => {
        if(!selected)
            return;
        Confirm("你确定要删除这些文件吗?",
            async () => {
                let result = await Request({
                    url: api.delFile,
                    params:{
                        dirIds: selectedDirIdList.value,
                        fileIds: selectedFileIdList.value
                    }
                });
                selectedDirIdList.value = [];
                selectedFileIdList.value = [];
                if(!result) {
                    return;
                }
            //刷新文件界面
            loadDataList();
        });
    };

    /****************单个文件操作*********************/

    /**单个文件的下载
     * @param document 待下载文件的信息
     */
    const download = async (document) =>{
        console.log(document);
        let result = await Request({
            url: api.createDownloadUrl + "/" + document.id,
        });
        if(!result)
            return;
        //访问文件下载链接
        window.location.href = api.download + "/" + result.data;
    };

    /**单个文件(夹)移入回收站
     * @param document 待回收的文件(夹)的信息
    */
    const recycle = (document)=>{
        Confirm(`你确定删除【${document.name}】吗?`,
            async ()=>{
                let dirIds = [];
                let fileIds = [];
                if(document.folderType)
                    dirIds.push(document.id);
                else
                    fileIds.push(document.id);
                let result = await Request({
                    url: api.delFile,
                    params: {
                        dirIds: dirIds,
                        fileIds: fileIds
                    }
                });
                if(!result)
                    return;
                loadDataList();
            });
    };

    /****************** 子组件相关 **********************/

    /**文件预览子组件的ref */
    const previewRef = ref();

    /**导航栏子组件的ref */
    const navigationRef = ref();

    /**导航栏切换时触发的事件
     * 即切换完成后,导航栏子组件调用的方法
     * 通过此方法子组件返回目录信息
     * @param data 目标目录的id和目标分类
     */
    const navChange = (data)=>{
        const {curFolder} = data;
        currentFolder.dirId = curFolder;
        showLoading.value = true;
        loadDataList();
    };

    /**预览文件
     * @param document 待预览文件的信息
     */
    const preview = (document)=>{
        //访问文件夹,切换导航栏
        if(document.folderType){
            navigationRef.value.openFolder(document);
            return;
        }
        //预览文件
        previewRef.value.showPreview(document,0);
    };

</script>

<style lang="scss" scoped>
@import "@/assets/file.list.scss";
.search-panel {
  margin-left: 10px !important;
}
.file-list {
  margin-top: 10px;
  .file-item {
    .op {
      width: 120px;
    }
  }
}
</style>
