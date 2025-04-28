var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var _validator, _encryptionKey, _options, _defaultValues;
import { createRequire } from "node:module";
import path, { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import electron, { BrowserWindow, app, shell as shell$1, ipcMain, dialog, nativeTheme, Tray, Menu } from "electron";
import process$1 from "node:process";
import emojiRegex from "emoji-regex";
import fs from "node:fs";
import extName from "ext-name";
import { spawn } from "child_process";
import fs$2 from "fs";
import execa from "execa";
import os, { userInfo } from "node:os";
import log$1 from "electron-log/main.js";
import { promisify, isDeepStrictEqual } from "node:util";
import crypto from "node:crypto";
import assert from "node:assert";
import AjvModule from "ajv";
import ajvFormatsModule from "ajv-formats";
import semver from "semver";
import which from "which";
import fs$1 from "fs-extra";
function isFullwidthCodePoint(codePoint) {
  if (!Number.isInteger(codePoint)) {
    return false;
  }
  return codePoint >= 4352 && (codePoint <= 4447 || // Hangul Jamo
  codePoint === 9001 || // LEFT-POINTING ANGLE BRACKET
  codePoint === 9002 || // RIGHT-POINTING ANGLE BRACKET
  // CJK Radicals Supplement .. Enclosed CJK Letters and Months
  11904 <= codePoint && codePoint <= 12871 && codePoint !== 12351 || // Enclosed CJK Letters and Months .. CJK Unified Ideographs Extension A
  12880 <= codePoint && codePoint <= 19903 || // CJK Unified Ideographs .. Yi Radicals
  19968 <= codePoint && codePoint <= 42182 || // Hangul Jamo Extended-A
  43360 <= codePoint && codePoint <= 43388 || // Hangul Syllables
  44032 <= codePoint && codePoint <= 55203 || // CJK Compatibility Ideographs
  63744 <= codePoint && codePoint <= 64255 || // Vertical Forms
  65040 <= codePoint && codePoint <= 65049 || // CJK Compatibility Forms .. Small Form Variants
  65072 <= codePoint && codePoint <= 65131 || // Halfwidth and Fullwidth Forms
  65281 <= codePoint && codePoint <= 65376 || 65504 <= codePoint && codePoint <= 65510 || // Kana Supplement
  110592 <= codePoint && codePoint <= 110593 || // Enclosed Ideographic Supplement
  127488 <= codePoint && codePoint <= 127569 || // CJK Unified Ideographs Extension B .. Tertiary Ideographic Plane
  131072 <= codePoint && codePoint <= 262141);
}
const ANSI_BACKGROUND_OFFSET = 10;
const wrapAnsi16 = (offset = 0) => (code) => `\x1B[${code + offset}m`;
const wrapAnsi256 = (offset = 0) => (code) => `\x1B[${38 + offset};5;${code}m`;
const wrapAnsi16m = (offset = 0) => (red, green, blue) => `\x1B[${38 + offset};2;${red};${green};${blue}m`;
const styles = {
  modifier: {
    reset: [0, 0],
    // 21 isn't widely supported and 22 does the same thing
    bold: [1, 22],
    dim: [2, 22],
    italic: [3, 23],
    underline: [4, 24],
    overline: [53, 55],
    inverse: [7, 27],
    hidden: [8, 28],
    strikethrough: [9, 29]
  },
  color: {
    black: [30, 39],
    red: [31, 39],
    green: [32, 39],
    yellow: [33, 39],
    blue: [34, 39],
    magenta: [35, 39],
    cyan: [36, 39],
    white: [37, 39],
    // Bright color
    blackBright: [90, 39],
    gray: [90, 39],
    // Alias of `blackBright`
    grey: [90, 39],
    // Alias of `blackBright`
    redBright: [91, 39],
    greenBright: [92, 39],
    yellowBright: [93, 39],
    blueBright: [94, 39],
    magentaBright: [95, 39],
    cyanBright: [96, 39],
    whiteBright: [97, 39]
  },
  bgColor: {
    bgBlack: [40, 49],
    bgRed: [41, 49],
    bgGreen: [42, 49],
    bgYellow: [43, 49],
    bgBlue: [44, 49],
    bgMagenta: [45, 49],
    bgCyan: [46, 49],
    bgWhite: [47, 49],
    // Bright color
    bgBlackBright: [100, 49],
    bgGray: [100, 49],
    // Alias of `bgBlackBright`
    bgGrey: [100, 49],
    // Alias of `bgBlackBright`
    bgRedBright: [101, 49],
    bgGreenBright: [102, 49],
    bgYellowBright: [103, 49],
    bgBlueBright: [104, 49],
    bgMagentaBright: [105, 49],
    bgCyanBright: [106, 49],
    bgWhiteBright: [107, 49]
  }
};
Object.keys(styles.modifier);
const foregroundColorNames = Object.keys(styles.color);
const backgroundColorNames = Object.keys(styles.bgColor);
[...foregroundColorNames, ...backgroundColorNames];
function assembleStyles() {
  const codes = /* @__PURE__ */ new Map();
  for (const [groupName, group] of Object.entries(styles)) {
    for (const [styleName, style] of Object.entries(group)) {
      styles[styleName] = {
        open: `\x1B[${style[0]}m`,
        close: `\x1B[${style[1]}m`
      };
      group[styleName] = styles[styleName];
      codes.set(style[0], style[1]);
    }
    Object.defineProperty(styles, groupName, {
      value: group,
      enumerable: false
    });
  }
  Object.defineProperty(styles, "codes", {
    value: codes,
    enumerable: false
  });
  styles.color.close = "\x1B[39m";
  styles.bgColor.close = "\x1B[49m";
  styles.color.ansi = wrapAnsi16();
  styles.color.ansi256 = wrapAnsi256();
  styles.color.ansi16m = wrapAnsi16m();
  styles.bgColor.ansi = wrapAnsi16(ANSI_BACKGROUND_OFFSET);
  styles.bgColor.ansi256 = wrapAnsi256(ANSI_BACKGROUND_OFFSET);
  styles.bgColor.ansi16m = wrapAnsi16m(ANSI_BACKGROUND_OFFSET);
  Object.defineProperties(styles, {
    rgbToAnsi256: {
      value: (red, green, blue) => {
        if (red === green && green === blue) {
          if (red < 8) {
            return 16;
          }
          if (red > 248) {
            return 231;
          }
          return Math.round((red - 8) / 247 * 24) + 232;
        }
        return 16 + 36 * Math.round(red / 255 * 5) + 6 * Math.round(green / 255 * 5) + Math.round(blue / 255 * 5);
      },
      enumerable: false
    },
    hexToRgb: {
      value: (hex) => {
        const matches = /[a-f\d]{6}|[a-f\d]{3}/i.exec(hex.toString(16));
        if (!matches) {
          return [0, 0, 0];
        }
        let [colorString] = matches;
        if (colorString.length === 3) {
          colorString = [...colorString].map((character) => character + character).join("");
        }
        const integer = Number.parseInt(colorString, 16);
        return [
          /* eslint-disable no-bitwise */
          integer >> 16 & 255,
          integer >> 8 & 255,
          integer & 255
          /* eslint-enable no-bitwise */
        ];
      },
      enumerable: false
    },
    hexToAnsi256: {
      value: (hex) => styles.rgbToAnsi256(...styles.hexToRgb(hex)),
      enumerable: false
    },
    ansi256ToAnsi: {
      value: (code) => {
        if (code < 8) {
          return 30 + code;
        }
        if (code < 16) {
          return 90 + (code - 8);
        }
        let red;
        let green;
        let blue;
        if (code >= 232) {
          red = ((code - 232) * 10 + 8) / 255;
          green = red;
          blue = red;
        } else {
          code -= 16;
          const remainder = code % 36;
          red = Math.floor(code / 36) / 5;
          green = Math.floor(remainder / 6) / 5;
          blue = remainder % 6 / 5;
        }
        const value = Math.max(red, green, blue) * 2;
        if (value === 0) {
          return 30;
        }
        let result = 30 + (Math.round(blue) << 2 | Math.round(green) << 1 | Math.round(red));
        if (value === 2) {
          result += 60;
        }
        return result;
      },
      enumerable: false
    },
    rgbToAnsi: {
      value: (red, green, blue) => styles.ansi256ToAnsi(styles.rgbToAnsi256(red, green, blue)),
      enumerable: false
    },
    hexToAnsi: {
      value: (hex) => styles.ansi256ToAnsi(styles.hexToAnsi256(hex)),
      enumerable: false
    }
  });
  return styles;
}
const ansiStyles = assembleStyles();
const astralRegex = /^[\uD800-\uDBFF][\uDC00-\uDFFF]$/;
const ESCAPES = [
  "\x1B",
  ""
];
const wrapAnsi = (code) => `${ESCAPES[0]}[${code}m`;
const checkAnsi = (ansiCodes, isEscapes, endAnsiCode) => {
  let output = [];
  ansiCodes = [...ansiCodes];
  for (let ansiCode of ansiCodes) {
    const ansiCodeOrigin = ansiCode;
    if (ansiCode.includes(";")) {
      ansiCode = ansiCode.split(";")[0][0] + "0";
    }
    const item = ansiStyles.codes.get(Number.parseInt(ansiCode, 10));
    if (item) {
      const indexEscape = ansiCodes.indexOf(item.toString());
      if (indexEscape === -1) {
        output.push(wrapAnsi(isEscapes ? item : ansiCodeOrigin));
      } else {
        ansiCodes.splice(indexEscape, 1);
      }
    } else if (isEscapes) {
      output.push(wrapAnsi(0));
      break;
    } else {
      output.push(wrapAnsi(ansiCodeOrigin));
    }
  }
  if (isEscapes) {
    output = output.filter((element, index) => output.indexOf(element) === index);
    if (endAnsiCode !== void 0) {
      const fistEscapeCode = wrapAnsi(ansiStyles.codes.get(Number.parseInt(endAnsiCode, 10)));
      output = output.reduce((current, next) => next === fistEscapeCode ? [next, ...current] : [...current, next], []);
    }
  }
  return output.join("");
};
function sliceAnsi(string, begin, end) {
  const characters = [...string];
  const ansiCodes = [];
  let stringEnd = typeof end === "number" ? end : characters.length;
  let isInsideEscape = false;
  let ansiCode;
  let visible = 0;
  let output = "";
  for (const [index, character] of characters.entries()) {
    let leftEscape = false;
    if (ESCAPES.includes(character)) {
      const code = /\d[^m]*/.exec(string.slice(index, index + 18));
      ansiCode = code && code.length > 0 ? code[0] : void 0;
      if (visible < stringEnd) {
        isInsideEscape = true;
        if (ansiCode !== void 0) {
          ansiCodes.push(ansiCode);
        }
      }
    } else if (isInsideEscape && character === "m") {
      isInsideEscape = false;
      leftEscape = true;
    }
    if (!isInsideEscape && !leftEscape) {
      visible++;
    }
    if (!astralRegex.test(character) && isFullwidthCodePoint(character.codePointAt())) {
      visible++;
      if (typeof end !== "number") {
        stringEnd++;
      }
    }
    if (visible > begin && visible <= stringEnd) {
      output += character;
    } else if (visible === begin && !isInsideEscape && ansiCode !== void 0) {
      output = checkAnsi(ansiCodes);
    } else if (visible >= stringEnd) {
      output += checkAnsi(ansiCodes, true, ansiCode);
      break;
    }
  }
  return output;
}
function ansiRegex({ onlyFirst = false } = {}) {
  const ST = "(?:\\u0007|\\u001B\\u005C|\\u009C)";
  const pattern = [
    `[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?${ST})`,
    "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))"
  ].join("|");
  return new RegExp(pattern, onlyFirst ? void 0 : "g");
}
const regex = ansiRegex();
function stripAnsi(string) {
  if (typeof string !== "string") {
    throw new TypeError(`Expected a \`string\`, got \`${typeof string}\``);
  }
  return string.replace(regex, "");
}
function isAmbiguous(x) {
  return x === 161 || x === 164 || x === 167 || x === 168 || x === 170 || x === 173 || x === 174 || x >= 176 && x <= 180 || x >= 182 && x <= 186 || x >= 188 && x <= 191 || x === 198 || x === 208 || x === 215 || x === 216 || x >= 222 && x <= 225 || x === 230 || x >= 232 && x <= 234 || x === 236 || x === 237 || x === 240 || x === 242 || x === 243 || x >= 247 && x <= 250 || x === 252 || x === 254 || x === 257 || x === 273 || x === 275 || x === 283 || x === 294 || x === 295 || x === 299 || x >= 305 && x <= 307 || x === 312 || x >= 319 && x <= 322 || x === 324 || x >= 328 && x <= 331 || x === 333 || x === 338 || x === 339 || x === 358 || x === 359 || x === 363 || x === 462 || x === 464 || x === 466 || x === 468 || x === 470 || x === 472 || x === 474 || x === 476 || x === 593 || x === 609 || x === 708 || x === 711 || x >= 713 && x <= 715 || x === 717 || x === 720 || x >= 728 && x <= 731 || x === 733 || x === 735 || x >= 768 && x <= 879 || x >= 913 && x <= 929 || x >= 931 && x <= 937 || x >= 945 && x <= 961 || x >= 963 && x <= 969 || x === 1025 || x >= 1040 && x <= 1103 || x === 1105 || x === 8208 || x >= 8211 && x <= 8214 || x === 8216 || x === 8217 || x === 8220 || x === 8221 || x >= 8224 && x <= 8226 || x >= 8228 && x <= 8231 || x === 8240 || x === 8242 || x === 8243 || x === 8245 || x === 8251 || x === 8254 || x === 8308 || x === 8319 || x >= 8321 && x <= 8324 || x === 8364 || x === 8451 || x === 8453 || x === 8457 || x === 8467 || x === 8470 || x === 8481 || x === 8482 || x === 8486 || x === 8491 || x === 8531 || x === 8532 || x >= 8539 && x <= 8542 || x >= 8544 && x <= 8555 || x >= 8560 && x <= 8569 || x === 8585 || x >= 8592 && x <= 8601 || x === 8632 || x === 8633 || x === 8658 || x === 8660 || x === 8679 || x === 8704 || x === 8706 || x === 8707 || x === 8711 || x === 8712 || x === 8715 || x === 8719 || x === 8721 || x === 8725 || x === 8730 || x >= 8733 && x <= 8736 || x === 8739 || x === 8741 || x >= 8743 && x <= 8748 || x === 8750 || x >= 8756 && x <= 8759 || x === 8764 || x === 8765 || x === 8776 || x === 8780 || x === 8786 || x === 8800 || x === 8801 || x >= 8804 && x <= 8807 || x === 8810 || x === 8811 || x === 8814 || x === 8815 || x === 8834 || x === 8835 || x === 8838 || x === 8839 || x === 8853 || x === 8857 || x === 8869 || x === 8895 || x === 8978 || x >= 9312 && x <= 9449 || x >= 9451 && x <= 9547 || x >= 9552 && x <= 9587 || x >= 9600 && x <= 9615 || x >= 9618 && x <= 9621 || x === 9632 || x === 9633 || x >= 9635 && x <= 9641 || x === 9650 || x === 9651 || x === 9654 || x === 9655 || x === 9660 || x === 9661 || x === 9664 || x === 9665 || x >= 9670 && x <= 9672 || x === 9675 || x >= 9678 && x <= 9681 || x >= 9698 && x <= 9701 || x === 9711 || x === 9733 || x === 9734 || x === 9737 || x === 9742 || x === 9743 || x === 9756 || x === 9758 || x === 9792 || x === 9794 || x === 9824 || x === 9825 || x >= 9827 && x <= 9829 || x >= 9831 && x <= 9834 || x === 9836 || x === 9837 || x === 9839 || x === 9886 || x === 9887 || x === 9919 || x >= 9926 && x <= 9933 || x >= 9935 && x <= 9939 || x >= 9941 && x <= 9953 || x === 9955 || x === 9960 || x === 9961 || x >= 9963 && x <= 9969 || x === 9972 || x >= 9974 && x <= 9977 || x === 9979 || x === 9980 || x === 9982 || x === 9983 || x === 10045 || x >= 10102 && x <= 10111 || x >= 11094 && x <= 11097 || x >= 12872 && x <= 12879 || x >= 57344 && x <= 63743 || x >= 65024 && x <= 65039 || x === 65533 || x >= 127232 && x <= 127242 || x >= 127248 && x <= 127277 || x >= 127280 && x <= 127337 || x >= 127344 && x <= 127373 || x === 127375 || x === 127376 || x >= 127387 && x <= 127404 || x >= 917760 && x <= 917999 || x >= 983040 && x <= 1048573 || x >= 1048576 && x <= 1114109;
}
function isFullWidth(x) {
  return x === 12288 || x >= 65281 && x <= 65376 || x >= 65504 && x <= 65510;
}
function isWide(x) {
  return x >= 4352 && x <= 4447 || x === 8986 || x === 8987 || x === 9001 || x === 9002 || x >= 9193 && x <= 9196 || x === 9200 || x === 9203 || x === 9725 || x === 9726 || x === 9748 || x === 9749 || x >= 9776 && x <= 9783 || x >= 9800 && x <= 9811 || x === 9855 || x >= 9866 && x <= 9871 || x === 9875 || x === 9889 || x === 9898 || x === 9899 || x === 9917 || x === 9918 || x === 9924 || x === 9925 || x === 9934 || x === 9940 || x === 9962 || x === 9970 || x === 9971 || x === 9973 || x === 9978 || x === 9981 || x === 9989 || x === 9994 || x === 9995 || x === 10024 || x === 10060 || x === 10062 || x >= 10067 && x <= 10069 || x === 10071 || x >= 10133 && x <= 10135 || x === 10160 || x === 10175 || x === 11035 || x === 11036 || x === 11088 || x === 11093 || x >= 11904 && x <= 11929 || x >= 11931 && x <= 12019 || x >= 12032 && x <= 12245 || x >= 12272 && x <= 12287 || x >= 12289 && x <= 12350 || x >= 12353 && x <= 12438 || x >= 12441 && x <= 12543 || x >= 12549 && x <= 12591 || x >= 12593 && x <= 12686 || x >= 12688 && x <= 12773 || x >= 12783 && x <= 12830 || x >= 12832 && x <= 12871 || x >= 12880 && x <= 42124 || x >= 42128 && x <= 42182 || x >= 43360 && x <= 43388 || x >= 44032 && x <= 55203 || x >= 63744 && x <= 64255 || x >= 65040 && x <= 65049 || x >= 65072 && x <= 65106 || x >= 65108 && x <= 65126 || x >= 65128 && x <= 65131 || x >= 94176 && x <= 94180 || x === 94192 || x === 94193 || x >= 94208 && x <= 100343 || x >= 100352 && x <= 101589 || x >= 101631 && x <= 101640 || x >= 110576 && x <= 110579 || x >= 110581 && x <= 110587 || x === 110589 || x === 110590 || x >= 110592 && x <= 110882 || x === 110898 || x >= 110928 && x <= 110930 || x === 110933 || x >= 110948 && x <= 110951 || x >= 110960 && x <= 111355 || x >= 119552 && x <= 119638 || x >= 119648 && x <= 119670 || x === 126980 || x === 127183 || x === 127374 || x >= 127377 && x <= 127386 || x >= 127488 && x <= 127490 || x >= 127504 && x <= 127547 || x >= 127552 && x <= 127560 || x === 127568 || x === 127569 || x >= 127584 && x <= 127589 || x >= 127744 && x <= 127776 || x >= 127789 && x <= 127797 || x >= 127799 && x <= 127868 || x >= 127870 && x <= 127891 || x >= 127904 && x <= 127946 || x >= 127951 && x <= 127955 || x >= 127968 && x <= 127984 || x === 127988 || x >= 127992 && x <= 128062 || x === 128064 || x >= 128066 && x <= 128252 || x >= 128255 && x <= 128317 || x >= 128331 && x <= 128334 || x >= 128336 && x <= 128359 || x === 128378 || x === 128405 || x === 128406 || x === 128420 || x >= 128507 && x <= 128591 || x >= 128640 && x <= 128709 || x === 128716 || x >= 128720 && x <= 128722 || x >= 128725 && x <= 128727 || x >= 128732 && x <= 128735 || x === 128747 || x === 128748 || x >= 128756 && x <= 128764 || x >= 128992 && x <= 129003 || x === 129008 || x >= 129292 && x <= 129338 || x >= 129340 && x <= 129349 || x >= 129351 && x <= 129535 || x >= 129648 && x <= 129660 || x >= 129664 && x <= 129673 || x >= 129679 && x <= 129734 || x >= 129742 && x <= 129756 || x >= 129759 && x <= 129769 || x >= 129776 && x <= 129784 || x >= 131072 && x <= 196605 || x >= 196608 && x <= 262141;
}
function validate(codePoint) {
  if (!Number.isSafeInteger(codePoint)) {
    throw new TypeError(`Expected a code point, got \`${typeof codePoint}\`.`);
  }
}
function eastAsianWidth(codePoint, { ambiguousAsWide = false } = {}) {
  validate(codePoint);
  if (isFullWidth(codePoint) || isWide(codePoint) || ambiguousAsWide && isAmbiguous(codePoint)) {
    return 2;
  }
  return 1;
}
const segmenter = new Intl.Segmenter();
const defaultIgnorableCodePointRegex = new RegExp("^\\p{Default_Ignorable_Code_Point}$", "u");
function stringWidth(string, options = {}) {
  if (typeof string !== "string" || string.length === 0) {
    return 0;
  }
  const {
    ambiguousIsNarrow = true,
    countAnsiEscapeCodes = false
  } = options;
  if (!countAnsiEscapeCodes) {
    string = stripAnsi(string);
  }
  if (string.length === 0) {
    return 0;
  }
  let width = 0;
  const eastAsianWidthOptions = { ambiguousAsWide: !ambiguousIsNarrow };
  for (const { segment: character } of segmenter.segment(string)) {
    const codePoint = character.codePointAt(0);
    if (codePoint <= 31 || codePoint >= 127 && codePoint <= 159) {
      continue;
    }
    if (codePoint >= 8203 && codePoint <= 8207 || codePoint === 65279) {
      continue;
    }
    if (codePoint >= 768 && codePoint <= 879 || codePoint >= 6832 && codePoint <= 6911 || codePoint >= 7616 && codePoint <= 7679 || codePoint >= 8400 && codePoint <= 8447 || codePoint >= 65056 && codePoint <= 65071) {
      continue;
    }
    if (codePoint >= 55296 && codePoint <= 57343) {
      continue;
    }
    if (codePoint >= 65024 && codePoint <= 65039) {
      continue;
    }
    if (defaultIgnorableCodePointRegex.test(character)) {
      continue;
    }
    if (emojiRegex().test(character)) {
      width += 2;
      continue;
    }
    width += eastAsianWidth(codePoint, eastAsianWidthOptions);
  }
  return width;
}
function getIndexOfNearestSpace(string, wantedIndex, shouldSearchRight) {
  if (string.charAt(wantedIndex) === " ") {
    return wantedIndex;
  }
  const direction = shouldSearchRight ? 1 : -1;
  for (let index = 0; index <= 3; index++) {
    const finalIndex = wantedIndex + index * direction;
    if (string.charAt(finalIndex) === " ") {
      return finalIndex;
    }
  }
  return wantedIndex;
}
function cliTruncate(text, columns, options = {}) {
  const {
    position = "end",
    space = false,
    preferTruncationOnSpace = false
  } = options;
  let { truncationCharacter = "…" } = options;
  if (typeof text !== "string") {
    throw new TypeError(`Expected \`input\` to be a string, got ${typeof text}`);
  }
  const length = stringWidth(text);
  if (length <= columns) {
    return text;
  }
  if (position === "start") {
    if (preferTruncationOnSpace) {
      const nearestSpace = getIndexOfNearestSpace(text, length - columns + 1, true);
      return truncationCharacter + sliceAnsi(text, nearestSpace, length).trim();
    }
    if (space === true) {
      truncationCharacter += " ";
    }
    return truncationCharacter + sliceAnsi(text, length - columns + stringWidth(truncationCharacter), length);
  }
  if (position === "middle") {
    if (space === true) {
      truncationCharacter = ` ${truncationCharacter} `;
    }
    const half = Math.floor(columns / 2);
    if (preferTruncationOnSpace) {
      const spaceNearFirstBreakPoint = getIndexOfNearestSpace(text, half);
      const spaceNearSecondBreakPoint = getIndexOfNearestSpace(text, length - (columns - half) + 1, true);
      return sliceAnsi(text, 0, spaceNearFirstBreakPoint) + truncationCharacter + sliceAnsi(text, spaceNearSecondBreakPoint, length).trim();
    }
    return sliceAnsi(text, 0, half) + truncationCharacter + sliceAnsi(text, length - (columns - half) + stringWidth(truncationCharacter), length);
  }
  if (position === "end") {
    if (preferTruncationOnSpace) {
      const nearestSpace = getIndexOfNearestSpace(text, columns - 1);
      return sliceAnsi(text, 0, nearestSpace) + truncationCharacter;
    }
    if (space === true) {
      truncationCharacter = ` ${truncationCharacter}`;
    }
    return sliceAnsi(text, 0, columns - stringWidth(truncationCharacter)) + truncationCharacter;
  }
  throw new Error(`Expected \`options.position\` to be either \`start\`, \`middle\` or \`end\`, got ${position}`);
}
function pathExistsSync(path2) {
  try {
    fs.accessSync(path2);
    return true;
  } catch {
    return false;
  }
}
class MaxTryError extends Error {
  constructor(originalPath, lastTriedPath) {
    super("Max tries reached.");
    this.originalPath = originalPath;
    this.lastTriedPath = lastTriedPath;
  }
}
const parenthesesIncrementer = (inputFilename, extension) => {
  const match = inputFilename.match(/^(?<filename>.*)\((?<index>\d+)\)$/);
  let { filename, index } = match ? match.groups : { filename: inputFilename, index: 0 };
  filename = filename.trim();
  return [`${filename}${extension}`, `${filename} (${++index})${extension}`];
};
const incrementPath = (filePath, incrementer) => {
  const ext = path.extname(filePath);
  const dirname = path.dirname(filePath);
  const [originalFilename, incrementedFilename] = incrementer(path.basename(filePath, ext), ext);
  return [path.join(dirname, originalFilename), path.join(dirname, incrementedFilename)];
};
function unusedFilenameSync(filePath, { incrementer = parenthesesIncrementer, maxTries = Number.POSITIVE_INFINITY } = {}) {
  let tries = 0;
  let [originalPath] = incrementPath(filePath, incrementer);
  let unusedPath = filePath;
  while (true) {
    if (!pathExistsSync(unusedPath)) {
      return unusedPath;
    }
    if (++tries > maxTries) {
      throw new MaxTryError(originalPath, unusedPath);
    }
    [originalPath, unusedPath] = incrementPath(unusedPath, incrementer);
  }
}
const _htmlEscape = (string) => string.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
function htmlEscape(strings, ...values) {
  if (typeof strings === "string") {
    return _htmlEscape(strings);
  }
  let output = strings[0];
  for (const [index, value] of values.entries()) {
    output = output + _htmlEscape(String(value)) + strings[index + 1];
  }
  return output;
}
class MissingValueError extends Error {
  constructor(key) {
    super(`Missing a value for ${key ? `the placeholder: ${key}` : "a placeholder"}`, key);
    this.name = "MissingValueError";
    this.key = key;
  }
}
function pupa(template, data, { ignoreMissing = false, transform = ({ value }) => value } = {}) {
  if (typeof template !== "string") {
    throw new TypeError(`Expected a \`string\` in the first argument, got \`${typeof template}\``);
  }
  if (typeof data !== "object") {
    throw new TypeError(`Expected an \`object\` or \`Array\` in the second argument, got \`${typeof data}\``);
  }
  const replace = (placeholder, key) => {
    let value = data;
    for (const property of key.split(".")) {
      value = value ? value[property] : void 0;
    }
    const transformedValue = transform({ value, key });
    if (transformedValue === void 0) {
      if (ignoreMissing) {
        return placeholder;
      }
      throw new MissingValueError(key);
    }
    return String(transformedValue);
  };
  const composeHtmlEscape = (replacer) => (...args2) => htmlEscape(replacer(...args2));
  const doubleBraceRegex = /{{(\d+|[a-z$_][\w\-$]*?(?:\.[\w\-$]*?)*?)}}/gi;
  if (doubleBraceRegex.test(template)) {
    template = template.replace(doubleBraceRegex, composeHtmlEscape(replace));
  }
  const braceRegex = /{(\d+|[a-z$_][\w\-$]*?(?:\.[\w\-$]*?)*?)}/gi;
  return template.replace(braceRegex, replace);
}
class CancelError extends Error {
}
const getFilenameFromMime = (name, mime) => {
  const extensions = extName.mime(mime);
  if (extensions.length !== 1) {
    return name;
  }
  return `${name}.${extensions[0].ext}`;
};
function registerListener(session, options, callback = () => {
}) {
  const downloadItems = /* @__PURE__ */ new Set();
  let receivedBytes = 0;
  let completedBytes = 0;
  let totalBytes = 0;
  const activeDownloadItems = () => downloadItems.size;
  const progressDownloadItems = () => receivedBytes / totalBytes;
  options = {
    showBadge: true,
    showProgressBar: true,
    ...options
  };
  const listener = (event, item, webContents2) => {
    downloadItems.add(item);
    totalBytes += item.getTotalBytes();
    const window_ = BrowserWindow.fromWebContents(webContents2);
    if (!window_) {
      throw new Error("Failed to get window from web contents.");
    }
    if (options.directory && !path.isAbsolute(options.directory)) {
      throw new Error("The `directory` option must be an absolute path");
    }
    const directory = options.directory ?? app.getPath("downloads");
    let filePath;
    if (options.filename) {
      filePath = path.join(directory, options.filename);
    } else {
      const filename = item.getFilename();
      const name = path.extname(filename) ? filename : getFilenameFromMime(filename, item.getMimeType());
      filePath = options.overwrite ? path.join(directory, name) : unusedFilenameSync(path.join(directory, name));
    }
    const errorMessage = options.errorMessage ?? "The download of {filename} was interrupted";
    if (options.saveAs) {
      item.setSaveDialogOptions({ defaultPath: filePath, ...options.dialogOptions });
    } else {
      item.setSavePath(filePath);
    }
    item.on("updated", () => {
      receivedBytes = completedBytes;
      for (const item2 of downloadItems) {
        receivedBytes += item2.getReceivedBytes();
      }
      if (options.showBadge && ["darwin", "linux"].includes(process$1.platform)) {
        app.badgeCount = activeDownloadItems();
      }
      if (!window_.isDestroyed() && options.showProgressBar) {
        window_.setProgressBar(progressDownloadItems());
      }
      if (typeof options.onProgress === "function") {
        const itemTransferredBytes = item.getReceivedBytes();
        const itemTotalBytes = item.getTotalBytes();
        options.onProgress({
          percent: itemTotalBytes ? itemTransferredBytes / itemTotalBytes : 0,
          transferredBytes: itemTransferredBytes,
          totalBytes: itemTotalBytes
        });
      }
      if (typeof options.onTotalProgress === "function") {
        options.onTotalProgress({
          percent: progressDownloadItems(),
          transferredBytes: receivedBytes,
          totalBytes
        });
      }
    });
    item.on("done", (event2, state) => {
      completedBytes += item.getTotalBytes();
      downloadItems.delete(item);
      if (options.showBadge && ["darwin", "linux"].includes(process$1.platform)) {
        app.badgeCount = activeDownloadItems();
      }
      if (!window_.isDestroyed() && !activeDownloadItems()) {
        window_.setProgressBar(-1);
        receivedBytes = 0;
        completedBytes = 0;
        totalBytes = 0;
      }
      if (options.unregisterWhenDone) {
        session.removeListener("will-download", listener);
      }
      if (state === "cancelled") {
        if (typeof options.onCancel === "function") {
          options.onCancel(item);
        }
        callback(new CancelError());
      } else if (state === "interrupted") {
        const message = pupa(errorMessage, { filename: path.basename(filePath) });
        callback(new Error(message));
      } else if (state === "completed") {
        const savePath = item.getSavePath();
        if (process$1.platform === "darwin") {
          app.dock.downloadFinished(savePath);
        }
        if (options.openFolderWhenDone) {
          shell$1.showItemInFolder(savePath);
        }
        if (typeof options.onCompleted === "function") {
          options.onCompleted({
            fileName: item.getFilename(),
            // Just for backwards compatibility. TODO: Remove in the next major version.
            filename: item.getFilename(),
            path: savePath,
            fileSize: item.getReceivedBytes(),
            mimeType: item.getMimeType(),
            url: item.getURL()
          });
        }
        callback(null, item);
      }
    });
    if (typeof options.onStarted === "function") {
      options.onStarted(item);
    }
  };
  session.on("will-download", listener);
}
async function download(window_, url, options) {
  return new Promise((resolve2, reject) => {
    options = {
      ...options,
      unregisterWhenDone: true
    };
    registerListener(window_.webContents.session, options, (error, item) => {
      if (error) {
        reject(error);
      } else {
        resolve2(item);
      }
    });
    window_.webContents.downloadURL(url);
  });
}
if (typeof electron === "string") {
  throw new TypeError("Not running in an Electron environment!");
}
const { env: env$2 } = process;
const isEnvSet = "ELECTRON_IS_DEV" in env$2;
const getFromEnv = Number.parseInt(env$2.ELECTRON_IS_DEV, 10) === 1;
const isDev = isEnvSet ? getFromEnv : !electron.app.isPackaged;
const webContents = (win) => win.webContents ?? (win.id && win);
const decorateMenuItem = (menuItem) => (options = {}) => {
  if (options.transform && !options.click) {
    menuItem.transform = options.transform;
  }
  return menuItem;
};
const removeUnusedMenuItems = (menuTemplate) => {
  let notDeletedPreviousElement;
  return menuTemplate.filter((menuItem) => menuItem !== void 0 && menuItem !== false && menuItem.visible !== false && menuItem.visible !== "").filter((menuItem, index, array) => {
    const toDelete = menuItem.type === "separator" && (!notDeletedPreviousElement || index === array.length - 1 || array[index + 1].type === "separator");
    notDeletedPreviousElement = toDelete ? notDeletedPreviousElement : menuItem;
    return !toDelete;
  });
};
const create = (win, options) => {
  const handleContextMenu = (event, properties) => {
    if (typeof options.shouldShowMenu === "function" && options.shouldShowMenu(event, properties) === false) {
      return;
    }
    const { editFlags } = properties;
    const hasText = properties.selectionText.length > 0;
    const isLink = Boolean(properties.linkURL);
    const can = (type) => editFlags[`can${type}`] && hasText;
    const defaultActions = {
      separator: () => ({ type: "separator" }),
      learnSpelling: decorateMenuItem({
        id: "learnSpelling",
        label: "&Learn Spelling",
        visible: Boolean(properties.isEditable && hasText && properties.misspelledWord),
        click() {
          const target = webContents(win);
          target.session.addWordToSpellCheckerDictionary(properties.misspelledWord);
        }
      }),
      lookUpSelection: decorateMenuItem({
        id: "lookUpSelection",
        label: "Look Up “{selection}”",
        visible: process$1.platform === "darwin" && hasText && !isLink,
        click() {
          if (process$1.platform === "darwin") {
            webContents(win).showDefinitionForSelection();
          }
        }
      }),
      searchWithGoogle: decorateMenuItem({
        id: "searchWithGoogle",
        label: "&Search with Google",
        visible: hasText,
        click() {
          const url = new URL("https://www.google.com/search");
          url.searchParams.set("q", properties.selectionText);
          electron.shell.openExternal(url.toString());
        }
      }),
      cut: decorateMenuItem({
        id: "cut",
        label: "Cu&t",
        enabled: can("Cut"),
        visible: properties.isEditable,
        click(menuItem) {
          const target = webContents(win);
          if (!menuItem.transform && target) {
            target.cut();
          } else {
            properties.selectionText = menuItem.transform ? menuItem.transform(properties.selectionText) : properties.selectionText;
            electron.clipboard.writeText(properties.selectionText);
          }
        }
      }),
      copy: decorateMenuItem({
        id: "copy",
        label: "&Copy",
        enabled: can("Copy"),
        visible: properties.isEditable || hasText,
        click(menuItem) {
          const target = webContents(win);
          if (!menuItem.transform && target) {
            target.copy();
          } else {
            properties.selectionText = menuItem.transform ? menuItem.transform(properties.selectionText) : properties.selectionText;
            electron.clipboard.writeText(properties.selectionText);
          }
        }
      }),
      paste: decorateMenuItem({
        id: "paste",
        label: "&Paste",
        enabled: editFlags.canPaste,
        visible: properties.isEditable,
        click(menuItem) {
          const target = webContents(win);
          if (menuItem.transform) {
            let clipboardContent = electron.clipboard.readText(properties.selectionText);
            clipboardContent = menuItem.transform ? menuItem.transform(clipboardContent) : clipboardContent;
            target.insertText(clipboardContent);
          } else {
            target.paste();
          }
        }
      }),
      selectAll: decorateMenuItem({
        id: "selectAll",
        label: "Select &All",
        click() {
          webContents(win).selectAll();
        }
      }),
      saveImage: decorateMenuItem({
        id: "saveImage",
        label: "Save I&mage",
        visible: properties.mediaType === "image",
        click(menuItem) {
          properties.srcURL = menuItem.transform ? menuItem.transform(properties.srcURL) : properties.srcURL;
          download(win, properties.srcURL);
        }
      }),
      saveImageAs: decorateMenuItem({
        id: "saveImageAs",
        label: "Sa&ve Image As…",
        visible: properties.mediaType === "image",
        click(menuItem) {
          properties.srcURL = menuItem.transform ? menuItem.transform(properties.srcURL) : properties.srcURL;
          download(win, properties.srcURL, { saveAs: true });
        }
      }),
      saveVideo: decorateMenuItem({
        id: "saveVideo",
        label: "Save Vide&o",
        visible: properties.mediaType === "video",
        click(menuItem) {
          properties.srcURL = menuItem.transform ? menuItem.transform(properties.srcURL) : properties.srcURL;
          download(win, properties.srcURL);
        }
      }),
      saveVideoAs: decorateMenuItem({
        id: "saveVideoAs",
        label: "Save Video& As…",
        visible: properties.mediaType === "video",
        click(menuItem) {
          properties.srcURL = menuItem.transform ? menuItem.transform(properties.srcURL) : properties.srcURL;
          download(win, properties.srcURL, { saveAs: true });
        }
      }),
      copyLink: decorateMenuItem({
        id: "copyLink",
        label: "Copy Lin&k",
        visible: properties.linkURL.length > 0 && properties.mediaType === "none",
        click(menuItem) {
          properties.linkURL = menuItem.transform ? menuItem.transform(properties.linkURL) : properties.linkURL;
          electron.clipboard.write({
            bookmark: properties.linkText,
            text: properties.linkURL
          });
        }
      }),
      saveLinkAs: decorateMenuItem({
        id: "saveLinkAs",
        label: "Save Link As…",
        visible: properties.linkURL.length > 0 && properties.mediaType === "none",
        click(menuItem) {
          properties.linkURL = menuItem.transform ? menuItem.transform(properties.linkURL) : properties.linkURL;
          download(win, properties.linkURL, { saveAs: true });
        }
      }),
      copyImage: decorateMenuItem({
        id: "copyImage",
        label: "Cop&y Image",
        visible: properties.mediaType === "image",
        click() {
          webContents(win).copyImageAt(properties.x, properties.y);
        }
      }),
      copyImageAddress: decorateMenuItem({
        id: "copyImageAddress",
        label: "C&opy Image Address",
        visible: properties.mediaType === "image",
        click(menuItem) {
          properties.srcURL = menuItem.transform ? menuItem.transform(properties.srcURL) : properties.srcURL;
          electron.clipboard.write({
            bookmark: properties.srcURL,
            text: properties.srcURL
          });
        }
      }),
      copyVideoAddress: decorateMenuItem({
        id: "copyVideoAddress",
        label: "Copy Video Ad&dress",
        visible: properties.mediaType === "video",
        click(menuItem) {
          properties.srcURL = menuItem.transform ? menuItem.transform(properties.srcURL) : properties.srcURL;
          electron.clipboard.write({
            bookmark: properties.srcURL,
            text: properties.srcURL
          });
        }
      }),
      inspect: () => ({
        id: "inspect",
        label: "I&nspect Element",
        click() {
          webContents(win).inspectElement(properties.x, properties.y);
          if (webContents(win).isDevToolsOpened()) {
            webContents(win).devToolsWebContents.focus();
          }
        }
      }),
      services: () => ({
        id: "services",
        label: "Services",
        role: "services",
        visible: process$1.platform === "darwin" && (properties.isEditable || hasText)
      })
    };
    const shouldShowInspectElement = typeof options.showInspectElement === "boolean" ? options.showInspectElement : isDev;
    const shouldShowSelectAll = options.showSelectAll || options.showSelectAll !== false && process$1.platform !== "darwin";
    function word(suggestion) {
      return {
        id: "dictionarySuggestions",
        label: suggestion,
        visible: Boolean(properties.isEditable && hasText && properties.misspelledWord),
        click(menuItem) {
          const target = webContents(win);
          target.replaceMisspelling(menuItem.label);
        }
      };
    }
    let dictionarySuggestions = [];
    if (hasText && properties.misspelledWord && properties.dictionarySuggestions.length > 0) {
      dictionarySuggestions = properties.dictionarySuggestions.map((suggestion) => word(suggestion));
    } else {
      dictionarySuggestions.push(
        {
          id: "dictionarySuggestions",
          label: "No Guesses Found",
          visible: Boolean(hasText && properties.misspelledWord),
          enabled: false
        }
      );
    }
    let menuTemplate = [
      dictionarySuggestions.length > 0 && defaultActions.separator(),
      ...dictionarySuggestions,
      defaultActions.separator(),
      options.showLearnSpelling !== false && defaultActions.learnSpelling(),
      defaultActions.separator(),
      options.showLookUpSelection !== false && defaultActions.lookUpSelection(),
      defaultActions.separator(),
      options.showSearchWithGoogle !== false && defaultActions.searchWithGoogle(),
      defaultActions.separator(),
      defaultActions.cut(),
      defaultActions.copy(),
      defaultActions.paste(),
      shouldShowSelectAll && defaultActions.selectAll(),
      defaultActions.separator(),
      options.showSaveImage && defaultActions.saveImage(),
      options.showSaveImageAs && defaultActions.saveImageAs(),
      options.showCopyImage !== false && defaultActions.copyImage(),
      options.showCopyImageAddress && defaultActions.copyImageAddress(),
      options.showSaveVideo && defaultActions.saveVideo(),
      options.showSaveVideoAs && defaultActions.saveVideoAs(),
      options.showCopyVideoAddress && defaultActions.copyVideoAddress(),
      defaultActions.separator(),
      options.showCopyLink !== false && defaultActions.copyLink(),
      options.showSaveLinkAs && defaultActions.saveLinkAs(),
      defaultActions.separator(),
      shouldShowInspectElement && defaultActions.inspect(),
      options.showServices && defaultActions.services(),
      defaultActions.separator()
    ];
    if (options.menu) {
      menuTemplate = options.menu(defaultActions, properties, win, dictionarySuggestions, event);
    }
    if (options.prepend) {
      const result = options.prepend(defaultActions, properties, win, event);
      if (Array.isArray(result)) {
        menuTemplate.unshift(...result);
      }
    }
    if (options.append) {
      const result = options.append(defaultActions, properties, win, event);
      if (Array.isArray(result)) {
        menuTemplate.push(...result);
      }
    }
    menuTemplate = removeUnusedMenuItems(menuTemplate);
    for (const menuItem of menuTemplate) {
      if (options.labels && options.labels[menuItem.id]) {
        menuItem.label = options.labels[menuItem.id];
      }
      if (typeof menuItem.label === "string" && menuItem.label.includes("{selection}")) {
        const selectionString = typeof properties.selectionText === "string" ? properties.selectionText.trim() : "";
        menuItem.label = menuItem.label.replace("{selection}", cliTruncate(selectionString, 25).replaceAll("&", "&&"));
      }
    }
    if (menuTemplate.length > 0) {
      const menu2 = electron.Menu.buildFromTemplate(menuTemplate);
      if (typeof options.onShow === "function") {
        menu2.on("menu-will-show", options.onShow);
      }
      if (typeof options.onClose === "function") {
        menu2.on("menu-will-close", options.onClose);
      }
      menu2.popup(win);
    }
  };
  webContents(win).on("context-menu", handleContextMenu);
  return () => {
    if (win.isDestroyed()) {
      return;
    }
    webContents(win).removeListener("context-menu", handleContextMenu);
  };
};
function contextMenu(options = {}) {
  if (process$1.type === "renderer") {
    throw new Error("Cannot use electron-context-menu in the renderer process!");
  }
  let isDisposed = false;
  const disposables = [];
  const init = (win) => {
    if (isDisposed) {
      return;
    }
    const disposeMenu = create(win, options);
    const disposable = () => {
      disposeMenu();
    };
    webContents(win).once("destroyed", disposable);
  };
  const dispose = () => {
    for (const dispose2 of disposables) {
      dispose2();
    }
    disposables.length = 0;
    isDisposed = true;
  };
  if (options.window) {
    const win = options.window;
    if (webContents(win) === void 0) {
      const onDomReady = () => {
        init(win);
      };
      const listenerFunction = win.addEventListener ?? win.addListener;
      listenerFunction("dom-ready", onDomReady, { once: true });
      disposables.push(() => {
        win.removeEventListener("dom-ready", onDomReady, { once: true });
      });
      return dispose;
    }
    init(win);
    return dispose;
  }
  for (const win of electron.BrowserWindow.getAllWindows()) {
    init(win);
  }
  const onWindowCreated = (event, win) => {
    init(win);
  };
  electron.app.on("browser-window-created", onWindowCreated);
  disposables.push(() => {
    electron.app.removeListener("browser-window-created", onWindowCreated);
  });
  return dispose;
}
const detectDefaultShell = () => {
  const { env: env2 } = process$1;
  if (process$1.platform === "win32") {
    return env2.COMSPEC || "cmd.exe";
  }
  try {
    const { shell: shell2 } = userInfo();
    if (shell2) {
      return shell2;
    }
  } catch {
  }
  if (process$1.platform === "darwin") {
    return env2.SHELL || "/bin/zsh";
  }
  return env2.SHELL || "/bin/sh";
};
const defaultShell = detectDefaultShell();
const args = [
  "-ilc",
  'echo -n "_SHELL_ENV_DELIMITER_"; env; echo -n "_SHELL_ENV_DELIMITER_"; exit'
];
const env$1 = {
  // Disables Oh My Zsh auto-update thing that can block the process.
  DISABLE_AUTO_UPDATE: "true"
};
const parseEnv = (env2) => {
  env2 = env2.split("_SHELL_ENV_DELIMITER_")[1];
  const returnValue = {};
  for (const line of stripAnsi(env2).split("\n").filter((line2) => Boolean(line2))) {
    const [key, ...values] = line.split("=");
    returnValue[key] = values.join("=");
  }
  return returnValue;
};
function shellEnvSync(shell2) {
  if (process$1.platform === "win32") {
    return process$1.env;
  }
  try {
    const { stdout } = execa.sync(shell2 || defaultShell, args, { env: env$1 });
    return parseEnv(stdout);
  } catch (error) {
    {
      return process$1.env;
    }
  }
}
function shellPathSync() {
  const { PATH } = shellEnvSync();
  return PATH;
}
function fixPath() {
  if (process$1.platform === "win32") {
    return;
  }
  process$1.env.PATH = shellPathSync() || [
    "./node_modules/.bin",
    "/.nodebrew/current/bin",
    "/usr/local/bin",
    process$1.env.PATH
  ].join(":");
}
if (process.platform === "darwin") {
  fixPath();
}
process.env.IS_PACKAGED = String(app.isPackaged);
process.env.DESKTOP_PATH = app.getPath("desktop");
process.env.CWD = process.cwd();
const isPackaged$1 = ["true"].includes(process.env.IS_PACKAGED);
var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
var freeSelf = typeof self == "object" && self && self.Object === Object && self;
var root = freeGlobal || freeSelf || Function("return this")();
var Symbol$1 = root.Symbol;
var objectProto$e = Object.prototype;
var hasOwnProperty$b = objectProto$e.hasOwnProperty;
var nativeObjectToString$1 = objectProto$e.toString;
var symToStringTag$1 = Symbol$1 ? Symbol$1.toStringTag : void 0;
function getRawTag(value) {
  var isOwn = hasOwnProperty$b.call(value, symToStringTag$1), tag = value[symToStringTag$1];
  try {
    value[symToStringTag$1] = void 0;
    var unmasked = true;
  } catch (e) {
  }
  var result = nativeObjectToString$1.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag$1] = tag;
    } else {
      delete value[symToStringTag$1];
    }
  }
  return result;
}
var objectProto$d = Object.prototype;
var nativeObjectToString = objectProto$d.toString;
function objectToString$1(value) {
  return nativeObjectToString.call(value);
}
var nullTag = "[object Null]", undefinedTag = "[object Undefined]";
var symToStringTag = Symbol$1 ? Symbol$1.toStringTag : void 0;
function baseGetTag(value) {
  if (value == null) {
    return value === void 0 ? undefinedTag : nullTag;
  }
  return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString$1(value);
}
function isObjectLike(value) {
  return value != null && typeof value == "object";
}
var isArray = Array.isArray;
function isObject$1(value) {
  var type = typeof value;
  return value != null && (type == "object" || type == "function");
}
var asyncTag = "[object AsyncFunction]", funcTag$2 = "[object Function]", genTag$1 = "[object GeneratorFunction]", proxyTag = "[object Proxy]";
function isFunction(value) {
  if (!isObject$1(value)) {
    return false;
  }
  var tag = baseGetTag(value);
  return tag == funcTag$2 || tag == genTag$1 || tag == asyncTag || tag == proxyTag;
}
var coreJsData = root["__core-js_shared__"];
var maskSrcKey = function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
  return uid ? "Symbol(src)_1." + uid : "";
}();
function isMasked(func) {
  return !!maskSrcKey && maskSrcKey in func;
}
var funcProto$1 = Function.prototype;
var funcToString$1 = funcProto$1.toString;
function toSource(func) {
  if (func != null) {
    try {
      return funcToString$1.call(func);
    } catch (e) {
    }
    try {
      return func + "";
    } catch (e) {
    }
  }
  return "";
}
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
var reIsHostCtor = /^\[object .+?Constructor\]$/;
var funcProto = Function.prototype, objectProto$c = Object.prototype;
var funcToString = funcProto.toString;
var hasOwnProperty$a = objectProto$c.hasOwnProperty;
var reIsNative = RegExp(
  "^" + funcToString.call(hasOwnProperty$a).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
);
function baseIsNative(value) {
  if (!isObject$1(value) || isMasked(value)) {
    return false;
  }
  var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}
function getValue(object, key) {
  return object == null ? void 0 : object[key];
}
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : void 0;
}
var WeakMap2 = getNative(root, "WeakMap");
var objectCreate = Object.create;
var baseCreate = /* @__PURE__ */ function() {
  function object() {
  }
  return function(proto) {
    if (!isObject$1(proto)) {
      return {};
    }
    if (objectCreate) {
      return objectCreate(proto);
    }
    object.prototype = proto;
    var result = new object();
    object.prototype = void 0;
    return result;
  };
}();
function copyArray(source, array) {
  var index = -1, length = source.length;
  array || (array = Array(length));
  while (++index < length) {
    array[index] = source[index];
  }
  return array;
}
var defineProperty = function() {
  try {
    var func = getNative(Object, "defineProperty");
    func({}, "", {});
    return func;
  } catch (e) {
  }
}();
function arrayEach(array, iteratee) {
  var index = -1, length = array == null ? 0 : array.length;
  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
}
var MAX_SAFE_INTEGER$1 = 9007199254740991;
var reIsUint = /^(?:0|[1-9]\d*)$/;
function isIndex(value, length) {
  var type = typeof value;
  length = length == null ? MAX_SAFE_INTEGER$1 : length;
  return !!length && (type == "number" || type != "symbol" && reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
}
function baseAssignValue(object, key, value) {
  if (key == "__proto__" && defineProperty) {
    defineProperty(object, key, {
      "configurable": true,
      "enumerable": true,
      "value": value,
      "writable": true
    });
  } else {
    object[key] = value;
  }
}
function eq(value, other) {
  return value === other || value !== value && other !== other;
}
var objectProto$b = Object.prototype;
var hasOwnProperty$9 = objectProto$b.hasOwnProperty;
function assignValue(object, key, value) {
  var objValue = object[key];
  if (!(hasOwnProperty$9.call(object, key) && eq(objValue, value)) || value === void 0 && !(key in object)) {
    baseAssignValue(object, key, value);
  }
}
function copyObject(source, props, object, customizer) {
  var isNew = !object;
  object || (object = {});
  var index = -1, length = props.length;
  while (++index < length) {
    var key = props[index];
    var newValue = void 0;
    if (newValue === void 0) {
      newValue = source[key];
    }
    if (isNew) {
      baseAssignValue(object, key, newValue);
    } else {
      assignValue(object, key, newValue);
    }
  }
  return object;
}
var MAX_SAFE_INTEGER = 9007199254740991;
function isLength(value) {
  return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}
var objectProto$a = Object.prototype;
function isPrototype(value) {
  var Ctor = value && value.constructor, proto = typeof Ctor == "function" && Ctor.prototype || objectProto$a;
  return value === proto;
}
function baseTimes(n, iteratee) {
  var index = -1, result = Array(n);
  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}
var argsTag$3 = "[object Arguments]";
function baseIsArguments(value) {
  return isObjectLike(value) && baseGetTag(value) == argsTag$3;
}
var objectProto$9 = Object.prototype;
var hasOwnProperty$8 = objectProto$9.hasOwnProperty;
var propertyIsEnumerable$1 = objectProto$9.propertyIsEnumerable;
var isArguments = baseIsArguments(/* @__PURE__ */ function() {
  return arguments;
}()) ? baseIsArguments : function(value) {
  return isObjectLike(value) && hasOwnProperty$8.call(value, "callee") && !propertyIsEnumerable$1.call(value, "callee");
};
function stubFalse() {
  return false;
}
var freeExports$2 = typeof exports == "object" && exports && !exports.nodeType && exports;
var freeModule$2 = freeExports$2 && typeof module == "object" && module && !module.nodeType && module;
var moduleExports$2 = freeModule$2 && freeModule$2.exports === freeExports$2;
var Buffer$1 = moduleExports$2 ? root.Buffer : void 0;
var nativeIsBuffer = Buffer$1 ? Buffer$1.isBuffer : void 0;
var isBuffer = nativeIsBuffer || stubFalse;
var argsTag$2 = "[object Arguments]", arrayTag$2 = "[object Array]", boolTag$3 = "[object Boolean]", dateTag$3 = "[object Date]", errorTag$2 = "[object Error]", funcTag$1 = "[object Function]", mapTag$5 = "[object Map]", numberTag$3 = "[object Number]", objectTag$3 = "[object Object]", regexpTag$3 = "[object RegExp]", setTag$5 = "[object Set]", stringTag$3 = "[object String]", weakMapTag$2 = "[object WeakMap]";
var arrayBufferTag$3 = "[object ArrayBuffer]", dataViewTag$4 = "[object DataView]", float32Tag$2 = "[object Float32Array]", float64Tag$2 = "[object Float64Array]", int8Tag$2 = "[object Int8Array]", int16Tag$2 = "[object Int16Array]", int32Tag$2 = "[object Int32Array]", uint8Tag$2 = "[object Uint8Array]", uint8ClampedTag$2 = "[object Uint8ClampedArray]", uint16Tag$2 = "[object Uint16Array]", uint32Tag$2 = "[object Uint32Array]";
var typedArrayTags = {};
typedArrayTags[float32Tag$2] = typedArrayTags[float64Tag$2] = typedArrayTags[int8Tag$2] = typedArrayTags[int16Tag$2] = typedArrayTags[int32Tag$2] = typedArrayTags[uint8Tag$2] = typedArrayTags[uint8ClampedTag$2] = typedArrayTags[uint16Tag$2] = typedArrayTags[uint32Tag$2] = true;
typedArrayTags[argsTag$2] = typedArrayTags[arrayTag$2] = typedArrayTags[arrayBufferTag$3] = typedArrayTags[boolTag$3] = typedArrayTags[dataViewTag$4] = typedArrayTags[dateTag$3] = typedArrayTags[errorTag$2] = typedArrayTags[funcTag$1] = typedArrayTags[mapTag$5] = typedArrayTags[numberTag$3] = typedArrayTags[objectTag$3] = typedArrayTags[regexpTag$3] = typedArrayTags[setTag$5] = typedArrayTags[stringTag$3] = typedArrayTags[weakMapTag$2] = false;
function baseIsTypedArray(value) {
  return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
}
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}
var freeExports$1 = typeof exports == "object" && exports && !exports.nodeType && exports;
var freeModule$1 = freeExports$1 && typeof module == "object" && module && !module.nodeType && module;
var moduleExports$1 = freeModule$1 && freeModule$1.exports === freeExports$1;
var freeProcess = moduleExports$1 && freeGlobal.process;
var nodeUtil = function() {
  try {
    var types = freeModule$1 && freeModule$1.require && freeModule$1.require("util").types;
    if (types) {
      return types;
    }
    return freeProcess && freeProcess.binding && freeProcess.binding("util");
  } catch (e) {
  }
}();
var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
var objectProto$8 = Object.prototype;
var hasOwnProperty$7 = objectProto$8.hasOwnProperty;
function arrayLikeKeys(value, inherited) {
  var isArr = isArray(value), isArg = !isArr && isArguments(value), isBuff = !isArr && !isArg && isBuffer(value), isType = !isArr && !isArg && !isBuff && isTypedArray(value), skipIndexes = isArr || isArg || isBuff || isType, result = skipIndexes ? baseTimes(value.length, String) : [], length = result.length;
  for (var key in value) {
    if ((inherited || hasOwnProperty$7.call(value, key)) && !(skipIndexes && // Safari 9 has enumerable `arguments.length` in strict mode.
    (key == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
    isBuff && (key == "offset" || key == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
    isType && (key == "buffer" || key == "byteLength" || key == "byteOffset") || // Skip index properties.
    isIndex(key, length)))) {
      result.push(key);
    }
  }
  return result;
}
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}
var nativeKeys = overArg(Object.keys, Object);
var objectProto$7 = Object.prototype;
var hasOwnProperty$6 = objectProto$7.hasOwnProperty;
function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty$6.call(object, key) && key != "constructor") {
      result.push(key);
    }
  }
  return result;
}
function keys(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}
function nativeKeysIn(object) {
  var result = [];
  if (object != null) {
    for (var key in Object(object)) {
      result.push(key);
    }
  }
  return result;
}
var objectProto$6 = Object.prototype;
var hasOwnProperty$5 = objectProto$6.hasOwnProperty;
function baseKeysIn(object) {
  if (!isObject$1(object)) {
    return nativeKeysIn(object);
  }
  var isProto = isPrototype(object), result = [];
  for (var key in object) {
    if (!(key == "constructor" && (isProto || !hasOwnProperty$5.call(object, key)))) {
      result.push(key);
    }
  }
  return result;
}
function keysIn(object) {
  return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
}
var nativeCreate = getNative(Object, "create");
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
  this.size = 0;
}
function hashDelete(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}
var HASH_UNDEFINED$2 = "__lodash_hash_undefined__";
var objectProto$5 = Object.prototype;
var hasOwnProperty$4 = objectProto$5.hasOwnProperty;
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED$2 ? void 0 : result;
  }
  return hasOwnProperty$4.call(data, key) ? data[key] : void 0;
}
var objectProto$4 = Object.prototype;
var hasOwnProperty$3 = objectProto$4.hasOwnProperty;
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? data[key] !== void 0 : hasOwnProperty$3.call(data, key);
}
var HASH_UNDEFINED$1 = "__lodash_hash_undefined__";
function hashSet(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = nativeCreate && value === void 0 ? HASH_UNDEFINED$1 : value;
  return this;
}
function Hash(entries) {
  var index = -1, length = entries == null ? 0 : entries.length;
  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}
Hash.prototype.clear = hashClear;
Hash.prototype["delete"] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;
function listCacheClear() {
  this.__data__ = [];
  this.size = 0;
}
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}
var arrayProto = Array.prototype;
var splice = arrayProto.splice;
function listCacheDelete(key) {
  var data = this.__data__, index = assocIndexOf(data, key);
  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  --this.size;
  return true;
}
function listCacheGet(key) {
  var data = this.__data__, index = assocIndexOf(data, key);
  return index < 0 ? void 0 : data[index][1];
}
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}
function listCacheSet(key, value) {
  var data = this.__data__, index = assocIndexOf(data, key);
  if (index < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}
function ListCache(entries) {
  var index = -1, length = entries == null ? 0 : entries.length;
  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}
ListCache.prototype.clear = listCacheClear;
ListCache.prototype["delete"] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;
var Map$1 = getNative(root, "Map");
function mapCacheClear() {
  this.size = 0;
  this.__data__ = {
    "hash": new Hash(),
    "map": new (Map$1 || ListCache)(),
    "string": new Hash()
  };
}
function isKeyable(value) {
  var type = typeof value;
  return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
}
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
}
function mapCacheDelete(key) {
  var result = getMapData(this, key)["delete"](key);
  this.size -= result ? 1 : 0;
  return result;
}
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}
function mapCacheSet(key, value) {
  var data = getMapData(this, key), size = data.size;
  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}
function MapCache(entries) {
  var index = -1, length = entries == null ? 0 : entries.length;
  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype["delete"] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;
function arrayPush(array, values) {
  var index = -1, length = values.length, offset = array.length;
  while (++index < length) {
    array[offset + index] = values[index];
  }
  return array;
}
var getPrototype = overArg(Object.getPrototypeOf, Object);
function stackClear() {
  this.__data__ = new ListCache();
  this.size = 0;
}
function stackDelete(key) {
  var data = this.__data__, result = data["delete"](key);
  this.size = data.size;
  return result;
}
function stackGet(key) {
  return this.__data__.get(key);
}
function stackHas(key) {
  return this.__data__.has(key);
}
var LARGE_ARRAY_SIZE = 200;
function stackSet(key, value) {
  var data = this.__data__;
  if (data instanceof ListCache) {
    var pairs = data.__data__;
    if (!Map$1 || pairs.length < LARGE_ARRAY_SIZE - 1) {
      pairs.push([key, value]);
      this.size = ++data.size;
      return this;
    }
    data = this.__data__ = new MapCache(pairs);
  }
  data.set(key, value);
  this.size = data.size;
  return this;
}
function Stack(entries) {
  var data = this.__data__ = new ListCache(entries);
  this.size = data.size;
}
Stack.prototype.clear = stackClear;
Stack.prototype["delete"] = stackDelete;
Stack.prototype.get = stackGet;
Stack.prototype.has = stackHas;
Stack.prototype.set = stackSet;
function baseAssign(object, source) {
  return object && copyObject(source, keys(source), object);
}
function baseAssignIn(object, source) {
  return object && copyObject(source, keysIn(source), object);
}
var freeExports = typeof exports == "object" && exports && !exports.nodeType && exports;
var freeModule = freeExports && typeof module == "object" && module && !module.nodeType && module;
var moduleExports = freeModule && freeModule.exports === freeExports;
var Buffer2 = moduleExports ? root.Buffer : void 0, allocUnsafe = Buffer2 ? Buffer2.allocUnsafe : void 0;
function cloneBuffer(buffer, isDeep) {
  if (isDeep) {
    return buffer.slice();
  }
  var length = buffer.length, result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);
  buffer.copy(result);
  return result;
}
function arrayFilter(array, predicate) {
  var index = -1, length = array == null ? 0 : array.length, resIndex = 0, result = [];
  while (++index < length) {
    var value = array[index];
    if (predicate(value, index, array)) {
      result[resIndex++] = value;
    }
  }
  return result;
}
function stubArray() {
  return [];
}
var objectProto$3 = Object.prototype;
var propertyIsEnumerable = objectProto$3.propertyIsEnumerable;
var nativeGetSymbols$1 = Object.getOwnPropertySymbols;
var getSymbols = !nativeGetSymbols$1 ? stubArray : function(object) {
  if (object == null) {
    return [];
  }
  object = Object(object);
  return arrayFilter(nativeGetSymbols$1(object), function(symbol) {
    return propertyIsEnumerable.call(object, symbol);
  });
};
function copySymbols(source, object) {
  return copyObject(source, getSymbols(source), object);
}
var nativeGetSymbols = Object.getOwnPropertySymbols;
var getSymbolsIn = !nativeGetSymbols ? stubArray : function(object) {
  var result = [];
  while (object) {
    arrayPush(result, getSymbols(object));
    object = getPrototype(object);
  }
  return result;
};
function copySymbolsIn(source, object) {
  return copyObject(source, getSymbolsIn(source), object);
}
function baseGetAllKeys(object, keysFunc, symbolsFunc) {
  var result = keysFunc(object);
  return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
}
function getAllKeys(object) {
  return baseGetAllKeys(object, keys, getSymbols);
}
function getAllKeysIn(object) {
  return baseGetAllKeys(object, keysIn, getSymbolsIn);
}
var DataView = getNative(root, "DataView");
var Promise$1 = getNative(root, "Promise");
var Set$1 = getNative(root, "Set");
var mapTag$4 = "[object Map]", objectTag$2 = "[object Object]", promiseTag = "[object Promise]", setTag$4 = "[object Set]", weakMapTag$1 = "[object WeakMap]";
var dataViewTag$3 = "[object DataView]";
var dataViewCtorString = toSource(DataView), mapCtorString = toSource(Map$1), promiseCtorString = toSource(Promise$1), setCtorString = toSource(Set$1), weakMapCtorString = toSource(WeakMap2);
var getTag = baseGetTag;
if (DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag$3 || Map$1 && getTag(new Map$1()) != mapTag$4 || Promise$1 && getTag(Promise$1.resolve()) != promiseTag || Set$1 && getTag(new Set$1()) != setTag$4 || WeakMap2 && getTag(new WeakMap2()) != weakMapTag$1) {
  getTag = function(value) {
    var result = baseGetTag(value), Ctor = result == objectTag$2 ? value.constructor : void 0, ctorString = Ctor ? toSource(Ctor) : "";
    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString:
          return dataViewTag$3;
        case mapCtorString:
          return mapTag$4;
        case promiseCtorString:
          return promiseTag;
        case setCtorString:
          return setTag$4;
        case weakMapCtorString:
          return weakMapTag$1;
      }
    }
    return result;
  };
}
var objectProto$2 = Object.prototype;
var hasOwnProperty$2 = objectProto$2.hasOwnProperty;
function initCloneArray(array) {
  var length = array.length, result = new array.constructor(length);
  if (length && typeof array[0] == "string" && hasOwnProperty$2.call(array, "index")) {
    result.index = array.index;
    result.input = array.input;
  }
  return result;
}
var Uint8Array$1 = root.Uint8Array;
function cloneArrayBuffer(arrayBuffer) {
  var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
  new Uint8Array$1(result).set(new Uint8Array$1(arrayBuffer));
  return result;
}
function cloneDataView(dataView, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
  return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
}
var reFlags = /\w*$/;
function cloneRegExp(regexp) {
  var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
  result.lastIndex = regexp.lastIndex;
  return result;
}
var symbolProto$1 = Symbol$1 ? Symbol$1.prototype : void 0, symbolValueOf$1 = symbolProto$1 ? symbolProto$1.valueOf : void 0;
function cloneSymbol(symbol) {
  return symbolValueOf$1 ? Object(symbolValueOf$1.call(symbol)) : {};
}
function cloneTypedArray(typedArray, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
  return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
}
var boolTag$2 = "[object Boolean]", dateTag$2 = "[object Date]", mapTag$3 = "[object Map]", numberTag$2 = "[object Number]", regexpTag$2 = "[object RegExp]", setTag$3 = "[object Set]", stringTag$2 = "[object String]", symbolTag$2 = "[object Symbol]";
var arrayBufferTag$2 = "[object ArrayBuffer]", dataViewTag$2 = "[object DataView]", float32Tag$1 = "[object Float32Array]", float64Tag$1 = "[object Float64Array]", int8Tag$1 = "[object Int8Array]", int16Tag$1 = "[object Int16Array]", int32Tag$1 = "[object Int32Array]", uint8Tag$1 = "[object Uint8Array]", uint8ClampedTag$1 = "[object Uint8ClampedArray]", uint16Tag$1 = "[object Uint16Array]", uint32Tag$1 = "[object Uint32Array]";
function initCloneByTag(object, tag, isDeep) {
  var Ctor = object.constructor;
  switch (tag) {
    case arrayBufferTag$2:
      return cloneArrayBuffer(object);
    case boolTag$2:
    case dateTag$2:
      return new Ctor(+object);
    case dataViewTag$2:
      return cloneDataView(object, isDeep);
    case float32Tag$1:
    case float64Tag$1:
    case int8Tag$1:
    case int16Tag$1:
    case int32Tag$1:
    case uint8Tag$1:
    case uint8ClampedTag$1:
    case uint16Tag$1:
    case uint32Tag$1:
      return cloneTypedArray(object, isDeep);
    case mapTag$3:
      return new Ctor();
    case numberTag$2:
    case stringTag$2:
      return new Ctor(object);
    case regexpTag$2:
      return cloneRegExp(object);
    case setTag$3:
      return new Ctor();
    case symbolTag$2:
      return cloneSymbol(object);
  }
}
function initCloneObject(object) {
  return typeof object.constructor == "function" && !isPrototype(object) ? baseCreate(getPrototype(object)) : {};
}
var mapTag$2 = "[object Map]";
function baseIsMap(value) {
  return isObjectLike(value) && getTag(value) == mapTag$2;
}
var nodeIsMap = nodeUtil && nodeUtil.isMap;
var isMap = nodeIsMap ? baseUnary(nodeIsMap) : baseIsMap;
var setTag$2 = "[object Set]";
function baseIsSet(value) {
  return isObjectLike(value) && getTag(value) == setTag$2;
}
var nodeIsSet = nodeUtil && nodeUtil.isSet;
var isSet = nodeIsSet ? baseUnary(nodeIsSet) : baseIsSet;
var CLONE_DEEP_FLAG$1 = 1, CLONE_FLAT_FLAG = 2, CLONE_SYMBOLS_FLAG$1 = 4;
var argsTag$1 = "[object Arguments]", arrayTag$1 = "[object Array]", boolTag$1 = "[object Boolean]", dateTag$1 = "[object Date]", errorTag$1 = "[object Error]", funcTag = "[object Function]", genTag = "[object GeneratorFunction]", mapTag$1 = "[object Map]", numberTag$1 = "[object Number]", objectTag$1 = "[object Object]", regexpTag$1 = "[object RegExp]", setTag$1 = "[object Set]", stringTag$1 = "[object String]", symbolTag$1 = "[object Symbol]", weakMapTag = "[object WeakMap]";
var arrayBufferTag$1 = "[object ArrayBuffer]", dataViewTag$1 = "[object DataView]", float32Tag = "[object Float32Array]", float64Tag = "[object Float64Array]", int8Tag = "[object Int8Array]", int16Tag = "[object Int16Array]", int32Tag = "[object Int32Array]", uint8Tag = "[object Uint8Array]", uint8ClampedTag = "[object Uint8ClampedArray]", uint16Tag = "[object Uint16Array]", uint32Tag = "[object Uint32Array]";
var cloneableTags = {};
cloneableTags[argsTag$1] = cloneableTags[arrayTag$1] = cloneableTags[arrayBufferTag$1] = cloneableTags[dataViewTag$1] = cloneableTags[boolTag$1] = cloneableTags[dateTag$1] = cloneableTags[float32Tag] = cloneableTags[float64Tag] = cloneableTags[int8Tag] = cloneableTags[int16Tag] = cloneableTags[int32Tag] = cloneableTags[mapTag$1] = cloneableTags[numberTag$1] = cloneableTags[objectTag$1] = cloneableTags[regexpTag$1] = cloneableTags[setTag$1] = cloneableTags[stringTag$1] = cloneableTags[symbolTag$1] = cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] = cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
cloneableTags[errorTag$1] = cloneableTags[funcTag] = cloneableTags[weakMapTag] = false;
function baseClone(value, bitmask, customizer, key, object, stack) {
  var result, isDeep = bitmask & CLONE_DEEP_FLAG$1, isFlat = bitmask & CLONE_FLAT_FLAG, isFull = bitmask & CLONE_SYMBOLS_FLAG$1;
  if (result !== void 0) {
    return result;
  }
  if (!isObject$1(value)) {
    return value;
  }
  var isArr = isArray(value);
  if (isArr) {
    result = initCloneArray(value);
    if (!isDeep) {
      return copyArray(value, result);
    }
  } else {
    var tag = getTag(value), isFunc = tag == funcTag || tag == genTag;
    if (isBuffer(value)) {
      return cloneBuffer(value, isDeep);
    }
    if (tag == objectTag$1 || tag == argsTag$1 || isFunc && !object) {
      result = isFlat || isFunc ? {} : initCloneObject(value);
      if (!isDeep) {
        return isFlat ? copySymbolsIn(value, baseAssignIn(result, value)) : copySymbols(value, baseAssign(result, value));
      }
    } else {
      if (!cloneableTags[tag]) {
        return object ? value : {};
      }
      result = initCloneByTag(value, tag, isDeep);
    }
  }
  stack || (stack = new Stack());
  var stacked = stack.get(value);
  if (stacked) {
    return stacked;
  }
  stack.set(value, result);
  if (isSet(value)) {
    value.forEach(function(subValue) {
      result.add(baseClone(subValue, bitmask, customizer, subValue, value, stack));
    });
  } else if (isMap(value)) {
    value.forEach(function(subValue, key2) {
      result.set(key2, baseClone(subValue, bitmask, customizer, key2, value, stack));
    });
  }
  var keysFunc = isFull ? isFlat ? getAllKeysIn : getAllKeys : isFlat ? keysIn : keys;
  var props = isArr ? void 0 : keysFunc(value);
  arrayEach(props || value, function(subValue, key2) {
    if (props) {
      key2 = subValue;
      subValue = value[key2];
    }
    assignValue(result, key2, baseClone(subValue, bitmask, customizer, key2, value, stack));
  });
  return result;
}
var CLONE_DEEP_FLAG = 1, CLONE_SYMBOLS_FLAG = 4;
function cloneDeep(value) {
  return baseClone(value, CLONE_DEEP_FLAG | CLONE_SYMBOLS_FLAG);
}
var HASH_UNDEFINED = "__lodash_hash_undefined__";
function setCacheAdd(value) {
  this.__data__.set(value, HASH_UNDEFINED);
  return this;
}
function setCacheHas(value) {
  return this.__data__.has(value);
}
function SetCache(values) {
  var index = -1, length = values == null ? 0 : values.length;
  this.__data__ = new MapCache();
  while (++index < length) {
    this.add(values[index]);
  }
}
SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
SetCache.prototype.has = setCacheHas;
function arraySome(array, predicate) {
  var index = -1, length = array == null ? 0 : array.length;
  while (++index < length) {
    if (predicate(array[index], index, array)) {
      return true;
    }
  }
  return false;
}
function cacheHas(cache, key) {
  return cache.has(key);
}
var COMPARE_PARTIAL_FLAG$3 = 1, COMPARE_UNORDERED_FLAG$1 = 2;
function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG$3, arrLength = array.length, othLength = other.length;
  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
    return false;
  }
  var arrStacked = stack.get(array);
  var othStacked = stack.get(other);
  if (arrStacked && othStacked) {
    return arrStacked == other && othStacked == array;
  }
  var index = -1, result = true, seen = bitmask & COMPARE_UNORDERED_FLAG$1 ? new SetCache() : void 0;
  stack.set(array, other);
  stack.set(other, array);
  while (++index < arrLength) {
    var arrValue = array[index], othValue = other[index];
    if (customizer) {
      var compared = isPartial ? customizer(othValue, arrValue, index, other, array, stack) : customizer(arrValue, othValue, index, array, other, stack);
    }
    if (compared !== void 0) {
      if (compared) {
        continue;
      }
      result = false;
      break;
    }
    if (seen) {
      if (!arraySome(other, function(othValue2, othIndex) {
        if (!cacheHas(seen, othIndex) && (arrValue === othValue2 || equalFunc(arrValue, othValue2, bitmask, customizer, stack))) {
          return seen.push(othIndex);
        }
      })) {
        result = false;
        break;
      }
    } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
      result = false;
      break;
    }
  }
  stack["delete"](array);
  stack["delete"](other);
  return result;
}
function mapToArray(map) {
  var index = -1, result = Array(map.size);
  map.forEach(function(value, key) {
    result[++index] = [key, value];
  });
  return result;
}
function setToArray(set) {
  var index = -1, result = Array(set.size);
  set.forEach(function(value) {
    result[++index] = value;
  });
  return result;
}
var COMPARE_PARTIAL_FLAG$2 = 1, COMPARE_UNORDERED_FLAG = 2;
var boolTag = "[object Boolean]", dateTag = "[object Date]", errorTag = "[object Error]", mapTag = "[object Map]", numberTag = "[object Number]", regexpTag = "[object RegExp]", setTag = "[object Set]", stringTag = "[object String]", symbolTag = "[object Symbol]";
var arrayBufferTag = "[object ArrayBuffer]", dataViewTag = "[object DataView]";
var symbolProto = Symbol$1 ? Symbol$1.prototype : void 0, symbolValueOf = symbolProto ? symbolProto.valueOf : void 0;
function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
  switch (tag) {
    case dataViewTag:
      if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) {
        return false;
      }
      object = object.buffer;
      other = other.buffer;
    case arrayBufferTag:
      if (object.byteLength != other.byteLength || !equalFunc(new Uint8Array$1(object), new Uint8Array$1(other))) {
        return false;
      }
      return true;
    case boolTag:
    case dateTag:
    case numberTag:
      return eq(+object, +other);
    case errorTag:
      return object.name == other.name && object.message == other.message;
    case regexpTag:
    case stringTag:
      return object == other + "";
    case mapTag:
      var convert = mapToArray;
    case setTag:
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG$2;
      convert || (convert = setToArray);
      if (object.size != other.size && !isPartial) {
        return false;
      }
      var stacked = stack.get(object);
      if (stacked) {
        return stacked == other;
      }
      bitmask |= COMPARE_UNORDERED_FLAG;
      stack.set(object, other);
      var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
      stack["delete"](object);
      return result;
    case symbolTag:
      if (symbolValueOf) {
        return symbolValueOf.call(object) == symbolValueOf.call(other);
      }
  }
  return false;
}
var COMPARE_PARTIAL_FLAG$1 = 1;
var objectProto$1 = Object.prototype;
var hasOwnProperty$1 = objectProto$1.hasOwnProperty;
function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG$1, objProps = getAllKeys(object), objLength = objProps.length, othProps = getAllKeys(other), othLength = othProps.length;
  if (objLength != othLength && !isPartial) {
    return false;
  }
  var index = objLength;
  while (index--) {
    var key = objProps[index];
    if (!(isPartial ? key in other : hasOwnProperty$1.call(other, key))) {
      return false;
    }
  }
  var objStacked = stack.get(object);
  var othStacked = stack.get(other);
  if (objStacked && othStacked) {
    return objStacked == other && othStacked == object;
  }
  var result = true;
  stack.set(object, other);
  stack.set(other, object);
  var skipCtor = isPartial;
  while (++index < objLength) {
    key = objProps[index];
    var objValue = object[key], othValue = other[key];
    if (customizer) {
      var compared = isPartial ? customizer(othValue, objValue, key, other, object, stack) : customizer(objValue, othValue, key, object, other, stack);
    }
    if (!(compared === void 0 ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack) : compared)) {
      result = false;
      break;
    }
    skipCtor || (skipCtor = key == "constructor");
  }
  if (result && !skipCtor) {
    var objCtor = object.constructor, othCtor = other.constructor;
    if (objCtor != othCtor && ("constructor" in object && "constructor" in other) && !(typeof objCtor == "function" && objCtor instanceof objCtor && typeof othCtor == "function" && othCtor instanceof othCtor)) {
      result = false;
    }
  }
  stack["delete"](object);
  stack["delete"](other);
  return result;
}
var COMPARE_PARTIAL_FLAG = 1;
var argsTag = "[object Arguments]", arrayTag = "[object Array]", objectTag = "[object Object]";
var objectProto = Object.prototype;
var hasOwnProperty = objectProto.hasOwnProperty;
function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
  var objIsArr = isArray(object), othIsArr = isArray(other), objTag = objIsArr ? arrayTag : getTag(object), othTag = othIsArr ? arrayTag : getTag(other);
  objTag = objTag == argsTag ? objectTag : objTag;
  othTag = othTag == argsTag ? objectTag : othTag;
  var objIsObj = objTag == objectTag, othIsObj = othTag == objectTag, isSameTag = objTag == othTag;
  if (isSameTag && isBuffer(object)) {
    if (!isBuffer(other)) {
      return false;
    }
    objIsArr = true;
    objIsObj = false;
  }
  if (isSameTag && !objIsObj) {
    stack || (stack = new Stack());
    return objIsArr || isTypedArray(object) ? equalArrays(object, other, bitmask, customizer, equalFunc, stack) : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
  }
  if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
    var objIsWrapped = objIsObj && hasOwnProperty.call(object, "__wrapped__"), othIsWrapped = othIsObj && hasOwnProperty.call(other, "__wrapped__");
    if (objIsWrapped || othIsWrapped) {
      var objUnwrapped = objIsWrapped ? object.value() : object, othUnwrapped = othIsWrapped ? other.value() : other;
      stack || (stack = new Stack());
      return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
    }
  }
  if (!isSameTag) {
    return false;
  }
  stack || (stack = new Stack());
  return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
}
function baseIsEqual(value, other, bitmask, customizer, stack) {
  if (value === other) {
    return true;
  }
  if (value == null || other == null || !isObjectLike(value) && !isObjectLike(other)) {
    return value !== value && other !== other;
  }
  return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
}
function isEqual(value, other) {
  return baseIsEqual(value, other);
}
const isPackaged = ["true"].includes(process.env.IS_PACKAGED);
const extraResolve = (filePath) => {
  const basePath = isPackaged ? process.resourcesPath : "electron/resources";
  const value = resolve(basePath, "extra", filePath);
  return value;
};
const buildResolve = (value) => resolve(`electron/resources/build/${value}`);
function createProxy(targetObject, methodNames) {
  return methodNames.reduce((proxyObj, methodName) => {
    proxyObj[methodName] = (...args2) => targetObject[methodName](...cloneDeep(args2));
    return proxyObj;
  }, {});
}
async function executeI18n(mainWindow2, value) {
  try {
    return await mainWindow2.webContents.executeJavaScript(
      `window.t('${value}')`
    );
  } catch (error) {
    console.warn((error == null ? void 0 : error.message) || error);
    return value;
  }
}
function loadPage(win, prefix = "") {
  const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(join(VITE_DEV_SERVER_URL, prefix));
  } else {
    win.loadFile(join(process.env.DIST, prefix, "index.html"));
  }
}
log$1.transports.console.level = false;
const levels = Object.keys(log$1.functions);
const getFilePath = () => {
  var _a;
  return (_a = log$1.transports.file.getFile()) == null ? void 0 : _a.path;
};
const log = {
  ...createProxy(log$1, ["initialize", ...levels]),
  levels,
  functions: createProxy(log$1, levels),
  getFilePath,
  openInEditor: () => shell$1.openPath(getFilePath())
};
const isObject = (value) => {
  const type = typeof value;
  return value !== null && (type === "object" || type === "function");
};
const disallowedKeys = /* @__PURE__ */ new Set([
  "__proto__",
  "prototype",
  "constructor"
]);
const digits = new Set("0123456789");
function getPathSegments(path2) {
  const parts = [];
  let currentSegment = "";
  let currentPart = "start";
  let isIgnoring = false;
  for (const character of path2) {
    switch (character) {
      case "\\": {
        if (currentPart === "index") {
          throw new Error("Invalid character in an index");
        }
        if (currentPart === "indexEnd") {
          throw new Error("Invalid character after an index");
        }
        if (isIgnoring) {
          currentSegment += character;
        }
        currentPart = "property";
        isIgnoring = !isIgnoring;
        break;
      }
      case ".": {
        if (currentPart === "index") {
          throw new Error("Invalid character in an index");
        }
        if (currentPart === "indexEnd") {
          currentPart = "property";
          break;
        }
        if (isIgnoring) {
          isIgnoring = false;
          currentSegment += character;
          break;
        }
        if (disallowedKeys.has(currentSegment)) {
          return [];
        }
        parts.push(currentSegment);
        currentSegment = "";
        currentPart = "property";
        break;
      }
      case "[": {
        if (currentPart === "index") {
          throw new Error("Invalid character in an index");
        }
        if (currentPart === "indexEnd") {
          currentPart = "index";
          break;
        }
        if (isIgnoring) {
          isIgnoring = false;
          currentSegment += character;
          break;
        }
        if (currentPart === "property") {
          if (disallowedKeys.has(currentSegment)) {
            return [];
          }
          parts.push(currentSegment);
          currentSegment = "";
        }
        currentPart = "index";
        break;
      }
      case "]": {
        if (currentPart === "index") {
          parts.push(Number.parseInt(currentSegment, 10));
          currentSegment = "";
          currentPart = "indexEnd";
          break;
        }
        if (currentPart === "indexEnd") {
          throw new Error("Invalid character after an index");
        }
      }
      default: {
        if (currentPart === "index" && !digits.has(character)) {
          throw new Error("Invalid character in an index");
        }
        if (currentPart === "indexEnd") {
          throw new Error("Invalid character after an index");
        }
        if (currentPart === "start") {
          currentPart = "property";
        }
        if (isIgnoring) {
          isIgnoring = false;
          currentSegment += "\\";
        }
        currentSegment += character;
      }
    }
  }
  if (isIgnoring) {
    currentSegment += "\\";
  }
  switch (currentPart) {
    case "property": {
      if (disallowedKeys.has(currentSegment)) {
        return [];
      }
      parts.push(currentSegment);
      break;
    }
    case "index": {
      throw new Error("Index was not closed");
    }
    case "start": {
      parts.push("");
      break;
    }
  }
  return parts;
}
function isStringIndex(object, key) {
  if (typeof key !== "number" && Array.isArray(object)) {
    const index = Number.parseInt(key, 10);
    return Number.isInteger(index) && object[index] === object[key];
  }
  return false;
}
function assertNotStringIndex(object, key) {
  if (isStringIndex(object, key)) {
    throw new Error("Cannot use string index");
  }
}
function getProperty(object, path2, value) {
  if (!isObject(object) || typeof path2 !== "string") {
    return value === void 0 ? object : value;
  }
  const pathArray = getPathSegments(path2);
  if (pathArray.length === 0) {
    return value;
  }
  for (let index = 0; index < pathArray.length; index++) {
    const key = pathArray[index];
    if (isStringIndex(object, key)) {
      object = index === pathArray.length - 1 ? void 0 : null;
    } else {
      object = object[key];
    }
    if (object === void 0 || object === null) {
      if (index !== pathArray.length - 1) {
        return value;
      }
      break;
    }
  }
  return object === void 0 ? value : object;
}
function setProperty(object, path2, value) {
  if (!isObject(object) || typeof path2 !== "string") {
    return object;
  }
  const root2 = object;
  const pathArray = getPathSegments(path2);
  for (let index = 0; index < pathArray.length; index++) {
    const key = pathArray[index];
    assertNotStringIndex(object, key);
    if (index === pathArray.length - 1) {
      object[key] = value;
    } else if (!isObject(object[key])) {
      object[key] = typeof pathArray[index + 1] === "number" ? [] : {};
    }
    object = object[key];
  }
  return root2;
}
function deleteProperty(object, path2) {
  if (!isObject(object) || typeof path2 !== "string") {
    return false;
  }
  const pathArray = getPathSegments(path2);
  for (let index = 0; index < pathArray.length; index++) {
    const key = pathArray[index];
    assertNotStringIndex(object, key);
    if (index === pathArray.length - 1) {
      delete object[key];
      return true;
    }
    object = object[key];
    if (!isObject(object)) {
      return false;
    }
  }
}
function hasProperty(object, path2) {
  if (!isObject(object) || typeof path2 !== "string") {
    return false;
  }
  const pathArray = getPathSegments(path2);
  if (pathArray.length === 0) {
    return false;
  }
  for (const key of pathArray) {
    if (!isObject(object) || !(key in object) || isStringIndex(object, key)) {
      return false;
    }
    object = object[key];
  }
  return true;
}
const homedir = os.homedir();
const tmpdir = os.tmpdir();
const { env } = process$1;
const macos = (name) => {
  const library = path.join(homedir, "Library");
  return {
    data: path.join(library, "Application Support", name),
    config: path.join(library, "Preferences", name),
    cache: path.join(library, "Caches", name),
    log: path.join(library, "Logs", name),
    temp: path.join(tmpdir, name)
  };
};
const windows = (name) => {
  const appData = env.APPDATA || path.join(homedir, "AppData", "Roaming");
  const localAppData = env.LOCALAPPDATA || path.join(homedir, "AppData", "Local");
  return {
    // Data/config/cache/log are invented by me as Windows isn't opinionated about this
    data: path.join(localAppData, name, "Data"),
    config: path.join(appData, name, "Config"),
    cache: path.join(localAppData, name, "Cache"),
    log: path.join(localAppData, name, "Log"),
    temp: path.join(tmpdir, name)
  };
};
const linux = (name) => {
  const username = path.basename(homedir);
  return {
    data: path.join(env.XDG_DATA_HOME || path.join(homedir, ".local", "share"), name),
    config: path.join(env.XDG_CONFIG_HOME || path.join(homedir, ".config"), name),
    cache: path.join(env.XDG_CACHE_HOME || path.join(homedir, ".cache"), name),
    // https://wiki.debian.org/XDGBaseDirectorySpecification#state
    log: path.join(env.XDG_STATE_HOME || path.join(homedir, ".local", "state"), name),
    temp: path.join(tmpdir, username, name)
  };
};
function envPaths(name, { suffix = "nodejs" } = {}) {
  if (typeof name !== "string") {
    throw new TypeError(`Expected a string, got ${typeof name}`);
  }
  if (suffix) {
    name += `-${suffix}`;
  }
  if (process$1.platform === "darwin") {
    return macos(name);
  }
  if (process$1.platform === "win32") {
    return windows(name);
  }
  return linux(name);
}
const attemptifyAsync = (fn, onError) => {
  return function attemptified(...args2) {
    return fn.apply(void 0, args2).catch(onError);
  };
};
const attemptifySync = (fn, onError) => {
  return function attemptified(...args2) {
    try {
      return fn.apply(void 0, args2);
    } catch (error) {
      return onError(error);
    }
  };
};
const IS_USER_ROOT = process$1.getuid ? !process$1.getuid() : false;
const LIMIT_FILES_DESCRIPTORS = 1e4;
const NOOP = () => void 0;
const Handlers = {
  /* API */
  isChangeErrorOk: (error) => {
    if (!Handlers.isNodeError(error))
      return false;
    const { code } = error;
    if (code === "ENOSYS")
      return true;
    if (!IS_USER_ROOT && (code === "EINVAL" || code === "EPERM"))
      return true;
    return false;
  },
  isNodeError: (error) => {
    return error instanceof Error;
  },
  isRetriableError: (error) => {
    if (!Handlers.isNodeError(error))
      return false;
    const { code } = error;
    if (code === "EMFILE" || code === "ENFILE" || code === "EAGAIN" || code === "EBUSY" || code === "EACCESS" || code === "EACCES" || code === "EACCS" || code === "EPERM")
      return true;
    return false;
  },
  onChangeError: (error) => {
    if (!Handlers.isNodeError(error))
      throw error;
    if (Handlers.isChangeErrorOk(error))
      return;
    throw error;
  }
};
class RetryfyQueue {
  constructor() {
    this.interval = 25;
    this.intervalId = void 0;
    this.limit = LIMIT_FILES_DESCRIPTORS;
    this.queueActive = /* @__PURE__ */ new Set();
    this.queueWaiting = /* @__PURE__ */ new Set();
    this.init = () => {
      if (this.intervalId)
        return;
      this.intervalId = setInterval(this.tick, this.interval);
    };
    this.reset = () => {
      if (!this.intervalId)
        return;
      clearInterval(this.intervalId);
      delete this.intervalId;
    };
    this.add = (fn) => {
      this.queueWaiting.add(fn);
      if (this.queueActive.size < this.limit / 2) {
        this.tick();
      } else {
        this.init();
      }
    };
    this.remove = (fn) => {
      this.queueWaiting.delete(fn);
      this.queueActive.delete(fn);
    };
    this.schedule = () => {
      return new Promise((resolve2) => {
        const cleanup = () => this.remove(resolver);
        const resolver = () => resolve2(cleanup);
        this.add(resolver);
      });
    };
    this.tick = () => {
      if (this.queueActive.size >= this.limit)
        return;
      if (!this.queueWaiting.size)
        return this.reset();
      for (const fn of this.queueWaiting) {
        if (this.queueActive.size >= this.limit)
          break;
        this.queueWaiting.delete(fn);
        this.queueActive.add(fn);
        fn();
      }
    };
  }
}
const RetryfyQueue$1 = new RetryfyQueue();
const retryifyAsync = (fn, isRetriableError) => {
  return function retrified(timestamp) {
    return function attempt(...args2) {
      return RetryfyQueue$1.schedule().then((cleanup) => {
        const onResolve = (result) => {
          cleanup();
          return result;
        };
        const onReject = (error) => {
          cleanup();
          if (Date.now() >= timestamp)
            throw error;
          if (isRetriableError(error)) {
            const delay = Math.round(100 * Math.random());
            const delayPromise = new Promise((resolve2) => setTimeout(resolve2, delay));
            return delayPromise.then(() => attempt.apply(void 0, args2));
          }
          throw error;
        };
        return fn.apply(void 0, args2).then(onResolve, onReject);
      });
    };
  };
};
const retryifySync = (fn, isRetriableError) => {
  return function retrified(timestamp) {
    return function attempt(...args2) {
      try {
        return fn.apply(void 0, args2);
      } catch (error) {
        if (Date.now() > timestamp)
          throw error;
        if (isRetriableError(error))
          return attempt.apply(void 0, args2);
        throw error;
      }
    };
  };
};
const FS = {
  attempt: {
    /* ASYNC */
    chmod: attemptifyAsync(promisify(fs.chmod), Handlers.onChangeError),
    chown: attemptifyAsync(promisify(fs.chown), Handlers.onChangeError),
    close: attemptifyAsync(promisify(fs.close), NOOP),
    fsync: attemptifyAsync(promisify(fs.fsync), NOOP),
    mkdir: attemptifyAsync(promisify(fs.mkdir), NOOP),
    realpath: attemptifyAsync(promisify(fs.realpath), NOOP),
    stat: attemptifyAsync(promisify(fs.stat), NOOP),
    unlink: attemptifyAsync(promisify(fs.unlink), NOOP),
    /* SYNC */
    chmodSync: attemptifySync(fs.chmodSync, Handlers.onChangeError),
    chownSync: attemptifySync(fs.chownSync, Handlers.onChangeError),
    closeSync: attemptifySync(fs.closeSync, NOOP),
    existsSync: attemptifySync(fs.existsSync, NOOP),
    fsyncSync: attemptifySync(fs.fsync, NOOP),
    mkdirSync: attemptifySync(fs.mkdirSync, NOOP),
    realpathSync: attemptifySync(fs.realpathSync, NOOP),
    statSync: attemptifySync(fs.statSync, NOOP),
    unlinkSync: attemptifySync(fs.unlinkSync, NOOP)
  },
  retry: {
    /* ASYNC */
    close: retryifyAsync(promisify(fs.close), Handlers.isRetriableError),
    fsync: retryifyAsync(promisify(fs.fsync), Handlers.isRetriableError),
    open: retryifyAsync(promisify(fs.open), Handlers.isRetriableError),
    readFile: retryifyAsync(promisify(fs.readFile), Handlers.isRetriableError),
    rename: retryifyAsync(promisify(fs.rename), Handlers.isRetriableError),
    stat: retryifyAsync(promisify(fs.stat), Handlers.isRetriableError),
    write: retryifyAsync(promisify(fs.write), Handlers.isRetriableError),
    writeFile: retryifyAsync(promisify(fs.writeFile), Handlers.isRetriableError),
    /* SYNC */
    closeSync: retryifySync(fs.closeSync, Handlers.isRetriableError),
    fsyncSync: retryifySync(fs.fsyncSync, Handlers.isRetriableError),
    openSync: retryifySync(fs.openSync, Handlers.isRetriableError),
    readFileSync: retryifySync(fs.readFileSync, Handlers.isRetriableError),
    renameSync: retryifySync(fs.renameSync, Handlers.isRetriableError),
    statSync: retryifySync(fs.statSync, Handlers.isRetriableError),
    writeSync: retryifySync(fs.writeSync, Handlers.isRetriableError),
    writeFileSync: retryifySync(fs.writeFileSync, Handlers.isRetriableError)
  }
};
const DEFAULT_ENCODING = "utf8";
const DEFAULT_FILE_MODE = 438;
const DEFAULT_FOLDER_MODE = 511;
const DEFAULT_WRITE_OPTIONS = {};
const DEFAULT_USER_UID = os.userInfo().uid;
const DEFAULT_USER_GID = os.userInfo().gid;
const DEFAULT_TIMEOUT_SYNC = 1e3;
const IS_POSIX = !!process$1.getuid;
process$1.getuid ? !process$1.getuid() : false;
const LIMIT_BASENAME_LENGTH = 128;
const isException = (value) => {
  return value instanceof Error && "code" in value;
};
const isString = (value) => {
  return typeof value === "string";
};
const isUndefined = (value) => {
  return value === void 0;
};
const IS_LINUX = process$1.platform === "linux";
const IS_WINDOWS = process$1.platform === "win32";
const Signals = ["SIGABRT", "SIGALRM", "SIGHUP", "SIGINT", "SIGTERM"];
if (!IS_WINDOWS) {
  Signals.push("SIGVTALRM", "SIGXCPU", "SIGXFSZ", "SIGUSR2", "SIGTRAP", "SIGSYS", "SIGQUIT", "SIGIOT");
}
if (IS_LINUX) {
  Signals.push("SIGIO", "SIGPOLL", "SIGPWR", "SIGSTKFLT", "SIGUNUSED");
}
class Interceptor {
  /* CONSTRUCTOR */
  constructor() {
    this.callbacks = /* @__PURE__ */ new Set();
    this.exited = false;
    this.exit = (signal) => {
      if (this.exited)
        return;
      this.exited = true;
      for (const callback of this.callbacks) {
        callback();
      }
      if (signal) {
        if (IS_WINDOWS && (signal !== "SIGINT" && signal !== "SIGTERM" && signal !== "SIGKILL")) {
          process$1.kill(process$1.pid, "SIGTERM");
        } else {
          process$1.kill(process$1.pid, signal);
        }
      }
    };
    this.hook = () => {
      process$1.once("exit", () => this.exit());
      for (const signal of Signals) {
        try {
          process$1.once(signal, () => this.exit(signal));
        } catch {
        }
      }
    };
    this.register = (callback) => {
      this.callbacks.add(callback);
      return () => {
        this.callbacks.delete(callback);
      };
    };
    this.hook();
  }
}
const Interceptor$1 = new Interceptor();
const whenExit = Interceptor$1.register;
const Temp = {
  /* VARIABLES */
  store: {},
  /* API */
  create: (filePath) => {
    const randomness = `000000${Math.floor(Math.random() * 16777215).toString(16)}`.slice(-6);
    const timestamp = Date.now().toString().slice(-10);
    const prefix = "tmp-";
    const suffix = `.${prefix}${timestamp}${randomness}`;
    const tempPath = `${filePath}${suffix}`;
    return tempPath;
  },
  get: (filePath, creator, purge = true) => {
    const tempPath = Temp.truncate(creator(filePath));
    if (tempPath in Temp.store)
      return Temp.get(filePath, creator, purge);
    Temp.store[tempPath] = purge;
    const disposer = () => delete Temp.store[tempPath];
    return [tempPath, disposer];
  },
  purge: (filePath) => {
    if (!Temp.store[filePath])
      return;
    delete Temp.store[filePath];
    FS.attempt.unlink(filePath);
  },
  purgeSync: (filePath) => {
    if (!Temp.store[filePath])
      return;
    delete Temp.store[filePath];
    FS.attempt.unlinkSync(filePath);
  },
  purgeSyncAll: () => {
    for (const filePath in Temp.store) {
      Temp.purgeSync(filePath);
    }
  },
  truncate: (filePath) => {
    const basename = path.basename(filePath);
    if (basename.length <= LIMIT_BASENAME_LENGTH)
      return filePath;
    const truncable = /^(\.?)(.*?)((?:\.[^.]+)?(?:\.tmp-\d{10}[a-f0-9]{6})?)$/.exec(basename);
    if (!truncable)
      return filePath;
    const truncationLength = basename.length - LIMIT_BASENAME_LENGTH;
    return `${filePath.slice(0, -basename.length)}${truncable[1]}${truncable[2].slice(0, -truncationLength)}${truncable[3]}`;
  }
};
whenExit(Temp.purgeSyncAll);
function writeFileSync(filePath, data, options = DEFAULT_WRITE_OPTIONS) {
  if (isString(options))
    return writeFileSync(filePath, data, { encoding: options });
  const timeout = Date.now() + ((options.timeout ?? DEFAULT_TIMEOUT_SYNC) || -1);
  let tempDisposer = null;
  let tempPath = null;
  let fd = null;
  try {
    const filePathReal = FS.attempt.realpathSync(filePath);
    const filePathExists = !!filePathReal;
    filePath = filePathReal || filePath;
    [tempPath, tempDisposer] = Temp.get(filePath, options.tmpCreate || Temp.create, !(options.tmpPurge === false));
    const useStatChown = IS_POSIX && isUndefined(options.chown);
    const useStatMode = isUndefined(options.mode);
    if (filePathExists && (useStatChown || useStatMode)) {
      const stats = FS.attempt.statSync(filePath);
      if (stats) {
        options = { ...options };
        if (useStatChown) {
          options.chown = { uid: stats.uid, gid: stats.gid };
        }
        if (useStatMode) {
          options.mode = stats.mode;
        }
      }
    }
    if (!filePathExists) {
      const parentPath = path.dirname(filePath);
      FS.attempt.mkdirSync(parentPath, {
        mode: DEFAULT_FOLDER_MODE,
        recursive: true
      });
    }
    fd = FS.retry.openSync(timeout)(tempPath, "w", options.mode || DEFAULT_FILE_MODE);
    if (options.tmpCreated) {
      options.tmpCreated(tempPath);
    }
    if (isString(data)) {
      FS.retry.writeSync(timeout)(fd, data, 0, options.encoding || DEFAULT_ENCODING);
    } else if (!isUndefined(data)) {
      FS.retry.writeSync(timeout)(fd, data, 0, data.length, 0);
    }
    if (options.fsync !== false) {
      if (options.fsyncWait !== false) {
        FS.retry.fsyncSync(timeout)(fd);
      } else {
        FS.attempt.fsync(fd);
      }
    }
    FS.retry.closeSync(timeout)(fd);
    fd = null;
    if (options.chown && (options.chown.uid !== DEFAULT_USER_UID || options.chown.gid !== DEFAULT_USER_GID)) {
      FS.attempt.chownSync(tempPath, options.chown.uid, options.chown.gid);
    }
    if (options.mode && options.mode !== DEFAULT_FILE_MODE) {
      FS.attempt.chmodSync(tempPath, options.mode);
    }
    try {
      FS.retry.renameSync(timeout)(tempPath, filePath);
    } catch (error) {
      if (!isException(error))
        throw error;
      if (error.code !== "ENAMETOOLONG")
        throw error;
      FS.retry.renameSync(timeout)(tempPath, Temp.truncate(filePath));
    }
    tempDisposer();
    tempPath = null;
  } finally {
    if (fd)
      FS.attempt.closeSync(fd);
    if (tempPath)
      Temp.purge(tempPath);
  }
}
const copyProperty = (to, from, property, ignoreNonConfigurable) => {
  if (property === "length" || property === "prototype") {
    return;
  }
  if (property === "arguments" || property === "caller") {
    return;
  }
  const toDescriptor = Object.getOwnPropertyDescriptor(to, property);
  const fromDescriptor = Object.getOwnPropertyDescriptor(from, property);
  if (!canCopyProperty(toDescriptor, fromDescriptor) && ignoreNonConfigurable) {
    return;
  }
  Object.defineProperty(to, property, fromDescriptor);
};
const canCopyProperty = function(toDescriptor, fromDescriptor) {
  return toDescriptor === void 0 || toDescriptor.configurable || toDescriptor.writable === fromDescriptor.writable && toDescriptor.enumerable === fromDescriptor.enumerable && toDescriptor.configurable === fromDescriptor.configurable && (toDescriptor.writable || toDescriptor.value === fromDescriptor.value);
};
const changePrototype = (to, from) => {
  const fromPrototype = Object.getPrototypeOf(from);
  if (fromPrototype === Object.getPrototypeOf(to)) {
    return;
  }
  Object.setPrototypeOf(to, fromPrototype);
};
const wrappedToString = (withName, fromBody) => `/* Wrapped ${withName}*/
${fromBody}`;
const toStringDescriptor = Object.getOwnPropertyDescriptor(Function.prototype, "toString");
const toStringName = Object.getOwnPropertyDescriptor(Function.prototype.toString, "name");
const changeToString = (to, from, name) => {
  const withName = name === "" ? "" : `with ${name.trim()}() `;
  const newToString = wrappedToString.bind(null, withName, from.toString());
  Object.defineProperty(newToString, "name", toStringName);
  Object.defineProperty(to, "toString", { ...toStringDescriptor, value: newToString });
};
function mimicFunction(to, from, { ignoreNonConfigurable = false } = {}) {
  const { name } = to;
  for (const property of Reflect.ownKeys(from)) {
    copyProperty(to, from, property, ignoreNonConfigurable);
  }
  changePrototype(to, from);
  changeToString(to, from, name);
  return to;
}
const debounceFn = (inputFunction, options = {}) => {
  if (typeof inputFunction !== "function") {
    throw new TypeError(`Expected the first argument to be a function, got \`${typeof inputFunction}\``);
  }
  const {
    wait = 0,
    maxWait = Number.POSITIVE_INFINITY,
    before = false,
    after = true
  } = options;
  if (!before && !after) {
    throw new Error("Both `before` and `after` are false, function wouldn't be called.");
  }
  let timeout;
  let maxTimeout;
  let result;
  const debouncedFunction = function(...arguments_) {
    const context = this;
    const later = () => {
      timeout = void 0;
      if (maxTimeout) {
        clearTimeout(maxTimeout);
        maxTimeout = void 0;
      }
      if (after) {
        result = inputFunction.apply(context, arguments_);
      }
    };
    const maxLater = () => {
      maxTimeout = void 0;
      if (timeout) {
        clearTimeout(timeout);
        timeout = void 0;
      }
      if (after) {
        result = inputFunction.apply(context, arguments_);
      }
    };
    const shouldCallNow = before && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (maxWait > 0 && maxWait !== Number.POSITIVE_INFINITY && !maxTimeout) {
      maxTimeout = setTimeout(maxLater, maxWait);
    }
    if (shouldCallNow) {
      result = inputFunction.apply(context, arguments_);
    }
    return result;
  };
  mimicFunction(debouncedFunction, inputFunction);
  debouncedFunction.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = void 0;
    }
    if (maxTimeout) {
      clearTimeout(maxTimeout);
      maxTimeout = void 0;
    }
  };
  return debouncedFunction;
};
const objectToString = Object.prototype.toString;
function isUint8Array(value) {
  return value && objectToString.call(value) === "[object Uint8Array]";
}
function assertUint8Array(value) {
  if (!isUint8Array(value)) {
    throw new TypeError(`Expected \`Uint8Array\`, got \`${typeof value}\``);
  }
}
function concatUint8Arrays(arrays, totalLength) {
  if (arrays.length === 0) {
    return new Uint8Array(0);
  }
  totalLength ?? (totalLength = arrays.reduce((accumulator, currentValue) => accumulator + currentValue.length, 0));
  const returnValue = new Uint8Array(totalLength);
  let offset = 0;
  for (const array of arrays) {
    assertUint8Array(array);
    returnValue.set(array, offset);
    offset += array.length;
  }
  return returnValue;
}
function uint8ArrayToString(array) {
  assertUint8Array(array);
  return new globalThis.TextDecoder().decode(array);
}
function assertString(value) {
  if (typeof value !== "string") {
    throw new TypeError(`Expected \`string\`, got \`${typeof value}\``);
  }
}
function stringToUint8Array(string) {
  assertString(string);
  return new globalThis.TextEncoder().encode(string);
}
Array.from({ length: 256 }, (_, index) => index.toString(16).padStart(2, "0"));
const Ajv = AjvModule.default;
const ajvFormats = ajvFormatsModule.default;
const encryptionAlgorithm = "aes-256-cbc";
const createPlainObject = () => /* @__PURE__ */ Object.create(null);
const isExist = (data) => data !== void 0 && data !== null;
const checkValueType = (key, value) => {
  const nonJsonTypes = /* @__PURE__ */ new Set([
    "undefined",
    "symbol",
    "function"
  ]);
  const type = typeof value;
  if (nonJsonTypes.has(type)) {
    throw new TypeError(`Setting a value of type \`${type}\` for key \`${key}\` is not allowed as it's not supported by JSON`);
  }
};
const INTERNAL_KEY = "__internal__";
const MIGRATION_KEY = `${INTERNAL_KEY}.migrations.version`;
class Conf {
  constructor(partialOptions = {}) {
    __publicField(this, "path");
    __publicField(this, "events");
    __privateAdd(this, _validator, void 0);
    __privateAdd(this, _encryptionKey, void 0);
    __privateAdd(this, _options, void 0);
    __privateAdd(this, _defaultValues, {});
    __publicField(this, "_deserialize", (value) => JSON.parse(value));
    __publicField(this, "_serialize", (value) => JSON.stringify(value, void 0, "	"));
    const options = {
      configName: "config",
      fileExtension: "json",
      projectSuffix: "nodejs",
      clearInvalidConfig: false,
      accessPropertiesByDotNotation: true,
      configFileMode: 438,
      ...partialOptions
    };
    if (!options.cwd) {
      if (!options.projectName) {
        throw new Error("Please specify the `projectName` option.");
      }
      options.cwd = envPaths(options.projectName, { suffix: options.projectSuffix }).config;
    }
    __privateSet(this, _options, options);
    if (options.schema) {
      if (typeof options.schema !== "object") {
        throw new TypeError("The `schema` option must be an object.");
      }
      const ajv = new Ajv({
        allErrors: true,
        useDefaults: true
      });
      ajvFormats(ajv);
      const schema = {
        type: "object",
        properties: options.schema
      };
      __privateSet(this, _validator, ajv.compile(schema));
      for (const [key, value] of Object.entries(options.schema)) {
        if (value == null ? void 0 : value.default) {
          __privateGet(this, _defaultValues)[key] = value.default;
        }
      }
    }
    if (options.defaults) {
      __privateSet(this, _defaultValues, {
        ...__privateGet(this, _defaultValues),
        ...options.defaults
      });
    }
    if (options.serialize) {
      this._serialize = options.serialize;
    }
    if (options.deserialize) {
      this._deserialize = options.deserialize;
    }
    this.events = new EventTarget();
    __privateSet(this, _encryptionKey, options.encryptionKey);
    const fileExtension = options.fileExtension ? `.${options.fileExtension}` : "";
    this.path = path.resolve(options.cwd, `${options.configName ?? "config"}${fileExtension}`);
    const fileStore = this.store;
    const store = Object.assign(createPlainObject(), options.defaults, fileStore);
    this._validate(store);
    try {
      assert.deepEqual(fileStore, store);
    } catch {
      this.store = store;
    }
    if (options.watch) {
      this._watch();
    }
    if (options.migrations) {
      if (!options.projectVersion) {
        throw new Error("Please specify the `projectVersion` option.");
      }
      this._migrate(options.migrations, options.projectVersion, options.beforeEachMigration);
    }
  }
  get(key, defaultValue) {
    if (__privateGet(this, _options).accessPropertiesByDotNotation) {
      return this._get(key, defaultValue);
    }
    const { store } = this;
    return key in store ? store[key] : defaultValue;
  }
  set(key, value) {
    if (typeof key !== "string" && typeof key !== "object") {
      throw new TypeError(`Expected \`key\` to be of type \`string\` or \`object\`, got ${typeof key}`);
    }
    if (typeof key !== "object" && value === void 0) {
      throw new TypeError("Use `delete()` to clear values");
    }
    if (this._containsReservedKey(key)) {
      throw new TypeError(`Please don't use the ${INTERNAL_KEY} key, as it's used to manage this module internal operations.`);
    }
    const { store } = this;
    const set = (key2, value2) => {
      checkValueType(key2, value2);
      if (__privateGet(this, _options).accessPropertiesByDotNotation) {
        setProperty(store, key2, value2);
      } else {
        store[key2] = value2;
      }
    };
    if (typeof key === "object") {
      const object = key;
      for (const [key2, value2] of Object.entries(object)) {
        set(key2, value2);
      }
    } else {
      set(key, value);
    }
    this.store = store;
  }
  /**
      Check if an item exists.
  
      @param key - The key of the item to check.
      */
  has(key) {
    if (__privateGet(this, _options).accessPropertiesByDotNotation) {
      return hasProperty(this.store, key);
    }
    return key in this.store;
  }
  /**
      Reset items to their default values, as defined by the `defaults` or `schema` option.
  
      @see `clear()` to reset all items.
  
      @param keys - The keys of the items to reset.
      */
  reset(...keys2) {
    for (const key of keys2) {
      if (isExist(__privateGet(this, _defaultValues)[key])) {
        this.set(key, __privateGet(this, _defaultValues)[key]);
      }
    }
  }
  delete(key) {
    const { store } = this;
    if (__privateGet(this, _options).accessPropertiesByDotNotation) {
      deleteProperty(store, key);
    } else {
      delete store[key];
    }
    this.store = store;
  }
  /**
      Delete all items.
  
      This resets known items to their default values, if defined by the `defaults` or `schema` option.
      */
  clear() {
    this.store = createPlainObject();
    for (const key of Object.keys(__privateGet(this, _defaultValues))) {
      this.reset(key);
    }
  }
  /**
      Watches the given `key`, calling `callback` on any changes.
  
      @param key - The key wo watch.
      @param callback - A callback function that is called on any changes. When a `key` is first set `oldValue` will be `undefined`, and when a key is deleted `newValue` will be `undefined`.
      @returns A function, that when called, will unsubscribe.
      */
  onDidChange(key, callback) {
    if (typeof key !== "string") {
      throw new TypeError(`Expected \`key\` to be of type \`string\`, got ${typeof key}`);
    }
    if (typeof callback !== "function") {
      throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof callback}`);
    }
    return this._handleChange(() => this.get(key), callback);
  }
  /**
      Watches the whole config object, calling `callback` on any changes.
  
      @param callback - A callback function that is called on any changes. When a `key` is first set `oldValue` will be `undefined`, and when a key is deleted `newValue` will be `undefined`.
      @returns A function, that when called, will unsubscribe.
      */
  onDidAnyChange(callback) {
    if (typeof callback !== "function") {
      throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof callback}`);
    }
    return this._handleChange(() => this.store, callback);
  }
  get size() {
    return Object.keys(this.store).length;
  }
  get store() {
    try {
      const data = fs.readFileSync(this.path, __privateGet(this, _encryptionKey) ? null : "utf8");
      const dataString = this._encryptData(data);
      const deserializedData = this._deserialize(dataString);
      this._validate(deserializedData);
      return Object.assign(createPlainObject(), deserializedData);
    } catch (error) {
      if ((error == null ? void 0 : error.code) === "ENOENT") {
        this._ensureDirectory();
        return createPlainObject();
      }
      if (__privateGet(this, _options).clearInvalidConfig && error.name === "SyntaxError") {
        return createPlainObject();
      }
      throw error;
    }
  }
  set store(value) {
    this._ensureDirectory();
    this._validate(value);
    this._write(value);
    this.events.dispatchEvent(new Event("change"));
  }
  *[Symbol.iterator]() {
    for (const [key, value] of Object.entries(this.store)) {
      yield [key, value];
    }
  }
  _encryptData(data) {
    if (!__privateGet(this, _encryptionKey)) {
      return typeof data === "string" ? data : uint8ArrayToString(data);
    }
    try {
      const initializationVector = data.slice(0, 16);
      const password = crypto.pbkdf2Sync(__privateGet(this, _encryptionKey), initializationVector.toString(), 1e4, 32, "sha512");
      const decipher = crypto.createDecipheriv(encryptionAlgorithm, password, initializationVector);
      const slice = data.slice(17);
      const dataUpdate = typeof slice === "string" ? stringToUint8Array(slice) : slice;
      return uint8ArrayToString(concatUint8Arrays([decipher.update(dataUpdate), decipher.final()]));
    } catch {
    }
    return data.toString();
  }
  _handleChange(getter, callback) {
    let currentValue = getter();
    const onChange = () => {
      const oldValue = currentValue;
      const newValue = getter();
      if (isDeepStrictEqual(newValue, oldValue)) {
        return;
      }
      currentValue = newValue;
      callback.call(this, newValue, oldValue);
    };
    this.events.addEventListener("change", onChange);
    return () => {
      this.events.removeEventListener("change", onChange);
    };
  }
  _validate(data) {
    if (!__privateGet(this, _validator)) {
      return;
    }
    const valid = __privateGet(this, _validator).call(this, data);
    if (valid || !__privateGet(this, _validator).errors) {
      return;
    }
    const errors = __privateGet(this, _validator).errors.map(({ instancePath, message = "" }) => `\`${instancePath.slice(1)}\` ${message}`);
    throw new Error("Config schema violation: " + errors.join("; "));
  }
  _ensureDirectory() {
    fs.mkdirSync(path.dirname(this.path), { recursive: true });
  }
  _write(value) {
    let data = this._serialize(value);
    if (__privateGet(this, _encryptionKey)) {
      const initializationVector = crypto.randomBytes(16);
      const password = crypto.pbkdf2Sync(__privateGet(this, _encryptionKey), initializationVector.toString(), 1e4, 32, "sha512");
      const cipher = crypto.createCipheriv(encryptionAlgorithm, password, initializationVector);
      data = concatUint8Arrays([initializationVector, stringToUint8Array(":"), cipher.update(stringToUint8Array(data)), cipher.final()]);
    }
    if (process$1.env.SNAP) {
      fs.writeFileSync(this.path, data, { mode: __privateGet(this, _options).configFileMode });
    } else {
      try {
        writeFileSync(this.path, data, { mode: __privateGet(this, _options).configFileMode });
      } catch (error) {
        if ((error == null ? void 0 : error.code) === "EXDEV") {
          fs.writeFileSync(this.path, data, { mode: __privateGet(this, _options).configFileMode });
          return;
        }
        throw error;
      }
    }
  }
  _watch() {
    this._ensureDirectory();
    if (!fs.existsSync(this.path)) {
      this._write(createPlainObject());
    }
    if (process$1.platform === "win32") {
      fs.watch(this.path, { persistent: false }, debounceFn(() => {
        this.events.dispatchEvent(new Event("change"));
      }, { wait: 100 }));
    } else {
      fs.watchFile(this.path, { persistent: false }, debounceFn(() => {
        this.events.dispatchEvent(new Event("change"));
      }, { wait: 5e3 }));
    }
  }
  _migrate(migrations, versionToMigrate, beforeEachMigration) {
    let previousMigratedVersion = this._get(MIGRATION_KEY, "0.0.0");
    const newerVersions = Object.keys(migrations).filter((candidateVersion) => this._shouldPerformMigration(candidateVersion, previousMigratedVersion, versionToMigrate));
    let storeBackup = { ...this.store };
    for (const version of newerVersions) {
      try {
        if (beforeEachMigration) {
          beforeEachMigration(this, {
            fromVersion: previousMigratedVersion,
            toVersion: version,
            finalVersion: versionToMigrate,
            versions: newerVersions
          });
        }
        const migration = migrations[version];
        migration == null ? void 0 : migration(this);
        this._set(MIGRATION_KEY, version);
        previousMigratedVersion = version;
        storeBackup = { ...this.store };
      } catch (error) {
        this.store = storeBackup;
        throw new Error(`Something went wrong during the migration! Changes applied to the store until this failed migration will be restored. ${error}`);
      }
    }
    if (this._isVersionInRangeFormat(previousMigratedVersion) || !semver.eq(previousMigratedVersion, versionToMigrate)) {
      this._set(MIGRATION_KEY, versionToMigrate);
    }
  }
  _containsReservedKey(key) {
    if (typeof key === "object") {
      const firsKey = Object.keys(key)[0];
      if (firsKey === INTERNAL_KEY) {
        return true;
      }
    }
    if (typeof key !== "string") {
      return false;
    }
    if (__privateGet(this, _options).accessPropertiesByDotNotation) {
      if (key.startsWith(`${INTERNAL_KEY}.`)) {
        return true;
      }
      return false;
    }
    return false;
  }
  _isVersionInRangeFormat(version) {
    return semver.clean(version) === null;
  }
  _shouldPerformMigration(candidateVersion, previousMigratedVersion, versionToMigrate) {
    if (this._isVersionInRangeFormat(candidateVersion)) {
      if (previousMigratedVersion !== "0.0.0" && semver.satisfies(previousMigratedVersion, candidateVersion)) {
        return false;
      }
      return semver.satisfies(versionToMigrate, candidateVersion);
    }
    if (semver.lte(candidateVersion, previousMigratedVersion)) {
      return false;
    }
    if (semver.gt(candidateVersion, versionToMigrate)) {
      return false;
    }
    return true;
  }
  _get(key, defaultValue) {
    return getProperty(this.store, key, defaultValue);
  }
  _set(key, value) {
    const { store } = this;
    setProperty(store, key, value);
    this.store = store;
  }
}
_validator = new WeakMap();
_encryptionKey = new WeakMap();
_options = new WeakMap();
_defaultValues = new WeakMap();
let isInitialized = false;
const initDataListener = () => {
  if (!ipcMain || !app) {
    throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
  }
  const appData = {
    defaultCwd: app.getPath("userData"),
    appVersion: app.getVersion()
  };
  if (isInitialized) {
    return appData;
  }
  ipcMain.on("electron-store-get-data", (event) => {
    event.returnValue = appData;
  });
  isInitialized = true;
  return appData;
};
class ElectronStore extends Conf {
  constructor(options) {
    let defaultCwd;
    let appVersion;
    if (process$1.type === "renderer") {
      const appData = electron.ipcRenderer.sendSync("electron-store-get-data");
      if (!appData) {
        throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
      }
      ({ defaultCwd, appVersion } = appData);
    } else if (ipcMain && app) {
      ({ defaultCwd, appVersion } = initDataListener());
    }
    options = {
      name: "config",
      ...options
    };
    options.projectVersion || (options.projectVersion = appVersion);
    if (options.cwd) {
      options.cwd = path.isAbsolute(options.cwd) ? options.cwd : path.join(defaultCwd, options.cwd);
    } else {
      options.cwd = defaultCwd;
    }
    options.configName = options.name;
    delete options.name;
    super(options);
  }
  static initRenderer() {
    initDataListener();
  }
  async openInEditor() {
    const error = await shell$1.openPath(this.path);
    if (error) {
      throw new Error(error);
    }
  }
}
const appStore = new ElectronStore();
if (isEqual(appStore.store, {})) {
  appStore.store = {};
}
const appStore$1 = {
  ...appStore,
  ...createProxy(appStore, [
    "set",
    "get",
    "delete",
    "clear",
    "reset",
    "has",
    "onDidChange",
    "onDidAnyChange",
    "openInEditor"
  ]),
  getAll: () => appStore.store,
  setAll: (value) => appStore.store = value
};
const debug$1 = appStore$1.get("common.debug") || false;
if (debug$1) {
  Object.assign(console, {
    ...createProxy(log.functions, log.levels),
    raw: console.log
  });
}
const getAdbPath = () => {
  switch (process.platform) {
    case "win32":
      return extraResolve("win/android-platform-tools/adb.exe");
    case "darwin":
      return extraResolve("mac/android-platform-tools/adb");
    case "linux":
      return extraResolve("linux/android-platform-tools/adb");
  }
};
getAdbPath();
const getScrcpyPath = () => {
  switch (process.platform) {
    case "win32":
      return extraResolve("win/scrcpy/scrcpy.exe");
    case "darwin":
      return extraResolve("mac/scrcpy/scrcpy");
    default:
      return which.sync("scrcpy", { nothrow: true });
  }
};
getScrcpyPath();
process.env.DESKTOP_PATH;
resolve("dev-publish.yml");
const logoPath = buildResolve("logo.png");
buildResolve("logo.ico");
buildResolve("logo.icns");
const trayPath = process.platform === "darwin" ? extraResolve("mac/tray/iconTemplate.png") : extraResolve("common/tray/icon.png");
process.env.LOG_PATH;
function getLogoPath() {
  const icon = logoPath;
  return icon;
}
const appEvents = () => {
  ipcMain.on("restart-app", () => {
    app.isQuiting = true;
    app.relaunch();
    app.quit();
  });
  ipcMain.on("close-active-window", (event) => {
    const win = BrowserWindow.getFocusedWindow();
    win.close();
  });
  ipcMain.on("hide-active-window", (event) => {
    const win = BrowserWindow.getFocusedWindow();
    win.hide();
  });
};
const handles = (mainWindow2) => {
  ipcMain.handle(
    "show-open-dialog",
    async (_, { preset = "", ...options } = {}) => {
      const res = await dialog.showOpenDialog(options).catch((e) => console.warn(e));
      if (res.canceled) {
        throw new Error("User cancel operation");
      }
      if (!res.filePaths.length) {
        throw new Error("Get the directory or file path failure");
      }
      const filePaths = res.filePaths;
      switch (preset) {
        case "replaceFile":
          await fs$1.copy(filePaths[0], options.filePath, { overwrite: true });
          break;
      }
      return filePaths;
    }
  );
  ipcMain.handle("open-path", async (_, pathValue) => {
    return shell$1.openPath(pathValue);
  });
  ipcMain.handle("show-item-in-folder", async (_, filePath) => {
    return shell$1.showItemInFolder(filePath);
  });
  ipcMain.handle(
    "show-save-dialog",
    async (_, { filePath = "", ...options } = {}) => {
      const res = await dialog.showSaveDialog({
        ...options
      }).catch((e) => console.warn(e));
      if (res.canceled) {
        throw new Error("User cancel operation");
      }
      if (!res.filePath) {
        throw new Error("Failure to obtain the file path");
      }
      const destinationPath = res.filePath;
      await fs$1.copy(filePath, destinationPath);
    }
  );
};
const theme = (mainWindow2) => {
  const appTheme = {
    value() {
      return nativeTheme.themeSource;
    },
    update(value) {
      nativeTheme.themeSource = value;
    },
    isDark() {
      return nativeTheme.shouldUseDarkColors;
    }
  };
  Object.entries(appTheme).forEach(([key, handler]) => {
    ipcMain.handle(`app-theme-${key}`, (_, value) => handler(value));
  });
  nativeTheme.on("updated", () => {
    mainWindow2.webContents.send("app-theme-change", {
      isDark: appTheme.isDark(),
      value: appTheme.value()
    });
  });
};
const tray = (mainWindow2) => {
  const t = (value) => executeI18n(mainWindow2, value);
  let tray2 = null;
  const showApp = () => {
    if (process.platform === "darwin") {
      app.dock.show();
    }
    mainWindow2.show();
    if (tray2) {
      tray2.destroy();
      tray2 = null;
    }
    return true;
  };
  const hideApp = () => {
    if (process.platform === "darwin") {
      app.dock.hide();
    }
    mainWindow2.hide();
    return true;
  };
  const quitApp = () => {
    app.isQuiting = true;
    app.quit();
    return true;
  };
  const closeApp = async (response) => {
    if (response === 0) {
      quitApp();
      return true;
    } else if (response === 1) {
      hideApp();
      tray2 = new Tray(trayPath);
      tray2.setToolTip("escrcpy");
      tray2.on("click", () => {
        showApp();
      });
      const contextMenu2 = Menu.buildFromTemplate([
        {
          label: await t("common.open"),
          click: () => {
            showApp();
          }
        },
        {
          label: await t("common.restart"),
          click: () => {
            app.relaunch();
            quitApp();
          }
        },
        {
          label: await t("close.quit"),
          click: () => {
            quitApp();
          }
        }
      ]);
      tray2.setContextMenu(contextMenu2);
      return true;
    }
    return false;
  };
  mainWindow2.on("close", async (event) => {
    if (app.isQuiting) {
      mainWindow2 = null;
      return true;
    }
    event.preventDefault();
    const appCloseCode = appStore$1.get("appCloseCode");
    if (typeof appCloseCode === "number") {
      closeApp(appCloseCode);
      return true;
    }
    const { response, checkboxChecked } = await dialog.showMessageBox({
      type: "question",
      buttons: [
        await t("close.quit"),
        await t("close.minimize"),
        await t("close.quit.cancel")
      ],
      title: await t("common.tips"),
      message: await t("close.message"),
      checkboxChecked: false,
      checkboxLabel: await t("close.remember")
    });
    if (checkboxChecked && [0, 1].includes(response)) {
      appStore$1.set("appCloseCode", response);
    }
    closeApp(response);
  });
};
const ipc = (mainWindow2) => {
  appEvents();
  handles();
  tray(mainWindow2);
  theme(mainWindow2);
};
function sleep(time = 500) {
  return new Promise((resolve2) => {
    setTimeout(() => resolve2(true), time);
  });
}
function initControlWindow(mainWindow2) {
  const __dirname2 = path.dirname(fileURLToPath(import.meta.url));
  const controlWindow = new BrowserWindow({
    icon: getLogoPath(),
    width: 700,
    minWidth: 700,
    height: 28,
    maxHeight: 28,
    frame: false,
    show: false,
    autoHideMenuBar: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname2, "preload.mjs"),
      nodeIntegration: true,
      sandbox: false,
      spellcheck: false
    }
  });
  controlWindow.customId = "control";
  loadPage(controlWindow, "control/");
  return controlWindow;
}
async function openControlWindow(win, data, args2 = {}) {
  if (args2.sleep) {
    await sleep(args2.sleep);
  }
  win.show();
  win.webContents.send("device-change", data);
}
function menu(controlWindow) {
  ipcMain.on("open-system-menu", openSystemMenu);
  function openSystemMenu(event, args2 = {}) {
    const { options = [], channel = "system-menu-click" } = args2;
    const template = options.map((item) => {
      return {
        label: item.label,
        click() {
          controlWindow.webContents.send(channel, item.value);
        }
      };
    });
    const menu2 = Menu.buildFromTemplate(template);
    menu2.popup(BrowserWindow.fromWebContents(event.sender));
  }
}
function onControlMounted(controlWindow) {
  ipcMain.on("language-change", (event, data) => {
    controlWindow.webContents.send("language-change", data);
  });
  ipcMain.on("theme-change", (event, data) => {
    controlWindow.webContents.send("theme-change", data);
  });
  menu(controlWindow);
}
const control = (mainWindow2) => {
  let controlWindow;
  ipcMain.handle("open-control-window", (event, data) => {
    controlWindow = BrowserWindow.getAllWindows().find(
      (win) => win.customId === "control"
    );
    if (controlWindow) {
      openControlWindow(controlWindow, data);
      return false;
    }
    controlWindow = initControlWindow();
    ipcMain.on("control-mounted", () => {
      openControlWindow(controlWindow, data);
      onControlMounted(controlWindow);
    });
  });
};
createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
log.initialize({ preload: true });
const debug = !!appStore$1.get("common.debug");
if (!debug) {
  log.warn(
    "Debug Tips:",
    "If you need to generate and view the running log, please start the debugging function on the preference setting page"
  );
}
contextMenu({
  showCopyImage: false,
  showSelectAll: false,
  showSearchWithGoogle: false,
  showSaveImageAs: true,
  showInspectElement: !isPackaged$1
});
process.env.DIST = path.join(__dirname, "../dist");
const USER_DATA_PATH = path.join(app.getPath("userData"), "users.json");
const WEB_SERVER_PATH = path.join(__dirname, "../server/index.js");
console.log("1!!", WEB_SERVER_PATH);
let mainWindow;
let webServer;
function startWebServer() {
  webServer = spawn("node", [WEB_SERVER_PATH], {
    stdio: "inherit"
  });
  webServer.on("error", (err) => {
    log.error("Web服务器启动失败:", err);
  });
  webServer.on("close", (code) => {
    log.info(`Web服务器退出，退出码: ${code}`);
  });
  console.log("success");
}
const readUserData = () => {
  try {
    if (fs$2.existsSync(USER_DATA_PATH)) {
      return JSON.parse(fs$2.readFileSync(USER_DATA_PATH, "utf-8"));
    }
  } catch (error) {
    log.error("读取用户数据失败:", error);
  }
  return [];
};
const saveUserData = (users) => {
  try {
    fs$2.writeFileSync(USER_DATA_PATH, JSON.stringify(users, null, 2));
  } catch (error) {
    log.error("保存用户数据失败:", error);
  }
};
function createWindow() {
  mainWindow = new BrowserWindow({
    icon: getLogoPath(),
    show: false,
    width: 1200,
    height: 800,
    minWidth: 1200,
    minHeight: 800,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      nodeIntegration: true,
      sandbox: false,
      spellcheck: false
    }
  });
  remote.enable(mainWindow.webContents);
  remote.initialize();
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });
  loadPage(mainWindow);
  ipc(mainWindow);
  control();
}
ipcMain.handle("get-user-data", () => {
  return readUserData();
});
ipcMain.handle("save-user-data", (event, users) => {
  saveUserData(users);
});
app.whenReady().then(() => {
  electronApp.setAppUserModelId("com.viarotel.escrcpy");
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });
  startWebServer();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
      return;
    }
    app.dock.show();
    mainWindow.show();
  });
});
app.on("window-all-closed", () => {
  app.isQuiting = true;
  if (webServer) {
    webServer.kill();
  }
  app.quit();
  mainWindow = null;
});
process.on("uncaughtException", (err) => {
  log.error("未捕获的异常:", err);
});
process.on("unhandledRejection", (reason, promise) => {
  log.error("未处理的Promise拒绝:", reason);
});
