import { ElMessage } from 'element-plus'

const showMessage = (msg,callback,type) => {
    ElMessage({
        type: type,
        message: msg,
        duration: 2000,
        onClose: () => {
            if(callback)
                callback();
        }
    });
}

/**
 * 发送弹窗:页面顶端居中,持续事件2秒   
 * 包括error,warning,success   
 * 一般用于显示接口调用结果
 * @param msg 显示的消息
 * @param callback 弹窗结束后的回调
 */
const Message = {
    error: (msg,callback) => {
        showMessage(msg,callback,"error");
    },
    success: (msg,callback) => {
        showMessage(msg,callback,"success");
    },
    warning: (msg,callback) => {
        showMessage(msg,callback,"warning");
    }
}

export default Message;