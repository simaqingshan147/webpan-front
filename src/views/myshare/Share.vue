<template>
    <div>
        <!-- 批量操作 -->
        <div class="top">
            <el-button
                type="primary"
                :disabled="selected"
                @click="cancelShareBatch"
            >
                <span class="iconfont icon-revert"></span>取消分享
            </el-button>
        </div>
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
                            <Icon v-if="row.folderType === 1" :fileType="0"></Icon>
                            <Icon v-else :fileType="row.type"></Icon>
                        </template>
                        <!-- 文件名 -->
                        <span class="file-name" v-if="!row.showEdit" :title="row.name">
                            <span>{{ row.name }}</span>
                        </span>
                        <!-- 文件操作 -->
                        <span class="op">
                            <template v-if="row.showOp && row.id">
                                <span class="iconfont icon-link" @click="copy(row)">
                                    复制链接
                                </span>
                                <span class="iconfont icon-cancel" @click="cancelShare(row)">
                                    取消分享
                                </span>
                            </template>
                        </span>
                    </div>
                </template>
                <template #fileSize="{index,row}">
                    <span v-if="row.fileSize">
                    {{ Utils.size2Str(row.fileSize) }}</span>
                </template>
                <template #expireTime="{index,row}">
                    {{ row.validType === VALID_TYPE.forever.type ? "永久" : row.expireTime }}
                </template>
            </Table>
        </div>
    </div>
</template>

<script setup>
    import { ref, inject } from 'vue';
    import { computed } from '@vue/reactivity';
    import useClipboard from "vue-clipboard3";
    const Message = inject("$message");
    const Request = inject("$request");
    const Confirm = inject("$confirm");
    const Utils = inject("$utils");

    /**分享时间类型 */
    const VALID_TYPE = Utils.VALID_TYPE;
    /**文件类型 */
    const TYPE = Utils.FILE_TYPE;
    const { toClipboard } = useClipboard();

    /**数据列 */
    const columns = [
        {
            label: "文件名",
            prop: "fileName",
            scopedSlots: "fileName",
        },
        {
            label: "大小",
            prop: "fileSize",
            scopedSlots: "fileSize",
            width: 100,
        },
        {
            label: "分享时间",
            prop: "shareTime",
            width: 200,
        },
        {
            label: "失效时间",
            prop: "expireTime",
            scopedSlots: "expireTime",
            width: 200,
        },
        {
            label: "浏览次数",
            prop: "showCount",
            width: 100,
        }
    ];

    const api = {
        loadDataList: "/share/loadShareList",
        cancelShare: "/share/cancelShare"
    }

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
        tableData.value = result.data;
    };

    /*****************批量文件操作**********************/
    
    /**多选分享文件的shareId列表 */
    const selectShareList = ref([]);

    /**是否多选 */
    let selected = computed( () => {
        return selectShareList.value.length == 0;
    });

    /**处理多选选中文件(夹)
    * @param 选中文件(夹)的ShareInfo类实例对象数组
    */
    const rowSelected = (rows)=>{
        selectShareList.value = []
        rows.forEach((shareInfo)=>{
            selectShareList.value.push(shareInfo.shareId);
        });
    };

    /**批量取消分享 */
    const cancelShareBatch = () => {
        if(!selected) {
            return;
        }
        Confirm("你确定要取消分享吗?",
            async () => {
                let result = await Request({
                    url: api.cancelShare,
                    params:{
                        shareIds: selectShareList.value
                    }
                });
                selectShareList.value = []
                if(!result) {
                    return;
                }
                Message.success("取消分享成功");
            //刷新文件界面
            loadDataList();
        });
    }

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

    /**取消分享单个文件 */
    const cancelShare = (shareInfo) => {
        Confirm("你确定要取消分享吗?",
            async () => {
                let list = [shareInfo.shareId];
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

    const shareUrl = ref(document.location.origin + "/webShare/");

    const copy = async (shareInfo) => {
        await toClipboard(
            `链接:${shareUrl.value}${shareInfo.shareId} 提取码: ${shareInfo.code}`
        )
        Message.success("复制成功");
    }
</script>

<style lang="scss" scoped>
@import "@/assets/file.list.scss";
.file-list {
    margin-top: 10px;
    .file-item {
        .file-name {
            span {
                &:hover {
                    color: #494944;
                }
            }
        }
    }
    .op {
        width: 170px;
    }
}
</style>