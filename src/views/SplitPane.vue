<template>
  <SplitPane style="height: 100vh" :zones="pane" :defaultSplit="defaultSplit">
    <template v-slot:a> a {{ text }} </template>
    <template v-slot:b> b {{ text }} </template>
    <template v-slot:e> e {{ text }} </template>
    <template v-slot:f> f {{ text }} </template>
    <template v-slot:g> g {{ text }} </template>
    <template v-slot:h> h {{ text }} </template>
    <template v-slot:i> i {{ text }} </template>
    <template v-slot:j> j {{ text }} </template>
  </SplitPane>
</template>

<script lang="ts">
// eslint-disable-next-line no-unused-vars
import SplitPane, { HorizontalPane } from "@/components/SplitPane.vue";
import { defineComponent } from "@vue/runtime-core";

export default defineComponent({
  components: {
    SplitPane,
  },
  setup() {
    const pane: HorizontalPane = {
      type: "horizontal",
      zones: [
        {
          type: "vertical",
          zones: [
            {
              type: "content",
              name: "a",
            },
            {
              type: "content",
              name: "b",
            },
          ],
        },
        {
          type: "vertical",
          zones: [
            {
              type: "content",
              name: "e",
            },
            {
              type: "horizontal",
              zones: [
                {
                  type: "content",
                  name: "f",
                },
                {
                  type: "vertical",
                  zones: [
                    {
                      type: "content",
                      name: "i",
                    },
                    {
                      type: "content",
                      name: "j",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: "vertical",
          zones: [
            {
              type: "content",
              name: "g",
            },
            {
              type: "content",
              name: "h",
            },
          ],
        },
      ],
    };

    return {
      pane,
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