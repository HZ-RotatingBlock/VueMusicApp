webpackJsonp([4],{"9s7R":function(t,n){},m40h:function(t,n,s){"use strict";n.b=function(){var t=r()({},u.b,{platform:"h5",uin:0,needNewCode:1});return Object(a.a)("https://c.y.qq.com/musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg",t,u.c)},n.a=function(){var t=r()({},u.b,{platform:"yqq",hostUin:0,sin:0,ein:29,sortId:5,needNewCode:0,categoryId:1e7,rnd:Math.random(),format:"json"});return d.a.get("/api/getDiscList",{params:t}).then(function(t){return i.a.resolve(t.data)})},n.c=function(t){var n=r()({},u.b,{disstid:t,g_tk:5381,type:1,json:1,utf8:1,onlysong:0,platform:"yqq",hostUin:0,needNewCode:0,format:"json"});return d.a.get("/api/getSongList",{params:n}).then(function(t){return i.a.resolve(t.data)})};var e=s("rVsN"),i=s.n(e),o=s("aA9S"),r=s.n(o),a=s("I020"),c=s("2sCs"),d=s.n(c),u=s("T452")},yUbB:function(t,n,s){"use strict";Object.defineProperty(n,"__esModule",{value:!0});var e=s("4YfN"),i=s.n(e),o=s("+xy4"),r=s("9rMa"),a=s("m40h"),c=s("T452"),d=s("Q23H"),u={components:{MusicList:o.a},data:function(){return{songs:[]}},computed:i()({title:function(){return this.disc.dissname},bgImg:function(){return this.disc.imgurl}},Object(r.c)(["disc"])),created:function(){this.$_disc_getSongList()},methods:{$_disc_getSongList:function(){var t=this;this.disc.dissid?Object(a.c)(this.disc.dissid).then(function(n){n.code===c.a&&(t.songs=t.$_disc_nomalizeSongs(n.cdlist[0].songlist))}):this.$router.back()},$_disc_nomalizeSongs:function(t){var n=[];return t.forEach(function(t){t.songid&&t.albumid&&n.push(Object(d.a)(t))}),n}}},f={render:function(){var t=this.$createElement,n=this._self._c||t;return n("transition",{attrs:{name:"slide"}},[n("music-list",{attrs:{title:this.title,"bg-image":this.bgImg,songs:this.songs}})],1)},staticRenderFns:[]},g=s("Mw9A")(u,f,!1,function(t){s("9s7R")},"data-v-28893e53",null);n.default=g.exports}});
//# sourceMappingURL=4.139d6353a5be4275205a.js.map