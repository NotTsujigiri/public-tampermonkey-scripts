const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
http.createServer((req,res) => {
 const name = req.url === '/' ? 'test.html' : req.url.slice(1);
 if (!['test.html','test.js','youtube-rotate.user.js'].includes(name)) {res.writeHead(404).end(); return;}
 res.setHeader('Content-Type',name.endsWith('.html')?'text/html; charset=utf-8':'text/javascript; charset=utf-8');
 res.end(fs.readFileSync(path.join(__dirname,name)));
}).listen(8766,'127.0.0.1');
