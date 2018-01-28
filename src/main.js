// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import router from './router'
import fastclick from 'fastclick'
import VueLazyLoad from 'vue-lazyload'
import store from './store'

import '@/public/sass/index.scss'

/* eslint-disable no-unused-vars */
// import VConsole from 'vconsole'

// var vConsole = new VConsole()
// console.log('test')

Vue.config.productionTip = false
fastclick.attach(document.body)
Vue.use(VueLazyLoad, {
  loading: require('public/image/default.png')
})
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  VueLazyLoad,
  template: '<App/>',
  components: { App }
})
