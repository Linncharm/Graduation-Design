<template>
  <div
    class="bg-primary-100 dark:bg-gray-800 flex items-center group h-9 overflow-hidden"
  >
    <el-button
      type="primary"
      class="el-button-nav"
      title="Prev"
      @click="handlePrev"
    >
      <el-icon>
        <CaretLeft />
      </el-icon>
    </el-button>

    <Scrollable ref="scrollableRef" class="flex-1 w-0 flex items-center">
      <component
        :is="item.component || 'div'"
        v-for="(item, index) of controlModel"
        :key="index"
        class="flex-none"
        v-bind="{
          device,
          floating,
        }"
      >
        <template #default="{ loading = false, trigger } = {}">
          <el-button
            type="primary"
            plain
            class="!border-none !mx-0 bg-transparent !rounded-0"
            :disabled="device.$unauthorized"
            :title="$t(item.tips || item.label)"
            :loading="loading"
            @click="handleClick(item, trigger || item.trigger)"
          >
            <template #icon>
              <svg-icon
                v-if="item.svgIcon"
                :name="item.svgIcon"
                :class="item.iconClass"
              ></svg-icon>
              <el-icon v-else-if="item.elIcon" :class="item.iconClass">
                <component :is="item.elIcon" />
              </el-icon>
            </template>
            {{ $t(item.label) }}
          </el-button>
        </template>
      </component>
    </Scrollable>

    <el-button
      type="primary"
      class="el-button-nav"
      title="Next"
      @click="handleNext"
    >
      <el-icon>
        <CaretRight />
      </el-icon>
    </el-button>
  </div>
</template>

<script>
// import Synergy from './Synergy/index.vue'
import Application from './Application/index.vue'
import ApplicationStart from './ApplicationStart/index.vue'
import FileManage from './FileManage/index.vue'
import Rotation from './Rotation/index.vue'
import Screenshot from './Screenshot/index.vue'
import Volume from './Volume/index.vue'

export default {
  components: {
    Screenshot,
    Application,
    ApplicationStart,
    Rotation,
    Volume,
    FileManage,
  },
  props: {
    device: {
      type: Object,
      default: () => ({}),
    },
    floating: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {}
  },
  computed: {
    controlModel() {
      const value = [
        {
          label: 'device.control.switch',
          elIcon: 'Switch',
          command: 'input keyevent 187',
        },
        {
          label: 'device.control.home',
          svgIcon: 'home',
          command: 'input keyevent 3',
        },
        {
          label: 'device.control.return',
          elIcon: 'Back',
          command: 'input keyevent 4',
        },
        {
          label: 'device.control.startApp',
          elIcon: 'Files',
          component: 'ApplicationStart',
        },
        {
          label: 'device.control.turnScreenOff',
          elIcon: 'TurnOff',
          tips: 'device.control.turnScreenOff.tips',
          trigger: () => {
            window.scrcpy.helper(this.device.id, '--turn-screen-off')
          },
        },
        {
          label: 'device.control.notification',
          elIcon: 'Notification',
          command: 'cmd statusbar expand-notifications',
          tips: 'device.control.notification.tips',
        },
        {
          label: 'device.control.power',
          elIcon: 'SwitchButton',
          command: 'input keyevent 26',
          tips: 'device.control.power.tips',
        },
        {
          label: 'device.control.rotation.name',
          svgIcon: 'rotation',
          component: 'Rotation',
        },
        {
          label: 'device.control.volume.name',
          svgIcon: 'volume-up',
          component: 'Volume',
        },
        {
          label: 'device.control.capture',
          elIcon: 'Crop',
          component: 'Screenshot',
        },
        {
          label: 'device.control.reboot',
          elIcon: 'RefreshLeft',
          command: 'reboot',
        },
        {
          label: 'device.control.install',
          svgIcon: 'install',
          component: 'Application',
        },
        {
          label: 'device.control.file.name',
          svgIcon: 'file-send',
          component: 'FileManage',
          hiddenKeys: ['floating'],
        },
      ]

      const handler = item =>
        !(item.hiddenKeys || []).some(key => this.$props[key])

      return value.filter(item => handler(item))
    },
  },
  methods: {
    handlePrev() {
      this.$refs.scrollableRef.scrollBackward()
    },
    handleNext() {
      this.$refs.scrollableRef.scrollForward()
    },
    handleClick(row, trigger) {
      if (trigger) {
        trigger(row)
        return false
      }

      if (row?.command) {
        this.$adb.deviceShell(this.device.id, row.command)
      }
      else if (row?.scrcpyCommand) {
        this.$scrcpy.control(this.device.id, { command: row.scrcpyCommand })
      }
    },
  },
}
</script>

<style lang="postcss" scoped>
.el-button.is-disabled {
  @apply !dark:bg-gray-800;
}

.el-button.el-button-nav {
  @apply flex-none p-0 rounded-none border-0 h-full flex items-center justify-center opacity-0 bg-primary-100 dark:bg-gray-800 !hover:bg-primary-300 active:bg-primary-500 text-primary-600 hover:text-white w-4 group-hover:opacity-100 transition-opacity;
}
</style>
