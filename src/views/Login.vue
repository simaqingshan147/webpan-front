<template>
    <div class="login-body">
        <div class="bg"></div>
        <div class="login-panel">
            <el-form class="login-register" :model="formData" :rules="rules" ref="formDataRef">
                <div class="login-title">webpan</div>
                <!--输入邮箱(注册/登录/重置密码)-->
                <el-form-item prop="email">
                    <el-input size="large" clearable placeholder="请输入邮箱" v-model.trim="formData.email">
                        <template #prefix>
                            <span class="iconfont icon-account"></span>
                        </template>
                    </el-input>
                </el-form-item>
                <!-- 输入密码(登录) -->
                <el-form-item prop="password" v-if="opType == 1">
                    <el-input size="large" type="password" placeholder="请输入密码" v-model.trim="formData.password">
                        <template #prefix>
                            <span class="iconfont icon-password"></span>
                        </template>
                    </el-input>
                </el-form-item>
                <!-- 注册或重置密码 -->
                <div v-if="opType == 0 || opType == 2">
                    <!-- 输入邮箱验证码(注册/重置密码) -->
                    <el-form-item prop="emailCode">
                        <div class="send-email-panel">
                            <el-input size="large" placeholder="请输入邮箱验证码" v-model.trim="formData.emailCode">
                                <template #prefix>
                                    <span class="iconfont icon-checkcode"></span>
                                </template>
                            </el-input>
                            <el-button class="send-mail-btn" type="primary" size="large" @click="getEmailCode">
                                获取验证码
                            </el-button>
                        </div>
                    </el-form-item>
                    <!-- 气泡卡片提示 -->
                    <el-popover placement="left" :width="500" trigger="click">
                        <div>
                            <p>1、在垃圾箱中查找邮箱验证码</p>
                            <p>2、在邮箱中头像->设置->反垃圾->白名单->设置邮件地址白名单</p>
                            <p>3、将邮箱【3490139755@qq.com】添加到白名单不知道怎么设置？</p>
                        </div>
                        <template #reference>
                            <span class="a-link" style="font-size: 14px;">
                                未收到邮箱验证码?
                            </span>
                        </template>
                    </el-popover>
                    <!-- 输入昵称(注册) -->
                    <el-form-item prop="nickName" v-if="opType == 0">
                        <el-input size="large" clearable placeholder="请输入昵称" v-model.trim="formData.nickName"
                            maxLength="20">
                            <template #prefix>
                                <span class="iconfont icon-accout"></span>
                            </template>
                        </el-input>
                    </el-form-item>
                    <!-- 输入密码(注册) -->
                    <el-form-item prop="regiterPassword">
                        <el-input size="large" type="password" placeholder="请输入密码" v-model.trim="formData.password"
                            show-password>
                            <template #prefix>
                                <span class="iconfont icon-password"></span>
                            </template>
                        </el-input>
                    </el-form-item>
                    <el-form-item prop="regiterPasswordAgain">
                        <el-input size="large" type="password" placeholder="请再次输入密码" v-model.trim="formData.password2"
                            show-password>
                            <template #prefix>
                                <span class="iconfont icon-password"></span>
                            </template>
                        </el-input>
                    </el-form-item>
                </div>
                <!-- 图片验证码(注册/登录/重置密码) -->
                <el-form-item prop="checkCode">
                    <div class="check-code-panel">
                        <el-input size="large" placeholder="请输入验证码" v-model.trim="formData.checkCode"
                            @keyup.enter="doSubmit">
                            <template #prefix>
                                <span class="iconfont icon-checkcode"></span>
                            </template>
                        </el-input>
                        <img :src="checkCodeUrl" class="check-code" @click="changeCheckcode()" />
                    </div>
                </el-form-item>
                <!-- 免密登录(登录页面相关) -->
                <el-form-item v-if="opType == 1">
                    <div class="remeberme-panel">
                        <el-checkbox v-model="formData.remeberme">记住我</el-checkbox>
                    </div>
                    <div class="no-account">
                        <a href="javascript:void(0)" class="a-link" @click="showPanel(2)">
                            忘记密码?
                        </a>
                        <a href="javascript:void(0)" class="a-link" @click="showPanel(0)">
                            没有账号?
                        </a>
                    </div>
                </el-form-item>
                <!--  转到登录(注册页面相关) -->
                <el-form-item v-if="opType == 0">
                    <a href="javascript:void(0)" class="a-link" @click="showPanel(1)">
                        已有账号?
                    </a>
                </el-form-item>
                <!-- 转到登录(重置密码界面相关) -->
                <el-form-item v-if="opType == 0">
                    <a href="javascript:void(0)" class="a-link" @click="showPanel(1)">
                        去登录
                    </a>
                </el-form-item>
                <!-- 提交 -->
                <el-form-item>
                    <el-button type="primary" class="op-btn" @click="doSubmit" size="large">
                        <span v-if="opType == 0">注册</span>
                        <span v-if="opType == 1">登录</span>
                        <span v-if="opType == 2">重置密码</span>
                    </el-button>
                </el-form-item>
            </el-form>
        </div>
        <!-- 邮箱验证码弹窗 -->
        <Dialog :show="dialogConfig.show" :title="dialogConfig.title" :buttons="dialogConfig.buttons" 
            width="500px" :showCancel=false @close="dialogConfig.show=false">
            <el-form :model="formData4MailCode" :rules="rules" ref="formData4MailCodeRef" label-width="80px"
                @submit.prevent>
                <el-form-item label="邮箱">
                    {{ formData.email }}
                </el-form-item>
                <el-form-item label="验证码" prop="checkCode">
                    <div class="check-code-panel">
                        <el-input size="large" placeholder="请输入验证码" v-model.trim="formData4MailCode.checkCode"
                            @keyup.enter="doSubmit">
                            <template #prefix>
                                <span class="iconfont icon-checkcode"></span>
                            </template>
                        </el-input>
                        <img :src="checkCodeUrl" class="check-code" @click="changeCheckcode()" />
                    </div>
                </el-form-item>
                <span class="diglog-footer">
                    <el-button type="primary" @click="sendMailCode">
                        发送验证码
                    </el-button>
                </span>
            </el-form>
        </Dialog>
    </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted, inject} from "vue";
import { useRouter, useRoute } from "vue-router";
import md5 from "js-md5";

//后端api的uri
const api = {
    //图片验证码
    checkCode: "/api/api/checkCode",
    //邮箱验证码
    emailCode: "/api/emailCode",
    register: "/user/register",
    login: "/user/login",
    resetPwd: "/user/resetPwd"
};

const Verify = inject('$verify');

// 表单校验规则
const rules = {
    email: [
        { required: true, message: "请输入邮箱" },
        { validator: Verify.email, message: "请输入正确的邮箱" }
    ],
    password: [
        { required: true, message: "请输入密码" }
    ],
    emailCode: [
        { required: true, message: "请输入邮箱验证码" }
    ],
    nickName: [
        { required: true, message: "请输入昵称" }
    ],
    registerPassword: [
        { required: true, message: "请输入密码" },
        { validator: Verify.password, message: "密码只能是数字,字母或特殊字符,8-18位" }
    ],
    registerPasswordAgagin: [
        {required: true,message:"请再次输入密码"},
        {validator: (rule,value,callback)=>{
            if(value !== formData.value.password)
                callback(new Error(rule.message));
            else
                callback();},
         message: "两次输入密码不一致"
        }
    ],
    checkCode: [
        { required: true, message: "请输入图片验证码" }
    ]
};

//vue-cookies
const Cookies = inject('$cookies');
//vue-router相关
const Router = useRouter();
const Route = useRoute();
//ajax请求
const Request = inject('$request');
//消息弹窗
const Message = inject('$message');

// 0:register 1:login 2:resetPassword
const opType = ref(1);

//用户信息表单输入数据
const formData = ref({});
//form表单
const formDataRef = ref();

//验证码接口url
let checkCodeUrl = ref();

//邮箱验证码相关

    //邮箱验证码表单输入数据
const formData4MailCode = ref({
    email: null,
    checkCode: null
});
    //邮箱验证码表单
const formData4MailCodeRef = ref();

const dialogConfig = reactive({
    show: false,
    title: "发送邮箱验证码",
    buttons: [{
        type: "primary",
        text: "发送验证码",
        click: ()=>{
            sendMailCode();
        }
    }]
});

const changeCheckcode = ()=>{
    let now = new Date();
    checkCodeUrl.value = api.checkCode + '?time=' + now.getTime();
}
    //点击获取邮箱验证码
const getEmailCode = ()=>{
    formDataRef.value.validateField("email",(valid)=>{
        if(!valid)
            return;
        dialogConfig.show = true;

        nextTick(()=>{
            //再次获取时,清空邮箱验证码表单
            changeCheckcode();
            formData4MailCodeRef.value.resetFields();
            formData4MailCode.value.email = formData.value.email;
        });
    });
}

    //发送邮箱验证码
const sendMailCode = ()=>{
    console.log('666');
    formData4MailCodeRef.value.validate(async (valid)=>{
        if(!valid)
            return;
        const params = Object.assign({},formData4MailCode.value);
        //邮箱验证码类型: 0注册 1:重置密码
        params.type = opType.value == 0 ? 0 : 1;
        let result = await Request({
            url: api.emailCode,
            params: params,
            errorCallback: ()=>{
                changeCheckcode();
            }
        });
        if(!result)
            return;
        Message.success("验证码发送成功,请登录邮箱查看");
        dialogConfig.show = false;
    });
};


//重置展示界面(登录)和表单数据
const showPanel = (type) => {
    opType.value = type;
    //重置表单
    nextTick(() => {
        changeCheckcode();
        formDataRef.value.resetFields();  //清空表单
        formData.value = {};              //清空数据

        //免密登录
        if (opType.value == 1) {
            const loginInfo = Cookies.get("loginInfo");
            if (loginInfo)
                formData.value = loginInfo;
        }
    })
}

//提交表单
const doSubmit = ()=>{
    formDataRef.value.validate(async (valid)=>{
        if(!valid)
            return;
        let params = Object.assign({},formData.value);
        //md5加密密码
        params.password = md5(params.password);
        
        let url = "";
        switch(opType.value){
            case 0:
                url = api.register;break;
            case 1:
                url = api.login;break;
            case 2:
                url = api.resetPwd;break;
            default:
                break;
        }
        let result = await Request({
                url: url,
                params: params,
                errorCallback: () => {
                    changeCheckcode();
                    formDataRef.value.resetFields();
                }
        });
        if(!result)
            return;

        //注册返回
        if(opType.value == 0){
            Message.success("注册成功,请登录");
            showPanel(1);
        //登录返回
        }else if(opType.value == 1){
            if(params.remeberme) {
                const loginInfo = {
                    email: params.email,
                    password: params.password,  //cookie中保存md5加密密码
                    remeberme: params.remeberme
                };
                Cookies.set("loginInfo",loginInfo,"7d");
            }else {
                Cookies.remove("loginInfo");
            }
            //存储userInfo
            Cookies.set("userInfo",result.data,0);
            //重定向到首页
            const redirectUrl = Route.query.redirectUrl || "/";
            Router.push(redirectUrl);
        //重置密码返回
        }else if(opType == 2){
            Message.success("重置密码成功,请登录");
            showPanel(1);
        }
    })
};

onMounted(() => showPanel(1))
</script>

<style lang="scss" scoped>
.login-body {
    height: calc(100vh);
    background-size: cover;
    background: url("../assets/login_bg.jpg");
    display: flex;

    .bg {
        flex: 1;
        background-size: cover;
        background-position: center;
        background-size: 800px;
        background-repeat: no-repeat;
        background-image: url("../assets/login_img.png");
    }

    .login-panel {
        width: 430px;
        margin-right: 15%;
        margin-top: calc((100vh - 500px) / 2);

        .login-register {
            padding: 25px;
            background: #fff;
            border-radius: 5px;

            .login-title {
                text-align: center;
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 20px;
            }

            .send-email-panel {
                display: flex;
                width: 100%;
                justify-content: space-between;

                .send-email-btn {
                    margin-left: 5px;
                }
            }

            .remeberme-panel {
                width: 100%;
            }

            .no-account {
                width: 100%;
                display: flex;
                justify-content: space-between;
            }

            .op-btn {
                width: 100%;
            }
        }
    }

    .check-code-panel {
        width: 100%;
        display: flex;

        .check-code {
            margin-left: 5px;
            cursor: pointer;
        }
    }

    .login-btn-qq {
        margin-top: 20px;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;

        img {
            cursor: pointer;
            margin-left: 10px;
            width: 20px;
        }
    }
}
</style>