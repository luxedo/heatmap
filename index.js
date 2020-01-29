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
const { createCanvas, Image } = require("canvas");
const { hsluvToRgb, rgbToHsluv } = require("hsluv");

/* EXPORTS */
exports.DEFAULTS = {
  sigma: 100,
  epsilon: 1,
  degree: 2,
  omega: 4,
  delta: 0,
  radius: 10
};
exports.kernels = {
  gaussian: gaussianKernel,
  exponential: exponentialKernel,
  inverseLinear: inverseLinearKernel,
  inversePolynomial: inversePolynomialKernel,
  cosine: cosineKernel,
  dampedCosine: dampedCosineKernel,
  step: stepKernel,
  bump: bumpKernel
};
exports.methods = {
  sum: sumMethod,
  max: maxMethod,
  nearest: nearestMethod,
  shepards: shepardsMethod // IDW
};

exports.drawGeoHeatmap = (
  coords,
  points,
  colors = null,
  crop = true,
  pxPerDegree = null,
  width = null,
  height = null,
  kernel = null,
  method = null
) => {
  const { cCoords, cPoints, cWidth, cHeight, origin, end } = convertData(
    coords,
    points,
    pxPerDegree,
    width,
    height
  );
  if (colors == null)
    colors = {
      steps: 255,
      values: ["#FEFFFE", "#00FF00", "#FFFF00", "#FF0000"],
      weights: [2, 3, 3, 2]
    };
  if (kernel == null) kernel = "gaussian";
  if (method == null) method = "nearest";
  const buf = exports.drawHeatmap(
    cPoints,
    cWidth,
    cHeight,
    colors,
    crop,
    cCoords,
    kernel,
    method
  );
  return {
    buf,
    origin,
    end
  };
};

exports.drawHeatmap = (
  cPoints,
  width,
  height,
  colors,
  crop,
  cCoords,
  kernel,
  method
) => {
  if (crop === true && !cCoords instanceof Array)
    throw new Error("You must provide a polygon in cCoords to crop");
  const heatData = interpolateData(cPoints, width, height, kernel, method);
  const canvas = createCanvas(width, height);
  drawHeatData(heatData, canvas, colors);
  if (crop) clipImg(canvas, cCoords);
  return canvas.toBuffer("image/png", {});
};

function convertData(coords, points, pxPerDegree, width, height) {
  if (pxPerDegree == null && width == null && height == null)
    throw new Error(
      "You must provide any of: pxPerDegree, width or height to convertData"
    );
  if (pxPerDegree != null && (width != null || height != null))
    throw new Error(
      "You must provide either: pxPerDegree or width and/or height to convertData"
    );
  const lats = coords.map(item => item.lat);
  const lngs = coords.map(item => item.lng);
  const origin = [Math.min(...lngs), Math.min(...lats)];
  const end = [Math.max(...lngs), Math.max(...lats)];
  let cWidth,
    cHeight,
    cScale = pxPerDegree,
    offset = 0;

  if (pxPerDegree == null) {
    const sw = width / (end[0] - origin[0]);
    const sh = height / (end[1] - origin[1]);
    if ((width != null) & (height != null)) {
      cScale = Math.min(sw, sh);
    } else if (width != null) {
      cScale = sw;
    } else {
      cScale = sh;
    }
  }
  cWidth = Math.ceil((end[0] - origin[0]) * cScale);
  cHeight = Math.ceil((end[1] - origin[1]) * cScale);
  if (pxPerDegree == null && width != null && height != null) {
    offset = height - cHeight;
    cWidth = Math.max(cWidth, width);
    cHeight = Math.max(cHeight, height);
  }
  const cCoords = coords.map(item => {
    return [
      (item.lng - origin[0]) * cScale,
      cHeight - (item.lat - origin[1]) * cScale - offset
    ];
  });
  const cPoints = points.map(item => {
    return {
      px: (item.lng - origin[0]) * cScale,
      py: cHeight - (item.lat - origin[1]) * cScale - offset,
      radius: item.radius,
      value: item.value,
      kernelArgs: fillDefaults(item, exports.DEFAULTS)
    };
  });
  return {
    cCoords,
    cPoints,
    cWidth,
    cHeight,
    origin,
    end
  };
}

function fillDefaults(item, defaults) {
  return Object.entries(defaults).reduce((acc, [key, value]) => {
    acc[key] = item[key] || value;
    return acc;
  }, {});
  return args;
}

/* FUNCTIONS */
function interpolateData(cPoints, width, height, kernel, method) {
  if (!(kernel in exports.kernels))
    throw new Error(
      `${kernel} not listed. Chose one of ${Object.keys(exports.kernels)}`
    );
  if (!(method in exports.methods))
    throw new Error(
      `${method} not listed. Chose one of ${Object.keys(exports.methods)}`
    );
  let heatData = [];
  for (let y = 0; y < height; y++) {
    let row = [];
    for (let x = 0; x < width; x++) {
      const data = cPoints.map(item => {
        item.r = euclideanDistance(x, y, item.px, item.py);
        item.fi = item.value * exports.kernels[kernel](item, item.kernelArgs);
        return item;
      });
      const value = exports.methods[method](data);
      row.push(value);
    }
    heatData.push(row);
  }
  return heatData;
}

function euclideanDistanceSquared(x, y, px, py) {
  return Math.pow(x - px, 2) + Math.pow(y - py, 2);
}

function euclideanDistance(x, y, px, py) {
  return Math.sqrt(euclideanDistanceSquared(x, y, px, py));
}

function drawHeatData(heatData, canvas, colors) {
  const width = canvas.width;
  const height = canvas.height;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingQuality = "high";
  const colormap = buildColormap(colors);
  let imgData = ctx.createImageData(width, height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const color =
        colormap[Math.round(heatData[y][x] * colors.steps)] ||
        colormap[colormap.length - 1];
      imgData.data[i + 0] = color[0];
      imgData.data[i + 1] = color[1];
      imgData.data[i + 2] = color[2];
      imgData.data[i + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

function buildColormap(colors) {
  let colormap = [];
  if (!colors.hasOwnProperty("weights")) {
    colors.weights = new Array(colors.steps).fill(1);
  }
  const totalSteps = colors.weights.reduce((acc, cur) => acc + cur, 0);
  const steps = colors.weights.map((val, idx) => {
    return Math.ceil((val / totalSteps) * colors.steps);
  });
  for (let i = 0; i < colors.values.length - 1; i++) {
    const cmap = interpolateColors(
      colors.values[i],
      colors.values[i + 1],
      Math.round(steps[i])
    );
    colormap = colormap.concat(cmap);
  }
  return colormap;
}

function interpolateColors(color1, color2, steps) {
  const c1 = rgbToHsluv(hexToRgbNorm(color1));
  const c2 = rgbToHsluv(hexToRgbNorm(color2));
  const h1 = degreesToRadians(c1[0]);
  const h2 = degreesToRadians(c2[0]);
  const delta = Math.atan2(Math.sin(h2 - h1), Math.cos(h2 - h1));
  const colormap = new Array(steps + 1).fill(0).map((item, idx) => {
    return hsluvToRgb([
      (radiansToDegrees(h1 + (delta * idx) / steps) + 360) % 360,
      c1[1] * ((steps - idx) / steps) + c2[1] * (idx / steps),
      c1[2] * ((steps - idx) / steps) + c2[2] * (idx / steps)
    ]).map(channel => {
      let v = Math.round(channel * 255);
      v = v <= 0 ? 0 : v;
      v = v >= 255 ? 255 : v;
      return v;
    });
  });
  return colormap;
}

function hexToRgbNorm(hex) {
  let c = hex.replace("#", "").trim();
  return [
    parseInt(c.slice(0, 2), 16) / 255,
    parseInt(c.slice(2, 4), 16) / 255,
    parseInt(c.slice(4, 6), 16) / 255
  ];
}

const degreesToRadians = degrees => (degrees * Math.PI) / 180;
const radiansToDegrees = radians => (radians * 180) / Math.PI;

function clipImg(canvas, cCoords) {
  const ctx = canvas.getContext("2d");
  const dataURL = canvas.toDataURL("image/png");
  const image = new Image();
  image.src = dataURL;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.moveTo(cCoords[0][0], cCoords[0][1]);
  cCoords.forEach(item => ctx.lineTo(...item));
  ctx.fill();
  ctx.clip();
  ctx.drawImage(image, 0, 0);
}

/* KERNELS */
function gaussianKernel(item, { sigma }) {
  return Math.exp(-Math.pow(item.r / sigma, 2));
}

function exponentialKernel(item, epsilon) {
  epsilon = item.epsilon || epsilon || 1;
  return Math.exp(-item.r * epsilon);
}

function inverseLinearKernel(item, epsilon) {
  epsilon = item.epsilon || epsilon || 1;
  return inversePolynomialKernel(item, epsilon, 1);
}

function inversePolynomialKernel(item, epsilon, degree) {
  epsilon = item.epsilon || epsilon || 1;
  degree = item.degree || degree || 2;
  return 1 / (1 + Math.pow(item.r * item.epsilon, degree));
}

function cosineKernel(item, omega, delta) {
  omega = item.omega || omega || 4;
  delta = item.delta || delta || 0;
  return (1 + Math.cos(((item.r * Math.PI) / 180) * omega + delta)) / 2;
}

function dampedCosineKernel(item, omega, delta, epsilon) {
  omega = item.omega || omega || 4;
  delta = item.delta || delta || 0;
  epsilon = item.epsilon || epsilon || 1;
  return cosineKernel(item, omega, delta) * exponentialKernel(item, epsilon);
}

function stepKernel(item, radius) {
  radius = item.radius || radius || 10;
  return item.r < radius ? 1 : 0;
}

function bumpKernel(item, radius) {
  radius = item.radius || radius || 10;
  return item.r > radius
    ? 0
    : Math.exp(1 / (1 - 1 / Math.pow(item.r / radius, 2)));
}
/* METHODS */
function sumMethod(cPoints) {
  return cPoints.reduce((acc, item) => acc + item.fi, 0);
}

function maxMethod(cPoints) {
  return Math.max(...cPoints.map(item => item.fi));
}

function nearestMethod(cPoints) {
  return cPoints.reduce((acc, item) => {
    return item.r <= acc.r && item.fi > 0 ? item : acc;
  }).fi;
}

function shepardsMethod(cPoints) {
  let sigmaW = 0;
  return cPoints
    .map(item => {
      const degree = item.degree || 3;
      item.wi = 1 / Math.pow(item.r, degree);
      sigmaW += item.wi;
      return item;
    })
    .reduce((acc, item) => acc + (item.fi * item.wi) / sigmaW, 0);
}
