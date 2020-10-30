<template>
  <layout>
    <router-view/>
  </layout>
</template>
<script>
import Layout from './layout/Layout'
export default {
  components: {
    Layout
  }
}
</script>
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
