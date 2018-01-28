// 抓取搜索关联数据
import jsonp from 'public/js/jsonp'
import {commonParams, options} from './config'
// 获取流行/热门关键词数据
export function getHotKey () {
  const url = 'https://c.y.qq.com/splcloud/fcgi-bin/gethotkey.fcg'

  const data = Object({}, commonParams, {
    g_tk: 5381,
    format: 'json',
    platform: 'h5',
    needNewCode: 1
  })

  return jsonp(url, data, options)
}
// 获取关键词搜索数据
// query：搜索关键词；page:显示的页数；zhida：搜索结果是否直达（如果搜索的不是歌曲而是歌手的话）
export function search (query, page, zhida, perpage) {
  const url = 'https://c.y.qq.com/soso/fcgi-bin/search_for_qq_cp'

  const data = Object.assign({}, commonParams, {
    // w决定关键词
    w: query,
    // p决定页数
    p: page,
    // catZhida决定是否有歌手数据
    catZhida: zhida ? 1 : 0,
    // perpage和n值控制一次返回多少各区数据
    perpage: perpage,
    n: perpage,
    g_tk: 5381,
    platform: 'h5',
    needNewCode: 1,
    uid: 0,
    zhidaqu: 1,
    t: 0,
    flag: 1,
    ie: 'utf-8',
    sem: 1,
    aggr: 0,
    remoteplace: 'txt.mqq.all'
  })

  return jsonp(url, data, options)
}
