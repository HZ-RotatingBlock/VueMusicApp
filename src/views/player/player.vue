<template>
  <div class="player" v-show="playlist.length > 0">
    <transition name="normal" @enter="enter" @after-enter="afterEnter" @leave="leave" @after-leave="afterLeave">
      <!-- normal-player展开的大播放器 -->
      <div class="normal-player" v-show="fullScreen">
        <div class="background">
          <!-- 当前播放的歌曲图片背景（失焦化） -->
          <img width="100%" height="100%" :src="currentSong.image">
        </div>
        <div class="top">
          <!-- 返回列表 -->
          <div class="back" @click="back">
            <i class="icon-back"></i>
          </div>
          <h1 class="title" v-html="currentSong.name"></h1>
          <h2 class="subtitle" v-html="currentSong.singer"></h2>
        </div>
        <div class="middle" @touchstart.prevent="middleTouchStart" @touchmove.prevent="middleTouchMove" @touchend="middleTouchEnd">
          <div class="middle-l" ref="middleL">
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd" :class="cdCls">
                <!-- 当前播放的歌曲cd图片 -->
                <div class="cdBg">
                  <img class="image" :src="currentSong.image">
                </div>
              </div>
            </div>
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric" v-show="playingLyric !== ''">{{ playingLyric }}</div>
            </div>
          </div>

          <!-- 歌词列表 -->
          <scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <p ref="lyricLine" :class="{'current': currentLineNum === index}" class="text" v-for="(line, index) in currentLyric.lines">{{ line.txt }}</p>
              </div>
            </div>
          </scroll>

        </div>
        <div class="bottom">
          <div class="dot-wrapper">
            <span class="dot" :class="{'active': currentShow === 'cd'}"></span>
            <span class="dot" :class="{'active': currentShow === 'lyric'}"></span>
          </div>
          <div class="progress-wrapper">
            <span class="time time-le">{{ format(currentTime) }}</span>
            <div class="progress-bar-wrapper">
              <progress-bar :percent="percent" @percentChange="onProgressBarChange"></progress-bar>
            </div>
            <span class="time time-r">{{ format(currentSong.duration) }}</span>
          </div>
          <div class="operators">
            <div class="icon i-left" @click="changeMode">
              <i :class="iconMode"></i>
            </div>
            <div class="icon i-left" :class="disableCls">
              <!-- 上一首 -->
              <i class="icon-prev" @click="prev"></i>
            </div>
            <div class="icon i-center" :class="disableCls">
              <!-- 播放暂停 -->
              <i :class="playIcon" @click="togglePlaying"></i>
            </div>
            <div class="icon i-right" :class="disableCls">
              <!-- 下一首 -->
              <i class="icon-next" @click="next"></i>
            </div>
            <div class="icon i-right">
              <i class="icon" :class="getFavoriteIcon(currentSong)" @click="toggleFavorite(currentSong)"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <transition name="mini">
      <!-- mini-player收起的小的播放器 -->
      <div class="mini-player" v-show="!fullScreen" @click="open">
        <div class="icon">
          <img width="40" height="40" :src="currentSong.image" :class="cdCls">
        </div>
        <div class="text">
          <h2 class="name" v-html="currentSong.name"></h2>
          <p class="desc" v-html="currentSong.singer"></p>
        </div>
        <div class="control">
          <progress-circle :radius="radius" :percent="percent">
            <i class="icon-mini" :class="miniIcon" @click.stop="togglePlaying"></i>
          </progress-circle>
        </div>
        <!-- 阻止点击冒泡的父级元素的click事件上避免在打开当前播放列表时同时打开播放器界面 -->
        <div class="control" @click.stop="showPlaylist">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <playlist ref="playlist"></playlist>
    <audio :src="currentSong.url" ref="audio" @play="ready" @error="error" @timeupdate="updateTime" @ended="end"></audio>
  </div>
</template>

<script type="text/ecmascript-6">
  import { mapGetters, mapMutations, mapActions } from 'vuex'
  import animations from 'create-keyframe-animation'
  import {prefixStyle} from 'public/js/dom'
  import ProgressBar from 'components/progress-bar/progress-bar'
  import ProgressCircle from 'components/progress-circle/progress-circle'
  import {playMode} from 'public/js/config'
  import Lyric from 'lyric-parser'
  import Scroll from 'components/scroll/scroll'
  import Playlist from 'views/playlist/playlist'
  import {playerMixin} from 'public/js/mixin'

  const transform = prefixStyle('transform')
  const transitionDuration = prefixStyle('transitionDuration')

  export default {
    mixins: [playerMixin],
    components: {
      ProgressBar,
      ProgressCircle,
      Scroll,
      Playlist
    },
    data () {
      return {
        songReady: false,
        currentTime: 0,
        radius: 32,
        // 当前歌曲歌词
        currentLyric: null,
        // 当前歌词所在行
        currentLineNum: 0,
        currentShow: 'cd',
        playingLyric: ''
      }
    },
    computed: {
      // 计算播放进度
      percent () {
        return this.currentTime / this.currentSong.duration
      },
      cdCls () {
        return this.playing ? 'play' : 'play pause'
      },
      playIcon () {
        return this.playing ? 'icon-pause' : 'icon-play'
      },
      miniIcon () {
        return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
      },
      // 如果处于歌曲加载时的ready状态则显示控件为无法点击状态
      disableCls () {
        return this.songReady ? '' : 'disable'
      },
      ...mapGetters([
        'fullScreen',
        'playing',
        'currentIndex'
      ])
    },
    watch: {
      // 监听当前播放的歌曲变化而执行播放
      currentSong (newSong, oldSong) {
        // 防止将播放列表歌曲全部删除后继续向后指定报错的问题
        if (!newSong.id) {
          return
        }
        // 如果切换的歌曲id没变，则无需再切换为播放状态
        if (newSong.id === oldSong.id) {
          return
        }
        // 歌曲切换时要清除歌词计时器
        if (this.currentLyric) {
          this.currentLyric.stop()
        }
        // 为了避免前后台切换导致js失效（尤其是微信浏览器）而歌曲无法正常播放。因此使用setTimeout设置延迟时间久一些而不是使用this.$nextTick()
        clearTimeout(this.timer)
        this.timer = setTimeout(() => {
          this.$refs.audio.play()
          this.getLyric()
        }, 1000)
      },
      // 播放监控
      playing (newPlaying) {
        const audio = this.$refs.audio
        //  播放控件控制
        this.$nextTick(() => {
          newPlaying ? audio.play() : audio.pause()
        })
      }
    },
    created () {
      this.touch = {}
    },
    methods: {
      // 当前播放列表显示
      showPlaylist () {
        // 控制playlist组件的show方法使当前播放列表显示
        this.$refs.playlist.show()
      },
      // 歌曲进度同步
      onProgressBarChange (percent) {
        const currentTime = this.currentSong.duration * percent
        this.$refs.audio.currentTime = currentTime
        // 暂停状态下拖动到指定位置后自动播放(体验相关，可选)
        // if (!this.playing) {
        //   this.togglePlaying()
        // }
        // 各区进度同步歌词进度
        if (this.currentLyric) {
          // 通过lyric插件的seek使歌词进度移动至指定进度，数值应为currentTime * 1000ms
          this.currentLyric.seek(currentTime * 1000)
          // 如果为暂停状态则歌词也暂停，避免暂停状态下拖动进度歌曲不播放而歌词播放问题
          if (!this.playing) {
            this.currentLyric.togglePlay()
          }
        }
      },
      format (interval) {
        interval = interval | 0
        // 获取分的部分
        const minute = this.$_player_pad(interval / 60 | 0)
        // 获取秒的部分
        const second = this.$_player_pad(interval % 60)
        return `${minute}:${second}`
      },
      // 播放时间更新
      updateTime (e) {
        this.currentTime = e.target.currentTime
      },
      // 加载失败也不能切换歌曲
      error () {
        this.songReady = true
      },
      // 歌曲即将播放时的执行函数
      ready () {
        // 将歌曲播放预备状态转变为true
        this.songReady = true
        // 将mapActions的savePlayHistory保存播放历史的操作在歌曲即将播放前执行，同时传入当前播放的歌曲this.currentSong
        this.savePlayHistory(this.currentSong)
      },
      // 上一首
      prev () {
        // 根据songReady的状态来决定点击是否生效以此来避免连续点击报错
        if (!this.songReady) {
          return
        }
        // 如果歌曲列表只有一首则循环播放
        if (this.playlist.length === 1) {
          this.loop()
          // eslint-disable-next-line
          return
        } else {
          let index = this.currentIndex - 1
          // 当当前歌曲为歌曲列表中的最后一首时回到第一首
          if (index === -1) {
            index = this.playlist.length - 1
          }
          this.setCurrentIndex(index)
          // 根据歌曲切换改变状态解决切换后状态为随同变化问题
          if (!this.playing) {
            this.togglePlaying()
          }
          this.songReady = false
        }
      },
      // 下一首
      next () {
        // 根据songReady的状态来决定点击是否生效以此来避免连续点击报错
        if (!this.songReady) {
          return
        }
        // 如果歌曲列表只有一首则循环播放
        if (this.playlist.length === 1) {
          this.loop()
          // eslint-disable-next-line
          return
        } else {
          let index = this.currentIndex + 1
          // 当当前歌曲为歌曲列表中的最后一首时回到第一首
          if (index === this.playlist.length) {
            index = 0
          }
          this.setCurrentIndex(index)
          // 根据歌曲切换改变状态解决切换后状态为随同变化问题
          if (!this.playing) {
            this.togglePlaying()
          }
          this.songReady = false
        }
      },
      // 歌曲播放结束后根据模式切换歌曲
      end () {
        if (this.mode === playMode.loop) {
          this.loop()
        } else {
          this.next()
        }
      },
      // 当前歌曲循环
      loop () {
        // 将当前歌曲播放进度置为0即可
        this.$refs.audio.currentTime = 0
        this.$refs.audio.play()
        // 如果循环播放则歌词重置
        if (this.currentLyric) {
          this.currentLyric.seek(0)
        }
      },
      // 播放器返回
      back () {
        this.setFullScreen(false)
      },
      // 播放器打开
      open () {
        this.setFullScreen(true)
      },
      // 过渡动画
      enter (el, done) {
        const {x, y, scale} = this.$_player_getPosAndScale()

        let animation = {
          0: {
            transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`
          },
          60: {
            transform: `translate3d(0, 0, 0) scale(1.1)`
          },
          80: {
            transform: `translate3d(0, 0, 0) scale(0.9)`
          },
          100: {
            transform: `translate3d(0, 0, 0) scale(1)`
          }
        }
        // 注册动画
        animations.registerAnimation({
          // 动画名称
          name: 'move',
          // 动画
          animation,
          // 预设字段
          presets: {
            // 间隔
            duration: 400,
            // 缓动
            easing: 'linear'
          }
        })
        // 动画运行
        animations.runAnimation(this.$refs.cdWrapper, 'move', done)
      },
      afterEnter () {
        // 清空动画
        animations.unregisterAnimation('move')
        this.$refs.cdWrapper.style.animation = ''
      },
      leave (el, done) {
        this.$refs.cdWrapper.style.transition = 'all 0.4s'
        const {x, y, scale} = this.$_player_getPosAndScale()
        this.$refs.cdWrapper.style[transform] = `translate3d(${x}px, ${y}px, 0) scale(${scale})`
        this.$refs.cdWrapper.addEventListener('transitionend', done)
      },
      afterLeave () {
        this.$refs.cdWrapper.style.transition = ''
        this.$refs.cdWrapper.style[transform] = ''
      },
      // 播放控制
      togglePlaying () {
        if (!this.songReady) {
          return
        }
        this.setPlayingState(!this.playing)
        if (this.currentLyric) {
          this.currentLyric.togglePlay()
        }
      },
      // 获取歌词
      getLyric () {
        this.currentSong.getLyric().then((lyric) => {
          // 如果获取的歌词不等于当前播放歌曲的歌词则直接返回而不是再次获取歌词，避免歌/词不同步问题
          if (this.currentSong.lyric !== lyric) {
            return
          }
          this.currentLyric = new Lyric(lyric, this.handleLyric)
          // 如果歌曲正在播放，歌词也播放
          if (this.playing) {
            this.currentLyric.play()
          }
        }).catch(() => {
          this.currentLyric = null
          this.playingLyric = ''
          this.currentLineNum = 0
        })
      },
      // 歌词发生改变的时候的回调函数,行数lineNum以及对应文字txt
      handleLyric ({lineNum, txt}) {
        this.currentLineNum = lineNum
        // 如果大于5则滚动到当前 lineNum - 5 的位置
        // 5指的是个头的信息行数
        if (lineNum > 5) {
          let lineEl = this.$refs.lyricLine[lineNum - 5]
          this.$refs.lyricList.scrollToElement(lineEl, 1000)
        } else {
          this.$refs.lyricList.scrollTo(0, 0, 1000)
        }
        // 在唱片去同步当前歌词
        this.playingLyric = txt
      },
      // 唱片和歌词间切换三个状态对应回调函数
      middleTouchStart (e) {
        this.touch.initiated = true
        const touch = e.touches[0]
        // 记录X坐标和Y坐标
        this.touch.startX = touch.pageX
        this.touch.startY = touch.pageY
      },
      middleTouchMove (e) {
        // 若未初始化则返回
        if (!this.touch.initiated) {
          return
        }
        const touch = e.touches[0]
        const deltaX = touch.pageX - this.touch.startX
        const deltaY = touch.pageY - this.touch.startY
        // 如果纵轴方向的滑动距离大于横轴方向的滚动距离则不切换（歌词部分可以纵向滚动因此需要此判断）
        if (Math.abs(deltaY) > Math.abs(deltaX)) {
          return
        }
        // 根据currentShow判断当前是唱片状态还是歌词状态以此来决定滚动
        // 滚动距离为屏幕的宽度负值 -window.innerWidth
        const left = this.currentShow === 'cd' ? 0 : -window.innerWidth
        // 滑动不能超出屏幕因此不能超过-window.innerWidth也不能超过0
        const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX))
        this.touch.percent = Math.abs(offsetWidth / window.innerWidth)
        // 通过 $el 直接操作组件 DOM
        this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
        this.$refs.lyricList.$el.style[transitionDuration] = 0
        // 唱片部分的变化
        this.$refs.middleL.style.opacity = 1 - this.touch.percent
        this.$refs.middleL.style[transitionDuration] = 0
      },
      middleTouchEnd () {
        let offsetWidth = 0
        let opacity = 0
        if (this.currentShow === 'cd') {
          if (this.touch.percent > 0.2) {
            offsetWidth = -window.innerWidth
            opacity = 0
            this.currentShow = 'lyric'
          } else {
            offsetWidth = 0
            opacity = 1
          }
        } else {
          if (this.touch.percent < 0.8) {
            offsetWidth = 0
            this.currentShow = 'cd'
            opacity = 1
          } else {
            offsetWidth = -window.innerWidth
            opacity = 0
          }
        }
        const time = 300
        this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
        this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`
        // 唱片部分的变化
        this.$refs.middleL.style.opacity = opacity
        this.$refs.middleL.style[transitionDuration] = `${time}ms`
      },
      // 补 0,补到几位,用 0 去补位，n表示要补到的字符串长度，默认是两位
      $_player_pad (num, n = 2) {
        let len = num.toString().length
        while (len < n) {
          num = '0' + num
          len++
        }
        return num
      },
      // 底部播放器图片位置获取
      $_player_getPosAndScale () {
        const targetWidth = 40
        const paddingLeft = 40
        const paddingBottom = 30
        const paddingTop = 80
        const width = window.innerWidth * 0.8
        const scale = targetWidth / width
        const x = -(window.innerWidth / 2 - paddingLeft)
        const y = window.innerHeight - paddingTop - width / 2 - paddingBottom
        return {
          x,
          y,
          scale
        }
      },
      // mutations提交
      ...mapMutations({
        setFullScreen: 'SET_FULL_SCREEN'
      }),
      ...mapActions([
        'savePlayHistory'
      ])
    }
  }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
  @import "../../public/sass/variable";
  @import "../../public/sass/mixin";

  .player {
    .normal-player {
      position: fixed;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      z-index: 150;
      background: $color-background-player;
      .background {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
        opacity: 0.6;
        filter: blur(20px);
      }
      .top {
        position: relative;
        margin-bottom: 25px;
        .back {
          position: absolute;
          top: 0;
          left: 6px;
          z-index: 50;
          .icon-back {
            display: block;
            padding: 9px;
            font-size: $font-size-large-x;
            color: $color-theme;
            transform: rotate(-90deg);
          }
        }
        .title {
          width: 70%;
          margin: 0 auto;
          line-height: 40px;
          text-align: center;
          @include no-wrap();
          font-size: $font-size-large;
          color: $color-text;
        }
        .subtitle {
          line-height: 20px;
          text-align: center;
          font-size: $font-size-medium;
          color: $color-text;
        }
      }
      .middle {
        position: fixed;
        width: 100%;
        top: 80px;
        bottom: 170px;
        white-space: nowrap;
        font-size: 0;
        .middle-l {
          display: inline-block;
          vertical-align: top;
          position: relative;
          width: 100%;
          height: 0;
          padding-top: 80%;
          .cd-wrapper {
            position: absolute;
            left: 10%;
            top: 0;
            width: 80%;
            height: 100%;
            .cd {
              width: 100%;
              height: 100%;
              box-sizing: border-box;
              border: 10px solid rgba(255, 255, 255, 0.1);
              border-radius: 50%;
              &.play {
                animation: rotate 20s linear infinite;
              }
              &.pause {
                animation-play-state: paused;
              }
              .cdBg {
                position: absolute;
                left: 50%;
                top: 50%;
                width: 105%;
                height: 105%;
                background: url(./cdBg.png) no-repeat center center;
                background-size: cover;
                border-radius: 50%;
                transform: translate(-50%, -50%);
                .image {
                  position: absolute;
                  left: 50%;
                  top: 50%;
                  width: 60%;
                  height: 60%;
                  border: 2px solid #111;
                  border-radius: 50%;
                  transform: translate(-50%, -50%);
                }
              }
            }
          }
          .playing-lyric-wrapper {
            width: 80%;
            margin: 30px auto 0 auto;
            overflow: hidden;
            text-align: center;
            .playing-lyric {
              height: 20px;
              line-height: 20px;
              font-size: $font-size-medium;
              color: $color-text-l;
            }
          }
        }
        .middle-r {
          display: inline-block;
          vertical-align: top;
          width: 100%;
          height: 100%;
          overflow: hidden;
          .lyric-wrapper {
            width: 80%;
            margin: 0 auto;
            overflow: hidden;
            text-align: center;
            .text {
              line-height: 32px;
              color: $color-text-l;
              font-size: $font-size-medium;
              &.current {
                color: $color-text;
              }
            }
          }
        }
      }
      .bottom {
        position: absolute;
        bottom: 50px;
        width: 100%;
        .dot-wrapper {
          text-align: center;
          font-size: 0;
          .dot {
            display: inline-block;
            vertical-align: middle;
            margin: 0 4px;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: $color-text-l;
            &.active {
              width: 20px;
              border-radius: 5px;
              background: $color-text-ll;
            }
          }
        }
        .progress-wrapper {
          display: flex;
          align-items: center;
          width: 80%;
          margin: 0px auto;
          padding: 10px 0;
          .time {
            color: $color-text;
            font-size: $font-size-small;
            flex: 0 0 30px;
            line-height: 30px;
            width: 30px;
            &.time-l {
              text-align: left;
            }
            &.time-r {
              text-align: right;
            }
          }
          .progress-bar-wrapper {
            flex: 1;
            padding: 0 4px;
          }
        }
        .operators {
          display: flex;
          align-items: center;
          .icon {
            flex: 1;
            color: $color-theme;
            &.disable {
              color: $color-theme-d;
            }
            i {
              font-size: 30px;
            }
          }
          .i-left {
            text-align: right;
          }
          .i-center {
            padding: 0 20px;
            text-align: center;
            i {
              font-size: 40px;
            }
          }
          .i-right {
            text-align: left;
          }
          .icon-favorite {
            color: $color-sub-theme;
          }
        }
      }
      &.normal-enter-active, &.normal-leave-active {
        transition: all 0.4s;
        .top, .bottom {
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32);
        }
      }
      &.normal-enter, &.normal-leave-to {
        opacity: 0;
        .top {
          transform: translate3d(0, -100px, 0);
        }
        .bottom {
          transform: translate3d(0, 100px, 0);
        }
      }
    }
    .mini-player {
      display: flex;
      align-items: center;
      position: fixed;
      left: 0;
      bottom: 0;
      z-index: 180;
      width: 100%;
      height: 60px;
      background: $color-highlight-background;
      &.mini-enter-active, &.mini-leave-active {
        transition: all 0.4s;
      }
      &.mini-enter, &.mini-leave-to {
        opacity: 0;
      }
      .icon {
        flex: 0 0 40px;
        width: 40px;
        padding: 0 10px 0 20px;
        img {
          border-radius: 50%;
          &.play {
            animation: rotate 10s linear infinite;
          }
          &.pause {
            animation-play-state: paused;
          }
        }
      }
      .text {
        display: flex;
        flex-direction: column;
        justify-content: center;
        flex: 1;
        line-height: 20px;
        overflow: hidden;
        .name {
          margin-bottom: 2px;
          @include no-wrap();
          font-size: $font-size-medium;
          color: $color-text;
        }
        .desc {
          @include no-wrap();
          font-size: $font-size-small;
          color: $color-text-d;
        }
      }
      .control {
        flex: 0 0 30px;
        width: 30px;
        padding: 0 10px;
        .icon-play-mini, .icon-pause-mini, .icon-playlist {
          font-size: 30px;
          color: $color-theme-d;
        }
        .icon-mini {
          font-size: 32px;
          position: absolute;
          left: 0;
          top: 0;
        }
      }
    }
  }

  @keyframes rotate {
    0% {
      transform: rotate(0);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
