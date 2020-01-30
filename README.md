# heatmap

## Usage

### `drawHeatmap(points, width, height, [colors, cropPolygon, kernel, method, methodArgs]) => Buffer`

Returns the `Buffer` of a `png` image of the heatmap. The `points` argument must be an `Array` containing the following properties: The center of the point `px`, `py`, The intensity of the point `value`. The range of values that makes the gradient are from 0 to 1, but it's possible to give values outside this range. Also, additional arguments can be given to overwrite the defaults for the _kernel_ configuration.

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

#### Results

![example 1](doc/examples/example1.png)

### `drawGeoHeatmap(geoCoords, geoPoints, (pxPerDeg, width, height), [colors, crop, kernel, method, methodArgs]) => {buf (Buffer), origin (Object), end (Object)}`

Returns an object with the `Buffer` (buf) of a `png` image of the heatmap, the northwestmost and southeastmost (origin, end) coordinates `{lat, lng}`. Inputs are `geoCoords` the boundaries of the image, an `Array` of coordinates `{lat, lng}`; and `geoPoints`, an `Array` of `{lat, lng, value}`, configuration is similar to `deawHeatmap`. One of: `pxPerDeg`, `width`, `height` must be provided.

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

#### Results

![example 2](doc/examples/example2.png)

#### Arguments

##### `drawGeoHeatmap`:

- `points`: `Array` of points to draw `[{px, py, value}]`.
- `width`: width of the image.
- `height`: height of the image.
- `colors`: An `Object` for colormap configuration.
- `cropPolygon`: `Array` of points `[{px, py}]` forming a polygon to crop the output image
- `kernel`: The RBF kernel for computing the intensity of the heatmap . Options: `bump`, `cosine`, `dampedCosine`, `exponential`, `gaussian`. `linear`, `polynomial`, `step`.
- `method`: The method for accumulating the intensities. Options: `max`, `nearest`, `shepards`, `sum`
- `methodArgs`: Additional arguments for the `method`.

##### `drawHeatmap`:

- `geoCoords`: `Array` of coordinates `[{lat, lng}]` of the boundaries of the heatmap. May also be used with `crop` when passing more than three coordinates to select the polygon inside the coordinates.
- `geoPoints`: `Array` of points to draw `[{lat, lng, value}]`.
- `pxPerDeg`: Number of pixels per degree of latitude/longitude. To use this scaling mode neither `width` and `height` can be provided.
- `width`: Forces the image to have a certain width. Can be used alongside with `height`.
- `height`: Forces the image to have a certain height. Can be used alongside with `width`.
- `colors`: An `Object` for colormap configuration.
- `crop`: Crops the polygon of the boundaries gven in `geoCoords` if `true`.
- `kernel`: The RBF kernel for computing the intensity of the heatmap . Options: `bump`, `cosine`, `dampedCosine`, `exponential`, `gaussian`. `linear`, `polynomial`, `step`.
- `method`: The method for accumulating the intensities. Options: `max`, `nearest`, `shepards`, `sum`
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
echo '{"points": [{"px": 10, "py": 10, "value": 1, "sigma": 30}, {"px": 120, "py": 30, "value": 0.6, "sigma": 50}, {"px": 70, "py": 130, "value": 0.2, "sigma": 70}], "width": 150, "height": 150, "method": "nearest"}' | bin/heatmap -- > example3.png
   See ... for configuration details.
```

#### example3.png

![example3.png](doc/examples/example3.png)

## Installation

### Node

Install via `npm`:

```bash
$ npm install @luxedo/heatmap
```

### Browser

Include the script from [jsDelivr](https://jsdelivr.com):

```html
<script src="https://cdn.jsdelivr.net/npm/@luxedo/heatmap@1.0.0/heatmap.min.js"></script>
```

## Kernels

There are 8 kernels used as [Radial Basis Functions](https://en.wikipedia.org/wiki/Radial_basis_function) for determining the intensity of each pixel in the heatmap:

| []()                                      |                                         |                                               |                                              |
| ----------------------------------------- | --------------------------------------- | --------------------------------------------- | -------------------------------------------- |
| **bump**                                  | **cosine**                              | **dampedCosine**                              | **exponential**                              |
| ![bump kernel](doc/examples/bump.png)     | ![bump kernel](doc/examples/cosine.png) | ![bump kernel](doc/examples/dampedCosine.png) | ![bump kernel](doc/examples/exponential.png) |
| **gaussian**                              | **linear**                              | **polynomial**                                | **step**                                       |
| ![bump kernel](doc/examples/gaussian.png) | ![bump kernel](doc/examples/linear.png) | ![bump kernel](doc/examples/polynomial.png)   | ![bump kernel](doc/examples/step.png)        |

### bump

### cosine

### dampedCosine

### exponential

### gaussian

### linear

### polynomial

### step

## Methods

### max

### nearest

### shepards

### sum

### Custom method

## Colors

## Examples

| kernel       | max                                                    | nearest                                                        | shepards                                                         | sum                                                    |
| ------------ | ------------------------------------------------------ | -------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------ |
| bump         | ![max bump](doc/examples/max_bump.png)                 | ![nearest_bump](doc/examples/nearest_bump.png)                 | ![shepards_bump](doc/examples/shepards_bump.png)                 | ![sum_bump](doc/examples/sum_bump.png)                 |
| cosine       | ![max cosine](doc/examples/max_cosine.png)             | ![nearest_cosine](doc/examples/nearest_cosine.png)             | ![shepards_cosine](doc/examples/shepards_cosine.png)             | ![sum_cosine](doc/examples/sum_cosine.png)             |
| dampedCosine | ![max dampedCosine](doc/examples/max_dampedCosine.png) | ![nearest_dampedCosine](doc/examples/nearest_dampedCosine.png) | ![shepards_dampedCosine](doc/examples/shepards_dampedCosine.png) | ![sum_dampedCosine](doc/examples/sum_dampedCosine.png) |
| exponential  | ![max exponential](doc/examples/max_exponential.png)   | ![nearest_exponential](doc/examples/nearest_exponential.png)   | ![shepards_exponential](doc/examples/shepards_exponential.png)   | ![sum_exponential](doc/examples/sum_exponential.png)   |
| gaussian     | ![max gaussian](doc/examples/max_gaussian.png)         | ![nearest_gaussian](doc/examples/nearest_gaussian.png)         | ![shepards_gaussian](doc/examples/shepards_gaussian.png)         | ![sum_gaussian](doc/examples/sum_gaussian.png)         |
| linear       | ![max linear](doc/examples/max_linear.png)             | ![nearest_linear](doc/examples/nearest_linear.png)             | ![shepards_linear](doc/examples/shepards_linear.png)             | ![sum_linear](doc/examples/sum_linear.png)             |
| polynomial   | ![max polynomial](doc/examples/max_polynomial.png)     | ![nearest_polynomial](doc/examples/nearest_polynomial.png)     | ![shepards_polynomial](doc/examples/shepards_polynomial.png)     | ![sum_polynomial](doc/examples/sum_polynomial.png)     |
| step         | ![max step](doc/examples/max_step.png)                 | ![nearest_step](doc/examples/nearest_step.png)                 | ![shepards_step](doc/examples/shepards_step.png)                 | ![sum_step](doc/examples/sum_step.png)                 |
