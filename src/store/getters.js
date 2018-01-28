const singer = state => state.singer
// 播放器相关
// 播放控制
const playing = state => state.playing
// 全屏控制
const fullScreen = state => state.fullScreen
// 播放列表
const playlist = state => state.playlist
// 顺序列表
const sequenceList = state => state.sequenceList
// 播放模式
const mode = state => state.mode
// 播放索引
const currentIndex = state => state.currentIndex
// 当前播放歌曲
const currentSong = (state) => {
  return state.playlist[state.currentIndex] || {}
}
// 歌单
const disc = (state) => state.disc

// 排行榜
const topList = (state) => state.topList

// 搜索历史获取
const searchHistory = state => state.searchHistory

// 播放历史
const playHistory = state => state.playHistory

// 歌曲收藏
const favoriteList = state => state.favoriteList

export {singer, playing, fullScreen, playlist, sequenceList, mode, currentIndex, currentSong, disc, topList, searchHistory, playHistory, favoriteList}
