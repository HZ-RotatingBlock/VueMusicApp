import Vue from 'vue'
import Vuex from 'vuex'
// 辅助工具，在我们通过mutationss去修改state时h会通过它在控制台去输出一个log,显示修改记录等日志
import createLogger from 'vuex/dist/logger'

import * as actions from './actions'
import * as getters from './getters'
import state from './state'
import mutations from './mutations'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  state,
  getters,
  actions,
  mutations,
  // 开启debug检测，上线时关闭
  strict: debug,
  plugins: debug ? [createLogger()] : []
})
