<template>
  <!-- 播放列表 -->
  <transition name="list-fade">
    <div class="playlist" v-show="showFlag" @click="hide">
      <div class="list-wrapper" @click.stop>
        <div class="list-header">
          <h1 class="title">
            <i class="icon" :class="iconMode" @click="changeMode"></i>
            <span class="text">{{ modeText }}</span>
            <span class="clear" @click="showConfirm"><i class="icon-clear"></i></span>
          </h1>
        </div>
        <scroll class="list-content" :data="sequenceList" ref="listContent" :refreshDelay="refreshDelay">
          <transition-group name="list" tag="ul">
            <li class="item" v-for="(item, index) in sequenceList" :key="item.id" :class="getCurrentIcon(item)" @click="selectItem(item, index)" ref="listItem">
              <i class="current"></i>
              <span class="text">{{ item.name }}</span>
              <span class="like" @click.stop="toggleFavorite(item)">
                <i :class="getFavoriteIcon(item)"></i>
              </span>
              <span class="delete" @click.stop="deleteOne(item)">
                <i class="icon-delete"></i>
              </span>
            </li>
          </transition-group>
        </scroll>
        <div class="list-operate">
          <div class="add" @click="addSong">
            <i class="icon-add"></i>
            <span class="text">添加歌曲到队列</span>
          </div>
        </div>
        <div class="list-close" @click="hide">
          <span>关闭</span>
        </div>
      </div>
      <confirm ref="confirm" text="是否清空播放列表" confirmBtnText="清空" @confirm="confirmClear"></confirm>
      <add-song ref="addSong"></add-song>
    </div>
  </transition>
</template>

<script type="text/ecmascript-6">
  import {mapActions} from 'vuex'
  import {playMode} from 'public/js/config'
  import Scroll from 'components/scroll/scroll'
  import Confirm from 'components/confirm/confirm'
  import {playerMixin} from 'public/js/mixin'
  import AddSong from 'views/add-song/add-song'

  export default {
    mixins: [playerMixin],
    components: {
      Scroll,
      Confirm,
      AddSong
    },
    data () {
      return {
        // 控制当前播放列表的显示隐藏
        showFlag: false,
        // 定义重新计算当前播放列表的时间
        refreshDelay: 100
      }
    },
    computed: {
      modeText () {
        return this.mode === playMode.sequence ? '顺序播放' : this.mode === playMode.random ? '随机播放' : '单曲循环'
      }
    },
    watch: {
      // 监视当前播放的歌曲，有变化时使当前播放列表滚动到当前播放的歌曲的位置
      currentSong (newSong, oldSong) {
        // 如果当前播放列表未张开或者切换后的歌曲与切换后的歌曲相同则直接返回不变
        if (!this.showFlag || newSong.id === oldSong.id) {
          return
        }
        this.scrollToCurrent(newSong)
      }
    },
    methods: {
      addSong () {
        this.$refs.addSong.show()
      },
      // 清空猎列表
      confirmClear () {
        this.deleteSongList()
        this.hide()
      },
      showConfirm () {
        this.$refs.confirm.show()
      },
      // 播放列表单项删除
      deleteOne (item) {
        this.deleteSong(item)
        if (!this.playlist.length) {
          this.hide()
        }
      },
      // 选择播放列表中的某一首歌时则切换到给该首歌播放
      selectItem (item, index) {
        // 如果当前播放模式为随机播放时
        // 获取当前的播放列表playlist并从其中寻找播放id一致的歌曲并返回匹配的歌曲下标index值
        if (this.mode === playMode.random) {
          index = this.playlist.findIndex((song) => {
            return song.id === item.id
          })
        }
        // 设置当前播放歌曲下标
        this.setCurrentIndex(index)
        this.setPlayingState(true)
      },
      // 当前播放的歌曲样式
      getCurrentIcon (item) {
        if (this.currentSong.id === item.id) {
          return 'icon-play'
        }
        return ''
      },
      // 控制播放列表出现
      show () {
        this.showFlag = true
        setTimeout(() => {
          // 在播放列表展开后重新计算列表高度以使得scroll组件的滚动功能能生效
          this.$refs.listContent.refresh()
          // 播放列表展开时滚动到当前播放列表的位置
          this.scrollToCurrent(this.currentSong)
        }, 20)
      },
      // 控制播放列表隐藏
      hide () {
        this.showFlag = false
      },
      // 使播放列表滚动到当前播放的歌曲的位置
      scrollToCurrent (current) {
        const index = this.sequenceList.findIndex((song) => {
          return current.id === song.id
        })
        this.$refs.listContent.scrollToElement(this.$refs.listItem[index], 300)
      },
      ...mapActions([
        'deleteSong',
        'deleteSongList'
      ])
    }
  }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
  @import "../../public/sass/variable";
  @import "../../public/sass/mixin";

  .playlist {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 200;
    background-color: $color-background-d;
    &.list-fade-enter-active,
    &.list-fade-leave-active {
      transition: opacity 0.3s;
      .list-wrapper {
        transition: all 0.3s;
      }
    }
    &.list-fade-enter,
    &.list-fade-leave-to {
      opacity: 0;
      .list-wrapper {
        transform: translate3d(0, 100%, 0);
      }
    }
    &.list-fade-enter,
    .list-wrapper {
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
      background-color: $color-highlight-background;
      .list-header {
        position: relative;
        padding: 20px 30px 10px 20px;
        .title {
          display: flex;
          align-items: center;
          .icon {
            margin-right: 10px;
            font-size: 30px;
            color: $color-theme-d;
          }
          .text {
            flex: 1;
            font-size: $font-size-medium;
            color: $color-text-l;
          }
          .clear {
            @include extend-click();
            .icon-clear {
              font-size: $font-size-medium;
              color: $color-text-d;
            }
          }
        }
      }
      .list-content {
        max-height: 240px;
        overflow: hidden;
        .item {
          display: flex;
          align-items: center;
          height: 40px;
          padding: 0 30px 0 20px;
          overflow: hidden;
          &.list-enter-active, &.list-leave-active {
            transition: all 0.2s;
          }
          &.list-enter, &.list-leave-to {
            height: 0;
          }
          .current {
            flex: 0 0 20px;
            width: 20px;
            font-size: $font-size-small;
            color: $color-theme-d;
          }
          .text {
            flex: 1;
            @include no-wrap();
            font-size: $font-size-medium;
            color: $color-text-d;
          }
          .like {
            @include extend-click();
            margin-right: 15px;
            font-size: $font-size-small;
            color: $color-theme;
            .icon-favorite {
              color: $color-sub-theme;
            }
          }
          .delete {
            @include extend-click();
            font-size: $font-size-small;
            color: $color-theme;
          }
        }
      }
      .list-operate {
        width: 140px;
        margin: 20px auto 30px auto;
        .add {
          display: flex;
          align-items: center;
          padding: 8px 16px;
          border: 1px solid $color-text-l;
          border-radius: 100px;
          color: $color-text-l;
          .icon-add {
            margin-right: 5px;
            font-size: $font-size-small-s;
          }
          .text {
            font-size: $font-size-small;
          }
        }
      }
      .list-close {
        text-align: center;
        line-height: 50px;
        background: $color-background;
        font-size: $font-size-medium-x;
        color: $color-text-l;
      }
    }
  }
</style>
