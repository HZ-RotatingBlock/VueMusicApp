<template>
  <!-- 进度条组件 -->
  <div class="progress-bar" ref="progressBar" @click="progressClick">
    <div class="bar-inner">
      <div class="progress" ref="progress"></div>
      <div class="progress-btn-wrapper" ref="progressBtn" @touchstart.prevent="progressTouchStart" @touchmove.prevent="progressTouchMove" @touchend="progressTouchEnd">
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  import {prefixStyle} from 'public/js/dom'
  // 进度按钮宽度
  const progressBtnWidth = 16
  // transform兼容
  const transform = prefixStyle('transform')

  export default {
    props: {
      // 进度条百分比
      percent: {
        type: Number,
        default: 0
      }
    },
    watch: {
      percent (newPercent) {
        if (newPercent >= 0 && !this.touch.initiated) {
          // 进度条宽度
          const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
          // 偏移宽度(当前进度宽度) = 当前播放进度比例 * 总宽度
          const offsetWidth = newPercent * barWidth
          this.$_pragressBar_offset(offsetWidth)
        }
      }
    },
    created () {
      // this.touch用于在不同的回调函数支架你的数据共享
      this.touch = {}
    },
    methods: {
      progressTouchStart (e) {
        // 标志位，表示是否已经初始化
        this.touch.initiated = true
        // touch的点击位置
        this.touch.startX = e.touches[0].pageX
        // 当前按钮所在的偏移位置，即已经滚动的进度条progress的宽度
        this.touch.left = this.$refs.progress.clientWidth
      },
      progressTouchMove (e) {
        // 如果未初始化则返回
        if (!this.touch.initiated) {
          return
        }
        // 计算纵向偏移量
        const deltaX = e.touches[0].pageX - this.touch.startX
        // this.touch.left+deltaX即为开始移动进度按钮时已经处于的偏移量加上手指滑动的偏移量，为了避免出现负数因此使用Math.max来去大值
        // 同时进度条不能超过总进度条长度因此使用Math.min来取小值
        const offsetWidth = Math.min(this.$refs.progressBar.clientWidth, Math.max(0, this.touch.left + deltaX))
        this.$_pragressBar_offset(offsetWidth)
      },
      progressTouchEnd () {
        this.touch.initiated = false
        // 派发时间告诉外层进度进度已经改变，以便同步进度
        this.$_pragressBar_triggerPercent()
      },
      // 点击切换进度
      progressClick (e) {
        const rect = this.$refs.progressBar.getBoundingClientRect()
        const offsetWidth = e.pageX - rect.left
        this.$_pragressBar_offset(offsetWidth)
        // 这里当我们点击 progressBtn 的时候, e.offsetX 获取不正确
        // this.$_pragressBar_offset(e.offsetX)
        this.$_pragressBar_triggerPercent()
      },
      // 封装进度条设置
      $_pragressBar_offset (offsetWidth) {
        this.$refs.progress.style.width = `${offsetWidth}px`
        this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
      },
      $_pragressBar_triggerPercent () {
        // 进度条宽度
        const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
        // 运动后的比例
        const percent = this.$refs.progress.clientWidth / barWidth
        this.$emit('percentChange', percent)
      }
    }
  }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
  @import "../../public/sass/variable";

  .progress-bar {
    height: 30px;
    .bar-inner {
      position: relative;
      top: 13px;
      height: 4px;
      background: rgba(0, 0, 0, 0.3);
      .progress {
        position: absolute;
        height: 100%;
        background: $color-theme;
      }
      .progress-btn-wrapper {
        position: absolute;
        left: -8px;
        top: -13px;
        width: 30px;
        height: 30px;
        .progress-btn {
          position: relative;
          top: 7px;
          left: 7px;
          box-sizing: border-box;
          width: 16px;
          height: 16px;
          border: 3px solid $color-text;
          border-radius: 50%;
          background: $color-theme;
        }
      }
    }
  }
</style>
