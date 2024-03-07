<template>
    <div>
        <videoPlay v-bind="options" id="player"/>
    </div>
</template>

<script>
import "vue3-video-play/dist/style.css";
import { videoPlay } from 'vue3-video-play/lib/index';
import 'vue3-video-play/dist/style.css'

export default {
    comments: {
        videoPlay
    },
    props: {
        url: {
            type: String
        }
    },
    setup(props) {
        const options = reactive({
            color: "#b7daff",
            src: props.url,
            type: "m3u8",
            speedRate: ["0.75", "1.0", "1.25", "1.5", "2.0"], //播放倍速
            autoPlay: false, //自动播放
            volume: 0.3, //默认音量大小
            control: true, //是否显示控制
            controlBtns: [
                "audioTrack",
                "quality",
                "speedRate",
                "volume",
                "setting",
                "pip",
                "pageFullScreen",
                "fullScreen",
            ]
        })
    }
}
</script>