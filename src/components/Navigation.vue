<!-- 导航栏子组件 -->
<template>
    <div class="top-navigation">
        <template v-if="folderList.length > 0">
            <!-- 后退 -->
            <span class="back link" @click="backParent">
                返回上一级
            </span>
            <!-- 垂直分割线 -->
            <el-divider direction="vertical" />
        </template>
        <span v-if="folderList.length == 0" class="all-file">
            全部文件
        </span>
        <!-- 首页 -->
        <span class="link" @click="setCurrentFolder(-1)" v-if="folderList.length > 0">
            全部文件
        </span>
        <template v-for="(dirIdAndName,index) in folderList">
            <span class="iconfont icon-right"></span>
            <span class="link" @click="setCurrentFolder(index)"
                v-if="index < folderList.length-1">
                {{ dirIdAndName.dirName }}
            </span>
            <span v-if="index == folderList.length -1" class="text">
                {{ dirIdAndName.dirName }}
            </span>
        </template>
    </div>
</template>

<script setup>
    import {ref,reactive,watch,inject} from 'vue';
    import {useRoute,useRouter} from 'vue-router';

    const Request = inject("$request");
    const Route = useRoute();
    const Router = useRouter();

    const api = {
        getFolderInfo: "/file/getFolderInfo",
        getFolderInfo4Share: "/webShare/getFolderInfo"
    }

    const props = defineProps({
        /**是否监听路径变化 */
        watchPath:{
            type: Boolean,
            default: true
        },
        /**文件分享id */
        shareId:{
            type: Number
        },
        /**是否显示管理员 */
        adminShow:{
            type: Boolean,
            default: false
        }
    });

    /*****************功能相关**********************/
    
    /**当前页面的分类 */
    const category = ref("");

    /**目录列表 */
    const folderList = ref([]);

    /**当前目录 */
    const currentFolder = reactive({
        dirId: 0
    });

    /**定义navChange事件   
     * 父组件更改分类或当前目录,刷新文件列表
    */
    const emit = defineEmits(['navChange']);

    /**执行父组件绑定在navChange事件上的函数 */
    const doCallback = ()=>{
        emit("navChange",{
            curFolder: currentFolder.dirId,
            curCategory: category.value
        });
    };

     /**暴露给父组件的初始化函数 */
     const init = ()=>{
        folderList.value = [];
        currentFolder.dirId = 0;
        doCallback();
    };

    /**设置url路径并跳转,触发监控,刷新目录和分类 */
    const setPath = ()=>{
        if(!props.watchPath){
            doCallback();
            return;
        }

        let pathArray = [];
        folderList.value.forEach((item)=>{
            pathArray.push(item.dirId);
        });

        let query = "";
        if(pathArray.length > 0)
            query = {path:pathArray.join("/")};
        Router.push({
            path: Route.path,
            query: query
        });
    };

    /**暴露给父组件,打开对应目录
     * @param document 对应目录的信息
     */
    const openFolder = (document)=>{
        const {id,name} = document;
        const dirIdAndName = {
            dirName: name,
            dirId: id
        };
        folderList.value.push(dirIdAndName);
        currentFolder.dirId = id;
        setPath();
    };
    defineExpose({openFolder,init});


    /**设置当前目录 */
    const setCurrentFolder = (index)=>{
        if(index == -1){
            currentFolder.dirId = 0;
            folderList.value = [];
        }else{
            currentFolder.dirId = folderList.value[index].dirId;
            //清空index后的子目录信息
            folderList.value.splice(index+1,folderList.value.length);
        }
        setPath();
    };

    /**后退 */
    const backParent = ()=>{
        let curIndex = null;
        //寻找当前目录在列表中的索引
        for(let i=0;i<folderList.value.length;i++){
            if(currentFolder.dirId == folderList.value[i].dirId){
                curIndex = i;
                break;
            }
        }
        //从当前目录后退
        setCurrentFolder(curIndex-1);
    };

    /**获取当前路径末尾的目录信息
     * @param path 文件目录,形如/dirId/dirId/dirId
     */
     const getNavigationFolder = async(path)=>{
        let url = api.getFolderInfo;
        if(props.shareId)
            url = api.getFolderInfo4Share;

        let result = await Request({
            url: url,
            params:{
                path: path,
                shareId: props.shareId
            }
        });
        if(!result)
            return;
        folderList.value = result.data;
    };

    /**监视路由变化,同步更新目录信息*/
    watch(
        ()=>Route,
        (newVal,oldVal)=>{
            if(!props.watchPath)
                return;
            //只有首页,分享,管理员界面需监听
            let path = newVal.path;
            if(path.indexOf("/main") == -1 && path.indexOf("/admin") == -1 && path.indexOf("/share") == -1){
                return;
            }
            //注意这个path是dirId组成的,不是目录名组成
            const toPath = newVal.query.path;
            const toCategory = newVal.params.category;
            category.value = toCategory;
            if(toPath == undefined)
                init();
            else{
                //刷新目录
                getNavigationFolder(toPath);
                //设置当前目录
                let pathArr = toPath.split("/");
                currentFolder.dirId = pathArr[pathArr.length-1];
                doCallback();
            }
        },
        {
            immediate: true,
            deep: true
        }
    )
</script>

<style lang="scss" scoped>
.top-navigation {
  font-size: 13px;
  display: flex;
  align-items: center;
  line-height: 40px;
  .all-file {
    font-weight: bold;
  }
  .link {
    color: #06a7ff;
    cursor: pointer;
  }
  .icon-right {
    color: #06a7ff;
    padding: 0px 5px;
    font-size: 13px;
  }
}
</style>