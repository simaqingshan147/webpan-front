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
    }
}