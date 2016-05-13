const http         = require('http'),
      fs           = require('fs'),
      path         = require('path'),
      contentTypes = require('./utils/content-types'),
      sysInfo      = require('./utils/sys-info'),
      env          = process.env,
      quotes       = require('./data/quotes.json');

let server = http.createServer(function (req, res) {
  let url = req.url;
  if (url == '/') {
    url += 'index.html';
  }

  // IMPORTANT: Your application HAS to respond to GET /health with status 200
  //            for OpenShift health monitoring

  if (url == '/quote') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store');
    res.end(JSON.stringify(quotes[Math.floor(Math.random() * quotes.length)]));
  } else if (url.indexOf('/quote/') == 0) {
    var character = url.split('/quote/')[1];
    var charArray = quotes.filter(function(quote) {
        return quote.character.toUpperCase() === character.toUpperCase()
    });
    if(charArray.length === 0) {
      res.writeHead(404);
      res.end("No quote found");
    }
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store');
    res.end(JSON.stringify(charArray[Math.floor(Math.random() * charArray.length)]));
  } else if (url == '/health') {
    res.writeHead(200);
    res.end();
  } else if (url.indexOf('/info/') == 0) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache, no-store');
    res.end(JSON.stringify(sysInfo[url.slice(6)]()));
  } else {
    fs.readFile('./static' + url, function (err, data) {
      if (err) {
        res.writeHead(404);
        res.end();
      } else {
        let ext = path.extname(url).slice(1);
        res.setHeader('Content-Type', contentTypes[ext]);
        if (ext === 'html') {
          res.setHeader('Cache-Control', 'no-cache, no-store');
        }
        res.end(data);
      }
    });
  }
});

server.listen(env.NODE_PORT || 3000, env.NODE_IP || 'localhost', function () {
  console.log(`Application worker ${process.pid} started...`);
});
