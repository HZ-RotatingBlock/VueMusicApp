<template>
  <!-- 头部组件 -->
  <div class="m-header">
    <div class="icon"></div>
    <h1 class="text">View Music</h1>
    <router-link to="/user" class="mine" tag="div">
      <i class="icon-mine"></i>
    </router-link>
  </div>
</template>

<script type="text/ecmascript-6">
  export default {}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
  @import "../../public/sass/variable";
  @import "../../public/sass/mixin";

  .m-header {
    position: relative;
    height: 44px;
    text-align: left;
    color: $color-theme;
    font-size: 0;
    background: $color-background-player;
    .icon {
      display: inline-block;
      vertical-align: top;
      margin-top: 6px;
      margin-left: 10px;
      width: 30px;
      height: 32px;
      margin-right: 9px;
      @include bg-image('logo');
      background-size: 30px 32px;
    }
    .text {
      display: inline-block;
      vertical-align: top;
      line-height: 44px;
      font-size: $font-size-large;
    }
    .mine {
      position: absolute;
      top: 0;
      right: 0;
      .icon-mine {
        display: block;
        padding: 12px;
        font-size: 20px;
        color: $color-theme;
      }
    }
  }

</style>
