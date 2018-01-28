<template>
  <!-- 轮播图组件 -->
  <div class="slider" ref="slider">
    <div class="slider-group" ref="sliderGroup">
      <slot>
      </slot>
    </div>
    <div class="dots">
      <span class="dot" v-for="(item, index) in dots" :class="{active: currentPageIndex === index}"></span>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  import BScroll from 'better-scroll'
  import {addClass} from 'public/js/dom'

  export default {
    name: 'slider',
    props: {
      // 是否循环轮播
      loop: {
        type: Boolean,
        default: true
      },
      // 是否自动轮播
      autoPlay: {
        type: Boolean,
        default: true
      },
      // 轮播间隔
      interval: {
        type: Number,
        default: 4000
      }
    },
    data () {
      return {
        dots: [],
        currentPageIndex: 0
      }
    },
    mounted () {
      setTimeout(() => {
        this.$_slider_setSliderWidth()
        this.$_slider_initDoc()
        this.$_slider_initSlider()
        if (this.autoPlay) {
          this.$_slider_play()
        }
      }, 20)
      window.addEventListener('resize', () => {
        if (!this.slider) {
          return
        }
        this.$_slider_setSliderWidth(true)
      })
    },
    destroyed () {
      clearTimeout(this.timer)
    },
    methods: {
      $_slider_setSliderWidth (isResize) {
        // 获取每个幻灯dom节点
        this.children = this.$refs.sliderGroup.children

        // 幻灯容器slider-group宽度
        let width = 0
        // 总父容器（可视区）slider宽度（也将会是每个幻灯的宽度）
        let sliderWidth = this.$refs.slider.clientWidth

        for (let i = 0, len = this.children.length; i < len; i++) {
          let child = this.children[i]
          addClass(child, 'slider-item')
          // 每个幻灯都设置为可视区的宽度
          child.style.width = sliderWidth + 'px'
          width += sliderWidth
        }
        // 若循环则幻灯容器宽度前后各加一个幻灯的宽度
        if (this.loop && !isResize) {
          width += 2 * sliderWidth
        }
        this.$refs.sliderGroup.style.width = width + 'px'
      },
      $_slider_initSlider () {
        this.slider = new BScroll(this.$refs.slider, {
          scrollX: true,
          scrollY: false,
          momentum: false,
          snap: {
            loop: this.loop,
            threshold: 0.3,
            speed: 400
          }
        })
        this.slider.on('scrollEnd', () => {
          let pageIndex = this.slider.getCurrentPage().pageX
          this.currentPageIndex = pageIndex
          if (this.autoPlay) {
            this.$_slider_play()
          }
        })
        this.slider.on('beforeScrollStart', () => {
          if (this.autoPlay) {
            clearTimeout(this.timer)
          }
        })
      },
      $_slider_initDoc () {
        this.dots = new Array(this.children.length)
      },
      $_slider_play () {
        let pageIndex = this.currentPageIndex + 1
        this.timer = setTimeout(() => {
          if (pageIndex === 5) {
            pageIndex = 0
          }
          this.slider.goToPage(pageIndex, 0, 400)
        }, this.interval)
      }
    }
  }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
  @import "../../public/sass/variable";

  .slider {
    min-height: 1px;
    .slider-group {
      position: relative;
      overflow: hidden;
      white-space: nowrap;
      .slider-item {
        float: left;
        box-sizing: border-box;
        overflow: hidden;
        text-align: center;
        a {
          display: block;
          width: 100%;
          overflow: hidden;
          text-decoration: none;
        }
        img {
          display: block;
          width: 100%;
        }
      }
    }
    .dots {
      position: absolute;
      right: 0;
      left: 0;
      bottom: 12px;
      text-align: center;
      font-size: 0;
      .dot {
        display: inline-block;
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
  }
</style>
