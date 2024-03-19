<template>
    <div class="gradient"></div>
    <div class="login-body">
        <div class="bg">
            <div class="banner-title">
                webpan
                <br/>
                电脑高效拍档 一键存爽快看
            </div>
            <div class="feature-label">
                <div class="feature-content">
                    <img src="../assets/download.png" alt="超大空间，超速下载">
                    <div class="feature-desc">超大空间，超速下载</div>
                </div>
                <div class="feature-content">
                    <img src="../assets/share.png" alt="PDF一键转换、编辑">
                    <div class="feature-desc">高速分享</div>
                </div>
                <div class="feature-content">
                    <img src="../assets/video.png" alt="超级播放器，升级AI字幕">
                    <div class="feature-desc">57种文件在线预览</div>
                </div>
            </div>
        </div>
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
                            <p>3、将邮箱【3490139755@qq.com】添加到白名单</p>
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
                    <!-- <div class="remeberme-panel">
                        <el-checkbox v-model="formData.remeberme">记住我</el-checkbox>
                    </div> -->
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
                <!-- <span class="diglog-footer">
                    <el-button type="primary" @click="sendMailCode">
                        发送验证码
                    </el-button>
                </span> -->
            </el-form>
        </Dialog>
    </div>
    <div class="footer" :style="{ position: (opType == 1 ? 'fixed' : 'static') }">
        <div class="website-info">
    
            <div class="about">
                <h4>关于本站</h4>
                <p>1.基于springboot+vue3开发</p>
                <p>2.新疆大学 毕设作品</p>
            </div>
    
            <div class="response hidden-xs">
                <h4>建议反馈</h4>
                <p>1.欢迎注册使用</p>
                <p>2.可在相应的仓库<a href="https://github.com/simaqingshan147/webpan">webpan</a>下issue</p>
                <p>3.发邮件到3490139755@qq.com</p>
            </div>
    
            <div class="contact hidden-xs hidden-sm">
                <h4>欢迎联系</h4>
                <p> <img style="height: 20px;" src="../assets/wechat.png" alt="qq">: 13476200991</p>
                <p><img style="height: 20px;" src="../assets/github.png" alt="github">: <a href="https://github.com/simaqingshan147">https://github.com/simaqingshan147</a></p>
            </div>
    
        </div>
    
        <div class="copyright">
            <span>Welcome to visit my website © Feng Junjie</span>
        </div>
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
            const userInfo = Cookies.get("userInfo");
            if(userInfo) {
                Router.push("/");
                return;
            }
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
            //存储userInfo
            Cookies.set("userInfo",result.data,"0");
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
  .gradient {
    width:100%;
    height: 100%;
    left: 0;
    top: 0;
    z-index: -1;
    position: fixed;
    display: block;
    background: linear-gradient(135deg, #c7e9fb, #a6defa, #80d4f9, #5bc9f8, #35bef7);;
    background-size: 600% 600%;
    animation: gradientBG 5s ease infinite;
  }

  @keyframes gradientBG {
    0% {
        background-position: 0% 50%;
    }
    50% {
        background-position: 100% 50%;
    }
    100% {
        background-position: 0% 50%;
    }
  }
.login-body {
    height: calc(100vh);
    background-size: cover;  
    display: flex;

    .bg {
        flex: 1;
        display: flex;
        background-size: cover;
        background-position: center;
        background-size: 800px;
        background-repeat: no-repeat;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        background-image: url("https://image.quark.cn/s/uae/g/3o/broccoli/resource/202311/1c69d780-8368-11ee-8302-1dc72091cc01.png");
        // background-image: url("../assets/login_img.png");

        .banner-title {
            font-size: 50px;
            font-weight: 600;
            line-height: 69px;
            color: black;
        }

        .feature-label {
            margin-top: 70px;
            display: flex;
            height: 24px;
            line-height: 24px;

            .feature-content {
                display: flex;
                align-items: center;
                margin-left: 15px;

                img{
                    height: 40px;
                    width: 40px;
                }

                .feature-desc {
                    color: #52565e;
                    font-size: 16px;
                    font-weight: 500;
                    margin-left: 8px;
                }
            }
        }
    }

    .login-panel {
        width: 430px;
        margin-right: 15%;
        margin-top: calc((100vh - 500px) / 2);

        .login-register {
            padding: 25px;
            background: #fff;
            border-radius: 25px;

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
}

.footer{
    width: 100%;
    position: fixed;
    bottom: 0;
}
 
.website-info{
    overflow: hidden;
    padding-left: 10%;
}
 
.website-info h4{
    padding-bottom: 3px;
    color: #424242;
    font-weight: bold;
    border-bottom: 1px solid #aaa;
}
 
.about, .response, .contact{
    float: left;
    margin-right: 10%;
    margin-left: 2% ;
    font-size: 0.75em;
}
 
.about p, .response p, .contact p{
    margin-bottom: 0.2em;
}
 
.copyright{
    text-align: center;
    padding: 0.5em 0;
    //background: #4F5893;
    color: #e7e7e7;
    bottom: 10em;
}
 
.copyright a{
    color: #fff;
    margin-left: 1em;
}
 
.copyright a:hover{
    color: cyan;
}
</style>