// 工具方法
// 自由取值，取指定范围的值
function getRandomIndex (min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}
// 利用getRandomIndex以及数据交换来实现洗牌功能函数
export function shuffle (arr) {
  let _arr = arr.slice(0)
  for (let i = 0, len = arr.length; i < len; i++) {
    let j = getRandomIndex(0, i)
    let t = _arr[i]
    _arr[i] = _arr[j]
    _arr[j] = t
  }
  return _arr
}

// 节流函数
export function debounce (func, delay) {
  let timer
  return function (...args) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}
