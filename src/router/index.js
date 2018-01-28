import Vue from 'vue'
import VueRouter from 'vue-Router'

Vue.use(VueRouter)

const Tab = () => import('components/tab/tab')
const Recommend = () => import('views/recommend/recommend')
const Singer = () => import('views/singer/singer')
const Rank = () => import('views/rank/rank')
const Search = () => import('views/search/search')
const SingerDetail = () => import('views/singer-detail/singer-detail')
const Disc = () => import('views/disc/disc')
const TopList = () => import('views/top-list/top-list')
const UserCenter = () => import('views/user-center/user-center')

export default new VueRouter({
  routes: [
    {
      path: '/',
      redirect: 'recommend'
    },
    {
      path: '/recommend',
      component: Recommend,
      children: [
        {
          path: ':id',
          component: Disc
        }
      ]
    },
    {
      path: '/rank',
      component: Rank,
      children: [
        {
          path: ':id',
          component: TopList
        }
      ]
    },
    {
      path: '/search',
      component: Search,
      children: [
        {
          path: ':id',
          component: SingerDetail
        }
      ]
    },
    {
      path: '/singer',
      component: Singer,
      children: [
        {
          path: ':id',
          component: SingerDetail
        }
      ]
    },
    {
      path: '/tab',
      component: Tab
    },
    {
      path: '/user',
      component: UserCenter
    }
  ]
})
