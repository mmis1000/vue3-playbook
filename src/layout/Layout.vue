<template>
  <div id="nav" :class="{ show }">
    <router-link v-for="route in routes" :key="route.path" :to="route.path">
      {{ route?.meta?.title ?? route.name }}
    </router-link>
  </div>
  <button class="toggle" :class="{ show }" @click="show = !show">
    <Close :cross="show" style="width: 32px; height: 32px; display: inline-block; vertical-align: middle"/>
  </button>
  <div class="layout-page">
    <slot/>
  </div>
</template>

<script>
import Close from './Close'
import { routes } from '../router'

export default {
  components: {
    Close
  },
  computed: {
    routes () {
      return routes
    }
  },
  data () {
    return {
      show: false
    }
  }
}
</script>

<style scoped>
#nav {
  position: fixed;
  width: 240px;
  left: 0;
  top: 0;
  bottom: 0;
  overflow: auto;
  background: cadetblue;
  padding: 56px 0 16px;
  z-index: 10;
}

.toggle {
  position: fixed;
  left: 16px;
  top: 16px;

  width: 40px;
  height: 40px;
  line-height: 40px;
  text-align: center;
  z-index: 11;

  background: transparent;
  color: white;

  padding: 0;
  border: 0;
  outline: 0;
}

#nav a {
  font-weight: bold;
  color: white;
  display: block;
  padding: 16px;
}

#nav a.router-link-exact-active {
  color: cadetblue;
  background: #eee;
}

.layout-page {
  margin-left: 0px;
  position: relative;
}

#nav {
  opacity: 0;
  pointer-events: none;
  transition: all .5s;
  transform: translateX(-50px);
}
#nav.show {
  opacity: 1;
  pointer-events: auto;
  transform: translateX(0px);
}

.toggle {
  filter: drop-shadow(0 0 4px black);
}

.toggle.show {
  filter: none;
  background: transparent;
  color: white;
}

@media screen and (min-width: 640px){
  #nav {
    padding: 16px 0;
    opacity: 1;
    pointer-events: auto;
    transform: translateX(0px);
  }
  .layout-page {
    margin-left: 240px;
    position: relative;
  }
  .toggle {
    display: none
  }
}
</style>