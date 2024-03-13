<template>
    <div>
        <!-- 批量操作 -->
        <div class="top">
            <el-button
                type="success"
                :disabled="selected"
                @click="revertBatch"
            >
                <span class="iconfont icon-revert"></span>还原
            </el-button>
            <el-button
                type="danger"
                :disabled="selected"
                @click="deleteBatch"
            >
                <span class="iconfont icon-del"></span>批量删除
            </el-button>
        </div>
        <!-- 回收文件列表 -->
        <div class="file-list">
            <Table
                :columns="columns"
                :showPagination="false"
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
                            <span>{{ row.name }}</span>
                        </span>
                        <!-- 文件操作 -->
                        <span class="op">
                            <template v-if="row.showOp && row.id && row.status == STATUS.recovery.code">
                                <span class="iconfont icon-revert" @click="revert(row)">
                                    还原
                                </span>
                                <span class="iconfont icon-del" @click="delFile(row)">
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
    </div>
</template>

<script setup>
    import { ref, inject } from 'vue';
    import { computed } from '@vue/reactivity';
    const Message = inject("$message");
    const Request = inject("$request");
    const Confirm = inject("$confirm");
    const Utils = inject("$utils");

    /**文件类型 */
    const TYPE = Utils.FILE_TYPE;
    /**文件状态 */
    const STATUS = Utils.FILE_STATUS;

    const api = {
        loadDataList: "/recycle/loadRecycleList",
        delFile: "/recycle/delFile",
        recoverFile: "/recycle/recoverFile"
    };

    const emit = defineEmits(["reload"]);

    /**列表的列 */
    const columns = [
        {
            label: "文件名",
            prop: "fileName",
            scopedSlots: "fileName",
        },
        {
            label: "删除时间",
            prop: "recoveryTime",
            width: 200,
        },
        {
            label: "大小",
            prop: "fileSize",
            scopedSlots: "fileSize",
            width: 200,
        }
    ];

    /**列表选项 */
    const tableOptions = {
        extHeight: 20,
        selectType: "checkbox"
    };

    /**文件(夹)列表,PagedResult<List<Document>>对象*/
    const tableData = ref({
        pageNo: 1,
        pageSize: 15,
        list: []
    });

    /**按照条件搜索并返回文件信息 */
    const loadDataList = async ()=>{
        let params = {
            pageNo: tableData.value.pageNo,
            pageSize: tableData.value.pageSize,
        };
        let result = await Request({
            url: api.loadDataList,
            params
        });
        if(!result){
            return;
        }
        console.log(result.data);
        tableData.value.list = result.data;
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

    /**批量还原 */
    const revertBatch = () => {
        if(!selected)
            return;
        Confirm("你确定要删除这些文件吗?删除文件可在10天内通过回收站还原",
            async () => {
                let result = await Request({
                    url: api.recoverFile,
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

    /**批量删除 */
    const deleteBatch = () => {
        if(!selected)
            return;
        Confirm("你确定要删除这些文件吗?删除将无法恢复",
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
            emit("reload");
        });
    };

    /*****************单个文件操作**********************/

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

    /**恢复单个文件 */
    const revert = (document) => {
        Confirm(`你确定要还原【${document.name}】吗？`, async () => {
            let dirIds = [];
            let fileIds = [];
            if(document.folderType)
                dirIds.push(document.id);
            else
                fileIds.push(document.id);
            let result = await Request({
                url: api.recoverFile,
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

    /**删除单个文件 */
    const delFile = (document) => {
        Confirm(`你确定要删除【${document.name}】吗？`, async () => {
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
            emit("reload");
        });
    };

</script>

<style lang="scss" scoped>
@import "@/assets/file.list.scss";
.file-list {
    margin-top: 10px;
    .file-item {
        .op {
            width: 120px;
        }
    }
}
</style>