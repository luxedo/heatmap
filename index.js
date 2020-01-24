/*  
    @luxedo/heatmap - Creates heatmaps from latitude and longitude data 
    Copyright (C) 2020 Luiz Eduardo Amaral 

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/
const {
  createCanvas,
  Image
} = require('canvas')
const {
  hsluvToRgb,
  rgbToHsluv
} = require('hsluv')

exports.drawGeoHeatmap = (coords, points, colors = null, crop = true, pxPerDegree = null, width = null, height = null, mapper = null, accumulator = null) => {
  const {
    cCoords,
    cPoints,
    cWidth,
    cHeight,
    origin,
    end
  } = convertData(coords, points, pxPerDegree, width, height)
  if (mapper == null) mapper = exports.gaussianMapper
  if (accumulator == null) accumulator = exports.addAccumulator
  if (colors == null) colors = {
    "steps": 200,
    "values": ["#FFFFFF", "#00FF00", "#FFFF00", "#FF0000"],
    "weights": [2, 3, 3, 2],
  }
  const buf = exports.drawHeatmap(cPoints, cWidth, cHeight, colors, crop, cCoords, mapper, accumulator)
  return {
    buf,
    origin,
    end
  }
}

exports.drawHeatmap = (cPoints, width, height, colors, crop, cCoords, mapper, accumulator) => {
  if (crop === true && !cCoords instanceof Array) throw new Error("You must provide a polygon in cCoords to crop")
  const heatData = buildHeatData(cPoints, width, height, mapper, accumulator)
  const canvas = createCanvas(width, height)
  drawHeatData(heatData, canvas, colors)
  if (crop) clipImg(canvas, cCoords)
  return canvas.toBuffer('image/png', {})
}

function convertData(coords, points, pxPerDegree, width, height) {
  if (pxPerDegree == null && width == null && height == null) throw new Error("You must provide any of: pxPerDegree, width or height to convertData")
  if (pxPerDegree != null && (width != null || height != null)) throw new Error("You must provide either: pxPerDegree or width and/or height to convertData")
  const lats = coords.map(item => item.lat)
  const lngs = coords.map(item => item.lng)
  const origin = [Math.min(...lngs), Math.min(...lats)]
  const end = [Math.max(...lngs), Math.max(...lats)]
  let cWidth, cHeight, cScale = pxPerDegree,
    offset = 0

  if (pxPerDegree == null) {
    const sw = width / (end[0] - origin[0])
    const sh = height / (end[1] - origin[1])
    if (width != null & height != null) {
      cScale = Math.min(sw, sh)
    } else if (width != null) {
      cScale = sw
    } else {
      cScale = sh
    }
  }
  cWidth = Math.ceil((end[0] - origin[0]) * cScale)
  cHeight = Math.ceil((end[1] - origin[1]) * cScale)
  if (pxPerDegree == null && width != null && height != null) {
    offset = height - cHeight
    cWidth = Math.max(cWidth, width)
    cHeight = Math.max(cHeight, height)
  }
  const cCoords = coords.map(item => {
    return [(item.lng - origin[0]) * cScale, cHeight - (item.lat - origin[1]) * cScale - offset]
  })
  const cPoints = points.map(item => {
    return {
      px: (item.lng - origin[0]) * cScale,
      py: cHeight - (item.lat - origin[1]) * cScale - offset,
      radius: item.radius,
      value: item.value
    }
  })
  return {
    cCoords,
    cPoints,
    cWidth,
    cHeight,
    origin,
    end
  }
}

function buildHeatData(cPoints, width, height, mapper, accumulator) {
  let heatData = []
  for (let y = 0; y < height; y++) {
    let row = []
    for (let x = 0; x < width; x++) {
      const intensities = cPoints.map(item => mapper(Object.assign({}, {
        x,
        y
      }, item)))
      const value = accumulator(intensities)
      row.push(value)
    }
    heatData.push(row)
  }
  return heatData
}

exports.gaussianMapper = (item) => {
  return item.value * gaussian(item.x, item.y, item.px, item.py, item.radius)
}

exports.exponentialMapper = (item) => {
  return item.value * exponential(item.x, item.y, item.px, item.py, item.radius)
}

exports.inverseLinearMapper = (item) => {
  return item.radius * item.value / 5 / euclideanDistance(item.x, item.y, item.px, item.py)
}

exports.inverseSquaredMapper = (item) => {
  return item.value * item.radius * 10 / euclideanDistanceSquared(item.x, item.y, item.px, item.py)
}

exports.stepMapper = (item) => {
  return item.value * step(item.x, item.y, item.px, item.py, item.radius)
}

exports.addAccumulator = (intensities) => {
  return intensities.reduce((acc, cur) => acc + cur, 0)
}

//exports.meanAccumulator = (intensities) => {
exports.addAccumulator = (intensities) => {
  return intensities.reduce((acc, cur) => acc + cur, 0) / intensities.length
}

function gaussian(x, y, px, py, sigma) {
  return Math.exp(-euclideanDistanceSquared(x, y, px, py) / Math.pow(sigma, 2) / 2)
}

function exponential(x, y, px, py, sigma) {
  return Math.exp(-euclideanDistance(x, y, px, py) / sigma)
}

function euclideanDistanceSquared(x, y, px, py) {
  return Math.pow(x - px, 2) + Math.pow(y - py, 2)
}

function euclideanDistance(x, y, px, py) {
  return Math.sqrt(euclideanDistanceSquared(x, y, px, py))
}

function step(x, y, px, py, radius) {
  return Math.sqrt(Math.pow(x - px, 2) + Math.pow(y - py, 2)) <= radius ? 1 : 0
}

function drawHeatData(heatData, canvas, colors) {
  const width = canvas.width
  const height = canvas.height
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingQuality = "high"
  const colormap = buildColormap(colors)
  let imgData = ctx.createImageData(width, height)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      const color = colormap[Math.round(heatData[y][x] * colors.steps)] || colormap[colormap.length - 1]
      imgData.data[i + 0] = color[0]
      imgData.data[i + 1] = color[1]
      imgData.data[i + 2] = color[2]
      imgData.data[i + 3] = 255
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

function buildColormap(colors) {
  let colormap = []
  if (!colors.hasOwnProperty("weights")) {
    colors.weights = new Array(colors.steps).fill(1)
  }
  const totalSteps = colors.weights.reduce((acc, cur) => acc + cur, 0)
  const steps = colors.weights.map((val, idx) => {
    return Math.ceil(val / totalSteps * colors.steps)
  })
  for (let i = 0; i < colors.values.length - 1; i++) {
    const cmap = interpolateColors(colors.values[i], colors.values[i + 1], Math.round(steps[i]))
    colormap = colormap.concat(cmap)
  }
  return colormap
}

function interpolateColors(color1, color2, steps) {
  const c1 = rgbToHsluv(hexToRgbNorm(color1))
  const c2 = rgbToHsluv(hexToRgbNorm(color2))
  const h1 = degreesToRadians(c1[0])
  const h2 = degreesToRadians(c2[0])
  const delta = Math.atan2(Math.sin(h2 - h1), Math.cos(h2 - h1));
  const colormap = (new Array(steps + 1)).fill(0).map((item, idx) => {
    return hsluvToRgb([
      (radiansToDegrees(h1 + delta * idx / steps) + 360) % 360,
      c1[1] * ((steps - idx) / steps) + c2[1] * (idx / steps),
      c1[2] * ((steps - idx) / steps) + c2[2] * (idx / steps),
    ]).map(channel => {
      let v = Math.round(channel * 255)
      v = v <= 0 ? 0 : v
      v = v >= 255 ? 255 : v
      return v
    })
  })
  return colormap
}

function hexToRgbNorm(hex) {
  let c = hex.replace("#", "").trim()
  return [
    parseInt(c.slice(0, 2), 16) / 255,
    parseInt(c.slice(2, 4), 16) / 255,
    parseInt(c.slice(4, 6), 16) / 255,
  ]
}

const degreesToRadians = (degrees) => degrees * Math.PI / 180
const radiansToDegrees = (radians) => radians * 180 / Math.PI

function clipImg(canvas, cCoords) {
  const ctx = canvas.getContext('2d')
  const dataURL = canvas.toDataURL("image/png")
  const image = new Image()
  image.src = dataURL
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.beginPath();
  ctx.moveTo(cCoords[0][0], cCoords[0][1]);
  cCoords.forEach(item => ctx.lineTo(...item))
  ctx.fill()
  ctx.clip()
  ctx.drawImage(image, 0, 0)
}
