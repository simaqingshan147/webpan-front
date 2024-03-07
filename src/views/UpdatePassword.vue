<!-- 修改密码页面 -->
<template>
    <el-dialog v-model="diglogConfig.show" :title="diglogConfig.title" width="500px"
        showCancel=true @close="diglogConfig.show=false">
        <el-form :model="formData" :rules="rules" ref="formDataRef"
            label-width="80px" @submit.prevent>
            <el-form-item label="新密码" prop="password">
                <el-input type="password" size="large" placeholder="请输入密码" v-model="formData.password"
                    show-password>
                    <template #prefix>
                        <span class="iconfont icon-password"></span>
                    </template>
                </el-input>
            </el-form-item>
            <el-form-item label="确认密码" prop="rePassword">
                <el-input type="password" size="large" placeholder="请再次输入密码" v-model="formData.rePassword">
                    <template #prefix>
                        <span class="iconfont icon-password"></span>
                    </template>
                </el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="submitForm()">
                    确定
                </el-button>
            </el-form-item>
        </el-form>
    </el-dialog>
</template>

<script setup>
    import { ref,nextTick,reactive,inject } from 'vue';
    import { md5 } from 'js-md5';
    const Verify = inject('$verify');
    const Request = inject('$request');
    const Message = inject('$message');

    const api = {
        updatePwd: "/user/updatePwd"
    };

    const checkRePwd = (rule,val,callback)=>{
        if(val != formData.rePassword){
            callback(new Error(rule.message));
        }else
            callback();
    }

    /**表单数据校验规则 */
    const rules = {
        password: [
            {
                required: true,
                message: "请输入密码"
            },
            {
                validator: Verify.password,
                message: "密码只能是数字，字母，特殊字符 8-18位"
            }
        ],
        rePassword: [
            {
                required: true,
                message: "请确认密码"
            },
            {
                validator: checkRePwd,
                message: "两次输入密码不一致"
            }
        ]
    };

    const formData = reactive({
        password: "",
        rePassword: ""
    });
    const formDataRef = ref();

    const diglogConfig = reactive({
        show: false,
        title: "修改密码"
    });

    /**暴露给父组件的show函数 */
    const show = ()=>{
        diglogConfig.show = true;
        nextTick(()=>{
            formDataRef.value.resetFields();
            formData.password = "";
            formData.rePassword = "";
        });
    };
    defineExpose({show});

    const submitForm = async ()=>{
        formDataRef.value.validate(async (valid)=>{
            if(!valid)
                return;
            //加密新密码
            formData.password = md5(formData.password);
            let result = await Request({
                url: api.updatePwd,
                params:{
                    newPassword: formData.password
                }
            });
            if(!result)
                return;
            diglogConfig.show = false;
            Message.success("密码修改成功");
        });
    };
</script>

<style scoped>
</style>