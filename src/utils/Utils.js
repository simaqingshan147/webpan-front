export default{
    size2Str: (size) =>{
        if(size == null) {
            return "null";
        }
        let strSize = "";
        if(size < 1024){
            strSize = size.toFixed(2) + "B";
        }
        else if(size < 1024*1024){
            strSize = (size / 1024).toFixed(2) + "KB";
        }
        else if(size < 1024*1024*1024){
            strSize = (size/(1024*1024)).toFixed(2) + "MB";
        }
        else{
            strSize = (size/(1024*1024*1024)).toFixed(2) + "GB";
        }
        let index = strSize.indexOf(".");
        //如果后两位为00,则删除
        let dou = strSize.substring(index+1,index+3);
        if(dou === "00") {
            return strSize.substring(0,index) + strSize.substring(index+3, index+5);
        }
        return strSize;
    },
    CATEGORY: {
        "video": {
            accept: ".mp4,.avi,.rmvb,.mkv,.mov"
        },
        "music": {
            accept: ".mp3,.wav,.wma,.mp2,.flac,.midi,.ra,.ape,.aac,.cda"
        },
        "image": {
            accept: ".jpeg,.jpg,.png,.gif,.bmp,.dds,.psd,.pdt,.webp,.xmp,.svg,.tiff"
        },
        "doc": {
            accept: ".pdf,.doc,.docx,.xls,.xlsx,.txt"
        },
        "other": {
            accept: "*"
        }
    },
    FILE_TYPE: {
        "folder":{
            name: '文件夹',
            type:0,
            category:null
        },
        "video":{
            name: '视频',
            type:1,
            category: "video"
        },
        "music":{
            name: '音乐',
            type:2,
            category: "music"
        },
        "image":{
            name: '图片',
            type:3,
            category:"image"
        },
        "pdf":{
            name: 'pdf',
            type:4,
            category:"doc"
        },
        "word":{
            name: 'word文档',
            type:5,
            category:"doc"
        },
        "excel":{
            name: 'excel文档',
            type:6,
            category:"doc"
        },
        "txt":{
            name: 'txt文件',
            type:7,
            category:"doc"
        },
        "program":{
            name: '代码',
            type:8,
            category:"other"
        },
        "zip":{
            name: '压缩包',
            type:9,
            category:"other"
        },
        "others":{
            name: '其他文件',
            type:10,
            category:"ohter"
        }
    },
    getTypeByCategory: function(category) {
        let types = [];
        for(const key in this.FILE_TYPE){
            if(category === this.FILE_TYPE[key].category){
                types.push(this.FILE_TYPE[key].type);
            }
        }
        return types;
    },
    UPLOAD_STATUS:{
        emptyFile: {
            value: "emptyFile",
            desc: "文件为空",
            color: "#F75000",
            icon: "close"
        },
        fail: {
            value: "fail",
            desc: "上传失败",
            color: "#f75000"
        },
        init: {
            value: "init",
            desc: "解析中",
            color: "#e6a23c",
            icon: "clock"
        },
        /**注意:只有以下三个状态可以被后端返回 */
        uploading: {
            value: "uploading",
            desc: "上传中",
            color: "#409eff",
            icon: "upload"
        },
        finish: {
            value: "finish",
            desc: "上传完成",
            color: "#67c23a",
            icon: "ok"
        },
        upload_seconds: {
            value: "upload_seconds",
            desc: "秒传完成",
            color: "#67c23a",
            icon: "ok"
        }
    },
    FILE_STATUS:{
        transfer:{
            code: 0,
            desc: "转码中"
        },
        transfer_fail:{
            code: 1,
            desc: "转码失败"
        },
        using:{
            code:2,
            desc:"使用中"
        },
        recovery:{
            code:3,
            desc:"移入回收站"
        },
        delete:{
            code:4,
            desc:"删除"
        }
    },
    VALID_TYPE:{
        day_1:{
            type: 0,
            days: 1
        },
        day_7:{
            type: 1,
            days: 7
        },
        day_30:{
            type: 2,
            days: 30
        },
        forever:{
            type: 3,
            days: Number.MAX_SAFE_INTEGER
        }
    }
}