// 操作和storage相关的逻辑模块
import storage from 'good-storage'

// 之后还需要缓存搜索历史和播放历史等等，每个缓存都需要定义一个key，因此这里先定义搜索的key
const SEARCH_KEY = '__search__'
// 最大存储长度
const SEARCH_MAX_LENTH = 15

const PLAY_KEY = '__play__'
const PLAY_MAX_LENGTH = 200

const FAVORITE_KEY = '__favorite__'
const FAVORITE_MAX_LENGTH = 200

// 搜索历史记录添加辅助函数
// 如果搜索的内容在过去的缓存中曾经存在过，则把过去的记录删除，新的放在缓存数组的最前部，相当于把记录向前安置，以便使最新搜索的记录显示在搜索历史的最前方
// arr:存储的数组；val：存储的值；compare：比较函数(即传入需要比较数据的规则函数)；maxlen：最大值；
function insertArray (arr, val, compare, maxLen) {
  const index = arr.findIndex(compare)
  // 如果数组中并没有数据，新插入的数据即为第一个数据，就什么都不做原样返回
  if (index === 0) {
    return
  }
  // 如果插入的数据在数组中存在且不再第一个位置则删除曾经存在的这个数据
  if (index > 0) {
    arr.splice(index, 1)
  }
  // 将数据添加到数据数组的最前端
  arr.unshift(val)
  // 如果数据数组有最大存储长度限制且添加了新数据后的数据数组长度大于最大长度限制的值则从数组尾部删除超出的过去的历史数据
  if (maxLen && arr.length > maxLen) {
    arr.pop()
  }
}
// 删除搜索历史记录辅助函数
function deleteFromArray (arr, compare) {
  const index = arr.findIndex(compare)
  if (index > -1) {
    arr.splice(index, 1)
  }
}

// 存储搜索结果
export function saveSearch (query) {
  let searches = storage.get(SEARCH_KEY, [])
  insertArray(searches, query, (item) => {
    return item === query
  }, SEARCH_MAX_LENTH)
  // 更新数据
  storage.set(SEARCH_KEY, searches)
  return searches
}

// 从本地缓存区读取searchlist即搜索历史记录数组列表
export function loadSearch () {
  return storage.get(SEARCH_KEY, [])
}
// 删除历史记录列表条目
export function deleteSearch (query) {
  let searches = storage.get(SEARCH_KEY, [])
  deleteFromArray(searches, (item) => {
    return item === query
  })
  // 更新数据
  storage.set(SEARCH_KEY, searches)
  return searches
}

export function clearSearch () {
  storage.remove(SEARCH_KEY)
  return []
}

// 存储播放历史
export function savePlay (song) {
  let songs = storage.get(PLAY_KEY, [])
  insertArray(songs, song, (item) => {
    return item.id === song.id
  }, PLAY_MAX_LENGTH)
  storage.set(PLAY_KEY, songs)
  return songs
}

// 播放历史读取
export function loadPlay () {
  return storage.get(PLAY_KEY, [])
}

// 收藏歌曲
export function saveFavorite (song) {
  // 获取当前存储于storage中的FAVORITE_KEY对象，没有则为默认值空数组
  let songs = storage.get(FAVORITE_KEY, [])
  insertArray(songs, song, (item) => {
    return song.id === item.id
  }, FAVORITE_MAX_LENGTH)
  storage.set(FAVORITE_KEY, songs)
  return songs
}

// 删除收藏的歌曲
export function deleteFavorite (song) {
  let songs = storage.get(FAVORITE_KEY, [])
  deleteFromArray(songs, (item) => {
    return song.id === item.id
  })
  storage.set(FAVORITE_KEY, songs)
  return songs
}

// 初始状态时加载所有的收藏列表
export function loadFavorite () {
  return storage.get(FAVORITE_KEY, [])
}
