<template>
  <div id="app">
    <div :class="[ismobile ? '' : 'pcBox']">
      <div :class="[ismobile ? '' : 'mobileBox']">
        <transition
          name="fade"
          mode="out-in"
        >
          <router-view class="view" />
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      ismobile: true
    }
  },
  mounted() {
    this.ismobile = !!navigator.userAgent.match(/AppleWebKit.*Mobile.*/)
  }
}
</script>
<style lang="scss">
@import url('./assets/index.scss');
#app {
  font-family: -apple-system, BlinkMacSystemFont, Roboto, Helvetica Neue,
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  touch-action: auto;
  background: #f0f2f5;
}
.PCNotic {
  display: none;
}
@media screen and (min-width: 415px) {
  #app {
    background: #f5f7fa;
    overflow: auto;
  }
  .PCNotic {
    display: flex;
  }
  * {
    padding: 0;
    margin: 0;
    outline: 0;
  }
  .pcBox {
    margin: 0 auto;
    width: 479px;
    height: 978px;
    border-radius: 56px;
    background: #fff 100% 100% url('~@/assets/images/Iphone.png');
    margin-top: 60px;
  }
  ::-webkit-scrollbar {
    width: 10px; /*对垂直流动条有效*/
    height: 10px; /*对水平流动条有效*/
    background-color: transparent;
  }
  ::-webkit-scrollbar-corner {
    background-color: transparent;
  }
  .search_PC {
    display: inline-block;
    transform: none !important;
    margin: 74px 0 0 26px;
    .MaskContent {
      width: 426px;
      height: 830px;
      position: fixed;
      z-index: 999;
      top: 0;
      background: transparent;
      transform: translateY(74px);
    }
  }
  .mobileBox {
    width: 436px;
    height: 830px;
    display: inline-block;
    overflow: auto;
    transform: translate(26px, 74px);
    .index .New .newsbox .right,
    .index .three_photo .imgbox,
    .new-item .img-content,
    .bottom-content .img-content {
      height: 81.867px;
    }
    .search_more {
      padding: 0;
      .footer {
        // transform: translateY(-.74rem);
        width: 3.9rem;
        .btn_reset {
          margin: 0 0.4rem 0 0;
        }
      }
    }
    .headercom .header .is-left .logoimg {
      transform: translateX(0.6rem);
    }
    .modelinfo .imgbox {
      width: 100%;
      height: 239.85px;
    }
    .cardetail .imgbox {
      width: 100%;
      height: 239.85px;
    }
  }
  .index .page-infinite-loading {
    display: none;
  }
  .floor_price {
    width: 4.27rem;
    .bg-img {
      width: 4.27rem !important;
      height: 2.401875rem !important;
    }
    .v-modal {
      width: 4.27rem;
      // height: 90%;
      top: 73px;
      left: 50%;
      transform: translateX(-50%);
    }
  }
}
.row {
  display: flex;
  align-items: center;
}

.col {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
