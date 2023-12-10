<template>
    <!-- 文件界面 -->
    <div class="top">
        <!-- 顶部操作栏 -->
        <div class="top-op">
            <!-- 上传文件 -->
            <div class="btn">
                <el-upload :show-file-list="false" :with-credentials="true" :multiple="true"
                    :http-request="addFile" :accept="fileAccept">
                    <el-button type="primary">
                        <span class="iconfont icon-upload"></span>
                        上传
                    </el-button>
                </el-upload>
            </div>
            <!-- 新建文件夹 -->
            <el-button type="success" @click="newFolder" v-if="category === 'all'">
                <span class="iconfont icon-folder-add"></span>
                新建文件夹
            </el-button>
            <!-- 移入回收站 -->
            <el-button type="danger" @click="recycleBatch" :disabled="selected">
                <span class="iconfont icon-del"></span>
                批量删除
            </el-button>
            <!-- 移动 -->
            <el-button type="warning" @click="moveBatch" :disabled="selected">
                <span class="iconfont icon-move"></span>
                批量移动
            </el-button>
            <!-- 搜索 -->
            <div class="search-panel">
                <el-input clearable placeholder="输入文件名搜索" v-model="fileNameFuzzy" @keyup.enter="search">
                    <template #suffix>
                        <i class="iconfont icon-search" @click="search"></i>
                    </template>
                </el-input>
            </div>
            <!-- 刷新 -->
            <div class="iconfont icon-refresh" @click="loadFileList"></div>
        </div>
        <!-- 导航 -->
        <Navigation ref="navigationRef" @navChange="navChange"></Navigation>
    </div>
    <!-- 文件列表 -->
    <div class="flie-list" v-if="tableData.list && tableData.list.length>0">
        <!-- 文件列表分页显示组件 -->
        <Table ref="dataTableRef" :columns="columns" :showPagination="true" :dataSource="tableData"
            :fetch="loadFileList" :initFetch="false" :options="tableOptions" @rowSelected="rowSelected">
            <template #fileName = "{index,row}">
                <div class="file-item" @mouseenter="showOp(row)" @mouseleave="cancelShowOp(row)">
                    <!-- 文件/目录封面 -->
                    <template v-if="(row.fileType == TYPE['iamge'].type || row.fileType == TYPE['video'].type) && row.status == STATUS.using.code">
                        <Icon :cover="row.fileCover" :width="32"></Icon>
                    </template>
                    <template v-else>
                        <Icon v-if="row.isFolder" :fileType="TYPE['folder'].type"></Icon>
                        <Icon v-else :fileType="row.fileType"></Icon>
                    </template>
                    <!-- 文件名 -->
                    <span class="file-name" v-if="!row.showEdit" :title="row.name">
                        <span @click="preview(row)">{{ row.name }}</span>
                        <span v-if="row.status == STATUS.transfer.code" class="transfer-status">转码中</span>
                        <span v-if="row.status == STATUS.transfer_fail.code" class="transfer-status transfer-fail">转码失败</span>
                    </span>
                    <!-- 重命名 -->
                    <div class="edit-panel" v-if="row.showEdit">
                        <el-input v-model.trim="row.fileNameReal" ref="editNameRef" :maxLength="190"
                            @keyup.enter="saveNameEdit(index)">
                            <template #suffix>{{ row.fileSuffix }}</template>
                        </el-input>
                        <span :class="['iconfont icon-right1',row.fileNameReal ? '' : 'not-allow']"
                            @click="saveNameEdit(index)">
                        </span>
                        <span :class="['iconfont icon-right1',row.fileNameReal ? '' : 'not-allow']"
                            @click="cancelNameEdit(index)">
                        </span>
                    </div>
                    <!-- 文件操作 -->
                    <span class="op">
                        <template v-if="row.showOp && row.id && row.status == STATUS.using.code">
                            <span class="iconfont icon-share1" @click="share(row)">
                                分享
                            </span>
                            <span class="iconfont icon-download" v-if="!row.isFolder"
                                @click="download(row)">
                                下载
                            </span>
                            <span class="iconfont icon-del" @click="recycle(row)">
                                删除
                            </span>
                            <span class="iconfont icon-edit" @click.stop="editName(index)">
                                重命名
                            </span>
                            <span class="iconfont icon-move" @click="move(row)">
                                移动
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
    <!-- 如果无数据 -->
    <div class="no-data" v-else>
        <div class="no-data-inner">
            <Icon iconName="no_data" :width="120" fit="fill"></Icon>
            <div class="tips">当前目录为空，上传你的第一个文件吧</div>
            <div class="op-list">
                <el-upload :show-file-list="false" :with-credentials="true" :multiple="true"
                    :http-request="addFile" :accept="fileAccept">
                    <div class="op-item">
                        <Icon iconName="file" :width="60"></Icon>
                        <div>上传文件</div>
                    </div>
                </el-upload>
                <div class="op-item" @click="newFolder" v-if="category === 'all'">
                    <Icon iconName="folder" :width="60"></Icon>
                    <div>新建目录</div>
                </div>
            </div>
        </div>
    </div>
    <!-- 文件预览组件 -->
    <Preview ref="previewRef"></Preview>
    <!-- 目标文件夹选择组件 -->
    <FolderSelect ref="folderSelectRef" @folderSelect="moveDone"></FolderSelect>
    <!-- 分享页面 -->
    <FileShare ref="shareRef"></FileShare>
</template>

<script setup>
    import { computed } from '@vue/reactivity';
    import {ref,reactive,inject, nextTick} from 'vue';

    //引入页面
    import FileShare from './FileShare.vue';

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

    const api = {
        loadFileList: "/file/loadDataList",
        rename: "/file/rename",
        newFolder: "/file/newFolder",
        recycle: "/file/recycle",
        changeFolder: "/file/changeFolder",
        createDownloadUrl: "/file/createDownloadUrl",
        download: "/api/api/download"
    };

    /**分类浏览时当前页面选择的分类 */
    const category = ref();

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

    /*******************重新加载 *****************/

    /**重新加载文件界面 */
    const reload = ()=>{
        showLoading.value = false;
        loadFileList();
        emit('reload');
    }
    /**将reload方法暴露给framework调用*/
    defineExpose({reload});

    /*******************上传文件 *****************/

    /**根据文件分类选择可以上传的文件后缀 */
    const fileAccept = computed(()=>{
        const categoryItem = Utils.CATEGORY[category.value];
        return categoryItem ? categoryItem.accept : "*";
    })

    /**定义暴露给framework的文件上传事件 */
    const emit = defineEmits(['addFile','reload']);

    /**上传文件
     * @param fileData 待上传的文件
     */
    const addFile = async (fileData) => {
        emit("addFile",{
            file: fileData.file,
            dirId: currentFolder.dirId
        });
    };

    /*******************新建文件夹*****************/

    /**文件名编辑文本框的ref */
    const editNameRef = ref();

    /**新建文件夹 */
    const newFolder = ()=>{
        if(editing.value)
            return;
        //禁止文件编辑
        tableData.value.list.foeach((elemnet) =>{
            elemnet.showEdit = false;
        });
        editing.value = true;
        //添加一个无名文件夹到当前文件列表,光标指向文件夹名
        tableData.value.list.unshift({
            showEdit: true,
            fileType: TYPE['folder'].type,
            //注意id为null
            id: null,
            pid: currentFolder.dirId,
            isFolder: true
        });
        nextTick(()=>{
            editNameRef.value.focus();
        });

        /************搜索并显示文件(夹)*********************/
        
        /**传递给文件列表子组件的选项 */
        const tableOptions = {
            extHeight: 50,
            selectType: "checkbox"
        };

        /**模糊搜索的文件(夹)名 */
        const fileNameFuzzy = ref();

        /**按照条件搜索并返回文件信息 */
        const loadDataList = async ()=>{
            editing.value = true;
            let params = {
                pageNo: tableData.value.pageNo,
                pageSize: tableData.value.pageSize,
                name: fileNameFuzzy,
                type: Utils.getTypeByCategory(category.value),
                pid: currentFolder.dirId,
                status: FILE_STATUS.using.code
            };
            //如果是分类查询,则不该指定父目录
            if(params.category !== "all")
                delete params.pid;

            let result = await Request({
                url: api.loadFileList,
                showLoading: showLoading,
                params
            });
            if(!result)
                return;
            tableData.value = result.data;
            editing.value = false;
        };

        /**搜索按钮的响应 */
        const search = ()=>{
            showLoading.value = true;
            loadFileList();
        }

        /*****************批量文件操作**********************/
        
        /**多选文件的id列表 */
        const selectedFileIdList = ref([]);
        /**多选文件夹的id列表 */
        const selectedDirIdList = ref([]);

        /**目标文件夹显示组件的ref */
        const folderSelectRef = ref();

        /**是否多选 */
        const selected = computed(()=>{
            return selectedDirIdList.value.length > 0 || selectedFileIdList.value.length > 0;
        })

        /**处理多选选中文件(夹)
         * @param 选中文件(夹)的Document类实例对象数组
         */
        const rowSelected = (rows)=>{
            rows.foreach((document)=>{
                if(document.isFolder)
                    selectedDirIdList.value.push(document.id);
                else
                    selectedFileIdList.value.push(document.id);
            });
        }


        /**批量移入回收站 */
        const recycleBatch = () =>{
            if(!selected)
                return;
            Confirm("你确定要删除这些文件吗?删除文件可在10天内通过回收站还原",
                async () => {
                    let result = await Request({
                        url: api.recycle,
                        params:{
                            dirIds: selectedDirIdList.value,
                            fileIds: selectedFileIdList.value
                        }
                    });
                    selectedDirIdList.value = [];
                    selectedFileIdList.value = [];
                    if(!result)
                        return;
                    //刷新文件界面
                    loadFileList();
                });
        }
        
        /**批量移动文件(夹) */
        const moveBatch = ()=>{
            if(!selected)
                return;
            //目标文件夹不能是当前文件夹(未移动)和待移动文件夹
            let excludeDirIdList = selectedDirIdList;
            excludeDirIdList.unshift(currentFolder.dirId);
            //选择目标文件夹
            folderSelectRef.value.showFolderDialog(excludeDirIdList);
        };



        /****************单个文件操作*********************/

        /**修改文件(夹)名 */

        /**开始编辑文件名 */
        const editName = (index)=>{
            //如果同时在新建文件夹,删除之
            if(!tableData.value.list[0].id)
                tableData.value.list.splice(0,1);
            //禁止其他文件(夹)修改
            tableData.value.list.foreach((document)=>{
                document.showEdit = false;
            })
            let document = tableData.value.list[index];
            document.showEdit = true;

            //编辑
            if(document.isFolder){
                document.fileNameReal = document.name;
                //文件夹无后缀
                document.fileSuffix = "";
            }else{
                let i = document.name.indexof(".");
                document.fileNameReal = document.name.substring(0,i);
                document.fileSuffix = document.name.substring(i);
            }
            editing.value = true;
            nextTick(()=>{
                editNameRef.value.focus();
            })
        };

        /**保存对文件(夹)名的编辑
        *@param index 对应文件(夹)在tableData.list的索引
        */
        const saveNameEdit = async(index)=>{
            const {id,pid,fileNameReal,fileSuffix,isFolder} = tableData.value.list[index];
            if(fileNameReal === "" || fileNameReal.index("/") != -1){
                Message.warning("文件名不能为空或含有斜杠");
                return;
            }
            let url = api.rename;
            let params = {
                pid: pid,
                //rename参数
                id: id,
                newName : fileNameReal+fileSuffix,
                isFolder: isFolder,
                //newFolder参数
                dirName: fileNameReal
            }
            //id为null,即为待保存的无名文件夹
            if(id = null){
                url = api.newFolder;
            }
            
            let result = await Request({
                url: url,
                params: params
            });
            if(!result)
                return;

            //无论是rename还是newFolder都会返回Document对象
            tableData.value.list[index] = result.data;
            editing.value = false;
        };

        /**取消文件(夹)重命名 */
        const cancelNameEdit = (index)=>{
            const document = tableData.value.list[index];
            //不是新建文件夹
            if(document.id){
                document.showEdit = false;
            }else{
                //删除新建文件夹
                tableData.value.list.splice(index,1);
            }
            editing.value = false;
        };

        /**分享文件(夹) */

        /**文件分享子组件的ref */
        const shareRef = ref();

        /**单个文件(夹)的分享
         * @param document 待分享的文件(夹)的信息
         */
        const share = (document)=>{
            editing.value = true;
            //完成分享
            shareRef.value.show(document);
            editing.value = false;
        };

        /**下载文件 */

        /**单个文件的下载
         * @param document 待下载文件的信息
         */
        const download = async (document) =>{
            let result = await Request({
                url: api.createDownloadUrl + "/" + document.id,
            });
            if(!result)
                return;
            //访问文件下载链接
            window.location.href = api.download + "/" + result.data;
        };

        /**文件(夹)移入回收站 */

        /**单个文件(夹)移入回收站
         * @param document 待回收的文件(夹)的信息
        */
        const recycle = (document)=>{
            Confirm(`你确定删除【${document.name}】吗？删除文件可在10天内通过回收站还原`,
                async ()=>{
                    let dirIds = [];
                    let fileIds = [];
                    if(document.isFolder)
                        dirIds.push(document.id);
                    else
                        fileIds.push(document.id);
                    let result = await Request({
                        url: api.recycle,
                        params:{
                            dirIds: dirIds,
                            fileIds: fileIds
                        }
                    });
                    if(!result)
                        return;
                    loadDataList();
                });
        };

        /**单个文件(夹)移动 */

        /**当前移动的文件(夹) */
        const currentMoveDocument = ref({});

        /**单个文件(夹)移动
         * @param document 待移动文件(夹)的信息
         */
        const move = (document)=>{
            currentMoveDocument.value = document;
            folderSelectRef.value.showFolderDialog(currentFolder.dirId);
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
            const {curFolder,curCategory} = data;
            currentFolder.dirId = curFolder;
            showLoading.value = true;
            category.value = curCategory;
            loadDataList();
        };

        /**预览文件
         * @param document 待预览文件的信息
         */
        const preview = (document)=>{
            //访问文件夹,切换导航栏
            if(document.isFolder){
                navigationRef.value.openFolder(document);
                return;
            }
            //预览文件
            previewRef.value.showPreview(document,0);
        };

        /**目标文件夹选中后的回调 
         * @param dirId 选中的目录的id
        */
        const moveDone = async (dirId)=>{
            if(currentFolder.dirId == dirId || currentMoveDocument.pid == dirId){
                Message.warning("文件正在当前文件夹,无需移动");
                return;
            }
            let fileIds = [];
            let dirIds = [];
            //判断是单个文件移动还是批量移动
            if(currentMoveDocument.value.id)
                fileIds.push(currentMoveDocument.value.id);
            else{
                dirIds = dirIds.concat(selectedDirIdList.value);
                fileIds = fileIds.concat(selectedFileIdList.value);
                selectedFileIdList.value = [];
                selectedDirIdList.value = [];
            }

            let result = await Request({
                url: api.changeFolder,
                params: {
                    dirId: dirId,
                    dirIds: dirIds,
                    fileIds: fileIds
                }
            });
            if(!result)
                return;
            folderSelectRef.value.close();
            loadFileList();
        };
    };
</script>

<style lang="scss" scoped>
@import "../../assets/file-list.scss";
</style>