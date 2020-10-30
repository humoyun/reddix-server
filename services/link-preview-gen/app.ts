const linkPreviewGenerator = require("./index");

const previewData = await linkPreviewGenerator(
  "https://www.youtube.com/watch?v=8mqqY2Ji7_g"
);

console.log(previewData);
/*
{
  title: 'Kiteboarding: Stylish Backroll in 4 Sessions - Ride with Blake: Vlog 20',
  description: 'The backroll is a staple in your kiteboarding trick ' +
    'bag. With a few small adjustments, you can really ' +
    'improve your style and make this basic your own. ' +
    'Sessio...',
  domain: 'youtube.com',
  img: 'https://i.ytimg.com/vi/8mqqY2Ji7_g/hqdefault.jpg'
}
*/