// 处理ajax请求,格式化后端响应
import axios from 'axios'
import { ElLoading } from 'element-plus'
import Message from '@/utils/Message.js'
//todo import Router from '@/router/index.js'

//loading实例
let loading = null;

//ajax请求
const instance = axios.create({
    baseURL: '/api',
    timeout: 30*1000
});

//请求前拦截器
instance.interceptors.request.use(
    (config) => {
        if(config.showLoading){
            loading = ElLoading.service({
                lock: true,
                text: '加载中......',
                background: 'rgba(0,0,0,0.7)'
            });
        }
        return config;
    },
    (error) => {
        if(config.showLoading && loading)
            loading.close();
        Message.error("请求发送失败");
        return Promise.reject("请求发送失败");
    }
);

//请求后拦截器
instance.interceptors.response.use(
    (response) => {
        //响应配置格式
        const { showLoading, errorCallback, showError = true, responseType } = response.config;
        if(showLoading && loading)
            loading.close();
        //包括code,status,info,data的json对象
        const responseData = response.data;
        //处理数据格式
        if(responseType == "arraybuffer" || responseType == "blob")
            return responseData;
        if(responseData.code === 200)
            return responseData;
        else{
            if(errorCallback)
                errorCallback(responseData.info);
            return Promise.reject({
                showError: showError,
                msg: responseData.data
            });
        }
    },
    (error) => {
        if(error.config.showLoading && loading)
            loading.close();
        return Promise.reject({
            showError: showError,
            msg: "网络异常"
        });
    }
);

const Request = (config) => {
    const {url,params,dataType,showLoading = true,responseType = "json"} = config;

    //根据request配置确定响应数据格式
    let contentType = 'application/x-www-form-urlencoded;charset=UTF-8';
    let formData = new FormData();
    for(let key in params)
        formData.append(key,params[key] == undefined ? "" : params[key]);
    if(dataType != null && dataType == "json")
        contentType = 'application/json';

    //
    let headers = {
        'Content-Type': contentType,
        'X-Requested-With': 'XMLHttpRequest'
    };

    return instance.post(url,formData,{
        onUploadProgress: (event) => {
            if(config.uploadProgerssCallback)
                config.uploadProgerssCallback();
        },
        responseType: responseType,
        headers: headers,
        showLoading: showLoading,
        errorCallback: config.errorCallback,
        showError: config.showError
    }).catch(error => {
        console.log(error);
        if(error.showError)
            Message.error(error.msg);
        return null;
    });
};

export default Request;