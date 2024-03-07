<!-- 用户界面框架 -->
<template>
    <div class="framework">
        <div class="header">
            <div class="logo">
                <span class="iconfont icon-pan"></span>
                <span class="name">webpan</span>
            </div>
            <!-- 状态栏 -->
            <div class="right-panel">
                <!-- 上传界面 -->
                <el-popover :width="800" trigger="click" v-model:visible="showUploader" :offset="20" transition="none"
                    :hide-after="0" popper-style="padding: 0px">
                    <template #reference>
                        <span class="iconfont icon-transfer"></span>
                    </template>
                    <template #default>
                        <!-- 自定义文件上传组件 -->
                        <Uploader ref="uploaderRef" @uploadCallback="uploadCallbackHandler">
                        </Uploader>
                    </template>
                </el-popover>
                <!-- 下拉栏:用户信息 -->
                <el-dropdown>
                    <div class="user-info">
                        <div class="avatar">
                            <Avatar :userId="userInfo.userId" :avatar="userInfo.avatar" :timestamp="timestamp"
                                :width=46>
                            </Avatar>
                        </div>
                        <div class="nick-name">{{ userInfo.nickName }}</div>
                    </div>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item @click="updateAvatar">
                                修改头像
                            </el-dropdown-item>
                            <el-dropdown-item @click="updatePassword">
                                修改密码
                            </el-dropdown-item>
                            <el-dropdown-item @click="logout">
                                退出
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </div>
        </div>
        <!-- 主界面 -->
        <div class="body">
            <!-- 功能界面 -->
            <div class="left-sider">
                <div class="menu-list">
                    <template v-for="item in menus">
                        <!-- 功能 -->
                        <div v-if="item.allShow || (!item.allShow && userInfo.admin)"
                            @click="jump(item)"
                            :class="[
                                'menu-item',
                                item.menuCode == currentMenu.menuCode ? 'active' : ''
                            ]">
                            <!-- 功能图标 -->
                            <div :class="['iconfont','icon-'+item.icon]"></div>
                            <!-- 功能名 -->
                            <div class="text">{{ item.name }}</div>
                        </div>
                    </template>
                </div>
                <!-- 子功能界面 -->
                <div class="menu-sub-list">
                    <template v-for="sub in currentMenu.children">
                        <!-- 子功能 -->
                        <div @click="jump(sub)"
                            :class="['menu-item-sub',currentPath == sub.path ? 'active' : '']">
                            <!-- 子功能图标 -->
                            <span v-if="sub.icon" :class="['iconfont','icon-'+sub.icon]"></span>
                            <span class="text">{{ sub.name }}</span>
                        </div>
                    </template>
                    <!--其他信息-->
                    <div class="tips" v-if="currentMenu && currentMenu.tips">
                        {{ currentMenu.tips }}
                    </div>
                    <div class="space-info">
                        <div>空间使用</div>
                        <div class="percent">
                            <el-progress color="#409eff"
                                :percentage="Math.floor(useSpaceInfo.useSpace/useSpaceInfo.totalSpace*10000)/100"/>
                        </div>
                        <div class="space-use">
                            <div class="use">
                                {{ Utils.size2Str(useSpaceInfo.useSpace) }} /
                                {{ Utils.size2Str(useSpaceInfo.totalSpace) }}
                            </div>
                            <div class="iconfont icon-refresh" @click="getUseSpace"></div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- 文件界面 -->
            <div class="body-content">
                <router-view v-slot="{Component}">
                    <component
                        @addFile="addFile"
                        ref="routerViewRef"
                        :is="Component"
                        @reload="getUseSpace"
                    />
                </router-view>
            </div>
        </div>
        <!-- 修改头像组件 -->
        <UpdateAvatar ref="updateAvatarRef" @updateAvatar="reloadAvatar">
        </UpdateAvatar>
        <!-- 修改密码组件 -->
        <UpdatePassword ref="updatePwdRef">
        </UpdatePassword>
    </div>
</template>

<script setup>
    import UpdateAvatar from "./UpdateAvatar.vue";
    import UpdatePassword from "./UpdatePassword.vue";
    import Uploader from "@/views/main/Uploader.vue";

    import {ref,nextTick,watch,inject} from 'vue';
    import {useRouter,useRoute} from 'vue-router';

    /**vue-cookies*/
    const Cookies = inject('$cookies');
    /**vue-router*/
    const Router = useRouter();
    /**vue-router的路由*/
    const Route = useRoute();
    /**ajax请求*/
    const Request = inject('$request');
    /**确认框 */
    const Confirm = inject('$confirm');
    const Utils = inject('$utils');

    /************页面相关 *****************/

    /**通过get请求获取的api */
    const api = {
        getUseSpace: "user/getUseSpace",
        logout: "/user/logout"
    };

    /**功能界面(菜单)格式和路径 */
    const menus = [
        {
            icon: "cloude",
            name: "首页",
            menuCode: "main",
            path: "/main/all",
            allShow: true,
            children: [
                {
                    icon: "all",
                    name: "全部",
                    category: "all",
                    path: "/main/all"
                },
                {
                    icon: "video",
                    name: "视频",
                    category: "video",
                    path: "/main/video"
                },
                {
                    icon: "music",
                    name: "音频",
                    category: "music",
                    path: "/main/music"
                },
                {
                    icon: "image",
                    name: "图片",
                    category: "image",
                    path: "/main/image"
                },
                {
                    icon: "doc",
                    name: "文档",
                    category: "doc",
                    path: "/main/doc"
                },
                {
                    icon: "more",
                    name: "其他",
                    category: "others",
                    path: "/main/others"
                }
            ]
        },
        {
            path: "/myshare",
            icon: "share",
            name: "分享",
            menuCode: "share",
            allShow: true,
            children: [{
                name: "分享记录",
                path: "/myshare"
            }]
        },
        {
            path: "/recycle",
            icon: "del",
            name: "回收站",
            menuCode: "recycle",
            tips: "回收站为你保存10天内删除的文件",
            allShow: true,
            children: [{
                name: "删除的文件",
                path: "/recycle"
            }]
        },
        {
            path: "/settings/fileList",
            icon: "settings",
            name: "设置",
            menuCode: "settings",
            allShow: false,
            children: [
                {
                    name: "用户文件",
                    path: "/settings/fileList",
                },
                {
                    name: "用户管理",
                    path: "/settings/userList",
                }
            ]
        }
    ]

    /**当前选中的菜单 */
    const currentMenu = ref({});
    /**当前选中菜单对应的路径 */
    const currentPath = ref();
    /**
     * 切换到指定菜单
     * @param item 目的菜单的格式和路径对象
    */
    const jump = (item) => {
        if(!item.path || item.menuCode == currentMenu.value.menuCode)
            return;
        Router.push(item.path);
    }

    /**设置当前菜单currentMenu */
    const setMenu = (menuCode,path) =>{
        const menu = menus.find((item)=>{
            return item.menuCode === menuCode;
        });
        currentMenu.value = menu;
        currentPath.value = path;
    }

    /**监视1.路由调用;2.菜单的切换 */
    watch(
        () => Route,
        (newVal,oldVal) =>{
            if(newVal.meta.menuCode){
                setMenu(newVal.meta.menuCode,newVal.path);
            }
        },
        {
            immediate: true,
            deep: true
        }
    );
    
    /**************文件上传相关 ********************/

    /**是否显示上传界面 */
    const showUploader = ref(false);
    /**自定义上传组件的ref */
    const uploaderRef = ref();
    /**文件上传完成后的回调 */
    const uploadCallbackHandler = ()=>{
        nextTick(()=>{
            //更新文件界面和用户使用空间
          routerViewRef.value.reload();
          getUseSpace();
        })
    }

    /**************文件界面相关 *********************/

    /**文件界面的ref */
    const routerViewRef = ref();
    /**传递上传文件参数到文件界面 */
    const addFile = (data) => {      
        const {file,dirId} = data;
        showUploader.value = true;
        uploaderRef.value.addFile(file,dirId);
    };

    /***************用户信息相关 ********************/

    /**从cookie中获取的UserInfo类实例 */
    const userInfo = ref(Cookies.get("userInfo"));
    /**用户空间信息,UseSpaceDto类实例*/
    const useSpaceInfo = ref({
        useSpace: 0,
        totalSpace: 1
    });

    /**更新用户空间信息 */
    const getUseSpace = async ()=>{
        let result = await Request({
            url: api.getUseSpace,
            showLoading: false
        });
        if(!result)
            return;
        console.log(result.data);
        useSpaceInfo.value = result.data;
    };

    /**'退出登录'按钮的响应*/
    const logout = ()=>{
        Confirm("你确认要退出吗",async ()=>{
            let result = await Request({
                url: api.logout
            });
            if(!result)
                return;
            Cookies.remove("userInfo");
            Router.push("/login");
        });
    }

    /**修改头像组件的ref */
    const updateAvatarRef = ref();
    /**修改密码组件的ref */
    const updatePwdRef = ref();
    /**调用后端接口可能作为参数传递的时间戳 */
    const timestamp = ref(0);

    /**"修改头像"按钮的响应 */
    const updateAvatar = ()=>{
        updateAvatarRef.value.show(userInfo.value);
    };

    /**传递给更新头像组件的事件 */
    const reloadAvatar = ()=>{
        //更新userInfo(中的avatar路径)
        userInfo.value = Cookies.get("userInfo");
        timestamp.value = new Date().getTime();
    };

    /**"修改密码"按钮的响应 */
    const updatePassword = ()=>{
        updatePwdRef.value.show();
    };

    getUseSpace();
    reloadAvatar();
</script>

<style lang="scss" scoped>
.header {
    box-shadow: 0 3px 10px 0 rgb(0 0 0 / 6%);
    height: 56px;
    padding-left: 24px;
    padding-right: 24px;
    position: relative;
    z-index: 200;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .logo {
        display: flex;
        align-items: center;

        .icon-pan {
            font-size: 40px;
            color: #1296db;
        }

        .name {
            font-weight: bold;
            margin-left: 5px;
            font-size: 25px;
            color: #05a1f5;
        }
    }

    .right-panel {
        display: flex;
        align-items: center;

        .icon-transfer {
            cursor: pointer;
        }

        .user-info {
            margin-right: 10px;
            display: flex;
            align-items: center;
            cursor: pointer;

            .avatar {
                margin: 0px 5px 0px 15px;
            }

            .nick-name {
                color: #05a1f5;
            }
        }
    }
}

.body {
    display: flex;

    .left-sider {
        border-right: 1px solid #f1f2f4;
        display: flex;

        .menu-list {
            height: calc(100vh - 56px);
            width: 80px;
            box-shadow: 0 3px 10px 0 rgb(0 0 0 / 6%);
            border-right: 1px solid #f1f2f4;

            .menu-item {
                text-align: center;
                font-size: 14px;
                font-weight: bold;
                padding: 20px 0px;
                cursor: pointer;

                &:hover {
                    background: #f3f3f3;
                }

                .iconfont {
                    font-weight: normal;
                    font-size: 28px;
                }
            }

            .active {
                .iconfont {
                    color: #06a7ff;
                }

                .text {
                    color: #06a7ff;
                }
            }
        }

        .menu-sub-list {
            width: 200px;
            padding: 20px 10px 0px;
            position: relative;

            .menu-item-sub {
                text-align: center;
                line-height: 40px;
                border-radius: 5px;
                cursor: pointer;

                &:hover {
                    background: #f3f3f3;
                }

                .iconfont {
                    font-size: 14px;
                    margin-right: 20px;
                }

                .text {
                    font-size: 13px;
                }
            }

            .active {
                background: #eef9fe;

                .iconfont {
                    color: #05a1f5;
                }

                .text {
                    color: #05a1f5;
                }
            }

            .tips {
                margin-top: 10px;
                color: #888888;
                font-size: 13px;
            }

            .space-info {
                position: absolute;
                bottom: 10px;
                width: 100%;
                padding: 0px 5px;

                .percent {
                    padding-right: 10px;
                }

                .space-use {
                    margin-top: 5px;
                    color: #7e7e7e;
                    display: flex;
                    justify-content: space-around;

                    .use {
                        flex: 1;
                    }

                    .iconfont {
                        cursor: pointer;
                        margin-right: 20px;
                        color: #05a1f5;
                    }
                }
            }
        }
    }

    .body-content {
        flex: 1;
        width: 0;
        padding-left: 20px;
    }
}
</style>