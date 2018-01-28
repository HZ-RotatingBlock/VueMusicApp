<template>
  <transition name="slide">
    <div class="add-song" v-show="showFlag" @click.stop>
      <div class="header">
        <h1 class="title">添加歌曲到列表</h1>
        <div class="close" @click="hide">
          <i class="icon-close"></i>
        </div>
      </div>
      <div class="search-box-wrapper">
        <search-box ref="searchBox" placeholder="搜索歌曲" @query="onQueryChange"></search-box>
      </div>
      <div class="shortcut" v-show="!query">
        <switches :switches="switches" :currentIndex="currentIndex" @switch="switchItem"></switches>
        <!-- 列表切换 -->
        <div class="list-wrapper">
          <!-- 最近播放 -->
          <!-- 当前索引是第一个时就显示列表 -->
          <scroll ref="songList" class="list-scroll" v-if="currentIndex === 0" :data="playHistory">
            <div class="list-inner">
              <song-list :songs="playHistory" @select="selectSong"></song-list>
            </div>
          </scroll>
          <!-- 搜索历史 -->
          <scroll class="list-scroll" v-if="currentIndex === 1" :data="searchHistory" ref="searchList" :refreshDelay="refreshDelay">
            <div class="list-inner">
              <search-list @delete="deleteSearchHistory" @select="addQuery" :searches="searchHistory"></search-list>
            </div>
          </scroll>
        </div>
      </div>
      <div class="search-result" v-show="query">
        <suggest :query="query" :showSinger="showSinger" @select="selectSuggest" @listScroll="blurInput"></suggest>
      </div>
      <top-tip ref="topTip">
        <div class="tip-title">
          <i class="icon-ok"></i>
          <span class="text">1首歌曲已经添加到播放列表</span>
        </div>
      </top-tip>
    </div>
  </transition>
</template>

<script type="text/ecmascript-6">
  import SearchBox from 'components/search-box/search-box'
  import Suggest from 'views/suggest/suggest'
  import {searchMixin} from 'public/js/mixin'
  import Switches from 'components/switches/switches'
  import Scroll from 'components/scroll/scroll'
  import SongList from 'components/song-list/song-list'
  import {mapGetters, mapActions} from 'vuex'
  import Song from 'public/js/song'
  import SearchList from 'components/search-list/search-list'
  import TopTip from 'components/top-tip/top-tip'

  export default {
    mixins: [searchMixin],
    components: {
      SearchBox,
      Suggest,
      Switches,
      Scroll,
      SongList,
      SearchList,
      TopTip
    },
    computed: {
      ...mapGetters([
        'playHistory'
      ])
    },
    data () {
      return {
        showFlag: false,
        showSinger: false,
        currentIndex: 0,
        switches: [
          {name: '最近播放'},
          {name: '搜索历史'}
        ]
      }
    },
    methods: {
      // 显示成功添加歌曲的提示框
      showTip () {
        this.$refs.topTip.show()
      },
      // 在添加歌曲到列表的最近播放栏中，每一项最近播放的歌曲如果被选择点中则将其插入到最近播放列表的最前方，同时自动播放，该流程由为每一个li绑定的对应的selectSong方法控制
      // 传入两个参数：song 为当前被选中的项目歌曲， index 为对应的下标
      // 该函数是通过监听song-list组件的select事件触发的
      selectSong (song, index) {
        if (!index !== 0) {
          // 注意这里直接插入song-list传递过来的song数据时不行的，因为传递过来的song仅仅是一个对象而不是实例，因此需要通过导入公共功能的song模块来将其转换为Song的实例对象再进行插入
          this.insertSong(new Song(song))
          // 显示成功添加提示框
          this.showTip()
        }
      },
      // 添加歌曲到队列的选项卡切换
      switchItem (index) {
        this.currentIndex = index
      },
      // 记录搜索结果
      selectSuggest () {
        this.saveSearch()
        // 显示成功添加提示框
        this.showTip()
      },
      show () {
        this.showFlag = true
        setTimeout(() => {
          if (this.currentIndex === 0) {
            this.$refs.songList.refresh()
          } else {
            this.$refs.searchList.refresh()
          }
        }, 20)
      },
      hide () {
        this.showFlag = false
      },
      ...mapActions([
        'insertSong'
      ])
    }
  }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
  @import "../../public/sass/variable";
  @import "../../public/sass/mixin";

  .add-song {
    position: fixed;
    top: 0;
    bottom: 0;
    width: 100%;
    z-index: 200;
    background: $color-background-player;
    &.slide-enter-active, &.slide-leave-active {
      transition: all 0.3s;
    }
    &.slide-enter, &.slide-leave-to {
      transform: translate3d(100%, 0, 0);
    }
    .header {
      position: relative;
      height: 44px;
      text-align: center;
      .title {
        line-height: 44px;
        font-size: $font-size-large;
        color: $color-text;
      }
      .close {
        position: absolute;
        top: 0;
        right: 8px;
        .icon-close {
          display: block;
          padding: 12px;
          font-size: 20px;
          color: $color-theme;
        }
      }
    }
    .search-box-wrapper {
      margin: 20px;
    }
    .shortcut {
      .list-wrapper {
        position: absolute;
        top: 165px;
        bottom: 0;
        width: 100%;
        .list-scroll {
          height: 100%;
          overflow: hidden;
          .list-inner {
            padding: 20px 30px;
          }
        }
      }
    }
    .search-result {
      position: fixed;
      top: 124px;
      bottom: 0;
      width: 100%;
    }
    .tip-title {
      text-align: center;
      padding: 18px 0;
      font-size: 0;
      .icon-ok {
        font-size: $font-size-medium;
        color: $color-theme;
        margin-right: 4px;
      }
      .text {
        font-size: $font-size-medium;
        color: $color-text;
      }
    }
  }
</style>
