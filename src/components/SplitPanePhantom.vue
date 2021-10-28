<script lang="tsx">
// eslint-disable-next-line no-unused-vars
import { defineComponent, PropType } from "@vue/runtime-core";
// eslint-disable-next-line no-unused-vars
import { Zone } from "./SplitPane.vue";

export default defineComponent({
  props: {
    zones: {
      type: Array as PropType<Zone[]>,
      required: true,
    },
  },
  render() {
    const children: JSX.Element[] = [];

    const formatPercentage = (v: number) => {
      return String(v * 100) + "%";
    };
    for (const zone of this.zones) {
      children.push(
        <div
          key={zone.name}
          class="zone-phantom"
          style={{
            top: formatPercentage(zone.top),
            left: formatPercentage(zone.left),
            bottom: formatPercentage(1 - zone.bottom),
            right: formatPercentage(1 - zone.right),
          }}
        >
          <div class="zone-phantom-inlet" />
        </div>
      );
    }

    return (<div class="zone-phantom-wrapper">
      {children}
    </div>)
  },
});
</script>

<style scope>
.zone-phantom-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.zone-phantom {
  position: absolute;
}

.zone-phantom-inlet {
  position: absolute;
  left: 2px;
  right: 2px;
  top: 2px;
  bottom: 2px;
  border-radius: 10px;
  background: rgba(64, 64, 64, 0.5);
}
</style>
