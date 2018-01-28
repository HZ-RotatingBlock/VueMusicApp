<template>
  <transition name="slide">
    <music-list :songs="songs" :title="title" :bg-image="bgImage"></music-list>
  </transition>
</template>

<script type="text/ecmascript-6">
  import { mapGetters } from 'vuex'
  import { getSingerDetail } from 'api/singer'
  import { ERR_OK } from 'api/config'
  import { createSong } from 'public/js/song'
  import MusicList from 'views/music-list/music-list'

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
        return this.singer.name
      },
      bgImage () {
        return this.singer.avatar
      },
      ...mapGetters([
        'singer'
      ])
    },
    created () {
      this.$_singerDetail_getDetail()
    },
    methods: {
      $_singerDetail_getDetail () {
        // 如果数据对应id不存在，则自动回到前一个页面
        if (!this.singer.id) {
          this.$router.push('/singer')
          return
        }
        getSingerDetail(this.singer.id).then((res) => {
          if (res.code === ERR_OK) {
            this.songs = this.$_singerDetail_normalizeSongs(res.data.list)
          }
        })
      },
      $_singerDetail_normalizeSongs (list) {
        let ret = []
        list.forEach((item) => {
          let { musicData } = item
          if (musicData.songid && musicData.albummid) {
            ret.push(createSong(musicData))
          }
        })
        return ret
      }
    }
  }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
  @import "../../public/sass/variable.scss";

  .slide-enter-active, .slide-leave-active {
    transition: all 0.3s;
  }
  .slide-enter, .slide-leave-active {
    transform: translate3d(100%, 0, 0);
  }
</style>
