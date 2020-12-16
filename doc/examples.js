#!/usr/bin/env node

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
const fs = require("fs");
const heatmap = require("@luxedo/heatmap");

const main = (() => {
  let fnArgs = [
    [
      {
        px: 10,
        py: 10,
        value: 1,
        radius: 10,
        sigma: 30,
        epsilon: 0.05
      },
      {
        px: 123,
        py: 33,
        value: 0.3,
        radius: 30,
        sigma: 10,
        epsilon: 0.05
      },
      {
        px: 26,
        py: 11,
        value: 0.2,
        radius: 20,
        sigma: 10,
        epsilon: 0.05
      },
      {
        px: 67,
        py: 114,
        value: 0.9,
        radius: 30,
        sigma: 40,
        epsilon: 0.05
      },
      {
        px: 44,
        py: 88,
        value: 0.9,
        radius: 40,
        sigma: 10,
        epsilon: 0.05
      },
      {
        px: 98,
        py: 99,
        value: 0.5,
        radius: 50,
        sigma: 10,
        epsilon: 0.05
      },
      {
        px: 111,
        py: 111,
        value: 0.2,
        radius: 30,
        sigma: 10,
        epsilon: 0.05
      },
      {
        px: 43,
        py: 98,
        value: 0.7,
        radius: 10,
        sigma: 20,
        epsilon: 0.05
      },
      {
        px: 86,
        py: 12,
        value: 0.7,
        radius: 40,
        sigma: 10,
        epsilon: 0.05
      },
      {
        px: 49,
        py: 88,
        value: 0.8,
        radius: 30,
        sigma: 20,
        epsilon: 0.05
      }
    ],
    144,
    144,
    null,
    null,
    "bump",
    "max",
    null
  ];
  //const buf = heatmap.drawHeatmap(...fnArgs);
  //fs.writeFileSync("out.png", buf);

  let points = [
    {
      px: 10,
      py: 10,
      value: 1,
      sigma: 40
    },
    {
      px: 120,
      py: 30,
      value: 0.6,
      sigma: 60
    },
    {
      px: 70,
      py: 130,
      value: 0.2,
      sigma: 100
    }
  ];
  let width = 150;
  let height = 150;
  let buf = heatmap.drawHeatmap({ points, width, height });
  fs.writeFileSync("example1.png", buf);

  const geoCoords = [
    {
      lat: 0.0,
      lng: 0.0
    },
    {
      lat: 0.3,
      lng: 0.3
    }
  ];
  const geoPoints = [
    {
      lat: 0.1,
      lng: 0.1,
      value: 1,
      sigma: 40
    },
    {
      lat: 0.1,
      lng: 0.2,
      value: 0.6,
      sigma: 40
    },
    {
      lat: 0.15,
      lng: 0.2,
      value: 0.2,
      sigma: 100
    }
  ];
  const pxPerDeg = 500;
  const method = "max";
  const retval = heatmap.drawGeoHeatmap({
    geoCoords,
    geoPoints,
    pxPerDeg,
    method
  });
  buf = retval.buf;
  fs.writeFileSync("example2.png", buf);

  let colors = {
    steps: 30,
    values: ["#111122", "#44AA11", "#DDDDFF"],
    weights: [1, 2, 3]
  };
  buf = heatmap.drawHeatmap({ points, width, height, colors });
  fs.writeFileSync("example4.png", buf);

  // Methods
  buf = heatmap.drawHeatmap({ points, width, height, method: "max" });
  fs.writeFileSync("max.png", buf);
  buf = heatmap.drawHeatmap({ points, width, height, method: "nearest" });
  fs.writeFileSync("nearest.png", buf);
  buf = heatmap.drawHeatmap({ points, width, height, method: "shepards" });
  fs.writeFileSync("shepards.png", buf);
  buf = heatmap.drawHeatmap({ points, width, height, method: "sum" });
  fs.writeFileSync("sum.png", buf);
  buf = heatmap.drawHeatmap({ points, width, height, method: "alphaShepards" });
  fs.writeFileSync("alphaShepards.png", buf);


  // Kernels
  points = [
    {
      px: 75,
      py: 75,
      value: 1,
      radius: 70,
      omega: 10,
      epsilon: 0.05,
      sigma: 50
    }
  ];
  buf = heatmap.drawHeatmap({ points, width, height, kernel: "bump" });
  fs.writeFileSync("bump.png", buf);
  buf = heatmap.drawHeatmap({ points, width, height, kernel: "cosine" });
  fs.writeFileSync("cosine.png", buf);
  buf = heatmap.drawHeatmap({ points, width, height, kernel: "dampedCosine" });
  fs.writeFileSync("dampedCosine.png", buf);
  buf = heatmap.drawHeatmap({ points, width, height, kernel: "exponential" });
  fs.writeFileSync("exponential.png", buf);
  buf = heatmap.drawHeatmap({ points, width, height, kernel: "gaussian" });
  fs.writeFileSync("gaussian.png", buf);
  buf = heatmap.drawHeatmap({ points, width, height, kernel: "linear" });
  fs.writeFileSync("linear.png", buf);
  buf = heatmap.drawHeatmap({ points, width, height, kernel: "polynomial" });
  fs.writeFileSync("polynomial.png", buf);
  buf = heatmap.drawHeatmap({ points, width, height, kernel: "step" });
  fs.writeFileSync("step.png", buf);

  // Colors
  buf = heatmap.drawHeatmap({
    points,
    width,
    height,
    colors: "teelights",
    kernel: "bump",
    method: "sum"
  });
  fs.writeFileSync("teelights.png", buf);
  buf = heatmap.drawHeatmap({
    points,
    width,
    height,
    colors: "jet",
    kernel: "bump",
    method: "sum"
  });
  fs.writeFileSync("jet.png", buf);
  buf = heatmap.drawHeatmap({
    points,
    width,
    height,
    colors: "parula",
    kernel: "bump",
    method: "sum"
  });
  fs.writeFileSync("parula.png", buf);
  buf = heatmap.drawHeatmap({
    points,
    width,
    height,
    colors: "gray",
    kernel: "bump",
    method: "sum"
  });
  fs.writeFileSync("gray.png", buf);
  buf = heatmap.drawHeatmap({
    points,
    width,
    height,
    colors: "magma",
    kernel: "bump",
    method: "sum"
  });
  fs.writeFileSync("magma.png", buf);
  buf = heatmap.drawHeatmap({
    points,
    width,
    height,
    colors: "plasma",
    kernel: "bump",
    method: "sum"
  });
  fs.writeFileSync("plasma.png", buf);
  buf = heatmap.drawHeatmap({
    points,
    width,
    height,
    colors: "inferno",
    kernel: "bump",
    method: "sum"
  });
  fs.writeFileSync("inferno.png", buf);
  buf = heatmap.drawHeatmap({
    points,
    width,
    height,
    colors: "viridis",
    kernel: "bump",
    method: "sum"
  });
  fs.writeFileSync("viridis.png", buf);
})();
