import { createApp } from 'vue'
import App from '@/App.vue'

import Router from '@/router'
import VueCookies from 'vue-cookies'

//工具相关
import Verify from '@/utils/Verify'
import Request from '@/utils/Request'
import Message from '@/utils/Message'
import Confirm from '@/utils/Confirm'
import Utils from '@/utils/Utils'

//样式相关
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import '@/assets/icon/iconfont.css'
import '@/assets/base.scss'

//自定义组件
import Dialog from '@/components/Dialog.vue'
import AvatarUpload from '@/components/AvatarUpload.vue'
import Avatar from '@/components/Avatar.vue'
import Icon from '@/components/Icon.vue'
import Nodata from '@/components/Nodata.vue'

const app = createApp(App);

app.use(ElementPlus);
app.use(Router);

//配置全局组件
app.component("Dialog",Dialog);
app.component("AvatarUpload",AvatarUpload);
app.component("Avatar",Avatar);
app.component("Icon",Icon);
app.component("Nodata",Nodata);

//配置全局变量
app.provide('$request',Request);
app.provide('$cookies',VueCookies);
app.provide('$verify',Verify);
app.provide('$message',Message);
app.provide('$confirm',Confirm);
app.provide('$utils',Utils);

app.mount('#app');
