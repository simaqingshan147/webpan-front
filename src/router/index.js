import { createRouter, createWebHistory } from 'vue-router'
import VueCookies from 'vue-cookies'

/**自定义路由 */
const routes = [
    {
        name: 'login',
        path: '/login',
        component: () => import('@/views/Login.vue')
    },
    {
        name: 'framework',
        path: "/",
        component: () => import('@/views/Framework.vue'),
        children: [
            {
                path: "/",
                redirect: "main/all"
            },
            {
                path: '/main/:category',
                name: "首页",
                meta: {
                    needLogin: true,
                    menuCode: "main"
                },
                component: () => import('@/views/main/Main.vue')
            },
            {
                path: '/recycle',
                name: "回收站",
                meta: {
                    needLogin: true,
                    menuCode: "recycle"
                },
                component: () => import('@/views/recycle/Recycle.vue')
            },
            {
                path: '/myshare',
                name: '我的分享',
                meta: {
                  needLogin: true,
                  menuCode: "share"
                },
                component: () => import("@/views/myshare/Share.vue")
            },
            {
                path: '/admin/fileList',
                name: '用户文件',
                meta: {
                  needLogin: true,
                  menuCode: "settings"
                },
                component: () => import("@/views/admin/FileList.vue")
            },
            {
                path: '/admin/userList',
                name: '用户管理',
                meta: {
                  needLogin: true,
                  menuCode: "settings"
                },
                component: () => import("@/views/admin/UserList.vue")
            }
        ]
    },
    {
        path: '/shareCheck/:shareId',
        name: '分享校验',
        component: () => import("@/views/webShare/ShareCheck.vue")
    },
    {
        path: '/webShare/:shareId',
        name: '分享',
        component: () => import("@/views/webShare/Share.vue")
    }
];

/**自定义路由器 */
const Router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes:routes
});

Router.beforeEach((to,from,next) => {
    const userInfo = VueCookies.get("userInfo");
    if(to.meta.needLogin != null && to.meta.needLogin && userInfo == null){
        Router.push("/login");
    }
    next();
})

export default Router