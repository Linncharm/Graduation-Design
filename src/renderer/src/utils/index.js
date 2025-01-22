import * as qrCode from 'qrcode'

/**
 * @desc 使用async await 进项进行延时操作
 * @param {*} time
 */
export function sleep(time = 1000) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), time)
  })
}

export function isIPWithPort(ip) {
  const regex
    = /^((25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d):([1-9]|[1-9]\d{1,3}|[1-6][0-5][0-5][0-3][0-5])$/

  return regex.test(ip)
}


/**
 * Generates a QR code data URL for ADB wireless pairing
 * @param options Configuration options
 * @returns Promise containing the QR code data URL
 */
export async function generateAdbPairingQR(options = {}) {
  // Generate random password (default 6 digits)
  const passwordLength = options.passwordLength || 6
  const minValue = 10 ** (passwordLength - 1)
  const maxValue = 10 ** passwordLength - 1
  const password = Math.floor(Math.random() * (maxValue - minValue) + minValue).toString()

  // Format the ADB pairing text
  const pairingText = `WIFI:T:ADB;S:ADBQR-connectPhoneOverWifi;P:${password};;`

  // Generate QR code
  const dataUrl = await qrCode.toDataURL(pairingText, {
    type: 'image/webp',
    rendererOpts: { quality: 1 },
    margin: 0,
  })

  return {
    dataUrl,
    password, // Return password so it can be displayed to user
  }
}


