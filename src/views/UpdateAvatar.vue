<!-- 更新头像的对话框页面 -->
<template>
   <Dialog :show="dialogConfig.show" :title="dialogConfig.title" :buttons="dialogConfig.buttons"
        width="500px" :showCancel=true @close="dialogConfig.show=false">
        <el-form :model="formData" ref="formDataRef" label-width="80px" @submit.prevent>
            <el-form-item label="昵称" prop="">
                {{ formData.nickName }}
            </el-form-item>
            <el-form-item label="头像" prop="">
                <!-- 上传头像组件 -->
                <AvatarUpload v-model="formData.avatar"></AvatarUpload>
            </el-form-item>
        </el-form>
   </Dialog>
</template>

<script setup>
    import AvatarUpload from "@/components/AvatarUpload.vue";
    import {ref,reactive,inject} from 'vue'
    
    /**页面相关 */

    const api = {
        updateAvatar: "/user/updateAvatar"
    };

    const Cookies = inject('$cookies');
    const Request = inject('$request');

    /**表单绑定数据 */
    const formData = reactive({
        nickName: "",
        /**注意与上传头像组件双向绑定 */
        avatar: {
            userId: "",
            avatarFile: null
        }
    })
    /**表单元素的ref */
    const formDataRef = ref();

    /**定义Framework.vue会调用的updateAvatar事件 */
    const emit = defineEmits(['updateAvatar']);


    /**功能相关 */

    /**对话框的配置 */
    const dialogConfig = reactive({
        show: false,
        title: "修改头像",
        buttons: [{
            type: "primary",
            text: "确定",
            click: ()=>{
                submitForm();
            }
        }]
    });

    /**
     * 暴露Framework.vue会调用的show函数   
     * 用于在上层显示该组件
     * @param userinfo 传递的用户数据,UserInfo类实例
     *  */
    const show = (userInfo)=>{
        //初始化formData
        formData.nickName = userInfo.nickName;
        formData.avatar.userId = userInfo.userId;
        formData.avatar.avatarFile = userInfo.avatar;
        //显示对话框(组件)
        dialogConfig.show = true;
    }
    defineExpose({show});

    /**"确定"按钮的响应动作 */
    const submitForm = async ()=>{
        if(!(formData.avatar instanceof File)){
            dialogConfig.show = false;
        }
        //post请求,发送上传头像文件
        console.log("avatar",formData.avatar);
        let result = await Request({
            url: api.updateAvatar,
            params: {
                avatar: formData.avatar
            }
        });
        if(!result)
            return;
        dialogConfig.show = false;
        const userInfo = Cookies.get("userInfo");
        delete userInfo.avatar;
        Cookies.set("userInfo",userInfo,0);
        //调用上层绑定到updateAvatar事件的函数,即reloadAvatar
        emit("updateAvatar");
    };
</script>

<style scoped>
</style>