<template>
    <span :style="{width: width + 'px',height: width + 'px'}" class="icon">
        <img :src="getImage()" :style="{objectFit: fit}" />
    </span>
</template>

<script setup>
    import { ref } from 'vue'
    
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
    const fileTypeMap = {
        0: { desc: "目录", icon: "folder" },
        1: { desc: "视频", icon: "video" },
        2: { desc: "音频", icon: "music" },
        3: { desc: "图片", icon: "image" },
        4: { desc: "exe", icon: "pdf" },
        5: { desc: "doc", icon: "word" },
        6: { desc: "excel", icon: "excel" },
        7: { desc: "纯文本", icon: "txt" },
        8: { desc: "程序", icon: "code" },
        9: { desc: "压缩包", icon: "zip" },
        10: { desc: "其他文件", icon: "others" }
    };

    /**获取图片 */
    const getImage = ()=>{
        //指定了图片路径
        if(props.cover)
            return imageUrl + props.cover;
        let icon = "unknown_icon";
        if(props.iconName)
            icon = props.iconName;
        else{
            const iconMap = fileTypeMap[props.fileType];
            if(iconMap != undefined)
                icon = iconMap["icon"];
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