#!/usr/bin/env node

const fs = require("fs");
const hm = require("@luxedo/heatmap");

const talhoso = {
  colors: {
    steps: 255,
    values: ["#00FF00", "#00FF00", "#AAAA00", "#FF0000"],
    weights: [2, 3, 3, 2],
  },
  geoCoords: [
    {
      lat: -22.26924577079028,
      lng: 46.4980277099864,
      id: "vl9zmNO9pq2nMqG56mts",
    },
    {
      id: "rXMfVmwVsuV0sP5TkvmT",
      lat: -22.409055199135516,
      lng: 46.56592929983902,
    },
    {
      lng: 46.575269328013256,
      lat: -22.31616056603905,
      id: "5xkoPIue31OJse2gONtq",
    },
    {
      id: "SrlPZFXCpfpx1yI2XgVB",
      lat: -22.262028340717983,
      lng: 46.54215326288493,
    },
  ],
  geoPoints: [
    {
      lat: -22.311742,
      lng: 46.544202,
      radius: 100,
      value: 2,
    },
  ],
  height: 500, // Remember to remove `pxPerDeg` and add `height`
  method: "shepards",
  kernel: "geoGaussian",
  crop: true,
  methodArgs: {
    kernel: "polynomial",
    kernelArgs: { epsilon: 0.005, degree: 3 },
  },
};

const fmc = {
  geoCoords: [
    {
      lat: -22.865522082592253,
      lng: -47.02332024971935,
      id: "ctlFtm1o1OuDgG9i58wx",
    },
    {
      id: "1w3zuN5kw6siJfUm0Y0X",
      lat: -22.865561625617033,
      lng: -47.023153952760424,
    },
    {
      id: "KLhg01U7YWLFj4e8dbzQ",
      lat: -22.865635768757492,
      lng: -47.02294474045726,
    },
    {
      lat: -22.865650597380714,
      lng: -47.02281599442455,
      id: "zmIL8YD0gn0U8iGYAeUU",
    },
    {
      id: "jX66LOFJk0UmKCDhslW8",
      lat: -22.86568519749531,
      lng: -47.022743574781146,
    },
    {
      lat: -22.865766754873402,
      id: "FnWByMp52zCJowwrxAAw",
      lng: -47.022665790719714,
    },
    {
      lat: -22.865853255069396,
      id: "gnnJeET1tPPuzbGJJYZq",
      lng: -47.022601417703356,
    },
    {
      id: "09ZC9IBjU7bPNCX1siWq",
      lng: -47.02254509131404,
      lat: -22.865947169505542,
    },
    {
      id: "jcusz2Khu70lEzz3YXXU",
      lat: -22.866031198156556,
      lng: -47.022528998059954,
    },
    {
      lat: -22.866102869611925,
      lng: -47.02251558701488,
      id: "gDRV52JcqqnEUXHL3sBh",
    },
    {
      lat: -22.8661745410295,
      lng: -47.02249949376079,
      id: "AFkG0L7rD7as8BVT9ZZN",
    },
    {
      lng: -47.02245926062557,
      id: "U6wvwekjL5rUvBuL4z8B",
      lat: -22.866273398095142,
    },
    {
      id: "IaPvVPJy8TS9BdPH1dbf",
      lat: -22.86639449790252,
      lng: -47.02253168026897,
    },
    {
      id: "rZJWBMYeoXkHcbj6pJ3P",
      lng: -47.02258800665828,
      lat: -22.866416740712552,
    },
    {
      lat: -22.866456283476946,
      lng: -47.0226631085107,
      id: "85dcXkT0ech592Lp0ELj",
    },
    {
      lng: -47.02268724839183,
      lat: -22.86650571191625,
      id: "v68QRM7VivZbVNjnGNmo",
    },
    {
      lat: -22.866557611758168,
      id: "gvRi32gk5qgtraJqe5mw",
      lng: -47.022765032453265,
    },
    {
      id: "kncHlEQdZLPTECbbp2sy",
      lng: -47.02279990117046,
      lat: -22.866579854541495,
    },
    {
      lat: -22.86656008317872,
      id: "xfvXeacaQAuwk5hAKWNb",
      lng: -47.02285086314174,
    },
    {
      lat: -22.86636731224087,
      id: "Al3zZWY9boU1XzBo4SpF",
      lng: -47.02291791836711,
    },
    {
      id: "XBdLniewQK2OySaTbGvK",
      lng: -47.0229152361581,
      lat: -22.866337655149223,
    },
    {
      lng: -47.02293937603923,
      lat: -22.86626351239181,
      id: "iFcJ6EfUesINEhDogC01",
    },
    {
      lng: -47.02295228602747,
      id: "yeDLCKWVXR1bWjPWe9HJ",
      lat: -22.866179945565747,
    },
    {
      id: "SqOPMezM4VegEP50u75D",
      lng: -47.02298715474466,
      lat: -22.86613051700791,
    },
    {
      lat: -22.866090974148698,
      lng: -47.023011294625796,
      id: "b9NQMbeZplROFRe5XQz1",
    },
    {
      lng: -47.02305689217905,
      lat: -22.866044016988447,
      id: "D5wLp0ko7uPnaT4fLywE",
    },
    {
      id: "bCyNKf82cnt2HXZ7mjmV",
      lng: -47.02311321856836,
      lat: -22.866011888395757,
    },
    {
      id: "GAdNbkl2QSVvjJN9hD2a",
      lng: -47.02318295600275,
      lat: -22.865974816933218,
    },
    {
      id: "MM4YqU3b59VG2BilcnCs",
      lng: -47.02332511308054,
      lat: -22.865942688324168,
    },
    {
      lat: -22.865942688324168,
      lng: -47.023378757260836,
      id: "B9AVzDQbuBAfEZYMcDoM",
    },
    {
      lat: -22.865932802596777,
      id: "9oKINUlPrjhxTgGMoPd2",
      lng: -47.023448494695224,
    },
    {
      lng: -47.0234806812034,
      id: "wkLn3lxHcyH9NZVCyz8W",
      lat: -22.865900673977784,
    },
    {
      id: "G8ydrP1XO4VxGI4tMoch",
      lat: -22.865858659618414,
      lng: -47.0234806812034,
    },
    {
      lat: -22.865754859380743,
      id: "TfDRBgad26e7HSsUNGaw",
      lng: -47.023515549920596,
    },
    {
      lat: -22.86569801635985,
      lng: -47.023510185502566,
      id: "gCqUBVZVXSA2HSkzccwb",
    },
    {
      lat: -22.86565600193781,
      lng: -47.02348336341242,
      id: "ISNYKkG6kf7EmFMUgLVx",
    },
    {
      lat: -22.865621401815787,
      id: "CX03TTsagm1kzGS2hpHt",
      lng: -47.02342971923212,
    },
    {
      id: "lQXwgDIVJstHXJ1ACTcV",
      lat: -22.865604101751465,
      lng: -47.02337339284281,
    },
    {
      lng: -47.02335729958872,
      id: "OxWkeS4ghlG3nyaY5pia",
      lat: -22.865534901472174,
    },
  ],
  geoPoints: [
    {
      lat: -22.865974,
      lng: -47.022887,
      radius: 50,
      value: 1,
    },
    {
      lat: -22.865874,
      lng: -47.022787,
      radius: 50,
      value: 0,
    },
    {
      lat: -22.865774,
      lng: -47.023287,
      radius: 50,
      value: 1,
    },
    {
      lat: -22.866274,
      lng: -47.022687,
      radius: 50,
      value: 0,
    },
  ],
  height: 500, // Remember to remove `pxPerDeg` and add `height`
  method: "shepards",
  kernel: "geoGaussian",
  crop: true,
  methodArgs: {
    kernel: "polynomial",
    kernelArgs: { epsilon: 0.035, degree: 2 },
  },
};

const radius = 100;
const height = 500;

// Update sigma
// const talhosoH = hm.drawGeoHeatmap(talhoso);
// fs.writeFileSync("talhosoMeters.png", talhosoH.buf);

const teste = {
  "colors": {
      "steps": 255,
      "values": [
          "#47ff47",
          "#00FF00",
          "#e0e000",
          "#FF0000"
      ],
      "weights": [
          2,
          3,
          3,
          2
      ]
  },
  "geoCoords": [
      {
          "lat": -13.737301596073172,
          "id": "6cm0C8pmmD98ylJvSjMi",
          "lng": -58.87535016671439
      },
      {
          "id": "7imxDsWg9cmrnWiOfOqv",
          "lng": -58.85922840723653,
          "lat": -13.735386545740523
      },
      {
          "id": "2Nc9owzFdzcZt1PUQZJq",
          "lng": -58.86298752399622,
          "lat": -13.72671290506177
      },
      {
          "id": "BKQzoVj59JRQA0xKm66u",
          "lng": -58.880312627836936,
          "lat": -13.728797367435883
      },
      {
          "lat": -13.729105259209414,
          "lng": -58.88131130408384,
          "id": "hKrf5NZkwzkDJhpBH6pU"
      }
  ],
  "geoPoints": [
      {
          "lat": -13.726838,
          "lng": -58.863105,
          "radius": 800,
          "value": 0.3
      },
      {
          "lat": -13.728163,
          "lng": -58.874338,
          "radius": 800,
          "value": 1
      },
      {
          "lat": -13.735307,
          "lng": -58.859371,
          "radius": 800,
          "value": 1
      }
  ],
  "height": 500,
  "method": "shepards",
  "kernel": "geoGaussian",
  "crop": true,
  "methodArgs": {
      "kernel": "polynomial",
      "kernelArgs": {
          "epsilon": 0.03,
          "degree": 2
      }
  }
}

const testH = hm.drawGeoHeatmap(teste)
// const fmcH = hm.drawGeoHeatmap(fmc);
// fs.writeFileSync("fmcMeters05.png", fmcH.buf);
// fs.writeFileSync("fmcMeters07.png", fmcH.buf);

