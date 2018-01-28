<template>
  <!-- 列表选择组件 -->
  <scroll class="listview"
          :data="data"
          ref="listview"
          :listenScroll="listenScroll"
          @scroll="scroll"
          :probeType="probeType"
   >
    <ul>
      <li v-for="group in data" class="list-group" ref="listGroup">
        <h2 class="list-group-title">{{group.title}}</h2>
        <ul>
          <li @click="selectItem(item)" v-for="item in group.items" class="list-group-item">
            <img class="avatar" v-lazy="item.avatar">
            <span class="name">{{ item.name }}</span>
          </li>
        </ul>
      </li>
    </ul>
    <div class="list-shortcut" @touchstart="onShortcutTouchStart" @touchmove.stop.prevent="onShortcutTouchMove">
      <ul>
        <li v-for="(item, index) in shortcutList" class="item" :data-index="index" :class="{current: currentIndex === index}">
          {{ item }}
        </li>
      </ul>
    </div>
    <!-- 相对于视窗定位的标题，提升用户体验 -->
    <div class="list-fixed" v-show="fixedTitle" ref="fixed">
      <h1 class="fixed-title">{{ fixedTitle }}</h1>
    </div>
    <div v-show="!data.length" class="loading-container">
      <loading></loading>
    </div>
  </scroll>
</template>

<script type="text/ecmascript-6">
  import Scroll from 'components/scroll/scroll'
  import Loading from 'components/loading/loading'
  import { getData } from 'public/js/dom'

  const ANCHOR_HEIGHT = 18
  const TITLE_HEIGHT = 30

  export default {
    components: {
      Scroll,
      Loading
    },
    props: {
      data: {
        type: Array,
        default: []
      }
    },
    data () {
      return {
        scrollY: -1,
        currentIndex: 0,
        diff: -1
      }
    },
    computed: {
      shortcutList () {
        return this.data.map((group) => {
          return group.title.slice(0, 1)
        })
      },
      fixedTitle () {
        if (this.scrollY > 0) {
          return ''
        }
        return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
      }
    },
    watch: {
      data () {
        setTimeout(() => {
          this.$_listview_calculateHeight()
        }, 20)
      },
      scrollY (newY) {
        const listHeight = this.listHeight
        // 当滚动到顶部，newY > 0
        if (newY > 0) {
          this.currentIndex = 0
          return
        }
        // 在中间部分滚动
        for (let i = 0, len = listHeight.length - 1; i < len; i++) {
          let height1 = listHeight[i]
          let height2 = listHeight[i + 1]
          if ((-newY >= height1 && -newY < height2)) {
            this.currentIndex = i
            // this.diff等于每个分类部分的位置减去滚动的距离
            this.diff = height2 + newY
            return
          }
        }
        // 当滚动到底部且-newY大于最后一个元素的上限
        this.currentIndex = listHeight.length - 2
      },
      // 观测diff的变化来设置fixed-title的偏移
      diff (newVal) {
        let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0
        // 判断是否已经真正变化，若有变化才改变dom，否则不变，减少修改dom的次数
        // this.fixed初始为undefined
        // 当滑动并使diff变化过一次后就会赋予fixedTop的实时变化值
        // 当根据上方变化fixedTop的值为0时，与被其赋值的this.fixedTop做比对
        // 相当于两个都为0则立即返回不对dom做变化操作，以达到减少操作的目的
        if (this.fixedTop === fixedTop) {
          return
        }
        this.fixedTop = fixedTop
        this.$refs.fixed.style.transform = `translate3d(0, ${fixedTop}px, 0)`
      }
    },
    created () {
      // 声明对象用以记录手指缓动前后的y轴值用以计算滑动距离
      this.touch = {}
      this.listenScroll = true
      // 用于存储每个分类应滚动距离的高度，用以与右侧索引列表对应
      this.listHeight = []
      this.probeType = 3
    },
    methods: {
      selectItem (item) {
        this.$emit('select', item)
      },
      refresh () {
        this.$refs.listview.refresh()
      },
      // 实时获取scroll.y即滚动的y轴坐标
      scroll (pos) {
        this.scrollY = pos.y
      },
      // 获取快捷栏对应标志的index
      onShortcutTouchStart (e) {
        let anchorIndex = getData(e.target, 'index')
        // touches是手指位置，touches[0]就是第一个手指位置
        let firstTouch = e.touches[0]
        // 记录手指第一次触碰的y轴值
        this.touch.y1 = firstTouch.pageY
        // 开始点击的锚点是第几个
        this.touch.anchorIndex = anchorIndex
        this.$_listview_scrollTo(anchorIndex)
      },
      onShortcutTouchMove (e) {
        let firstTouch = e.touches[0]
        // 记录手指第二次触碰的y轴值
        this.touch.y2 = firstTouch.pageY
        // 计算滑动前后手指触碰的y轴差,计算偏移了几个锚点
        let delta = Math.floor((this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT)
        // 得到 move 时的 index
        let anchorIndex = parseInt(this.touch.anchorIndex + delta)
        this.$_listview_scrollTo(anchorIndex)
      },
      // 滑动到指定的下标位置
      $_listview_scrollTo (index) {
        // 设置右侧索引表在两侧多余的部分点击无效化
        if (!index && index !== 0) {
          return
        }
        if (index < 0) {
          index = 0
        } else if (index > this.listHeight.length - 2) {
          index = this.listHeight.length - 2
        }
        this.scrollY = -this.listHeight[index]
        this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 1000)
      },
      $_listview_calculateHeight () {
        this.listHeight = []
        const list = this.$refs.listGroup
        let height = 0
        this.listHeight.push(height)
        // 遍历每一个分类栏
        for (let i = 0, len = list.length; i < len; i++) {
          let item = list[i]
          // 增加每一个分类栏的高度
          height += item.clientHeight
          this.listHeight.push(height)
        }
      }
    }
  }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
  @import "../../public/sass/variable";

  .listview {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: $color-background;
    .list-group {
      padding-bottom: 30px;
      .list-group-title {
        height: 30px;
        line-height: 30px;
        padding-left: 20px;
        font-size: $font-size-small;
        color: $color-text-l;
        background: $color-highlight-background;
      }
      .list-group-item {
        display: flex;
        align-items: center;
        padding: 20px 0 0 30px;
        .avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
        }
        .name {
          margin-left: 20px;
          color: $color-text-l;
          font-size: $font-size-medium;
        }
      }
    }
    .list-shortcut {
      position: absolute;
      z-index: 30;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 20px;
      padding: 20px 0;
      border-radius: 10px;
      text-align: center;
      background: $color-background-d;
      font-family: Helvetica;
      .item {
        padding: 3px;
        line-height: 1;
        color: $color-text-l;
        font-size: $font-size-small;
        &.current {
          color: $color-theme;
        }
      }
    }
    .list-fixed {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      .fixed-title {
        height: 30px;
        line-height: 30px;
        padding-left: 20px;
        font-size: $font-size-small;
        color: $color-text-l;
        background: $color-highlight-background;
      }
    }
    .loading-container {
      position: absolute;
      width: 100%;
      top: 50%;
      transform: translateY(-50%);
    }
  }

</style>
