<template>
  <transition name="slide">
    <music-list :title="title" :bg-image="bgImg" :songs="songs" :rank="rank"></music-list>
  </transition>
</template>

<script type="text/ecmascript-6">
  import MusicList from 'views/music-list/music-list'
  import {mapGetters} from 'vuex'
  import {getMusicList} from 'api/rank'
  import {ERR_OK} from 'api/config'
  import {createSong} from 'public/js/song'

  export default {
    components: {
      MusicList
    },
    data () {
      return {
        songs: [],
        rank: true
      }
    },
    computed: {
      title () {
        return this.topList.topTitle
      },
      bgImg () {
        if (this.songs.length) {
          return this.songs[0].image
        }
        return ''
      },
      ...mapGetters([
        'topList'
      ])
    },
    created () {
      this.$_topList_getMusicList()
    },
    methods: {
      $_topList_getMusicList () {
        // 若未获取到排行榜音乐的列表id则回退到上一级
        if (!this.topList.id) {
          this.$router.back()
          return
        }
        getMusicList(this.topList.id).then((res) => {
          if (res.code === ERR_OK) {
            this.songs = this.$_topList_normalizeSongs(res.songlist)
          }
        })
      },
      $_topList_normalizeSongs (list) {
        let ret = []
        list.forEach((item) => {
          const musicData = item.data
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
  .slide-enter-active, .slide-leave-active {
    transition: all 0.3s ease;
  }
  .slide-enter, .slide-leave-to {
    opacity: 0;
    transform: translate3d(100%, 0, 0);
  }

</style>
