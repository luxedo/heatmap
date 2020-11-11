# heatmap

## Usage

### `drawHeatmap({points, width, height, [...args]}) ⇒ Buffer`

Returns the `Buffer` of a `png` image of the heatmap. The `points` argument must be an `Array` containing the following properties: The center of the point `px`, `py`, the intensity of the point `value`. The range of values that makes the gradient are from 0 to 1, but it's possible to give values outside this range. Also, additional arguments can be given to overwrite the defaults for the _kernel_ configuration.

#### Example

```javascript
const fs = require("fs");
const heatmap = require("@luxedo/heatmap");

const points = [
  {
    px: 10,
    py: 10,
    value: 1,
    sigma: 30
  },
  {
    px: 120,
    py: 30,
    value: 0.6,
    sigma: 50
  },
  {
    px: 70,
    py: 130,
    value: 0.2,
    sigma: 70
  }
];
const width = 150;
const height = 150;
const buf = heatmap.drawHeatmap(points, width, height);
fs.writeFileSync("example1.png", buf);
```

##### example1.png

![example 1](doc/examples/example1.png)

### `drawGeoHeatmap({geoCoords, geoPoints, (pxPerDeg || (width | height)), [...args]}) ⇒ {buf (Buffer), origin (Object), end (Object)}`

Returns an object with the `Buffer` (buf) of a `png` image of the heatmap, the northwestmost and southeastmost (origin, end) coordinates `{lat, lng}`. Inputs are `geoCoords`, the boundaries of the image, an `Array` of coordinates `{lat, lng}`; and `geoPoints`, an `Array` of `{lat, lng, value}`, configuration is similar to `deawHeatmap`. One of: `pxPerDeg`, `width`, `height` must be provided.

```javascript
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
const buf = heatmap.drawGeoHeatmap({ geoCoords, geoPoints, pxPerDeg, method });
fs.writeFileSync("example2.png", buf);
```

#### example2.png

![example 2](doc/examples/example2.png)

#### Arguments

##### `drawHeatmap`:

- `points`: `Array` of points to draw `[{px, py, value}]`.
- `width`: width of the image.
- `height`: height of the image.
- `colors`: Either an `Object` for colormap configuration, or a `String` of a default colormap. Options: `teelights`, `jet`, `parula`, `gray`, `magma`, `plasma`, `inferno`, `viridis`.
- `cropPolygon`: `Array` of points `[{px, py}]` forming a polygon to crop the output image
- `kernel`: The RBF kernel for computing the intensity of the heatmap. Options: `bump`, `cosine`, `dampedCosine`, `exponential`, `gaussian`. `linear`, `polynomial`, `step`.
- `method`: The method for accumulating the intensities. Options: `max`, `nearest`, `shepards`, `sum`.
- `methodArgs`: Additional arguments for the `method`.

##### `drawGeoHeatmap`:

- `geoCoords`: `Array` of coordinates `[{lat, lng}]` of the boundaries of the heatmap. May also be used with `crop` when passing more than three coordinates to select the polygon inside the coordinates.
- `geoPoints`: `Array` of points to draw `[{lat, lng, value}]`.
- `pxPerDeg`: Number of pixels per degree of latitude/longitude. To use this scaling mode neither `width` and `height` can be provided.
- `width`: Forces the image to have a certain width. Can be used alongside with `height`.
- `height`: Forces the image to have a certain height. Can be used alongside with `width`.
- `colors`: Either an `Object` for colormap configuration, or a `String` of a default colormap. Options: `teelights`, `jet`, `parula`, `gray`, `magma`, `plasma`, `inferno`, `viridis`.
- `crop`: Crops the polygon of the boundaries gven in `geoCoords` if `true`.
- `kernel`: The RBF kernel for computing the intensity of the heatmap . Options: `bump`, `cosine`, `dampedCosine`, `exponential`, `gaussian`. `linear`, `polynomial`, `step`.
- `method`: The method for accumulating the intensities. Options: `max`, `nearest`, `shepards`, `sum`.
- `methodArgs`: Additional arguments for the `method`.

### Command line

```bash
$ heatmap --help
Usage: heatmap [-g] -i input_file -o output_file       heatmap [-g] [--] file

Options:
  --help        Show help                                              [boolean]
  --version     Show version number                                    [boolean]
  --geo, -g     Receives input as geographic data                      [boolean]
  --input, -i   Input json file with the configurations                 [string]
  --output, -o  Output png file                                         [string]
  --            Receives input from stdin and outputs to stdout

Example:
echo '{"points": [{"px": 10, "py": 10, "value": 1, "sigma": 30},
  {"px": 120, "py": 30, "value": 0.6, "sigma": 50},
  {"px": 70, "py": 130, "value": 0.2, "sigma": 70}],
  "width": 150,
  "height": 150,
  "method": "nearest"}' | bin/heatmap -- > example3.png

   See https://github.com/luxedo/heatmap for configuration details.
```

#### example3.png

![example3.png](doc/examples/example3.png)

## Installation

Install via `npm`:

```bash
$ npm install @luxedo/heatmap
```

You need to have [Cairo](https://www.cairographics.org/) installed.

## Kernels

There are 8 kernels used as [Radial Basis Functions](https://en.wikipedia.org/wiki/Radial_basis_function) for determining the intensity of each pixel in the heatmap:

| []()                                          |                                           |                                                       |                                                     |
| --------------------------------------------- | ----------------------------------------- | ----------------------------------------------------- | --------------------------------------------------- |
| **bump**                                      | **cosine**                                | **dampedCosine**                                      | **exponential**                                     |
| ![bump kernel](doc/examples/bump.png)         | ![cosine kernel](doc/examples/cosine.png) | ![dampedCosine kernel](doc/examples/dampedCosine.png) | ![exponential kernel](doc/examples/exponential.png) |
| **gaussian**                                  | **linear**                                | **polynomial** degree 2                               | **step**                                            |
| ![gaussian kernel](doc/examples/gaussian.png) | ![linear kernel](doc/examples/linear.png) | ![polynomial kernel](doc/examples/polynomial.png)     | ![step kernel](doc/examples/step.png)               |

### bump

##### arguments:

- `radius`: Radius of the bump

### cosine

##### arguments:

- `omega`: Angular frequency
- `phi`: Phase

### dampedCosine

##### arguments:

- `omega`: Angular frequency
- `phi`: Phase
- `epsilon`: Decay

### exponential

##### arguments:

- `epsilon`: Decay

### gaussian

##### arguments:

- `sigma`: Standard deviation

### linear

##### arguments:

- `epsilon`: Decay

### polynomial

##### arguments:

- `epsilon`: Decay
- `degree`: Degree of the polynomial

### step

##### arguments:

- `radius`: Radius of the step

## Geo Kernels
Geo Kernels are meant to add consistency for geographical data heatmaps
by using more intuitive arguments and scaling the kernels correctly.
These kernels are avaliable only for `drawGeoHeatMap`:

### geoGaussian

##### arguments:

- `radius`: Radius of the gaussian in meters


## Methods

There are 4 methods for accumulating the values of the points:

| []()                                 |                                          |                                           |                                      |
| ------------------------------------ | ---------------------------------------- | ----------------------------------------- | ------------------------------------ |
| **max**                              | **nearest**                              | **shepards**                              | **sum**                              |
| ![bump kernel](doc/examples/max.png) | ![bump kernel](doc/examples/nearest.png) | ![bump kernel](doc/examples/shepards.png) | ![bump kernel](doc/examples/sum.png) |

### max

Gets the maximum value of any point

### nearest

Gets the value for the nearest point

### shepards

Computes a weighted sum of the points using a kernel. The default value is polynomial degree 5.

##### arguments:

- `kernel`: Name of the kernel (optional)
- `kernelArgs`: Extra arguments for the kernel (optional)

### sum

Sums the values of all points.

## Colors

The first option for configuring the colormap is by chosing one of the default colors:

| []()                                     |                                    |                                      |                                      |
| ---------------------------------------- | ---------------------------------- | ------------------------------------ | ------------------------------------ |
| **teelights** default                    | **jet**                            | **parula**                           | **gray**                             |
| ![teelights](doc/examples/teelights.png) | ![jet](doc/examples/jet.png)       | ![parula](doc/examples/parula.png)   | ![gray](doc/examples/gray.png)       |
| **magma**                                | **plasma**                         | **inferno**                          | **viridis**                          |
| ![magma](doc/examples/magma.png)         | ![plasma](doc/examples/plasma.png) | ![inferno](doc/examples/inferno.png) | ![viridis](doc/examples/viridis.png) |

The second option is an `Object` containing the following _properties_:

- `steps`: Number of colors for interpolation.
- `colors`: An `Array` of the colors in the colormap in hex.
- `weights`: An `Array` of weights for each color (optional).

#### Example

```javascript
const fs = require("fs");
const heatmap = require("@luxedo/heatmap");

const points = [
  {
    px: 10,
    py: 10,
    value: 1,
    sigma: 30
  },
  {
    px: 120,
    py: 30,
    value: 0.6,
    sigma: 50
  },
  {
    px: 70,
    py: 130,
    value: 0.2,
    sigma: 70
  }
];
const width = 150;
const height = 150;

let colors = {
  steps: 30,
  values: ["#111122", "#44AA11", "#DDDDFF"],
  weights: [1, 2, 3]
};
buf = heatmap.drawHeatmap({ points, width, height, colors });
fs.writeFileSync("example4.png", buf);
```

#### example4.png

![example4](doc/examples/example4.png)

## More Examples

| kernel/method | max                                                    | nearest                                                        | shepards                                                         | sum                                                    |
| ------------- | ------------------------------------------------------ | -------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------ |
| bump          | ![max bump](doc/examples/max_bump.png)                 | ![nearest_bump](doc/examples/nearest_bump.png)                 | ![shepards_bump](doc/examples/shepards_bump.png)                 | ![sum_bump](doc/examples/sum_bump.png)                 |
| cosine        | ![max cosine](doc/examples/max_cosine.png)             | ![nearest_cosine](doc/examples/nearest_cosine.png)             | ![shepards_cosine](doc/examples/shepards_cosine.png)             | ![sum_cosine](doc/examples/sum_cosine.png)             |
| dampedCosine  | ![max dampedCosine](doc/examples/max_dampedCosine.png) | ![nearest_dampedCosine](doc/examples/nearest_dampedCosine.png) | ![shepards_dampedCosine](doc/examples/shepards_dampedCosine.png) | ![sum_dampedCosine](doc/examples/sum_dampedCosine.png) |
| exponential   | ![max exponential](doc/examples/max_exponential.png)   | ![nearest_exponential](doc/examples/nearest_exponential.png)   | ![shepards_exponential](doc/examples/shepards_exponential.png)   | ![sum_exponential](doc/examples/sum_exponential.png)   |
| gaussian      | ![max gaussian](doc/examples/max_gaussian.png)         | ![nearest_gaussian](doc/examples/nearest_gaussian.png)         | ![shepards_gaussian](doc/examples/shepards_gaussian.png)         | ![sum_gaussian](doc/examples/sum_gaussian.png)         |
| linear        | ![max linear](doc/examples/max_linear.png)             | ![nearest_linear](doc/examples/nearest_linear.png)             | ![shepards_linear](doc/examples/shepards_linear.png)             | ![sum_linear](doc/examples/sum_linear.png)             |
| polynomial    | ![max polynomial](doc/examples/max_polynomial.png)     | ![nearest_polynomial](doc/examples/nearest_polynomial.png)     | ![shepards_polynomial](doc/examples/shepards_polynomial.png)     | ![sum_polynomial](doc/examples/sum_polynomial.png)     |
| step          | ![max step](doc/examples/max_step.png)                 | ![nearest_step](doc/examples/nearest_step.png)                 | ![shepards_step](doc/examples/shepards_step.png)                 | ![sum_step](doc/examples/sum_step.png)                 |

## License

> @luxedo/heatmap - Creates heatmaps from latitude and longitude data 
> MIT License
> 
> Copyright (c) 2020 [Luiz Eduardo Amaral](luizamaral306@gmail.com)
> 
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
> 
> The above copyright notice and this permission notice shall be included in all
> copies or substantial portions of the Software.
> 
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
> SOFTWARE.
