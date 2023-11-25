import {ElMessageBox,ElMessage} from 'element-plus'

/**
 * 确认框:页面居中,点击确认消失   
 * 一般用于中断用户操作,直至用户确认
 * @param message 确认消息
 * @param okfun 点击确认后的动作
 */
const Confirm = (message,okfun)=>{
    ElMessageBox.confirm(message,'提示',{
       confirmButtonText: '确定' ,
       cancelButtonText: '取消',
       type: 'info'
    }).then(()=>{
        ElMessage({
            type: 'success',
            message: '成功',
            duration: 2000
        })
        okfun();
    }).catch(()=>{
        ElMessage({
            type: 'info',
            message: '取消',
            duration: 2000
        })
    });
}

export default Confirm;