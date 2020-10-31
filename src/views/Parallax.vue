<template>
  <div>
    <Parallax style="height: 100vh">
      inline
      <ParallaxChild style="width: 10%; height: 10%; display: inline-block; vertical-align: middle">
        <template v-slot:default="{ height, scroll }">
          <div
            :style="{
              height: height + 'px',
              background:'url(https://i.imgur.com/HKyMBF1.jpg)',
              backgroundSize: '100% auto',
              backgroundPosition: `${-scroll / 2}px ${scroll / 2}px`,
              willChange: 'background-position',
              color: 'blue' 
            }"
          >hhh<br>hhh<br>hhh<br>hhh<br>hhh<br></div>
        </template>
      </ParallaxChild>
      Do work

      <br>

      <template v-for="index in 100" :key="index">
        <ParallaxChild style="height: calc(100% / 3); width: calc(100% / 3); display: inline-block; vertical-align: middle">
          <template v-slot:default="{ height, scroll }">
            <div
              :style="{
                height: height + 'px',
                background:'url(https://i.imgur.com/HKyMBF1.jpg)',
                backgroundSize: '100% auto',
                backgroundPosition: `${-scroll / 2}px ${scroll / 2}px`,
                willChange: 'background-position',
                color: 'blue' 
              }"
            >hhh<br>hhh<br>hhh<br>hhh<br>hhh<br></div>
          </template>
        </ParallaxChild>
        <ParallaxChild style="height: calc(100% / 3); width: calc(100% / 3); display: inline-block; vertical-align: middle">
          <template v-slot:default="{ height, scroll }">
            <div
              :style="{
                height: height + 'px',
                background: 'url(https://i.imgur.com/t9XlvvL.jpg)',
                backgroundSize: '100% auto',
                backgroundPosition: `${scroll / 2}px ${scroll / 2}px`,
                willChange: 'background-position',
              }"
            >aaa<br>aaa<br>aaa<br>aaa<br>aaa<br></div>
          </template>
        </ParallaxChild>
        <h1 v-if="index === 50">你沒看到我(X</h1>
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