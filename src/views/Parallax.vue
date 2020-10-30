<template>
  <div>
    <Parallax style="height: 100vh">
      <template v-for="index in 10" :key="index">
        <ParallaxChild style="height: 50%; position: relative;">
          <template v-slot:default="{ height, scroll }">
            <div
              :style="{
                height: height + 'px',
                background:'url(https://i.imgur.com/HKyMBF1.jpg)',
                backgroundSize: '100% auto',
                backgroundPosition: `${-scroll / 2}px ${scroll / 2}px`,
                color: 'blue' 
              }"
            >hhh<br>hhh<br>hhh<br>hhh<br>hhh<br></div>
          </template>
        </ParallaxChild>
        <ParallaxChild style="height: 50%; position: relative;">
          <template v-slot:default="{ height, scroll }">
            <div
              :style="{
                height: height + 'px',
                background: 'url(https://i.imgur.com/t9XlvvL.jpg)',
                backgroundSize: '100% auto',
                backgroundPosition: `${scroll / 2}px ${scroll / 2}px`,
              }"
            >aaa<br>aaa<br>aaa<br>aaa<br>aaa<br></div>
          </template>
        </ParallaxChild>
      </template>
    </Parallax>
  </div>
</template>

<script>
import Parallax from '@/components/Parallax.vue'
import ParallaxChild from '@/components/ParallaxChild.vue'
export default {
  name: "ParallaxPage",
  components: {
    Parallax,
    ParallaxChild
  }
}
</script>

<style>

</style>