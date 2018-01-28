<template>
  <div class="singer" ref="singer">
    <list-view :data="singers" @select="selectSinger" ref="list"></list-view>
    <transition name="move">
      <router-view></router-view>
    </transition>
  </div>
</template>

<script>
import {getSingerList} from 'api/singer'
import {ERR_OK} from 'api/config'
import Singer from 'public/js/singer'
import ListView from 'components/listview/listview'
import { mapMutations } from 'vuex'
import {playlistMixin} from 'public/js/mixin'

const HOT_NAME = '热门'
const HOT_SINGER_LEN = 10

export default {
  mixins: [playlistMixin],
  components: {
    ListView
  },
  data () {
    return {
      singers: []
    }
  },
  created () {
    this.$_singer_getSingerList()
  },
  methods: {
    selectSinger (singer) {
      this.$router.push({
        path: `/singer/${singer.id}`
      })
      this.setSinger(singer)
    },
    handlePlaylist (playlist) {
      const bottom = playlist.length > 0 ? '60px' : '0'
      this.$refs.singer.style.bottom = bottom
      this.$refs.list.refresh()
    },
    $_singer_getSingerList () {
      getSingerList().then((res) => {
        if (res.code === ERR_OK) {
          this.singers = this.$_singer_normalizeSinger(res.data.list)
        }
      }).catch((err) => {
        console.log('请求失败，错误信息：' + err)
      })
    },
    $_singer_normalizeSinger (list) {
      let map = {
        hot: {
          title: HOT_NAME,
          items: []
        }
      }
      // 遍历数据
      list.forEach((item, index) => {
        // 取数据前十条为热门
        if (index < HOT_SINGER_LEN) {
          map.hot.items.push(new Singer({
            id: item.Fsinger_mid,
            name: item.Fsinger_name
          }))
        }
        // 按照字母分类，Findex表示为当前便利到的歌手姓名开头字母的数据
        const key = item.Findex
        // 如果map对象中不存在当前遍历到的字母，则创建
        if (!map[key]) {
          map[key] = {
            title: key,
            items: []
          }
        }
        // 如果map对象中存在当前遍历到的字母，则将数据推入对应字母对象的item数组中
        map[key].items.push(new Singer({
          id: item.Fsinger_mid,
          name: item.Fsinger_name
        }))
      })
      // 为了的到有序列表，我们需要处理 map
      let hot = []
      let ret = []
      for (let key in map) {
        let val = map[key]
        if (val.title.match(/[a-zA-Z]/)) {
          ret.push(val)
        } else if (val.title === HOT_NAME) {
          hot.push(val)
        }
      }
      ret.sort((a, b) => {
        // charCodeAt() 方法可返回指定位置的字符的 Unicode 编码。这个返回值是 0 - 65535 之间的整数
        return a.title.charCodeAt(0) - b.title.charCodeAt(0)
      })
      return hot.concat(ret)
    },
    ...mapMutations({
      setSinger: 'SET_SINGER'
    })
  }
}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
  .move-enter-active,
  .move-leave-active {
    transition: all .3s;
  }
  .move-enter,
  .move-leave-to {
    transform: translate3d(100%, 0, 0);
    opacity: 0;
  }

  .singer {
    position: fixed;
    top: 88px;
    bottom: 0;
    width: 100%;
  }
</style>
