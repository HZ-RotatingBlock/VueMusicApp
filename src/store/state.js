import {playMode} from 'public/js/config'
import {loadSearch, loadPlay, loadFavorite} from 'public/js/cache'

const state = {
  singer: {},
  // 播放控制
  playing: false,
  // 全屏控制
  fullScreen: false,
  // 当前播放列表（切换播放模式时就是修改这个列表）
  playlist: [],
  // 原始播放列表
  sequenceList: [],
  // 播放模式
  mode: playMode.sequence,
  // 播放索引
  currentIndex: -1,
  // 歌单对象
  disc: {},
  // 排行榜对象
  topList: {},
  // 搜索结果历史
  searchHistory: loadSearch(),
  // 播放历史
  playHistory: loadPlay(),
  // 歌曲收藏
  favoriteList: loadFavorite()
}
export default state
