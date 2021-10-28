<template>
  <SplitPane style="height: 100vh" :zones="pane" :defaultSplit="defaultSplit">
    <template v-slot:a> a </template>
    <template v-slot:b> b </template>
    <template v-slot:e> e </template>
    <template v-slot:f> f </template>
    <template v-slot:g> g </template>
    <template v-slot:h> h </template>
    <template v-slot:i> i </template>
    <template v-slot:j> j </template>
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
    };
  },
});
</script>

<style>
</style>