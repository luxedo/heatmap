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
const fs = require('fs');
const { expect } = require('chai');
const { createCanvas, Image } = require('canvas');
const heatmap = require('@luxedo/heatmap');
const OUTPUT_FOLDER = 'test/output/';

describe('@luxedo/heatmap', () => {
  describe('drawHeatmap', () => {
    const data = JSON.parse(fs.readFileSync('test/testHeatmap.json'));

    // Simple tests
    it('should return an image buffer', () => {
      const fnArgs = buildFnArgs(data);
      const buf = heatmap.drawHeatmap(...fnArgs);
      expect(buf).to.be.instanceof(Buffer);
    });
    it('should return an all white image when not passing points', () => {
      const fnArgs = buildFnArgs(data, { points: [] });
      const buf = heatmap.drawHeatmap(...fnArgs);
      const imgData = bufToImgData(buf);
      for (let i = 0; i < imgData.data.length; i += 4) {
        const px = [
          imgData.data[i + 0],
          imgData.data[i + 1],
          imgData.data[i + 2],
          imgData.data[i + 3]
        ];
        expect(px).to.eql([254, 255, 254, 255]);
      }
    });
    it('should return an all red image when passing a huge point', () => {
      const points2 = JSON.parse(JSON.stringify([data.points[0]]));
      points2[0].value = 1;
      points2[0].radius = 10000;
      const fnArgs = buildFnArgs(data, {
        points: points2,
        kernel: 'step',
        method: 'sum'
      });
      const buf = heatmap.drawHeatmap(...fnArgs);
      const imgData = bufToImgData(buf);
      for (let i = 0; i < imgData.data.length; i += 4) {
        const px = [
          imgData.data[i + 0],
          imgData.data[i + 1],
          imgData.data[i + 2],
          imgData.data[i + 3]
        ];
        expect(px).to.eql([255, 0, 0, 255]);
      }
    });

    // Kernels and methods tests
    Object.entries(heatmap.kernels).forEach(([k, kernel]) => {
      Object.entries(heatmap.methods).forEach(([m, method]) => {
        it(`Should return a buffer for kernel: ${k} and method: ${m} `, () => {
          data.kernel = k;
          data.method = m;
          const fnArgs = buildFnArgs(data, { kernel: k, method: m });
          const buf = heatmap.drawHeatmap(...fnArgs);
          const filename = `${OUTPUT_FOLDER}${m}_${k}.png`;
          expect(buf).to.be.instanceof(Buffer);
          fs.writeFile(filename, buf, () => {});
        });
      });
    });
  });
});

describe('@luxedo/heatmap', () => {
  describe('drawGeoHeatmap', () => {
    data = JSON.parse(fs.readFileSync('test/testLocation.json'));

    // Scale, width and height tests
    it('should return an image buffer and two coordinates', () => {
      const fnArgs = buildGeoFnArgs(data);
      const { buf, origin, end } = heatmap.drawGeoHeatmap(...fnArgs);
      expect(buf).to.be.instanceof(Buffer);
      expect(origin).to.have.length(2);
      expect(end).to.have.length(2);
    });
    it('should return an image with fixed width when passing widht as argument', () => {
      const width = 200;
      const fnArgs = buildGeoFnArgs(data, { pxPerDeg: null, width: width });
      const { buf } = heatmap.drawGeoHeatmap(...fnArgs);
      const img = new Image();
      img.src = buf;
      expect(img.width).to.equal(width);
    });
    it('should return an image with fixed height when passing height as argument', () => {
      const height = 200;
      const fnArgs = buildGeoFnArgs(data, { pxPerDeg: null, height: height });
      const { buf } = heatmap.drawGeoHeatmap(...fnArgs);
      const img = new Image();
      img.src = buf;
      expect(img.height).to.equal(height);
    });
  });
});

function buildFnArgs(data, overwrite = {}) {
  return JSON.parse(JSON.stringify([
    overwrite.points !== undefined ? overwrite.points : data.points,
    overwrite.width !== undefined ? overwrite.width : data.width || 144,
    overwrite.height !== undefined ? overwrite.height : data.height || 144,
    overwrite.colors !== undefined ? overwrite.colors : data.colors || null,
    overwrite.cropPolygon !== undefined
      ? overwrite.cropPolygon
      : data.cropPolygon || null,
    overwrite.kernel !== undefined ? overwrite.kernel : data.kernel || null,
    overwrite.method !== undefined ? overwrite.method : data.method || null,
    overwrite.methodArgs !== undefined
      ? overwrite.methodArgs
      : data.methodArgs || null
  ]));
}

function buildGeoFnArgs(data, overwrite = {}) {
  return [
    overwrite.coords !== undefined ? overwrite.coords : data.coords,
    overwrite.points !== undefined ? overwrite.points : data.points,
    overwrite.pxPerDeg !== undefined
      ? overwrite.pxPerDeg
      : data.pxPerDeg || null,
    overwrite.width !== undefined ? overwrite.width : data.width || null,
    overwrite.height !== undefined ? overwrite.height : data.height || null,
    overwrite.colors !== undefined ? overwrite.colors : data.colors || null,
    overwrite.crop !== undefined ? overwrite.crop : data.crop || null,
    overwrite.kernel !== undefined ? overwrite.kernel : data.kernel || null,
    overwrite.method !== undefined ? overwrite.method : data.method || null
  ];
}
function bufToImgData(buffer) {
  const img = new Image();
  img.src = buffer;
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, img.width, img.height);
}
