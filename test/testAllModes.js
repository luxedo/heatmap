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
const OUTPUT_FOLDER = "test/output/";

const main = (() => {
  data = JSON.parse(fs.readFileSync("test/testLocation.json"));
  Object.entries(heatmap.kernels).forEach(([k, kernel]) => {
    Object.entries(heatmap.methods).forEach(([m, method]) => {
      data.kernel = k;
      data.method = m;
      const fnArgs = buildFnArgs(data);
      const { buf } = heatmap.drawGeoHeatmap(...fnArgs);
      const filename = `${OUTPUT_FOLDER}${m}_${k}.png`;
      fs.writeFileSync(filename, buf);
    });
  });
})();

function buildFnArgs(data) {
  return [
    data.coords,
    data.points,
    data.colors || null,
    data.crop || null,
    data.pxPerDegree || null,
    data.width || null,
    data.height || null,
    data.kernel || null,
    data.method || null
  ];
}
