import { mergeConfigs, presetWind } from 'unocss'
import transformerDirectives from '@unocss/transformer-directives'
import { presetShades } from '../preset/index.js'

function presetConfig(...configs) {
  const windConfig = presetWind()
  return mergeConfigs([
    {
      presets: [windConfig, presetShades('#4A90E2')],
      theme: {
        colors: {
          gray: windConfig?.theme?.colors?.neutral,
        },
      },
      transformers: [transformerDirectives()],
      shortcuts: {
        'inset-center':
          'top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2',
        'left-center': 'left-1/2 transform -translate-x-1/2',
        'top-center': 'top-1/2 transform -translate-y-1/2',
        'inset-fix-0': 'top-0 bottom-0 left-0 right-0',
      },
    },
    ...configs,
  ])
}

export default presetConfig
