<!-- 主界面上的文件上传组件 -->
<template>
    <div class="uploader-panel">
        <div class="upload-title">
            <span>上传任务</span>
            <span class="tips">(仅展示本次上传任务)</span>
        </div>
        <!-- 上传文件展示 -->
        <div class="file-list">
            <div v-for="(fileItem,index) in fileList " class="file-item">
                <!-- 显示界面 -->
                <div class="upload-panel">
                    <!-- 文件名 -->
                    <div class="file-name">
                        <!-- todo: file是Docment实例还是FileInfo实例? -->
                        {{ fileItem.fileName }}
                    </div>
                    <!-- 上传进度 -->
                    <div class="progress">
                        <el-progress :percentage="fileItem.uploadProgress"
                            v-if="fileItem.status === STATUS.uploading.value ||
                                  fileItem.status === STATUS.upload_seconds.value ||
                                  fileItem.status === STATUS.finish.value" />
                    </div>
                    <!-- 上传状态 -->
                    <div class="upload-staus">
                        <!-- 状态图标 -->
                        <span :class="['iconfont','icon-' + STATUS[fileItem.status].icon]"
                            :style="{color: STATUS[fileItem.status].color}"></span>
                        <!-- 状态描述 -->
                        <span class="status" :style="{color: STATUS[fileItem.status].color}">
                            {{ fileItem.status === STATUS.fail.value ? fileItem.errorMsg : STATUS[fileItem.status].desc}}
                        </span>
                        <!-- 上传中状态 -->
                        <span class="upload-info" v-if="fileItem.status == STATUS.uploading.value">
                            {{ Utils.size2Str(fileItem.uploadSize) }}/{{ Utils.size2Str(fileItem.totalSize) }}
                        </span>
                    </div>
                </div>
                <!-- 操作界面 -->
                <div class="op">
                    <!-- MD5计算进度(文件处于初始化状态时显示) -->
                    <el-progress type="circle" width="50" :percentage="fileItem.md5Progress"
                        v-if="fileItem.status == STATUS.init.value" />
                    <div class="op-btn">
                        <span v-if="fileItem.status === STATUS.uploading.value">
                            <Icon width=28 class="btn-item" iconName="upload" title="上传"
                              v-if="fileItem.pause" @click="startUpload(fileItem.uid)">
                            </Icon>
                            <Icon width=28 class="btn-item" iconName="pause" title="暂停"
                              v-else @click="pauseUpload(fileItem.uid)">
                            </Icon>
                        </span>
                        <Icon width=28 class="del btn-item" iconName="del" title="删除"
                            v-if="fileItem.status === STATUS.init.value ||
                                  fileItem.status === STATUS.finish.value ||
                                  fileItem.status === STATUS.upload_seconds"
                            @click="delUpload(fileItem.uid,index)">
                        </Icon>
                        <Icon width=28 class="clean btn-item" iconName="clean" title="清除"
                            v-if="fileItem.status === STATUS.finish.value ||
                                  fileItem.status === STATUS.upload_seconds"
                            @click="delUpload(fileItem.uid,index)">
                        </Icon>
                    </div>
                </div>
            </div>
            <div v-if="fileList.length === 0">
                <Nodata msg="暂无上传任务"></Nodata>
            </div>
        </div>
    </div>
</template>

<script setup>
    import{ref, inject} from 'vue'
    import SparkMd5 from 'spark-md5'
    const Request = inject("$request");
    
    const api = {
        upload: "/file/uploadFile"
    };

    /**文件上传状态 */
    const STATUS = {
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
    };
    /**待上传文件列表 */
    const fileList = ref([]);
    /**待删除文件列表 */
    const delList = ref([]);
    /**分片大小:512KB */
    const chunkSize = 1024*512;

    /**
     * 指定file实例和文件所属目录id,上传文件
     * @param file File类实例,待上传文件
     * @param dirId 待上传目录的id
    */
    const addFile = async (file,dirId)=>{
        const fileItem = {
            file: file,
            /**文件uid,注意不是FileId,FileId是上传后才有 */
            uid: file.uid,
            md5Progress: 0,
            fileMd5: null,
            fileName: file.name,
            status: STATUS.init.value,
            uploadSize: 0,
            totalSize: file.size,
            uploadProgress: 0,
            pause: false,
            chunkIndex: 0,
            dirId: dirId,
            errorMsg: null
        };
        //加入文件列表
        fileList.value.unshift(fileItem);
        if(fileItem.totalSize == 0){
            fileItem.status = STATUS.emptyFile.value;
            return;
        }
        //计算md5
        let fileMd5 = await computeMd5(fileItem);
        if(fileMd5 == null)
            return;
        uploadFile(fileItem.uid);
    };
    /**暴露addFile函数 */
    defineExpose({addFile});

    /**暴露事件uploadCallback,即父组件传递的函数,在上传完成后调用 */
    const emit = defineEmits(['uploadCallback']);


    /**上传图标按钮的响应,开始上传
     * @param uid 上传文件的uid
     */
    const startUpload = (uid) =>{
        let currentFile = getFileByUid(uid);
        currentFile.pause = false;
        //开始上传
        uploadFile(uid,currentFile.chunkIndex);
    };

    /**暂停图标按钮的响应,暂停选定文件的上传 */
    const pauseUpload = (uid)=>{
        let currentFile = getFileByUid(uid);
        currentFile.pause = true;
    };

    /**终止上传,并从上传列表删除
     * @param uid 文件uid
     * @param index 文件在fileList的index
     */
    const delUpload = (uid,index)=>{
        delList.value.push(uid);
        fileList.value.splice(index,1);
    };


    /*****************工具函数 ******************/

    /**通过uid在fileList中找到文件
     * @param uid 文件uid
     */
     const getFileByUid = (uid)=>{
        let file = fileList.value.find((fileItem) =>{
            return fileItem.uid === uid;
        });
        return file;
    };

    /**从指定位置上传文件
     * @param uid 上传文件uid
     * @param chunkIndex 开始上传的分片的索引
     */
    const uploadFile = async (uid,chunkIndex)=>{
        chunkIndex = chunkIndex ? chunkIndex : 0;
        
        let currentFile = getFileByUid(uid);
        //计算分片
        const file = currentFile.file;
        const fileSize = currentFile.totalSize;
        const chunks = Math.ceil(fileSize / chunkSize);

        //从指定分片开始上传
        for(let i = chunkIndex;i < chunks;i++){
            //每个分片开始上传时检查当前上传文件是否被删除
            let delIndex = delList.value.indexOf(uid);
            if(delIndex != -1){
                //终止上传
                delList.value.splice(delIndex,1);
                break;
            }
            //检查当前上传文件是否被暂停上传
            currentFile = getFileByUid(uid);
            if(currentFile.pause)
                break;
            //开始上传分片
            let start = i * chunkSize;
            let end = start + chunkSize >= fileSize ? fileSize : start+ chunkSize;
            let chunkFile = file.slice(start,end);

            /**后端返回的UploadResultDto   
             * 包括 fileId:只有在传输完成后不为null   
             *      status: 上传,秒传,完成三种
             */
            let uploadResult = await Request({
                url: api.upload,
                showLoading: false,
                dataType: "file",
                params: {
                    file: chunkFile,
                    fileName: file.name,
                    fileMd5: currentFile.fileMd5,
                    chunkIndex: i,
                    chunks: chunks,
                    dirId: currentFile.dirId
                },
                showError: false,
                errorCallback: (errorMsg)=>{
                    currentFile.status = STATUS.fail.value;
                    currentFile.errorMsg = errorMsg;
                },
                uploadProgressCallback: (event)=>{
                    //计算已上传字节数
                    let loaded = event.loaded;
                    if(loaded > fileSize)
                        loaded = fileSize;
                    currentFile.uploadFile = i * chunkSize + loaded;
                    currentFile.uploadProgress = Math.floor(
                        (currentFile.uploadFile/fileSize)*100
                    );
                }
            });
            if(uploadResult == null){
                //不能直接设为失败或从fileList删除
                //因为可能是网络问题,可以继续上传
                break;
            }
            currentFile.fileId = uploadResult.data.fileId;
            currentFile.status = STATUS[uploadResult.data.status].value;
            currentFile.chunkIndex = i;
            //上传完成
            if(uploadResult.data.status === STATUS.upload_seconds.value || uploadResult.data.status === STATUS.finish.value){
                currentFile.uploadProgress = 100;
                //调用父组件传递函数
                emit("uploadCallback");
                break;
            }
        }
    };

    /**分片计算文件md5 */
    const computeMd5 = (fileItem)=>{
        let file = fileItem.file;
        let blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;
        let chunks = Math.ceil(file.size / chunkSize);
        let chunkIndex = 0;

        let spark = new SparkMd5.ArrayBuffer();
        let fileReader = new FileReader();
        
        let loadNext = ()=>{
            let start = chunkIndex * chunkSize;
            let end = start + chunkSize > file.size ? file.size : start + chunkSize;
            fileReader.readAsArrayBuffer(blobSlice.call(file,start,en));
        }

        loadNext();
        return new Promise((resolve,reject)=>{
            let resultFile = getFileByUid(file.uid);
            fileReader.onload = (e)=>{
                spark.append(e.target.result);
                chunkIndex++;
                if(chunkIndex < chunks){
                    let percent = Math.floor((chunkIndex/chunks)*100);
                    resultFile.md5Progress = percent;
                    loadNext();
                    //计算结束
                }else{
                    let md5 = spark.end();
                    spark.destroy();
                    resultFile.md5Progress = 100;
                    resultFile.status = STATUS.uploading.value;
                    resultFile.fileMd5 = md5;
                    resolve(fileItem.uid);
                }
            };
            fileReader.onerror = ()=>{
                resultFile.md5Progress = -1;
                resultFile.status = STATUS.fail.value;
                resolve(fileItem.uid);
            };
        }).catch((error)=>{
            return null;
        });
    }
</script>

<style lang="scss" scoped>
.uploader-panel {
  .uploader-title {
    border-bottom: 1px solid #ddd;
    line-height: 40px;
    padding: 0px 10px;
    font-size: 15px;
    .tips {
      font-size: 13px;
      color: rgb(169, 169, 169);
    }
  }
  .file-list {
    overflow: auto;
    padding: 10px 0px;
    min-height: calc(100vh / 2);
    max-height: calc(100vh - 120px);
    .file-item {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 3px 10px;
      background-color: #fff;
      border-bottom: 1px solid #ddd;
    }
    .file-item:nth-child(even) {
      background-color: #fcf8f4;
    }
    .upload-panel {
      flex: 1;
      .file-name {
        color: rgb(64, 62, 62);
      }
      .upload-status {
        display: flex;
        align-items: center;
        margin-top: 5px;
        .iconfont {
          margin-right: 3px;
        }
        .status {
          color: red;
          font-size: 13px;
        }
        .upload-info {
          margin-left: 5px;
          font-size: 12px;
          color: rgb(112, 111, 111);
        }
      }
      .progress {
        height: 10px;
      }
    }
    .op {
      width: 100px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      .op-btn {
        .btn-item {
          cursor: pointer;
        }
        .del,
        .clean {
          margin-left: 5px;
        }
      }
    }
  }
}
</style>