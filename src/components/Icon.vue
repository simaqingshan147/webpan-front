<template>
    <span :style="{width: width + 'px',height: width + 'px'}" class="icon">
        <img :src="getImage()" :style="{objectFit: fit}" />
    </span>
</template>

<script setup>
    import { ref,inject } from 'vue'
    import Utils from '../utils/Utils';
    
    /**暴露组件属性 */
    const props = defineProps({
        fileType: {
            type: Number
        },
        iconName: {
            type: String
        },
        cover: {
            type: String
        },
        width: {
            type: Number,
            default: 32
        },
        fit: {
            type: String,
            default: "cover"
        }
    });

    const api = {
        avatarUrl: "/api/user/getAvatar",
        imageUrl: "/api/file/getImage"
    };

    /**文件类型 */
    const getIcon = (fileType)=>{
        for(typeName in Utils.FILE_TYPE){
            if(Utils.FILE_TYPE[typeName].type == fileType)
                return type;
        }
        return "others";
    }

    /**获取图片 */
    const getImage = ()=>{
        //指定了图片路径
        if(props.cover)
            return imageUrl + props.cover;
        let icon = "unknown_icon";
        if(props.iconName)
            icon = props.iconName;
        else{
            icon = getIcon(fileType);
        }
        return new URL(`/src/assets/icon-image/${icon}.png`,import.meta.url).href;
    }
</script>

<style lang="scss" scoped>
.icon {
  text-align: center;
  display: inline-block;
  border-radius: 3px;
  overflow: hidden;
  img {
    width: 100%;
    height: 100%;
  }
}
</style>