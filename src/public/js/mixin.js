import {mapGetters, mapMutations, mapActions} from 'vuex'
import {playMode} from 'public/js/config'
import {shuffle} from 'public/js/util'
// 在组件中导入改文件后通过mixins: [playlistMixin] 插入到组件中，相当于在组建中中写了这些方法，组件中的同名设置会覆盖这里的设置
export const playlistMixin = {
  computed: {
    ...mapGetters([
      'playlist'
    ])
  },
  watch: {
    playlist (newVal) {
      this.handlePlaylist(newVal)
    }
  },
  mounted () {
    this.handlePlaylist(this.playlist)
  },
  activated () {
    this.handlePlaylist(this.playlist)
  },
  methods: {
    // 这里的意思是，如果在组件导入该文件后没后实现handlePlaylist这个方法，则抛出异常错误
    handlePlaylist () {
      throw new Error('component must implement handlePlaylist method')
    }
  }
}

// playlist组件与player组件间的公用代码
export const playerMixin = {
  computed: {
    // 播放模式图标
    iconMode () {
      return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
    },
    ...mapGetters([
      'sequenceList',
      'currentSong',
      'playlist',
      'mode',
      'favoriteList'
    ])
  },
  methods: {
    // 切换收藏的状态(与收藏数据列表中删除已经被收藏的或者添加未被收藏的)
    toggleFavorite (song) {
      if (this.isFavorite(song)) {
        // 如果当前歌曲已经存在于收藏的数据列表中则删除（取消收藏）
        console.log('当前歌曲已经存在，删除！')
        this.deleteFavoriteList(song)
      } else {
        console.log('当前歌曲不存在，收藏！')
        // 如果当期哪个区不存在于收藏的数据列表中则添加（收藏当前歌曲）
        this.saveFavoriteList(song)
      }
    },
    // 设定对应的收藏按钮的样式
    getFavoriteIcon (song) {
      if (this.isFavorite(song)) {
        // console.log('icon-favorite:' + this.isFavorite(song))
        return 'icon-favorite'
      }
      // console.log('icon-not-favorite:' + this.isFavorite(song))
      return 'icon-not-favorite'
    },
    // 收藏按钮被点击时，当前歌曲是否已经存在于歌曲收藏数据中
    isFavorite (song) {
      const index = this.favoriteList.findIndex((item) => {
        return item.id === song.id
      })
      // console.log(this.favoriteList)
      // console.log(index)
      return index > -1
    },
    // 歌曲播放模式控制
    changeMode () {
      // mode + 1状态，同时因为有3种状态，因此对3取余
      const mode = (this.mode + 1) % 3
      this.setPlayMode(mode)
      let list = null
      if (mode === playMode.random) {
        list = shuffle(this.sequenceList)
      } else {
        list = this.sequenceList
      }
      this.resetCurrentIndex(list)
      this.setPlayList(list)
    },
    // 由于通过setPlayList修改播放模式会关联到currentSong即当前播放歌曲的修改，为了不修改currentSong，因此要重置其currentIndex即当前播放的歌曲索引
    // 在模式改变的时候同时设置当前播放歌曲为当前歌曲索引以保证当前播放的歌曲不会随着模式的切换而改变
    resetCurrentIndex (list) {
      // 在list当中找到song对应的索引
      let index = list.findIndex((item) => {
        return item.id === this.currentSong.id
      })
      this.setCurrentIndex(index)
    },
    // mutations提交
    ...mapMutations({
      setPlayingState: 'SET_PLAYING_STATE',
      setCurrentIndex: 'SET_CURRENT_INDEX',
      setPlayMode: 'SET_PLAY_MODE',
      setPlayList: 'SET_PLAYLIST'
    }),
    ...mapActions([
      'saveFavoriteList',
      'deleteFavoriteList'
    ])
  }
}

export const searchMixin = {
  data () {
    return {
      query: '',
      refreshDelay: 120
    }
  },
  computed: {
    ...mapGetters([
      'searchHistory'
    ])
  },
  methods: {
    // 保存搜索记录
    saveSearch () {
      this.saveSearchHistory(this.query)
    },
    // 输入框失焦
    blurInput () {
      this.$refs.searchBox.blur()
    },
    // 监听来自search-box的query事件并获取其query数据使其与区间query数据同步
    onQueryChange (query) {
      this.query = query
    },
    // 添加关键词
    addQuery (query) {
      this.$refs.searchBox.setQuery(query)
    },
    ...mapActions([
      'saveSearchHistory',
      'deleteSearchHistory'
    ])
  }
}
