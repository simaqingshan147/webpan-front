<!-- 头像组件 -->
<template>
    <span class="avatar" :style="{width: width+'px', height: width+'px'}">
        <img :src="validAvatar" v-if="userId"/>
    </span>
</template>

<script setup>
    import {computed} from 'vue'
    const api = {
        avatarUrl: "/api/user/getAvatar/",
        imageUrl: "/api/file/getImage/"
    };

    const props = defineProps({
        userId:{
            type:String
        },
        avatar:{
            type:String
        },
        timestamp:{
            type:Number,
            default:0
        },
        width:{
            type:Number,
            default:40
        }
    });

    const validAvatar = computed(()=>{
        if(props.avatar &&  props.avatar != '')
            return props.avatar;
        return `${api.avatarUrl}${props.userId}?timestamp=${props.timestamp}`;
    });
</script>

<style lang="scss" scoped>
.avatar {
  display: flex;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  img {
    width: 100%;
    object-fit: cover;
  }
}
</style>