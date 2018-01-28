<template>
  <!-- svg实现圆形进度条 -->
  <div class="progress-circle">
    <!-- viewBox:与下方半径对应，指视口的宽度位置，这里表示从左上角拉到右下角100,100的位置 -->
    <!-- width和height指真正显示到屏幕上的宽高 -->
    <svg :width="radius" :height="radius" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">
      <!-- 内层圆 -->
      <!-- r:半径;cx:圆心的x轴坐标;cy:圆心的y轴坐标; -->
      <circle class="progress-background" r="50" cx="50" cy="50" fill="transparent"/>
      <!-- 外层圆 -->
      <!-- stroke-dasharray表示描边以及描边距离 -->
      <!-- stroke-dashoffset表示描边偏移 -->
      <circle class="progress-bar" r="50" cx="50" cy="50" fill="transparent" :stroke-dasharray="dashArray" :stroke-dashoffset="dashOffset" />
    </svg>
    <slot></slot>
  </div>
</template>

<script type="text/ecmascript-6">
  export default {
    props: {
      // 通过外层传入的radius来决定svg的大小
      radius: {
        type: Number,
        default: 100
      },
      // 接收外部监听传入的计算属性percent即播放进度与总歌曲进度的比例
      percent: {
        type: Number,
        default: 0
      }
    },
    data () {
      return {
        dashArray: Math.PI * 100
      }
    },
    computed: {
      // 进度比例
      dashOffset () {
        return (1 - this.percent) * this.dashArray
      }
    }
  }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
  @import "../../public/sass/variable";

  .progress-circle {
    position: relative;
    circle {
      stroke-width: 8px;
      transform-origin: center;
      &.progress-background {
        transform: scale(0.9);
        stroke: $color-theme-d;
      }
      &.progress-bar {
        transform: scale(0.9) rotate(-90deg);
        stroke: $color-theme;
      }
    }
  }
</style>
