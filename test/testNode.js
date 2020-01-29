const heatmap = require("@luxedo/heatmap");
const { expect } = require("chai");
const { createCanvas, Image } = require("canvas");
describe("@luxedo/heatmap", () => {
  describe("drawGeoHeatmap", () => {
    const coords = [
      {
        lat: -22.542375726527336,
        lng: -45.768957285705596
      },
      {
        lat: -22.541206446271943,
        lng: -45.76666131478885
      },
      {
        lat: -22.545467335077834,
        lng: -45.76440825921634
      },
      {
        lat: -22.542791908634925,
        lng: -45.76844230157474
      }
    ];
    const points1 = [
      {
        lat: -22.541400601778598,
        lng: -45.76889830134393,
        value: 0.5,
        radius: 200
      },
      {
        lat: -22.54452010647742,
        lng: -45.76533627929883,
        value: 1,
        radius: 50
      }
    ];
    const scale = 100000;
    const color1 = "#00FF00";
    const color2 = "#FF0000";
    it("should return an image buffer and two coordinates", () => {
      const { buf, origin, end } = heatmap.drawGeoHeatmap(
        coords,
        points1,
        color1,
        color2,
        true,
        scale
      );
      expect(buf).to.be.instanceof(Buffer);
      expect(origin).to.have.length(2);
      expect(end).to.have.length(2);
    });
    it("should return an image with fixed width when passing widht as argument", () => {
      const width = 200;
      const { buf } = heatmap.drawGeoHeatmap(
        coords,
        points1,
        color1,
        color2,
        true,
        null,
        width
      );
      const img = new Image();
      img.src = buf;
      expect(img.width).to.equal(width);
    });
    it("should return an image with fixed height when passing height as argument", () => {
      const height = 200;
      const { buf } = heatmap.drawGeoHeatmap(
        coords,
        points1,
        color1,
        color2,
        true,
        null,
        null,
        height
      );
      const img = new Image();
      img.src = buf;
      expect(img.height).to.equal(height);
    });
    it("should return an all green image when not passing points", () => {
      const { buf } = heatmap.drawGeoHeatmap(
        coords,
        [],
        color1,
        color2,
        false,
        scale
      );
      const imgData = bufToImgData(buf);
      for (let i = 0; i < imgData.data.length; i += 4) {
        const px = [
          imgData.data[i + 0],
          imgData.data[i + 1],
          imgData.data[i + 2],
          imgData.data[i + 3]
        ];
        expect(px).to.eql([0, 255, 0, 255]);
      }
    });
    it("should return an all red image when passing a huge point", () => {
      const points2 = [points1[0]];
      points2[0].value = 1;
      points2[0].radius = 10000;
      const { buf } = heatmap.drawGeoHeatmap(
        coords,
        points2,
        color1,
        color2,
        false,
        scale
      );
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
  });
});

function bufToImgData(buffer) {
  const img = new Image();
  img.src = buffer;
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, img.width, img.height);
}
