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

/* DEFAULTS */
const DEFAULT_KERNEL = "gaussian";
const DEFAULT_METHOD = "shepards";
const DEFAULT_COLORS = "teelights";
const DEFAULT_METHOD_ARGS = {
  kernel: "polynomial",
  kernelArgs: {
    sigma: 100,
    epsilon: 0.015,
    degree: 5,
    omega: 4,
    phi: 0,
    radius: 100,
  },
};
const DEFAULT_KERNEL_ARGS = {
  sigma: 150,
  epsilon: 0.005,
  degree: 2,
  omega: 4,
  phi: 0,
  radius: 100,
};

/* CONSTANTS EXPORTS */
exports.colors = {
  teelights: {
    steps: 255,
    values: ["#FEFFFE", "#00FF00", "#FFFF00", "#FF0000"],
    weights: [2, 3, 3, 2],
  },
  jet: {
    steps: 255,
    values: [
      "#000080",
      "#0000FF",
      "#00FFFF",
      "#00FF00",
      "#FFFF00",
      "#FF0000",
      "#800000",
    ],
  },
  parula: {
    steps: 255,
    values: ["#4548A8", "#2D8CF4", "#8CCB4E", "#F8BA3D", "#F5EC32"],
  },
  gray: {
    steps: 255,
    values: ["#000000", "#FFFFFF"],
  },
  magma: {
    steps: 255,
    values: ["#000003", "#4C3578", "#B5477A", "#F27C5C", "#FAF6BF"],
  },
  plasma: {
    steps: 255,
    values: ["#1C3887", "#7E4EA7", "#CB4C7A", "#F59441", "#EDEC30"],
  },
  inferno: {
    steps: 255,
    values: ["#000003", "#54316C", "#B93E55", "#F4812D", "#FAF3A3"],
  },
  viridis: {
    steps: 255,
    values: ["#462553", "#3e4788", "#3A8E8C", "#7BD34F", "#FDE833"],
  },
};
exports.kernels = {
  gaussian: gaussianKernel,
  exponential: exponentialKernel,
  linear: linearKernel,
  polynomial: polynomialKernel,
  cosine: cosineKernel,
  dampedCosine: dampedCosineKernel,
  step: stepKernel,
  bump: bumpKernel,
};
exports.methods = {
  sum: sumMethod,
  max: maxMethod,
  nearest: nearestMethod,
  shepards: shepardsMethod, // IDW
};

/* FUNCTION EXPORTS */
exports.drawGeoHeatmap = ({
  geoCoords,
  geoPoints,
  pxPerDeg = null,
  width = null,
  height = null,
  colors = null,
  crop = false,
  kernel = null,
  method = null,
  methodArgs = null,
}) => {
  const { cropPolygon, points, cWidth, cHeight, origin, end } = convertData(
    geoCoords,
    geoPoints,
    pxPerDeg,
    width,
    height
  );

  width = cWidth;
  height = cHeight;

  if (kernel == "geoGaussian") {
    kernel = "gaussian";
    geoPoints = geoPoints.map((item) => {
      item.sigma = metersTosigma(item.radius || 100, height, geoCoords);
      return item;
    });
  }
  const buf = exports.drawHeatmap({
    points,
    width,
    height,
    colors,
    cropPolygon: crop === true ? cropPolygon : null,
    kernel,
    method,
    methodArgs,
  });
  return {
    buf,
    origin,
    end,
  };
};

exports.drawHeatmap = ({
  points,
  width,
  height,
  colors = null,
  cropPolygon = null,
  kernel = null,
  method = null,
  methodArgs = null,
}) => {
  if (colors == null) colors = DEFAULT_COLORS;
  if (kernel == null) kernel = DEFAULT_KERNEL;
  if (method == null) method = DEFAULT_METHOD;
  if (methodArgs == null) methodArgs = DEFAULT_METHOD_ARGS;
  if (cropPolygon instanceof Array && cropPolygon.length < 3)
    throw new Error(
      "You must provide a polygon in cropPolygon to crop the image"
    );
  if (points == null || width == null || height == null)
    throw new Error(
      "You must provide all of the following arguments to drawHeatmap: points, width, height."
    );

  methodArgs = parseMethodArgs(methodArgs);
  const heatData = interpolateData(
    points,
    width,
    height,
    kernel,
    method,
    methodArgs
  );
  const canvas = createCanvas(width, height);
  drawHeatData(heatData, canvas, colors);
  if (cropPolygon != null) clipImg(canvas, cropPolygon);
  return canvas.toBuffer("image/png", {});
};

function convertData(geoCoords, geoPoints, pxPerDeg, width, height) {
  if (pxPerDeg == null && width == null && height == null)
    throw new Error(
      "You must provide any of: pxPerDeg, width or height to convertData"
    );
  if (pxPerDeg != null && (width != null || height != null))
    throw new Error(
      "You must provide either: pxPerDeg or width and/or height to convertData"
    );
  const lats = geoCoords.map((item) => item.lat);
  const lngs = geoCoords.map((item) => item.lng);
  const origin = [Math.min(...lngs), Math.min(...lats)];
  const end = [Math.max(...lngs), Math.max(...lats)];
  let cWidth,
    cHeight,
    cScale = pxPerDeg,
    offset = 0;

  if (pxPerDeg == null) {
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
  if (pxPerDeg == null && width != null && height != null) {
    offset = height - cHeight;
    cWidth = Math.max(cWidth, width);
    cHeight = Math.max(cHeight, height);
  }
  const cropPolygon = geoCoords.map((item) => {
    return [
      (item.lng - origin[0]) * cScale,
      cHeight - (item.lat - origin[1]) * cScale - offset,
    ];
  });
  const points = geoPoints.map((item) => {
    return Object.assign(item, {
      px: (item.lng - origin[0]) * cScale,
      py: cHeight - (item.lat - origin[1]) * cScale - offset,
      value: item.value,
    });
  });
  return {
    cropPolygon,
    points,
    cWidth,
    cHeight,
    origin,
    end,
  };
}

function parseMethodArgs(methodArgs) {
  let args = {};
  if (Object.keys(methodArgs).includes("kernel")) {
    const kernel = exports.kernels[methodArgs.kernel];
    if (Object.keys(methodArgs).includes("kernelArgs")) {
      methodArgs.kernelArgs = fillDefaults(
        methodArgs.kernelArgs,
        DEFAULT_KERNEL_ARGS
      );
    } else {
      methodArgs.kernelArgs = {};
    }
    args.kernel = (item) => kernel(item, methodArgs.kernelArgs);
  }
  return args;
}

function fillDefaults(item, defaults) {
  return Object.entries(defaults).reduce((acc, [key, value]) => {
    acc[key] = item[key] || value;
    return acc;
  }, {});
  return args;
}

/* FUNCTIONS */
function interpolateData(
  points,
  width,
  height,
  kernel,
  method,
  methodArgs = null
) {
  if (!(kernel in exports.kernels))
    throw new Error(
      `${kernel} not listed. Chose one of ${Object.keys(exports.kernels)}`
    );
  if (!(method in exports.methods))
    throw new Error(
      `${method} not listed. Chose one of ${Object.keys(exports.methods)}`
    );
  points.forEach((item) => {
    item.kernelArgs = fillDefaults(item, DEFAULT_KERNEL_ARGS);
  });

  let heatData = [];
  for (let y = 0; y < height; y++) {
    let row = [];
    for (let x = 0; x < width; x++) {
      const intensities = points.map((item) => {
        item.r = euclideanDistance(x, y, item.px, item.py);
        item.w = exports.kernels[kernel](item.r, item.kernelArgs);
        return item;
      });
      const value = exports.methods[method](intensities, methodArgs);
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
  const colormap = buildColormap(colors);
  let imgData = ctx.createImageData(width, height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      let cIndex = Math.round(heatData[y][x] * colormap.length);
      cIndex =
        cIndex < 0
          ? 0
          : cIndex >= colormap.length
          ? colormap.length - 1
          : cIndex;
      const color = colormap[cIndex];
      imgData.data[i + 0] = color[0];
      imgData.data[i + 1] = color[1];
      imgData.data[i + 2] = color[2];
      imgData.data[i + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

function buildColormap(colors) {
  let colorsObj;
  if (typeof colors === "string" || colors instanceof String) {
    if (Object.keys(exports.colors).includes(colors)) {
      colorsObj = exports.colors[colors];
    } else {
      throw Error(
        `Colors ${colors} not found. Chose one of ${Object.keys(
          exports.colors
        ).join(", ")}`
      );
    }
  } else {
    colorsObj = JSON.parse(JSON.stringify(colors));
  }
  let colormap = [];
  if (!colorsObj.hasOwnProperty("weights")) {
    colorsObj.weights = new Array(colorsObj.values.length).fill(1);
  }
  const totalSteps = colorsObj.weights.reduce((acc, cur) => acc + cur, 0);
  const steps = colorsObj.weights.map((val, idx) => {
    return Math.ceil((val / totalSteps) * colorsObj.steps);
  });
  for (let i = 0; i < colorsObj.values.length - 1; i++) {
    const cmap = interpolateColors(
      colorsObj.values[i],
      colorsObj.values[i + 1],
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
      c1[2] * ((steps - idx) / steps) + c2[2] * (idx / steps),
    ]).map((channel) => {
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
    parseInt(c.slice(4, 6), 16) / 255,
  ];
}

const degreesToRadians = (degrees) => (degrees * Math.PI) / 180;
const radiansToDegrees = (radians) => (radians * 180) / Math.PI;

function clipImg(canvas, cropPolygon) {
  const ctx = canvas.getContext("2d");
  const dataURL = canvas.toDataURL("image/png");
  const image = new Image();
  image.src = dataURL;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.moveTo(cropPolygon[0][0], cropPolygon[0][1]);
  cropPolygon.forEach((item) => ctx.lineTo(...item));
  ctx.fill();
  ctx.clip();
  ctx.drawImage(image, 0, 0);
}

/* KERNELS */
function gaussianKernel(r, { sigma }) {
  return Math.exp(-Math.pow(r / sigma, 2));
}

function exponentialKernel(r, { epsilon }) {
  return Math.exp(-r * epsilon);
}

function linearKernel(r, { epsilon }) {
  return polynomialKernel(r, { epsilon, degree: 1 });
}

function polynomialKernel(r, { epsilon, degree }) {
  return 1 / (1 + Math.pow(r * epsilon, degree));
}

function cosineKernel(r, { omega, phi }) {
  return (1 + Math.cos(((r * Math.PI) / 180) * omega + phi)) / 2;
}

function dampedCosineKernel(r, { omega, phi, epsilon }) {
  return cosineKernel(r, { omega, phi }) * exponentialKernel(r, { epsilon });
}

function stepKernel(r, { radius }) {
  return r < radius ? 1 : 0;
}

function bumpKernel(r, { radius }) {
  return r >= radius ? 0 : Math.exp(1 / (1 - 1 / Math.pow(r / radius, 2)));
}

/* METHODS */
function sumMethod(points) {
  return points.reduce((acc, item) => acc + item.value * item.w, 0);
}

function maxMethod(points) {
  return Math.max(...points.map((item) => item.value * item.w).concat([0]));
}

function nearestMethod(points) {
  const item = points.reduce((acc, item) => {
    return item.r <= acc.r && item.w > 0 ? item : acc;
  });
  return item.value * item.w;
}

function shepardsMethod(points, { kernel }) {
  let sigmaWs = 0;
  return (
    points
      .map((item) => {
        item.ws = kernel(item.r);
        sigmaWs += item.ws;
        return item;
      })
      .reduce((acc, item) => {
        return acc + (item.value * item.w * item.ws) / sigmaWs;
      }, 0) || 0
  );
}

/* GEO KERNELS */
const EARTH_MEAN_RADIUS = 6371000;
function metersTosigma(radius, height, geoCoords, gaussianBorderValue = 0.2) {
  /*
   * Convert radius (in meters) to the sigma parameter for the gaussian
   * kernel.
   *
   * radius: spot radius in meters
   * height: image height
   * geoCoords: Array of a geo polygon containing objects with keys
   *     {lat, lng}
   * gaussianBorderValue: intensity of the gaussian function considered
   *    as the border of the gaussian
   */
  const lats = geoCoords.map((item) => degreesToRadians(item.lat));
  const y0 = Math.min(...lats),
    y1 = Math.max(...lats);
  const dy = haversine(EARTH_MEAN_RADIUS, 0, 0, y0, y1);
  const pxPerMeter = height / dy;
  const pxRadius = pxPerMeter * radius;
  const sigma = gaussianRadiusToSigma(pxRadius, gaussianBorderValue);
  return sigma;
}

function gaussianRadiusToSigma(radius, value) {
  return radius * Math.sqrt(-1 / Math.log(value));
}

function haversine(r, f1, f2, l1, l2) {
  /*
   * Haversine formula for calculating distances from geographical
   * coordinates: https://en.wikipedia.org/wiki/Haversine_formula
   *
   * r - Sphere radius
   * f1, f2 - fi1, fi2 (latitudes)
   * l1, l2 - lambda1, lambda2 (longitudes)
   */
  return (
    2 *
    r *
    Math.asin(
      Math.sqrt(
        Math.pow(Math.sin((f2 - f1) / 2), 2) +
          Math.cos(f1) * Math.cos(f2) * Math.pow(Math.sin((l2 - l1) / 2), 2)
      )
    )
  );
}
