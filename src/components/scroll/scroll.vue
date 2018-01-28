<template>
  <!-- 滚动计算组件 -->
  <!-- 用于在页面变化需要better-scroll重新计算高度决定滚动的距离时的组件 -->
  <div ref="wrapper">
    <slot></slot>
  </div>
</template>

<script>
import BScroll from 'better-scroll'

export default {
  components: {
    BScroll
  },
  props: {
    probeType: {
      type: Number,
      default: 1
    },
    click: {
      type: Boolean,
      default: true
    },
    data: {
      type: Array,
      default: null
    },
    listenScroll: {
      type: Boolean,
      default: false
    },
    // 是否加载上拉刷新
    pullup: {
      type: Boolean,
      default: false
    },
    // better-scroll组件在滚动开始会派发一个beforeScrollStart事件，利用该事件修改beforeScroll的值以此解决移动端选择搜索页面搜索栏聚焦而使输入法键盘遮挡搜索结果的问题
    beforeScroll: {
      type: Boolean,
      default: false
    },
    refreshDelay: {
      type: Number,
      default: 20
    }
  },
  watch: {
    data () {
      setTimeout(() => {
        this.refresh()
      }, this.refreshDelay)
    }
  },
  mounted () {
    setTimeout(() => {
      this.$_scroll_initScroll()
    }, 20)
  },
  methods: {
    enable () {
      this.scroll && this.scroll.enable()
    },
    disable () {
      this.scroll && this.scroll.disable()
    },
    refresh () {
      this.scroll && this.scroll.refresh()
    },
    scrollTo () {
      // scrollTo会接收一些参数，我们要把参数传递到scrollTo中，因此需要使用apply
      this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments)
    },
    scrollToElement () {
      this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments)
    },
    $_scroll_initScroll () {
      // 没有获取到dom就返回
      if (!this.$refs.wrapper) {
        return
      }
      this.scroll = new BScroll(this.$refs.wrapper, {
        probeType: this.probeType,
        click: this.click
      })

      if (this.listenScroll) {
        // 外层保留Vue实例的this
        let me = this
        // pos是一个对象，他有X和Y轴的属性
        this.scroll.on('scroll', (pos) => {
          me.$emit('scroll', pos)
        })
      }
      // 根据pullup的值来决定是否开启上拉刷新
      if (this.pullup) {
        // 监听滚动结束事件scrollEnd
        this.scroll.on('scrollEnd', () => {
          // 如果scroll的在y轴上的滚动值小于scroll.maxScrollY + 50最大滚动值+50的时候说明已经快滚动到底部了
          // 此时派发scrollToEnd事件
          if (this.scroll.y <= (this.scroll.maxScrollY + 50)) {
            // scrollEnd表示滚动停止,scrollToEnd表示滚动达到底部了
            this.$emit('scrollToEnd')
          }
        })
      }

      if (this.beforeScroll) {
        this.scroll.on('beforeScrollStart', () => {
          this.$emit('beforeScroll')
        })
      }
    }
  }
}
</script>

<style scoped lang="scss" rel="stylesheet/scss">

</style>
