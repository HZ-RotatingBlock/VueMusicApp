<template>
  <!-- 检索结果组件 -->
  <scroll class="suggest" :data="result" :pullup="pullup" @scrollToEnd="searchMore" ref="suggest" :beforeScroll="beforeScroll" @beforeScroll="listScroll">
    <ul class="suggest-list">
      <li class="suggest-item" v-for="item in result" @click="selectItem(item)">
        <div class="icon">
          <i :class="getIconCls(item)"></i>
        </div>
        <div class="name">
          <p class="text" v-html="getDisplayName(item)"></p>
        </div>
      </li>
      <loading v-show="hasMore" title=""></loading>
    </ul>
    <div class="no-result-wrapper" v-show="!hasMore && !result.length">
      <no-result title="抱歉，暂无搜索结果"></no-result>
    </div>
  </scroll>
</template>

<script type="text/ecmascript-6">
  import {search} from 'api/search'
  import {ERR_OK} from 'api/config'
  import {createSong} from 'public/js/song'
  import Scroll from 'components/scroll/scroll'
  import Loading from 'components/loading/loading'
  import Singer from 'public/js/singer'
  import {mapMutations, mapActions} from 'vuex'
  import noResult from 'components/no-result/no-result'

  // 设置常量用以区分获取到的数据样式以及抓取指定数据
  const TYPE_SINGER = 'singer'
  // 每一页搜索结果数据一次返回的结果个数
  const perpage = 20

  export default {
    components: {
      Scroll,
      Loading,
      noResult
    },
    props: {
      // 检索结果依赖于外部传入的检索词
      query: {
        type: String,
        default: ''
      },
      showSinger: {
        type: Boolean,
        default: true
      }
    },
    data () {
      return {
        page: 1,
        result: [],
        pullup: true,
        // 标志位hasMore表示是否已经将搜索相关数据加载结束
        hasMore: true,
        beforeScroll: true
      }
    },
    watch: {
      query () {
        this.search()
      }
    },
    methods: {
      refresh () {
        this.$refs.suggest.refresh()
      },
      // 监听来自scroll组件的beforeScroll事件并触发对应方法来派发listScroll事件
      listScroll () {
        this.$emit('listScroll')
      },
      selectItem (item) {
        if (item.type === TYPE_SINGER) {
          const singer = new Singer({
            id: item.singermid,
            name: item.singername
          })
          this.$router.push({
            path: `/search/${singer.id}`
          })
          this.setSinger(singer)
        } else {
          this.insertSong(item)
        }
        this.$emit('select', item)
      },
      // 获取关键词搜索数据
      // query：搜索关键词；page:显示的页数；showSinger：搜索结果是否直达（如果搜索的不是歌曲而是歌手的话）
      search () {
        // 初次搜索时将page页数重置为 1 ，从而避免在下拉刷新后立即在搜索框输入新的搜索词而导致的page未重置而看不到数据的问题（其实已经请求到数据，只是由于page未重置而无法加载）
        this.page = 1
        // 重新出发search方法时一般都是搜索词发生了变化，因此改变标志位hasMore为true来使searchMore有机会加载更多数据
        this.hasMore = true
        // 将scroll组件（结果列表）从新定位到顶部，避免错位而造成加载失败的假象
        this.$refs.suggest.scrollTo(0, 0)
        search(this.query, this.page, this.showSinger, perpage).then((res) => {
          if (res.code === ERR_OK) {
            this.result = this.$_suggest_getResult(res.data)
            this.$_suggest_checkMore(res.data)
          }
        })
      },
      // 上拉加载更多搜索结果数据
      searchMore () {
        if (!this.hasMore) {
          return
        }
        // 若未加载结束则页数加 1 然后继续加载数据
        this.page++
        search(this.query, this.page, this.showSinger, perpage).then((res) => {
          if (res.code === ERR_OK) {
            // 由于已经不是第一次获取到结果数据，因此要将新获取的数据与此前的旧数据进行拼接
            this.result = this.result.concat(this.$_suggest_getResult(res.data))
            this.$_suggest_checkMore(res.data)
          }
        })
      },
      // 根据数据显示不同的图标
      getIconCls (item) {
        if (item.type === TYPE_SINGER) {
          return 'icon-mine'
        } else {
          return 'icon-music'
        }
      },
      // 根据数据显示不同的内容名
      getDisplayName (item) {
        if (item.type === TYPE_SINGER) {
          return item.singername
        } else {
          return `${item.name}-${item.singer}`
        }
      },
      // 由于请求的数据总有两个对象有数据因此需要先处理
      $_suggest_getResult (data) {
        let ret = []
        // 如果zhida对象存在且含有singerid字段则推入数据
        if (data.zhida && data.zhida.singerid) {
          // 推入所有的zhida对象数据以及内部含有指定TYPE_SINGER字符串值为singer的对象数据
          ret.push({...data.zhida, ...{type: TYPE_SINGER}})
        }
        // 如果数据中还存在song对象数据则将其list数据与现存的结果数组ret合并
        if (data.song) {
          ret = ret.concat(this.$_suggest_nomalizeSongs(data.song.list))
        }
        return ret
      },
      // 对搜索请求回来的数据进行进一步处理，获取其中的list歌曲列表数据
      // 这里的list数据与之前歌单列表等歌曲列表的数据结构基本一致
      // 将data.song.list数据装换为Song类的数据，便此前将api/song.js的内部方法filter暴露给外部
      $_suggest_nomalizeSongs (list) {
        let ret = []
        list.forEach((musicData) => {
          if (musicData.songid && musicData.albumid) {
            ret.push(createSong(musicData))
          }
        })
        return ret
      },
      // 判断何时将搜索结果数据加载开关关闭
      $_suggest_checkMore (data) {
        const song = data.song
        // 当列表数据为0或者（第一页20个数据 + 当前页数 * 每页数据数） > 歌曲数据总数的时候将加载标志位（加载加载开关关闭）
        if (!song.list.length || (song.curnum + song.curpage * perpage) > song.totalnum) {
          this.hasMore = false
        }
      },
      ...mapMutations({
        setSinger: 'SET_SINGER'
      }),
      ...mapActions([
        'insertSong'
      ])
    }
  }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
  @import "../../public/sass/variable";
  @import "../../public/sass/mixin";

  .suggest {
    height: 100%;
    overflow: hidden;
    .suggest-list {
      padding: 0 30px;
      .suggest-item {
        display: flex;
        align-items: center;
        padding-bottom: 20px;
      }
      .icon {
        flex: 0 0 30px;
        width: 30px;
        [class^="icon-"] {
          font-size: 14px;
          color: $color-text-d;
        }
      }
      .name {
        flex: 1;
        font-size: $font-size-medium;
        color: $color-text-d;
        overflow: hidden;
        .text {
          @include no-wrap();
        }
      }
    }
    .no-result-wrapper {
      position: absolute;
      width: 100%;
      top: 50%;
      transform: translateY(-50%);
    }
  }
</style>
