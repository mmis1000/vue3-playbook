<template>
  <SplitPane style="height: 100vh" :defaultSplit="defaultSplit">
    <template v-slot:layout>
      <s-hori>
        <s-vert>
          <s-content name="a" />
          <s-content name="b" />
        </s-vert>
        <s-vert>
          <s-content name="c" />
          <!-- <s-content name="i" /> -->
          <s-hori>
            <s-content name="d" />
            <s-vert>
              <s-content name="e" />
              <s-content name="f" />
            </s-vert>
          </s-hori>
        </s-vert>
        <s-vert>
          <s-content name="g" />
          <s-content name="h" />
        </s-vert>
      </s-hori>
    </template>
    <template v-slot:a> a {{ text }} </template>
    <template v-slot:b> b {{ text }} </template>
    <template v-slot:c> c {{ text }} </template>
    <template v-slot:d> d {{ text }} </template>
    <template v-slot:e> e {{ text }} </template>
    <template v-slot:f> f {{ text }} </template>
    <template v-slot:g> g {{ text }} </template>
    <template v-slot:h> h {{ text }} </template>
    <template v-slot:i> i {{ text }} </template>
  </SplitPane>
</template>

<script lang="ts">
// eslint-disable-next-line no-unused-vars
import SplitPane from "@/components/SplitPane.vue";
import SplitPaneLayoutContentVue from "@/components/SplitPaneLayoutContent.vue";
import SplitPaneLayoutHoriVue from "@/components/SplitPaneLayoutHori.vue";
import SplitPaneLayoutVertVue from "@/components/SplitPaneLayoutVert.vue";
import { defineComponent } from "vue";

export default defineComponent({
  components: {
    SplitPane,
    SVert: SplitPaneLayoutVertVue,
    SHori: SplitPaneLayoutHoriVue,
    SContent: SplitPaneLayoutContentVue
  },
  setup() {
    return {
      defaultSplit: {
        "": [0.25, 0.75],
        "0": [0.7],
        "1": [0.8],
        "1,1": [0.8],
      },
      text: '    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
    };
  },
});
</script>

<style>
</style>