var express = require('express'),
    im = require('imagemagick'),
    fs = require('fs'),
    PORT = process.env.PORT || 9500,
    app;

/////////////////////////////////////////////////////////

/**
 * Chain callbacks.
 * @param {Function[]} [No arguments name] Call function objects as chain method.
 * @return undefined
 * @example
 *   chain(function (next) {... next(); }, function (next) {... next(); }, function (next) {... next(); }...);
 *       -> next is callback.
 */
function chain() {

    var actors = Array.prototype.slice.call(arguments);

    function next() {

        var actor = actors.shift(),
            arg = Array.prototype.slice.call(arguments);

        //push `next` method to argumetns to last.
        arg.push(next);

        //when `actor` is function, call it.
        (Object.prototype.toString.call(actor) === '[object Function]') && actor.apply(actor, arg);
    }

    next();
}

///////////////////////////////////////////////////////////

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

//when be accessed to document root.
app.get('/', function (req, res) {
    
    res.render('index', {
        title: 'Post a image by canvas'
    });
});

//when be accessed to '/viewer'.
app.get('/viewer', function (req, res) {

    var files = fs.readdirSync(__dirname + '/public/post-img');

    res.render('viewer', {
        title: 'Posted images viewer',
        files: files
    });
});

app.post('/post', function (req, res) {

    var data = req.body.imageData,
        time = +new Date(),
        fileEx = data.match(/data:image\/(.*);base64,/)[1],
        imgData = new Buffer(data.replace(/data:image\/.*;base64,/g, ''), 'base64'),
        filePath = __dirname + '/public/post-img/' + time,
        tmpFilePath = __dirname + '/temp/' + time;

    if (fileEx === 'bmp') {
        chain(
            function (next) {

                fs.writeFile(tmpFilePath + '.bmp', imgData, next);
            },
            function (err, next) {
            
                im.convert([tmpFilePath + '.bmp', filePath + '.png'], function (err, metaData) {

                    if (err) {
                        throw err;
                    }
                });
            }
        );
    }
    else {
        fs.writeFile(filePath + '.' + fileEx, imgData, function (err) {

            if (err) {
                throw err;
            }
        });
    }
    
    res.end('post to avairrable');
});

//start listening.
app.listen(PORT);

/**
 * Trap the error on `server.js`
 */
process.on('uncaughtException', function (err) {
    console.log('Caught exception: ' + err);
});

console.log('Running');
