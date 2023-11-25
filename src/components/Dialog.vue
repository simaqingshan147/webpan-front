<!-- 弹窗组件 -->
<template>
    <el-dialog :show-close="showClose" :draggable=true :model-value="show"
        :close-on-click-modal=false :title="title" class="cust-dialog" :top="top + 'px'"
        :width="width" @close="close">
        <div class="dialog-body" :style="{'max-height': maxHeight+'px',padding: padding + 'px'}">
            <slot></slot>
        </div>
        <template v-if="(buttons && buttons.length>0) || showCancel">
            <div class="dialog-footer">
                <el-button link @click="close" v-if="showCancel">
                    取消
                </el-button>
                <el-button v-for="btn in buttons" :type="btn.type || 'primary'" @click="btn.click">
                    {{ btn.text }}
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup>
    const props = defineProps({
        /**弹窗标题 */
        title:{
            type:String,
            default: "标题"
        },
        /**弹窗是否显示 */
        show:{
            type:Boolean,
            default: false
        },
        showClose:{
            type:Boolean,
            default:true
        }
        ,
        /**是否显示取消按钮 */
        showCancel:{
            type: Boolean,
            default: true
        },
        /**dialog CSS 中的 margin-top 值 */
        top:{
            type: Number,
            default: 50
        },
        width:{
            type: String,
            default: "30%"
        },
        padding:{
            type: Number,
            default: 15
        },
        buttons:{
            type:Array
        }
    });
    const maxHeight = window.innerHeight - props.top - 100;
    const emit = defineEmits(['close']);
    const close = ()=>{
        emit("close");
    }
</script>

<style lang="scss" scoped>
.cust-dialog {
  margin: 30px auto 10px !important;
  .el-dialog__body {
    padding: 0px;
  }
  .dialog-body {
    border-top: 1px solid #ddd;
    border-bottom: 1px solid #ddd;
    min-height: 80px;
    overflow: auto;
  }
  .dialog-footer {
    text-align: right;
    padding: 5px 20px;
  }
}
</style>