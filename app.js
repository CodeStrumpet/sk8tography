
/**
 * Module dependencies.
 */

var http = require('http'),
  express = require('express'),
  db = require('./models/db.js').initialize(),
  routes = require('./routes'),
  api = require('./routes/api'),
  socket = require('./routes/socket.js'),
  streamS3 = require('./connect-stream-s3'),
  amazon = require('awssum').load('amazon/amazon');




////////////////////////////////////////////////////////////////////////////////////////////////////
// set up some middleware that we'll specifically use for certain paths
//IMPORTANT! YOU MUST PROVIDE THESE PROCESS VARIABLES. Do so with a .env file, with export command (via command line), or config variables from the production server (I like heroku)

var s3StreamMiddleware;
/*
var s3StreamMiddleware = streamS3({
    accessKeyId     : process.env.ACCESS_KEY_ID,
    secretAccessKey : process.env.SECRET_ACCESS_KEY,
    awsAccountId    : process.env.AWS_ACCOUNT_ID,
    region          : amazon.US_EAST_1,
    bucketName      : process.env.BUCKET_NAME,
    concurrency     : 2,
});
*/

// middleware to set the name of the single file upload to contain the date and time
var setS3ObjectName = function(req, res, next) {
    // firstly, check that the 'file' exists
    if ( req.files.file ) {
        //
        // Note:
        //
        // This is an example of where you may use the filename provided by the user. If for example they upload a file
        // which is named 'cat.png', then req.files.file.name will contain 'cat.png'. So that we don't overwrite an
        // existing file that they may have uploaded, we rename it to contain the date to seconds accuracy.
        //
        // This approach is pretty bad and there are better ways but it is here to document what you can do so that
        // connect-stream-s3 doesn't keep overwriting the same object in your bucket.
        //
        req.files.file.s3ObjectName = (new Date()).toISOString().substr(0, 19) + '-' + req.files.file.name;
    }
    // Else: no file, just ignore this for now. You may want to have checked that a file exists in some validation
    // middleware called prior to this one.

    // next middleware
    next();
};

var randomiseS3ObjectNames = function(req, res, next) {
    // Each file will be uploaded in the format 'username/xxxxxxxxx.ext' where:
    //
    // * username = their unique username you presumably get from their session
    // * xxxxxxxxx = a random set for digits (you could use letters too, but digits for ease of use here)
    // * ext = the original filename extension (if it exists)
    //
    // Note: whilst the chances of ObjectNames clashing with existing objects in your bucket are there, it is possible.
    // You may want to do something so that your ObjectNames are a primary key (stored somewhere) so that you can
    // easily check for existance.

    var m;
    var objectName;

    // loop through all of the uploaded files and assign a random name to them
    for(var key in req.files) {
        // basepath
        objectName = req.files[key].s3ObjectName = 'username/' + parseInt(Math.random() * 1000000000);

        // check for an extension
        m = req.files[key].name.match(/\.(\w+)$/);
        if ( m ) {
            objectName += '.' + m[1];
        }

        // set the s3ObjectName to this created objectName
        req.files[key].s3ObjectName = objectName;
    }
    next();
}

// ----------------------------------------------------------------------------

////////////////////////////////////////////////////////////////////////////////////////////////////

var app = module.exports = express.createServer();


// Hook Socket.io into Express
var io = require('socket.io').listen(app);

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', {
    layout: false
  });
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use('/videos', express.static(__dirname + '/videos'));
  app.use(express.static(__dirname + '/public'));
  app.use(app.router);
});


app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);
app.get('/partials/:name', routes.partials);

// JSON API

app.put('/api/addVideo', api.addVideo);
app.put('/api/processVideo', api.processVideo);
app.get('/api/videos', api.videos);
app.get('/api/clips', api.clips);

// ========================================
app.get('/api/posts', api.posts);
app.get('/api/post/:id', api.post);
app.post('/api/post', api.addPost);
app.put('/api/post/:id', api.editPost);
app.delete('/api/post/:id', api.deletePost);


///////////////////////////////////////////////////////////////////////////////////////////

app.post('/single-file', setS3ObjectName, s3StreamMiddleware, function(req, res, next) {
    console.log('Single file uploaded as : ' + req.files.file.s3ObjectName);
});

app.post('/multiple-files', randomiseS3ObjectNames, s3StreamMiddleware, function(req, res, next) {
    for(var key in req.files) {
        console.log('File "' + key + '" uploaded as : ' + req.files[key].s3ObjectName);
    }
});


// redirect all others to the index (HTML5 history)
app.get('*', routes.index);

// Start server
var awsKey = process.env.S3_KEY;
var mongolabKey = process.env.MLAB_KEY;

var port = process.env.PORT || 3000;
var ipaddr = process.env.IP;

// Socket.io Communication
io.sockets.on('connection', socket);

app.listen(port, ipaddr, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
