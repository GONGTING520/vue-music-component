<template>
  <div id="music">
    <img :src="pic_small" class="blur">    
    <div class="album-info" @click="isShow=false">
      <div class="album-left">
        <img :src="pic_small">
      </div>
      <div class="alubum-right">
        <p v-text="name" class="title"></p>
        <p v-text="singer" class="singer"></p>
      </div>
      <div class="controls" @click.stop>
        <i class="icon iconfont icon-shangyishou" @click="prev"></i>
        <i class="icon iconfont icon-bofang" v-show="!isPlay" @click="changeState"></i>
        <i class="icon iconfont icon-zanting" v-show="isPlay" @click="changeState"></i>
        <i class="icon iconfont icon-xiayishou" @click="changeMusic"></i>
      </div>
      <span class="menu" @click.stop="isShow=!isShow">菜单</span>
    </div>
    <div class="lrc" @click="isShow=false" ref="lrcScroll">
      <p class="empty" v-for="index in 5" :key="index-100" v-text="index"></p>
      <p :class="{selected: idx==index}" v-for="(obj, index) in lrc" :key="index" v-text="obj[1]"></p>
      <p class="empty" v-for="index in 5" :key="index-50" v-text="index"></p>      
    </div>
    <audio ref="musicAudio" @playing="isPlay=true" @pause="isPlay=false" class="controler" :src="audio" @ended="changeMusic" :autoplay="isPlay" controls></audio>              

    <transition-group tag="div" name="slide">
      <div :key="-100" class="music-list" v-show="isShow">
        <div class="music-title">歌单列表</div>              
        <ul>
          <li v-for="(obj, index) in musicList" :key="obj.album_id" class="music-info" :class="{selected: iNow==index}" @click="changeInow(index)">
            <div v-text="index + 1" class="info-left"></div>
            <div class="info-right">
              <span v-text="obj.album_title"></span> - 
              <span v-text="obj.artist_name"></span>
            </div>
          </li>
        </ul>
      </div>
    </transition-group>
  </div>
</template>

<script>
import axios from "axios";
export default {
  name: "vueMusicComponent",
  data() {
    return {
      isShow: true,
      name: "",
      singer: "",
      pic_small: "",
      audio: "",
      lrc: [],
      idx: 0
    };
  },
  props: ["musicList", "iNow", "isPlay"],
  mounted() {
    // 定义歌词的滚动事件
    this.$refs.musicAudio.ontimeupdate = () => {
      let iTime = this.$refs.musicAudio.currentTime;
      this.lrc.forEach((item, key) => {
        if (this.idx == 0 && iTime < item[0]) {
          this.idx = 0;
        }
        if (
          iTime >= item[0] &&
          (this.lrc[key + 1] == undefined || iTime < this.lrc[key + 1][0])
        ) {
          this.idx = key;
        }
      });
      this.$refs.lrcScroll.scrollTop = 26 * this.idx;
    };
  },
  watch: {
    iNow() {
      if (this.iNow != null) {
        this.name = this.musicList[this.iNow].album_title;
        this.singer = this.musicList[this.iNow].artist_name;
        this.pic_small = this.musicList[this.iNow].pic_small;
        this.audio = this.musicList[this.iNow].src;
        axios
          .get(this.musicList[this.iNow].lrcSrc)
          .then(res => {
            this.parseLyric(res.data);
            this.idx = 0;
          })
          .catch(() => {
            console.log("error");
          });
      }
    }
  },
  methods: {
    changeInow(num) {
      // 点击时切换歌曲
      this.iNow = num;
      this.isPlay = true;
    },
    prev() {
      // 上一首
      this.iNow--;
      if (this.iNow == -1) {
        this.iNow = this.musicList.length - 1;
      }
      this.isPlay = true;
    },
    changeState() {
      // 播放和暂停切换
      if (this.$refs.musicAudio.paused) {
        this.$refs.musicAudio.play();
        this.isPlay = true;
      } else {
        this.$refs.musicAudio.pause();
        this.isPlay = false;
      }
    },
    parseLyric(text) {
      let lyric = text.split("\n"); //先按行分割
      let _l = lyric.length; //获取歌词行数
      let lrc = new Array(); //新建一个数组存放最后结果
      for (let i = 0; i < _l; i++) {
        let d = lyric[i].match(/\[\d{2}:\d{2}((\.|\:)\d{2,})\]/g); //正则匹配播放时间
        let t = lyric[i].split(d); //以时间为分割点分割每行歌词，数组最后一个为歌词正文
        // let t = lyric[i].split(']'); //以时间为分割点分割每行歌词，数组最后一个为歌词正文
        if (d != null) {
          //过滤掉空行等非歌词正文部分
          //换算时间，保留两位小数
          let dt = String(d).split(":");
          let _t =
            parseInt(dt[0].split("[")[1]) * 60 +
            parseFloat(dt[1].split("]")[0]);
          lrc.push([_t, t[1]]);
        }
      }
      this.lrc = lrc;
    },
    changeMusic() {
      // 自动播放下一首
      this.iNow++;
      if (this.iNow == this.musicList.length) {
        this.iNow = 0;
      }
      this.isPlay = true;
    }
  }
};
</script>

<style scoped>
ul {
  padding: 0;
  margin: 0;
}
#music {
  overflow: hidden;
  position: relative;
}
.album-info {
  padding: 10% 4%;
  height: 8%;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
  color: #ffffff;
  background: rgba(0, 0, 0, 0.35);
}
.blur {
  filter: blur(20px);
  position: absolute;
  top: 0;
  z-index: -1;
  width: 100%;
  height: 100%;
}
.album-left {
  flex-grow: 1;
  width: 0;
  margin-right: 4%;
}
.album-left img {
  width: 100%;
}
.alubum-right {
  flex-grow: 3;
  width: 0;
}
.alubum-right .title {
  font-size: 120%;
  margin: 0;
}
.alubum-right .singer {
  margin: 0;
  font-size: 90%;
}
/*上方控制台*/
.controls {
  position: absolute;
  top: 50%;
  right: 10%;
  width: 30%;
  transform: translate(0, -50%);
  display: flex;
}
.iconfont {
  flex-grow: 1;
  font-size: 180%;
  width: 0;
  cursor: pointer;
}
.menu {
  position: absolute;
  right: 6%;
  bottom: 6%;
  cursor: pointer;
}
/*歌词*/
.lrc {
  position: absolute;
  top: 30%;
  bottom: 10%;
  left: 0;
  right: 0;
  text-align: center;
  color: #000000;
  overflow-y: scroll;
}
.lrc p {
  font-size: 80%;
  transition: all 0.5s ease-out;
}
.lrc .empty {
  color: transparent;
}
.lrc .selected {
  font-size: 130%;
  color: #eeeeee;
}
.controler {
  position: absolute;
  bottom: 0;
  width: 100%;
}
/*歌单列表*/
.music-list {
  position: absolute;
  top: 50%;
  left: 0;
  bottom: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.8);
  color: #ffffff;
}
.music-list ul {
  overflow-y: scroll;
  position: absolute;
  left: 0;
  right: 0;
  top: 10%;
  bottom: 0;
}
.music-list .music-title {
  text-align: center;
  height: 10%;
}
.music-list .music-info {
  cursor: pointer;
  border-bottom: 1px solid #000000;
  padding: 6%;
  display: flex;
  align-items: center;
}
.music-info .info-left {
  flex-grow: 1;
  text-align: center;
  width: 0;
}
.music-info .info-right {
  flex-grow: 9;
  width: 0;
}
.music-list .selected {
  background: rgba(255, 255, 255, 0.4);
  color: #000000;
}
.slide-enter {
  top: 100%;
}
.slide-enter-to {
  top: 50%;
}
.slide-enter-active,
.slide-leave-active {
  transition: top 1s ease;
}
.slide-leave {
  top: 50%;
}
.slide-leave-to {
  top: 100%;
}

@font-face {
  font-family: "iconfont";
  src: url("/static/font/iconfont.eot?t=1517733299011"); /* IE9*/
  src: url("/static/font/iconfont.eot?t=1517733299011#iefix")
      format("embedded-opentype"),
    url("data:application/x-font-woff;charset=utf-8;base64,d09GRgABAAAAAAZ8AAsAAAAACmgAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAABHU1VCAAABCAAAADMAAABCsP6z7U9TLzIAAAE8AAAARAAAAFZW7kioY21hcAAAAYAAAAB3AAAByJvo0U9nbHlmAAAB+AAAAmUAAAPc9yWvdGhlYWQAAARgAAAALwAAADYQWRFhaGhlYQAABJAAAAAcAAAAJAfeA4dobXR4AAAErAAAABMAAAAYF+kAAGxvY2EAAATAAAAADgAAAA4DpgKEbWF4cAAABNAAAAAfAAAAIAEVAF1uYW1lAAAE8AAAAUUAAAJtPlT+fXBvc3QAAAY4AAAAQgAAAFgrUudveJxjYGRgYOBikGPQYWB0cfMJYeBgYGGAAJAMY05meiJQDMoDyrGAaQ4gZoOIAgCKIwNPAHicY2Bk/sM4gYGVgYOpk+kMAwNDP4RmfM1gxMjBwMDEwMrMgBUEpLmmMDgwVDzbxdzwv4EhhrmBoQEozAiSAwAydg0qeJzFkcENhDAMBMckwOlEGTxTCaIexOMqoyC3wa0TeFABG02UXdlyJAM9kEQRGeyHEdqUWs0T35pnFvmJD53eu48+e/HjPJU+3S1T9X3CJU3L6sYGXpO9N/qpqd7r5WIP+4W+6GMjduNzI2q8NGJXfjTo/s1uG48AeJydU89rE0EUfm9mZzZp0427SXaTTfNjd5sdtW0wabpBalsoUqp4UPQiePFcLfTUSw+5iCIeRDx7EMFD/4ViQQiBHvScUyn6JxQqVqfO2mrTeqrDzOO9t/MN38f7FhjA4S7dpHnIwEVowHW4DYB8HH2DlNATrToZx5zHck7WoCIQnh74dTqLjs+zdjNqhQ7XeRoNLOOU14xEnQicbs2RGWzaJcRC0b1r1UYt+hKH8qL8RN4kbzFXCUbTc5PyxsR8tlnNJNZSllWwrBcJzliCEC1t4GPHTrLkEJfvWNrNbVYukQqmCsK9dX+kWrQePmutlGpOErHTwUyxaryfN11T7XXXzlgF/cJIIu+OBGNZXPs6nM+kSuEXUCvW2tGAdiAFBbgMM3BNNUMQEbRtcDjopjoqU7Xq6mV0TAODhh8Kcw7bDe9sY4pAX+5wjl6/jx7ncqfflQeMIet2kTEmD7odt4ZYc48iwmBFO4PA+CH6OYYMPvEU/aLkbhC4+L3o4+kq1qQpTR/oR7oAwzAGk3BVTc/AmLoiWMeMmo4v6ijCVls1oqajvthZnVPGHWa3zZAFXDdtZypSOYEtqVhv/Y73osWlN0uLy2W1lk/SdbmnaZjiiHLzgYaoxYEu/EGp+PPK9BnMUYob25q2TTi+5gQ1uRKD8ZX2/xomMVTU27WofU4N8pvcUwI4prTn59Owq/jLR5xsa59OSQD611vD4EAQ/0MnVqIDHqMiVGTLOI9R61/79OS+mn2y18OkIrIvNiZmEWfqG+PKLMcmOb7+ozFwr6dwxF4tedOHEFVHV/07itIvet/aoQAAAHicY2BkYGAA4tfu0ofi+W2+MnCzMIDAtTnPNiHo/w0sDMwNQC4HAxNIFABSCwvkAHicY2BkYGBu+N/AEMPCAAJAkpEBFbABAEcMAm94nGNhYGBgfsnAwMKAigESnwEBAAAAAAAAdgDgAUIBpAHuAAB4nGNgZGBgYGMIZGBlAAEmIOYCQgaG/2A+AwARSAFzAHicZY9NTsMwEIVf+gekEqqoYIfkBWIBKP0Rq25YVGr3XXTfpk6bKokjx63UA3AejsAJOALcgDvwSCebNpbH37x5Y08A3OAHHo7fLfeRPVwyO3INF7gXrlN/EG6QX4SbaONVuEX9TdjHM6bCbXRheYPXuGL2hHdhDx18CNdwjU/hOvUv4Qb5W7iJO/wKt9Dx6sI+5l5XuI1HL/bHVi+cXqnlQcWhySKTOb+CmV7vkoWt0uqca1vEJlODoF9JU51pW91T7NdD5yIVWZOqCas6SYzKrdnq0AUb5/JRrxeJHoQm5Vhj/rbGAo5xBYUlDowxQhhkiMro6DtVZvSvsUPCXntWPc3ndFsU1P9zhQEC9M9cU7qy0nk6T4E9XxtSdXQrbsuelDSRXs1JErJCXta2VELqATZlV44RelzRiT8oZ0j/AAlabsgAAAB4nGNgYoAALgbsgI2RiZGZkYWRlZGNkZ2BsYK9KjGvJDMvnbs4IzEvvTKzOCO/lLMiMxHCYkvKTwMKMzAAAELzDssAAA==")
      format("woff"),
    url("/static/font/iconfont.ttf?t=1517733299011") format("truetype"),
    url("/static/font/iconfont.svg?t=1517733299011#iconfont") format("svg"); /* iOS 4.1- */
}

.iconfont {
  font-family: "iconfont" !important;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.icon-zanting:before {
  content: "\e6ba";
}

.icon-shangyishou:before {
  content: "\e607";
}

.icon-xiayishou:before {
  content: "\e62c";
}

.icon-bofang:before {
  content: "\e624";
}
</style>
