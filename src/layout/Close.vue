<template>
  <div class="layout__close" :class="{ cross }">
    <div class="lt"></div>
    <div class="rt"></div>
    <div class="lb"></div>
    <div class="rb"></div>
    <div class="m"></div>
  </div>
</template>

<script>
export default {
  props: {
    cross: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style scoped>
.layout__close {
  position: relative;
}

.layout__close .lt,
.layout__close .rt,
.layout__close .lb,
.layout__close .rb {
  width: 50%;
  height: 10%;
  background: currentColor;
  position: absolute;

  transition: all .5s;
  transform: translate(-50%, -50%)  rotate(0deg) scaleX(1);
}

.layout__close .m {
  width: 100%;
  left: 50%;
  top: 50%;
  height: 10%;
  background: currentColor;
  position: absolute;
  transition: all .5s;
  transform: translate(-50%, -50%) scaleX(1);
}

.layout__close .lt, .layout__close .lb {
  left: 25%;
}
.layout__close .rt, .layout__close .rb {
  left:75%;
}
.layout__close .lt, .layout__close .rt {
  top: 25%;
}
.layout__close .lb, .layout__close .rb {
  top:75%;
}

.layout__close.cross .lt, .layout__close.cross .rb {
  transform: translate(-50%, -50%)  rotate(45deg) scaleX(1.44);
}
.layout__close.cross .rt, .layout__close.cross .lb {
  transform: translate(-50%, -50%)  rotate(-45deg) scaleX(1.44);
}
.layout__close.cross .m {
  transform: translate(-50%, -50%) scaleX(0);
}
</style>
