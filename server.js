const http=require('http');
const fs=require('fs');
const path=require('path');

const root=__dirname;
const port=process.env.PORT||3000;
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml; charset=utf-8'};

http.createServer((req,res)=>{
  const parsed=new URL(req.url,'http://localhost');
  let url;
  try{
    url=decodeURIComponent(parsed.pathname);
  }catch{
    res.writeHead(400,{'Content-Type':'text/plain; charset=utf-8'});
    return res.end('Bad request');
  }
  if(url==='/health'){
    res.writeHead(200,{'Content-Type':'text/plain'});
    return res.end('ok');
  }

  if(url==='/panels'||url==='/panels.html'){
    res.writeHead(301,{Location:`/panel${parsed.search}`});
    return res.end();
  }

  if(url==='/index.html'||url==='/index'){
    res.writeHead(301,{Location:`/${parsed.search}`});
    return res.end();
  }

  if(url.endsWith('.html')){
    res.writeHead(301,{Location:`${url.slice(0,-5)}${parsed.search}`});
    return res.end();
  }

  if(url.length>1&&url.endsWith('/')){
    res.writeHead(301,{Location:`${url.slice(0,-1)}${parsed.search}`});
    return res.end();
  }

  if(url==='/'||url==='')url='/index.html';
  let file=path.normalize(path.join(root,url));
  if(!file.startsWith(root)){
    res.writeHead(403);
    return res.end('Forbidden');
  }
  if(!path.extname(file))file+='.html';

  fs.readFile(file,(err,data)=>{
    if(err){
      return fs.readFile(path.join(root,'404.html'),(notFoundError,notFoundPage)=>{
        res.writeHead(404,{
          'Content-Type':'text/html; charset=utf-8',
          'X-Content-Type-Options':'nosniff',
          'X-Frame-Options':'SAMEORIGIN',
          'Referrer-Policy':'strict-origin-when-cross-origin',
          'Cache-Control':'no-cache'
        });
        if(notFoundError)return res.end('<h1>404</h1><p>Page not found.</p>');
        res.end(notFoundPage);
      });
    }
    const ext=path.extname(file);
    const cache=ext==='.html'?'no-cache':'public, max-age=86400';
    res.writeHead(200,{'Content-Type':types[ext]||'application/octet-stream','X-Content-Type-Options':'nosniff','X-Frame-Options':'SAMEORIGIN','Referrer-Policy':'strict-origin-when-cross-origin','Cache-Control':cache});
    res.end(data);
  });
}).listen(port,()=>console.log(`OTTDistributor running on port ${port}`));
