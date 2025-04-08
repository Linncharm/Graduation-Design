import Color from 'color'
// import  { Preset } from 'unocss'

// export interface ShadesOptions {
//   shades?: number[]
//   baseShade?: number
//   returnRgb?: boolean
// }

// export interface ColorOptions {
//   [key: number]: string
//   DEFAULT: string
// }

// export interface PresetOptions extends ShadesOptions {
//   primaryKey?: string
// }


export function generateShades(
  colorValue = '',
  {
    shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
    baseShade = 500,
    returnRgb = false,
  } = {},
) {
  const baseColor = Color(colorValue)
  // console.log('baseColor', baseColor)

  const getColor = (color) => {
    if (returnRgb) {
      return color.round().array().join(',')
    }

    return color.hex()
  }

  const value = shades.reduce(
    (obj, shadeValue) => {
      if (baseShade === shadeValue) {
        obj[shadeValue] = obj.DEFAULT
      }
      else if (shadeValue < baseShade) {
        const weight = 1 - shadeValue / baseShade
        const whiten = baseColor.mix(Color('white'), weight)
        obj[shadeValue] = getColor(whiten)
      }
      else {
        const weight = (shadeValue - baseShade) / (1000 - baseShade)
        const blacken = baseColor.mix(Color('black'), weight)
        obj[shadeValue] = getColor(blacken)
      }
      return obj
    },
    {
      DEFAULT: getColor(baseColor),
    },
  )

  // console.log('generateShades.value', value)

  return value
}

export function presetShades(
  colorValue = '',
  { primaryKey = 'primary', ...options } = {},
) {
  const shades = generateShades(colorValue, {
    returnRgb: true,
    ...options,
  })
  // console.log('shades', shades)
  const shadeList = Object.entries(shades)

  return {
    name: 'presetShades',
    preflights: [
      {
        getCSS: () => {
          const vars = shadeList.reduce((style, [key, value]) => {
            if (key === 'DEFAULT') {
              style += `--color-${primaryKey}: ${value};`
            }
            else {
              style += `--color-${primaryKey}-${key}: ${value};`
            }
            return style
          }, '')

          return `
            :root, page {
              ${vars}
            }
          `
        },
      },
    ],
    theme: {
      colors: {
        [primaryKey]: shadeList.reduce(
          (obj, [key]) => {
            if (key === 'DEFAULT') {
              obj[
                key
                ] = `rgba(var(--color-${primaryKey}), <alpha-value>)`
            }
            else {
              obj[
                key
                ] = `rgba(var(--color-${primaryKey}-${key}), <alpha-value>)`
            }
            return obj
          },
          {},
        ),
      },
    },
  }
}