<template>
  <!-- 搜索框 -->
  <div class="search-box">
    <i class="icon-search"></i>
    <input class="box" :placeholder="placeholder" v-model="query" ref="query"/>
    <i class="icon-dismiss" v-show="query" @click="clear"></i>
  </div>
</template>

<script type="text/ecmascript-6">
  import { debounce } from 'public/js/util'

  export default {
    props: {
      placeholder: {
        type: String,
        default: '搜索歌曲、歌手'
      }
    },
    data () {
      return {
        query: ''
      }
    },
    created () {
      // 这里的$watch功能与平时的watch监视器功能一样，在这里使用主要是因为：
      // 监听query的变化并发送事件及其数据
      // 为了避免输入框中的关键词变化而导致频繁请求的问题，需要使用导入的util插件中的debounce函数对其回调进行函数节流
      this.$watch('query', debounce((newQuery) => {
        this.$emit('query', newQuery)
      }, 200))
    },
    methods: {
      // 搜索框置空
      clear () {
        this.query = ''
      },
      // 将选择的关键词添加到搜索框中
      setQuery (query) {
        this.query = query
      },
      // 供父层操作以使输入框失焦的blur方法
      blur () {
        this.$refs.query.blur()
      }
    }
  }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
  @import "../../public/sass/variable";

  .search-box {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    width: 100%;
    padding: 0 6px;
    height: 40px;
    background: $color-highlight-background;
    border-radius: 6px;
    .icon-search {
      font-size: 24px;
      color: $color-text;
    }
    .box {
      flex: 1;
      margin: 0 5px;
      line-height: 18px;
      background: $color-highlight-background;
      color: $color-text;
      font-size: $font-size-medium;
      &::placeholder {
        color: $color-text-d;
      }
    }
    .icon-dismiss {
      font-size: 16px;
      color: $color-text;
    }
  }
</style>
