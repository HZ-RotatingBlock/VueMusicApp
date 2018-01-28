import * as types from './mutation-types'
import {playMode} from 'public/js/config'
import {shuffle} from 'public/js/util'
import {saveSearch, deleteSearch, clearSearch, savePlay, saveFavorite, deleteFavorite} from 'public/js/cache'

function findIndex (list, song) {
  return list.findIndex((item) => {
    return item.id === song.id
  })
}
// 选择播放
const selectPlay = function ({commit, state}, {list, index}) {
  // 设置原始播放列表
  commit(types.SET_SEQUENCE_LIST, list)
  // 如果是随机播放模式，则洗牌后再提交
  if (state.mode === playMode.random) {
    let randomList = shuffle(list)
    commit(types.SET_PLAYLIST, randomList)
    // 找到当前这首歌在randomList中的索引
    index = findIndex(randomList, list[index])
  } else {
    // 设置当前播放列表
    commit(types.SET_PLAYLIST, list)
  }

  // 设置当前播放歌曲索引
  commit(types.SET_CURRENT_INDEX, index)
  // 设置全屏
  commit(types.SET_FULL_SCREEN, true)
  // 设置播放状态（暂停或播放）
  commit(types.SET_PLAYING_STATE, true)
}
// 随机播放
const randomPlay = function ({commit}, {list}) {
  commit(types.SET_PLAY_MODE, playMode.random)
  commit(types.SET_SEQUENCE_LIST, list)
  let randomlist = shuffle(list)
  commit(types.SET_PLAYLIST, randomlist)
  commit(types.SET_CURRENT_INDEX, 0)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

export {selectPlay, randomPlay}

// 当前播放列表操作
export const insertSong = function ({commit, state}, song) {
  // 当前播放列表
  // 由于是数组类型的引用，因此需要拷贝副本来使用而不是直接使用，否则会报错，因为不使用副本则相当于直接改变了原来的数组数据，即不通过mutations直接去修改了state，因此需要通过slice()拷贝副本后再使用
  let playlist = state.playlist.slice(0)
  // 顺序播放列表
  // 由于是数组类型的引用，因此需要拷贝副本来使用而不是直接使用，否则会报错，因为不使用副本则相当于直接改变了原来的数组数据，即不通过mutations直接去修改了state，因此需要通过slice()拷贝副本后再使用
  let sequenceList = state.sequenceList.slice(0)
  // 当前歌曲下标
  let currentIndex = state.currentIndex
  // 记录当前歌曲
  let currentSong = playlist[currentIndex]
  // 查找当前列表中是否有待插入的歌曲并返回其索引
  let fpIndex = findIndex(playlist, song)
  // 因为是插入歌曲所以索引要加一
  currentIndex++
  // 插入这首歌到当前索引位置
  playlist.splice(currentIndex, 0, song)
  // 如果已经包含了这首歌则删除
  if (fpIndex > -1) {
    // 如果当前插入的序号大于列表中的序号
    if (currentIndex > fpIndex) {
      playlist.splice(fpIndex, 1)
      currentIndex--
    } else {
      playlist.splice(fpIndex + 1, 1)
    }
  }

  // 找到当前歌曲在顺序列表中所处的位置并返回其位置小标+1
  let currentSIndex = findIndex(sequenceList, currentSong) + 1
  // 要插入的歌曲是否已经存在于顺序播放列表中的位置
  let fsIndex = findIndex(sequenceList, song)
  sequenceList.splice(currentSIndex, 0, song)

  if (fsIndex > -1) {
    if (currentSIndex > fsIndex) {
      sequenceList.splice(fsIndex, 1)
    } else {
      sequenceList.splice(fsIndex + 1, 1)
    }
  }

  commit(types.SET_PLAYLIST, playlist)
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_CURRENT_INDEX, currentIndex)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}
// 存储搜索结果
export const saveSearchHistory = function ({commit}, query) {
  commit(types.SET_SEARCH_HISTORY, saveSearch(query))
}
// 删除搜索结果
export const deleteSearchHistory = function ({commit}, query) {
  commit(types.SET_SEARCH_HISTORY, deleteSearch(query))
}

// 清空搜索历史记录列表
export const clearSearchHistory = function ({commit}) {
  commit(types.SET_SEARCH_HISTORY, clearSearch())
}

// 当前播放列表的歌曲删除
export const deleteSong = function ({commit, state}, song) {
  let playlist = state.playlist.slice(0)
  let sequenceList = state.sequenceList.slice(0)
  let currentIndex = state.currentIndex
  // 从playlist即歌曲列表中找到需要删除的歌曲然后返回下标pIndex
  let pIndex = findIndex(playlist, song)
  // 删除指定播放列表中的歌曲
  playlist.splice(pIndex, 1)
  // 从sequenceList的顺序播放列表中找到需删除的歌曲并返回下标sIndex
  let sIndex = findIndex(sequenceList, song)
  // 删除顺序列表中的指定歌曲
  sequenceList.splice(sIndex, 1)
  // 如果当前播放的歌曲下标处在需要删除的歌曲下标之后，那么在删除同时需要将当前播放的歌曲的下标 -1 ，以使得歌曲继续正确播放
  // 如果当前播放的歌曲下标为播放列表的最后一位（即歌曲列表的长度），那么在删除同时需要将当前播放的歌曲下标 -1， 以使得歌曲继续正确播放
  if (currentIndex > pIndex || currentIndex === playlist.length) {
    currentIndex--
  }
  // 提交修改后的各个列表
  commit(types.SET_PLAYLIST, playlist)
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_CURRENT_INDEX, currentIndex)

  const playingState = playlist.length > 0
  // 如果删除指定歌曲后歌曲列表已无内容则将播放状态置为暂停状态
  commit(types.SET_PLAYING_STATE, playingState)
}
// 删除歌曲列表
export const deleteSongList = function ({commit}) {
  commit(types.SET_PLAYLIST, [])
  commit(types.SET_SEQUENCE_LIST, [])
  commit(types.SET_CURRENT_INDEX, -1)
  commit(types.SET_PLAYING_STATE, false)
}
// 保存搜索历史
export const savePlayHistory = function ({commit}, song) {
  commit(types.SET_PLAY_HISTORY, savePlay(song))
}

// 收藏歌曲
export const saveFavoriteList = function ({commit}, song) {
  commit(types.SET_FAVORITE_LIST, saveFavorite(song))
}

// 取消收藏歌曲
export const deleteFavoriteList = function ({commit}, song) {
  commit(types.SET_FAVORITE_LIST, deleteFavorite(song))
}
