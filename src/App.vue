<template>
  <div id="app">
    <m-header></m-header>
    <tab></tab>
    <div class="bgm"></div>
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
    <player></player>
  </div>
</template>

<script>
import MHeader from 'components/m-header/m-header'
import Tab from 'components/tab/tab'
import Player from 'views/player/player'

export default {
  components: {
    MHeader,
    Tab,
    Player
  }
}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
  @import "./public/sass/variable.scss";
  .bgm {
    z-index: -1;
    position: fixed;
    width: 100%;
    top: 88px;
    bottom: 0;
    background: url(./public/image/3.jpg) no-repeat center center;
    background-size: cover;
  }
</style>
