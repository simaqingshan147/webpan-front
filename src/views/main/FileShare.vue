<!-- 文件分享页面,弹窗选择分享信息 -->
<template>
    <Dialog
        :show="dialogConfig.show"
        :title="dialogConfig.title"
        :buttons="dialogConfig.buttons"
        width="600px"
        :showCancel="showCancel"
        @close="dialogConfig.show = false"
    >
        <el-form
            :model="formData"
            :rules="rules"
            ref="formDataRef"
            label-width="100px"
            @submit.prevent
        >
            <el-form-item label="文件">
                {{ formData.name }}
            </el-form-item>
            <!-- 分享文件 -->
            <template v-if="showType == 0">
                <el-form-item label="有效期" prop="validType">
                    <el-radio-group v-model="formData.validType">
                        <el-radio :value="VALID_TYPE.day_1.type">1天</el-radio>
                        <el-radio :value="VALID_TYPE.day_7.type">7天</el-radio>
                        <el-radio :value="VALID_TYPE.day_30.type">30天</el-radio>
                        <el-radio :value="VALID_TYPE.forever.type">永久有效</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="提取码" prop="codeType">
                    <el-radio-group v-model="formData.codeType">
                        <el-radio :value="0">自定义</el-radio>
                        <el-radio :value="1">系统生成</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item prop="code" v-if="formData.codeType == 0">
                    <el-input clearable placeholder="请输入5位提取码" maxLength="5" style="width: 130px;"
                        v-model.trim="formData.code">
                    </el-input>
                </el-form-item>
            </template>
            <!-- 显示分享信息 -->
            <template v-else>
                <el-form-item label="分享链接">
                    {{ shareUrl }}{{ shareInfo.shareId }}
                </el-form-item>
                <el-form-item label="提取码">
                    {{ shareInfo.code }}
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="copy">
                        复制链接及提取码
                    </el-button>
                </el-form-item>
            </template>
        </el-form>
    </Dialog>
</template>

<script setup>
    import useClipboard from 'vue-clipboard3';
    import {ref,nextTick,reactive,inject} from 'vue'
    
    const {toClipboard} = useClipboard();

    const Utils = inject("$utils");
    const Message = inject("$message");
    const Verify = inject("$verify");
    const Request = inject("$request");

    /**分享链接前缀 */
    const shareUrl = ref(document.location.origin + "/webShare/");
    /**分享文件有效期类型 */
    const VALID_TYPE = Utils.VALID_TYPE;
    /**检验规则 */
    const rules = {
        validType: [{
                        required:true,
                        message: "请选择有效期"
                    }],
        codeType: [{
                        required:true,
                        message:"请选择提取码类型"
                    }],
        code:[
            {
                required: true,
                message: "请输入提取码"
            },
            {
                validator: Verify.shareCode,
                message: "提取码只能包含数字字母"
            },
            {
                min: 5,
                message: "提取码5位"
            }
        ]
    };
    /**弹窗配置 */
    const dialogConfig = reactive({
        show: false,
        title: "分享",
        buttons: [
            {
                type: "primary",
                text: "确定",
                click: (e)=>{
                    share();
                }
            }
        ]
    });
    /**弹窗是否显示取消按钮 */
    const showCancel = ref(true);
    /**api */
    const api = {
        shareFile: "/share/shareFile"
    };

    /******************功能相关*******************/

    /**展示信息: 0显示文件分享 1显示分享信息 */
    const showType = ref(0);
    /**表单绑定数据 */
    const formData = ref({});
    /**表单绑定的ref */
    const formDataRef = ref();
    /**分享结果 */
    const shareInfo = ref({});

    /**分享按钮的响应,传递分享信息到后端 */
    const share = async ()=>{
        //如果已经有分享结果,分享取消
        if(Object.keys(shareInfo.value).length > 0){
            dialogConfig.show = false;
            return;
        }
        formDataRef.value.validate(async (valid)=>{
            if(!valid)
                return;
            const params = {
                id: formData.value.id,
                folderType: formData.value.folderType == true ? 1 : 0,
                validType: formData.value.validType,
                code: formData.value.code
            };
            let result = await Request({
                url: api.shareFile,
                params: params
            });
            if(!result)
                return;
            //保存分享信息
            shareInfo.value = result.data;
            console.log(result.data);
            //显示分享信息
            showType.value = 1;
            dialogConfig.buttons[0].text = "关闭";
            showCancel.value = false;
        });
    };

    /**暴露给父组件的函数,显示弹窗
     * @param document 父组件传递的文件(夹)信息
     */
    const show = (document)=>{
        showCancel.value = true;
        dialogConfig.show = true;
        showType.value = 0;
        //清空分享结果
        shareInfo.value = {};
        nextTick(()=>{
            formDataRef.value.resetFields();
            //保存文件(夹)信息
            formData.value = Object.assign({},document);
        });
    };
    defineExpose({show});

    /**将分享信息写入剪切板 */
    const copy = async ()=>{
        await toClipboard(
            `链接:${shareUrl.value}${shareInfo.value.shareId} 提取码:${shareInfo.value.code}`
        );
        Message.success("复制成功");
    };
</script>

<style lang="scss" scoped>
</style>