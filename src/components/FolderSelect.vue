<!-- 选择目录的弹窗组件 -->
<template>
    <Dialog :show="dialogConfig.show" :title="dialogConfig.title" :buttons="dialogConfig.buttons"
        width="600px" :showCancel="true" @close="close">
        <div class="navigation-panel">
            <Navigation ref="navigationRef" @navChange="navChange" :watchPath="false">
            </Navigation>
        </div>
        <div class="folder-list" v-if="folderList !== undefined && folderList.length > 0">
            <div class="folder-item" v-for="document in folderList" @click="selectFolder(document)">
                <Icon :fileType="0"></Icon>
                <span class="file-name">{{ document.name }}</span>
            </div>
        </div>
        <div v-else class="tips">
            移动到当前文件夹
        </div>
    </Dialog>
</template>

<script setup>
    import {ref,nextTick,reactive,inject} from 'vue';
    const Request = inject("$request");

    const api = {
        loadAllFolder: "/file/getAllFolder"
    };

    /**导航栏的ref */
    const navigationRef = ref();

    /**选中目录 */
    const selectedFolder = reactive({
        dirId: 0,
        dirName: ""
    });

    /**可选择的所有目录集合 */
    const folderList = ref([]);

    /**通过showFolderDialog函数传递的不显示的目录id集合 */
    const excludeDirIdList = ref([]);

    /**加载所有可选目录 */
    const loadAllFolder = async ()=>{
        let result = Request({
            url: api.loadAllFolder,
            params: {
                pid: selectedFolder.dirId,
                checkedDirIds: excludeDirIdList.value
            }
        });
        if(!result)
            return;
        folderList.value = result.data;
    };

    /**暴露函数 */

    /**暴露给父组件的方法,关闭弹窗 */
    const close = ()=>{
        dialogConfig.show = false;
    };

    /**暴露给父组件的方法,显示弹窗
     * @param curFolder 单文件移动时该文件的目录id,或者是待移动目录的id数组
     */
    const showFolderDialog = (curFolder) =>{
        dialogConfig.show = true;
        if(curFolder instanceof String) {
            excludeDirIdList.value.push(curFolder);
        } else if(curFolder instanceof Array) {
            excludeDirIdList.value = curFolder;
        }
        selectedFolder.dirId = 0;
        nextTick(()=>{
            navigationRef.value.init();
        })
    }
    defineExpose({showFolderDialog,close});

    /*打开目录
     * @param document 选中目录的信息
     */
    const selectFolder = (document)=>{
        navigationRef.value.openFolder(document.id);
    };

    /**打开目录后的后调
     * @param data 包含打开目录的dirId
     */
    const navChange = (data)=>{
        const {curFolder} = data;
        //打开目录后,如果此时确认,就是选中该目录
        selectedFolder.dirId = curFolder;
        loadAllFolder();
    };

    /**定义事件 */
    const emit = defineEmits(["folderSelect"]);
    /**触发父组件传递的事件函数   
     * 返回选中目录的dirId给父组件
    */
    const folderSelect = ()=>{
        emit("folderSelect",selectedFolder.dirId);
    };

    /**弹窗设置 */
    const dialogConfig = reactive({
        show: false,
        title: "移动到",
        buttons:[
            {
                type: "primary",
                click: ()=>{
                    folderSelect();
                },
                text: "移动到此"
            }
        ]
    });


</script>

<style lang="scss" scoped>
.navigation-panel {
  padding-left: 10px;
  background: #f1f1f1;
}
.folder-list {
  .folder-item {
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 10px;
    .file-name {
      display: inline-block;
      margin-left: 10px;
    }
    &:hover {
      background: #f8f8f8;
    }
  }
  max-height: calc(100vh - 200px);
  min-height: 200px;
}
.tips {
  text-align: center;
  line-height: 200px;
  span {
    color: #06a7ff;
  }
}
</style>