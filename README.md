# music

> 一个音乐播放器组件，包含播放器的基本功能，可以设置播放器宽高，可以设置是否自动播放

## Build Setup

首先确保项目安装了axios

 ![image](./static/music.png) 

``` bash
# 安装音乐播放器组件
npm install vue-music-component -s

# 引入组件
import Music from 'vue-music-component'

# 设置音乐播放器的宽高
可以在组件外面定义一个有具体宽高的div，也可以直接给组件添加class来指定宽高

# 参数
musicList：包含音乐资源的数组
    其中：
    album_title: 歌曲名称,
    artist_name: 演唱者,
    id: 唯一的id,
    src: 歌曲资源地址,
    lrcSrc: 歌词资源地址,
    pic_small: 歌曲图片资源地址
iNow：进入后显示的歌曲索引，表示数组中的第iNow首歌曲被显示在界面上,最开始一定要设置成null，随后在获取到音乐资源以后在修改iNow的值
isPlay：是否自动播放
```

Example:

```html
<template>
    <music id="music" :musicList="musicList" :iNow="iNow" :isPlay="isPlay"></music>
</template>

<script>
export default {
  data() {
    return {
      // 可以用axios请求数据
      musicList: [{
            album_title: "带你去旅行",
            artist_name: "宗顺康Ken",
            id: 0,
            src: "static/music/travel.mp3",
            lrcSrc: "static/music/travel.lrc",
            pic_small: "http://qukufile2.qianqian.com/data2/pic/4a2cffbaf32b0a7cb77986bc483e8642/569217166/569217166.JPG@s_1,w_90,h_90"
        }],
      iNow: null,
      isPlay: false
    };
  },
  components: {
    Music
  }
};
}
</script>
```

```css
#music{
    width: 400px;
    height: 600px;
}
```

对事物如何工作的详细解释，看看[指南](https://github.com/GONGTING520/vue-music-component.git).