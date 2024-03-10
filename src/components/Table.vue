<!-- 文件分页显示组件 -->
<template>
    <el-table
        ref="dataTableRef"
        :data="dataSource.list || []"
        :height="tableHeight"
        :stripe="options.stripe"
        :border="options.border"
        header-row-class-name="table-header-row"
        highlight-current-row
        @row-click="handleRowClick"
        @selection-change="handleSelectionChange"
    >
        <!-- 选择框 -->
        <el-table-column
            v-if="options.selectType && options.selectType == 'checkbox'"
            type="selection"
            :width="50" 
            align="center"
        >
        </el-table-column>
        <!-- 序号 -->
        <el-table-column 
            v-if="options.showIndex" 
            label="序号" 
            type="index" 
            :width="60" 
            align="center"
        >
        </el-table-column>
        <!-- 文件列 -->
        <template v-for="(column,index) in columns">
            <template v-if="column.scopedSlots">
                <el-table-column 
                    :key="index"
                    :prop="column.prop"
                    :label="column.label"
                    :align="column.align || 'left'"
                    :width="column.width"
                >
                    <template #default="scope">
                        <slot 
                            :name="column.scopedSlots"
                            :index="scope.$index"
                            :row="scope.row"
                        >
                        </slot>
                    </template>
                </el-table-column>
            </template>
            <template v-else>
                <el-table-column 
                    :key="index"
                    :prop="column.prop"
                    :label="column.label"
                    :align="column.align || 'left'"
                    :width="column.width"
                >
                </el-table-column>
            </template>
        </template>
    </el-table>
    <!-- 分页 -->
    <div class="pagination" v-if="showPagination">
            <el-pagination
                v-if="dataSource.totalCount && dataSource.totalCount > 0"
                background
                :total="dataSource.totalCount"
                :page-sizes="[15,30,50,100]"
                :page-size="dataSource.pageSize"
                :current-page.sync="dataSource.pageNo"
                :layout="layout" 
                style="text-align: right;"
                @size-change="handlePageSizeChange"
                @current-change="handlePageNoChange"
            >
            </el-pagination>
        </div>
</template>

<script setup>
    import {ref,computed,inject} from 'vue'
    const Message = inject("$message");

    /******************* 暴露给父组件 *******************/

    /**定义暴露给父组件的属性 */
    const props = defineProps({
        /**PagedResult类实例,包含分页数据 */
        dataSource: Object,
        /**是否显示分页 */
        showPagination:{
            type: Boolean,
            default: true
        },
        /**是否显示每页记录数 */
        showPageSize: {
            type: Boolean,
            default: true
        },
        options:{
            type: Object,
            default:{
                extHeight: 0,
                showIndex: false
            }
        },
        columns: Array,
        /**父组件传递的获取列表函数 */
        fetch: Function,
        initFetch:{
            type: Boolean,
            default: true
        }
    });

    /**el-tabel的引用 */
    const dataTableRef = ref();

    /**设置行选中 */
    const setCurrentRow = (rowKey,rowVal) => {
        let row = props.dataSource.list.find((item)=>{
            return item[rowKey] === rowVal;
        });
        dataTableRef.value.setCurrentRow(row);
    };

    /**清除选中 */
    const clearSelection = () => {
        dataTableRef.value.clearSelection();
    };
    /** 暴露选中和清除选中*/
    defineExpose({setCurrentRow,clearSelection});

    /**************** 页面布局 ***********************/

    const layout = computed(()=>{
        return `total, ${props.showPageSize ? "sizes" : ""},prev,pager,next,jumper`;
    })
    //顶部 60 , 内容区域距离顶部 20， 内容上下内间距 15*2  分页区域高度 46
    const topHeight = 60 + 20 + 30 + 46;
    //页面高度
    const tableHeight = ref(
        props.options.tableHeight
        ? props.options.tableHeight
        : window.innerHeight - topHeight - props.options.extHeight
    );

    /**初始化 */
    const init = ()=>{
        console.log(props);
        if(props.initFetch && props.fetch)
            props.fetch();
    };
    init();

    /**定义事件,传递数据给父组件 */
    const emit = defineEmits(["rowSelected","rowClick"]);

    /**行的点击 */
    const handleRowClick = (row)=>{
        emit("rowClick",row);
    }

    /**多选 */
    const handleSelectionChange = (row)=>{
        emit("rowSelected",row);
    }

    /**切换pageSize */
    const handlePageSizeChange = (size)=>{
        if(size > 5){
            props.dataSource.pageSize = size;
            props.dataSource.pageNo = 1;
            props.fetch();
        }
        else{
            Message.warning("每页大小不能小于5条/页");
        }
    };

    /**切换pageNo */
    const handlePageNoChange = (pageNo) =>{
        if(pageNo > 0 && pageNo < props.dataSource.pageTotal){
            props.dataSource.pageNo = pageNo;
            props.fetch();
        }
    };
</script>

<style lang="scss" scoped>
.pagination {
    padding-top: 10px;
    padding-right: 10px;
}
.el-pagination {
    justify-content: right;
}

:deep(.el-table__cell) {
    padding: 4px 0px;
}
</style>