var url = require('url'),
    http = require('http'),
    fs = require('fs'),
    qs = require('querystring');

http.createServer(function (req, res) {
   
    var body = '';

    if(req.method === 'POST') {
            console.log(req.method);

            req.on('data', function (data) {

                body += data;
            });
            req.on('end', function () {
            
                var POST = qs.parse(body),
                    fileEx = POST.img.match(/data:image\/(.*);base64,/)[1],
                    imgData = new Buffer(POST.img.replace(/data:image\/.*;base64,/g, ''), 'base64');

                fs.writeFile('test.' + fileEx, imgData, function (err) {

                    if (err) {
                        console.log(err);
                        return false;
                    }

                    console.log('saved!');
                });

                res.end('edo');
            });
   }
   else if(req.method=='GET') {

       if (req.url === '/') {
           fs.readFile('index.html', 'utf-8', function (err, data) {
               res.end(data);
           });
       }
       else {
           fs.readFile('samp.jpg', function (err, data) {
           
               res.end(data);
           });
       }
   }
   

}).listen(8882, '192.168.10.239');
