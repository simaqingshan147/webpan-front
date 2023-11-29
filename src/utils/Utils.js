export default{
    size2Str: (size) =>{
        let strSize = "";
        if(size < 0.1*1024)
            strSize = size.toFixed(2) + "B";
        else if(size < 0.1*1024*1024)
            strSize = (size / 1024).toFixed(2) + "KB";
        else if(size < 0.1*1024*1024*1024)
            strSize = (size/(1024*1024)).toFixed(2) + "MB";
        else
            strSize = (size/(1024*1024*1024)).toFixed(2) + "GB";
        let index = strSize.indexOf(".");
        //如果后两位为00,则删除
        let dou = strSize.substring(index+1,index+3);
        if(dou === "00")
            return strSize.substring(0,index);
        return strSize;
    },
    CATEGORY:{
        "all": {
            accept: "*"
        },
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
    FILE_TYPE:{
        "folder":{
            type:0,
            category:null,
            accept:null
        },
        "video":{
            type:1,
            category: "video",
            accept: null
        },
        "music":{
            type:2,
            category: "music",
            accept: null
        },
        "image":{
            type:3,
            category:"image",
            accept:null
        },
        "pdf":{
            type:4,
            category:"doc",
            accept:[".pdf"]
        },
        "word":{
            type:5,
            category:"doc",
            accept:[".doc,.docx"]
        },
        "excel":{
            type:6,
            category:"doc",
            accept:[".xlsx"]
        },
        "txt":{
            type:7,
            category:"doc",
            accept:[".txt"]
        },
        "program":{
            type:8,
            category:"other",
            accept:[".h", ".c", ".hpp", ".hxx", ".cpp", ".cc", ".c++", ".cxx", 
                    ".m", ".o", ".s", ".dll", ".cs",".java", ".class", ".js", 
                    ".ts", ".css", ".scss", ".vue", ".jsx", ".sql", ".md",
                     ".json", ".html", ".xml"]
        },
        "zip":{
            type:9,
            category:"other",
            accept:["rar", ".zip", ".7z", ".cab", ".arj", ".lzh", ".tar", ".gz",
                    ".ace", ".uue", ".bz", ".jar", ".iso",".mpq"]
        },
        others:{
            type:10,
            category:"ohter",
            accept:null
        }
    },
    getTypeByCategory: (category)=>{
        let types = [];
        for(let typeObj in Object.values(FILE_TYPE)){
            if(typeObj.category === category)
                types.push(typeObj.type);
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
    }
}