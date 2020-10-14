#!/usr/bin/env node

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
const heatmap = require("@luxedo/heatmap");
const args = require("yargs")
  .scriptName("heatmap")
  .usage(`Usage: $0 [-g] -i input_file -o output_file       $0 [-g] [--] file`)
  .option("geo", {
    alias: "g",
    type: "boolean",
    description: "Receives input as geographic data"
  })
  .option("input", {
    alias: "i",
    type: "string",
    description: "Input json file with the configurations"
  })
  .option("output", {
    alias: "o",
    type: "string",
    description: "Output png file"
  })
  .option("", {
    description: "Receives input from stdin and outputs to stdout"
  }).epilog(`Example:
echo '{"points": [{"px": 10, "py": 10, "value": 1, "sigma": 30}, 
  {"px": 120, "py": 30, "value": 0.6, "sigma": 50}, 
  {"px": 70, "py": 130, "value": 0.2, "sigma": 70}], 
  "width": 150, 
  "height": 150, 
  "method": "nearest"}' | heatmap -- > example3.png

   See https://github.com/luxedo/heatmap for configuration details.`).argv;

const main = (() => {
  let data;
  let out = "file";
  if (args.hasOwnProperty("o") || args.hasOwnProperty("i")) {
    if (!(args.hasOwnProperty("o") && args.hasOwnProperty("i")))
      throw Error("You must provide both -i (input_file) and -o (output_file)");
    data = JSON.parse(fs.readFileSync(args.i).toString());
  } else {
    data = JSON.parse(fs.readFileSync(0, "utf-8"));
    out = "stdout";
  }

  let Buf;
  if (args.hasOwnProperty("g")) {
    const { buf } = heatmap.drawGeoHeatmap(data);
    Buf = buf;
  } else {
    Buf = heatmap.drawHeatmap(data);
  }

  if (out == "file") fs.writeFileSync(args.o, Buf);
  else process.stdout.write(Buf);
})();
