var express = require('express'),
    fs = require('fs'),
    qs = require('querystring'),
    PORT = process.env.PORT || 8888,
    app;

app = express.createServer(
    express.bodyParser(),
    express.static(__dirname + '/public'),
    express.cookieParser(),
    express.session({
        secret: 'edo',
        cookie: { httpOnly: false }
    })
);

app.configure(function () {
    
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
});

app.get('/', function (req, res) {
    
    res.render('index', {
        title: 'Post a image by canvas'
    });
});

app.post('/post', function (req, res) {

    var data = req.body.imageData,
        time = +new Date(),
        fileEx = data.match(/data:image\/(.*);base64,/)[1],
        imgData = new Buffer(data.replace(/data:image\/.*;base64,/g, ''), 'base64');

    fs.writeFile(__dirname + '/public/post-img/' + time + '.' + fileEx, imgData, function (err) {

        if (err) {
            console.log(err);
            return false;
        }

        res.end('saved!');
    });
    
    res.end(__dirname + '/public/post-img/' + 'test.' + fileEx);
});

//start listening.
app.listen(PORT, '192.168.10.239');

/**
 * Trap the error on `server.js`
 */
process.on('uncaughtException', function (err) {
    console.log('Caught exception: ' + err);
});

console.log('Running at 192.168.10.239');
