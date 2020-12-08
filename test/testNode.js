/*  
@luxedo/heatmap - Creates heatmaps from latitude and longitude data 
MIT License

Copyright (c) 2020 [Luiz Eduardo Amaral](luizamaral306@gmail.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
const fs = require("fs");
const Jimp = require("jimp");
const { expect } = require("chai");
const heatmap = require("@luxedo/heatmap");
const OUTPUT_FOLDER = "test/output/";

describe("@luxedo/heatmap", () => {
  describe("drawHeatmap", () => {
    const data = JSON.parse(fs.readFileSync("test/testHeatmap.json"));

    // Simple tests
    it("should return an image buffer", async () => {
      const buf = await heatmap.drawHeatmap(data);
      expect(buf).to.be.instanceof(Buffer);
    });
    it("should return an all white image when not passing points", async () => {
      const data2 = deepCopy(data);
      data2.points = [];
      const buf = await heatmap.drawHeatmap(data2);
      const imgData = await bufToImgData(buf);
      for (let i = 0; i < imgData.data.length; i += 4) {
        const px = [
          imgData.data[i + 0],
          imgData.data[i + 1],
          imgData.data[i + 2],
          imgData.data[i + 3]
        ];
        expect(px).to.eql([255, 255, 255, 255]);
      }
    });
    it("should return an all red image when passing a huge point", async () => {
      const points2 = deepCopy([data.points[0]]);
      points2[0].value = 1;
      points2[0].radius = 10000;
      const data2 = deepCopy(data);
      data2.points = points2;
      data2.kernel = "step";
      data2.method = "sum";
      const buf = await heatmap.drawHeatmap(data2);
      const imgData = await bufToImgData(buf);
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
        it(`Should return a buffer for kernel: ${k} and method: ${m} `, async () => {
          const data2 = deepCopy(data);
          data2.kernel = k;
          data2.method = m;
          const buf = await heatmap.drawHeatmap(data2);
          const filename = `${OUTPUT_FOLDER}${m}_${k}.png`;
          expect(buf).to.be.instanceof(Buffer);
          fs.writeFile(filename, buf, () => {});
        });
      });
    });
  });
});

describe("@luxedo/heatmap", () => {
  describe("drawGeoHeatmap", async () => {
    const data = JSON.parse(fs.readFileSync("test/testLocation.json"));
    // Scale, width and height tests
    it("should return an image buffer and two coordinates", async () => {
      const data2 = deepCopy(data);
      data2.pxPerDeg = 10000;
      const { buf, origin, end } = await heatmap.drawGeoHeatmap(data2);
      expect(buf).to.be.instanceof(Buffer);
      expect(origin).to.have.length(2);
      expect(end).to.have.length(2);
    });
    it("should return an image with fixed width when passing widht as argument", async () => {
      const data2 = deepCopy(data);
      const width = 200;
      data2.width = width;
      data2.pxPerDeg = null;
      const { buf } = await heatmap.drawGeoHeatmap(data2);
      const imgData = await bufToImgData(buf);
      expect(imgData.width).to.equal(width);
    });
    it("should return an image with fixed height when passing height as argument", async () => {
      const data2 = deepCopy(data);
      const height = 200;
      data2.height = height;
      data2.pxPerDeg = null;
      const { buf } = await heatmap.drawGeoHeatmap(data2);
      const imgData = await bufToImgData(buf);
      expect(imgData.height).to.equal(height);
    });
  });
});

function deepCopy(object) {
  return JSON.parse(JSON.stringify(object));
}

async function bufToImgData(buffer) {
  const img = await Jimp.read(buffer);
  return img.bitmap;
}
