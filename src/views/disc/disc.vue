<template>
  <!-- 歌单详情页 -->
  <transition name="slide">
    <music-list :title="title" :bg-image="bgImg" :songs="songs"></music-list>
  </transition>
</template>

<script>
  import MusicList from 'views/music-list/music-list'
  import {mapGetters} from 'vuex'
  import {getSongList} from 'api/recommend'
  import {ERR_OK} from 'api/config'
  import {createSong} from 'public/js/song'

  export default {
    components: {
      MusicList
    },
    data () {
      return {
        songs: []
      }
    },
    computed: {
      title () {
        return this.disc.dissname
      },
      bgImg () {
        return this.disc.imgurl
      },
      ...mapGetters([
        'disc'
      ])
    },
    created () {
      this.$_disc_getSongList()
    },
    methods: {
        // 请求对应id的数据
      $_disc_getSongList () {
        // 在当前歌单页面直接刷新会导致获取不到数据
        // 因此需要判断若没有dissid的话就回退到父级路由路由
        if (!this.disc.dissid) {
          this.$router.back()
          // 使用this.$router.push('/recommend')返回到指定路由也可
          return
        }
        getSongList(this.disc.dissid).then((res) => {
          if (res.code === ERR_OK) {
            this.songs = this.$_disc_nomalizeSongs(res.cdlist[0].songlist)
          }
        })
      },
      // 数据处理
      $_disc_nomalizeSongs (list) {
        let ret = []
        list.forEach((musicData) => {
          if (musicData.songid && musicData.albumid) {
            // 为结果数组推入传入了musicData列表歌曲数据的Song的实例
            ret.push(createSong(musicData))
          }
        })
        return ret
      }
    }
  }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
  .slide-enter-active,
  .slice-leave-active {
    transition: all .3s
  }
  .slide-enter,
  .slide-leave-to {
    transform: translate3d(100%, 0, 0);
  }
</style>
