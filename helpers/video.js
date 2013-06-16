
var consts = require('../public/js/SharedConstants').Constantsinople;

exports.importVideo = function(video) {

  require('async').series({

    getVideoSource : function(callback) {
      var err = null;
      var vidSource = exports.videoSource(video.url);
      video.source = vidSource;

      // set video status based on source
      if (vidSource == consts.VideoSource.UNKNOWN) {
        video.status = consts.VideoStatus.INVALID;
      } else {
        video.status = consts.VideoStatus.ACQUIRING_INFO;
      }

      video.save(function (saveErr) {
        if (saveErr) {
          err = "error saving video";
        }        

        if (video.status == consts.VideoStatus.INVALID) {
          err = "invalid video";
        }

        callback(err, null);
      });    
    },

    getVideoInfo : function(callback) {
      var err = null;

      // use source service api to get info about the video
      var infoURL = exports.videoInfoURL(video);

      if (infoURL == null) {
        err = "could not construct info url";
      }

      // get info for video
      var http = require('http');
      var parsedURL = require('url').parse(infoURL);
      var options = {
        host: parsedURL.host,
        path: parsedURL.path
      };

      http.request(options, function(response) {
        var str = '';

        //another chunk of data has been recieved, so append it to `str`
        response.on('data', function (chunk) {
          str += chunk;
        });

        //the whole response has been recieved, so we just print it out here
        response.on('end', function () {

          var info = JSON.parse(str);
           
          // try add our new info to video
          if (exports.populateVideoInfo(video, info)) {
            video.status = consts.VideoStatus.DOWNLOADING;
          } else {
            err = "import error";
            video.status = consts.VideoStatus.INVALID;
          }

          video.save(function (saveErr) {
            if (saveErr) {
              err = "error saving video";
            }

            callback(err, null);
          });
        });
      }).end();

    },

    downloadVideo : function(callback) {

      // check if we have the file in the video cache... (for debugging)
      fs = require('fs');
      var cachePath = "./children/shotsplitter.py";
      if (fs.existsSync(cachePath)) {
        // copy the video from the cache
        exports.copyVideoFromCache(video, callback);
      } else {
        // get the video from the web
        exports.downloadVideo(video, callback);  
      }      
    },

    processVideo : function(callback) {
      console.log("Processing video...");
      exports.processVideo(video, callback);
    }
  },

  // final callback
  function(err, results) {
    if (err) {
      console.log("Err:  " + err);
    } else {
      console.log("Finished video import");
    }

  });
};

exports.downloadVideo = function(video, callback) {
  var err = null;
	var spawn = require('child_process').spawn,
    youtubedl = spawn( "youtube-dl", ["-o", "videos/" + video.fileName(), video.url]);

  youtubedl.stdout.on('data', function (data) {
    var buff = new Buffer(data);
    console.log("more data: " + buff.toString('utf8'));
  });

  youtubedl.stderr.on('data', function (data) {
    console.log('stdout: ' + data);
  });

  youtubedl.on('exit', function (code) {

    console.log('Child process exited with exit code ' + code);

    if (code == 0) {
      video.status = consts.VideoStatus.PROCESSING;
    } else {
      video.status = consts.VideoStatus.INVALID;
    }

    // save video, and if successful kick off download
    video.save(function (saveErr) {
      if (saveErr) {
        err = "error saving";
      }

      if (video.status == consts.VideoStatus.INVALID) {
        err = "Video is invalid";
      }

      // call callback function that was passed in
      callback(err, null);
    });
  });
};

exports.copyVideoFromCache = function(video, callback) {

  console.log("copying video from cache");

  var source = "./videocache/" + video.fileName();
  var target = "./videos/" + video.fileName();

  var cbCalled = false;

  var rd = fs.createReadStream(source);
  rd.on("error", function(err) {
    done(err);
  });
  var wr = fs.createWriteStream(target);
  wr.on("error", function(err) {
    done(err);
  });
  wr.on("close", function(ex) {
    done(null);
  });
  rd.pipe(wr);

  function done(err) {
    if (!cbCalled) {
      callback(err, null);
      cbCalled = true;
    }
  }
};

exports.processVideo = function(video, callback) {

  
  var err = null;
  var buffer = null;
  console.log(__dirname);
  var spawn = require('child_process').spawn,
    shotsplitter = spawn(__dirname + "/../children/shotsplitter.py", ["-input", __dirname + "/../videos/" + video.fileName(), "-output", __dirname + "/../videos"]);

  shotsplitter.stdout.on('data', function (data) {
    buffer = new Buffer(data);
    //console.log("data returned: " + buffer.toString('utf8'));
  });

  shotsplitter.stderr.on('data', function (data) {
    //console.log('stdout: ' + data);
    //err = data;
  });

  shotsplitter.on('exit', function (code) {

    if (code == 0 && buffer != null) {
      
      // call separate create clips function
      exports.createClips(video, callback, JSON.parse(buffer.toString('utf8')));
      return;

    } else {
      err = "shotsplitter failed with code: " + code;
    }

    callback(err, null);
  });
  
};

exports.createClips = function(video, callback, timestamps) {
  console.log("creating clips for timestamps: " + JSON.stringify(timestamps));
  callback(null, null);
};

exports.populateVideoInfo = function (video, videoInfo) {

  if (typeof videoInfo.data != 'undefined') {
    video.sourceTitle = videoInfo.data.title;
    video.sourceDesc = videoInfo.data.description;
    video.sourceSquareThumb = videoInfo.data.thumbnail.sqDefault;
    video.sourceLargeThumb = videoInfo.data.thumbnail.hqDefault;
    video.sourceDuration = videoInfo.data.duration;
    video.sourceViewCount = videoInfo.data.viewCount;
    video.sourceUploader = videoInfo.data.uploader;

    return true;

  } 

  return false;
};

exports.videoInfoURL = function (video) {
  ////https://gdata.youtube.com/feeds/api/videos/s0Nbkxy7E48?v=2&alt=json
  var infoURL = null;
  if (video.source == consts.VideoSource.YOUTUBE) {
    infoURL = "http://gdata.youtube.com/feeds/api/videos/" + video._id + "?v=2&alt=jsonc";
  }

  return infoURL;
};

exports.videoSourceId = function(url) {

  var source = exports.videoSource(url);

  var urlParse = require('url');
  var parsedURL = urlParse.parse(url, true);
  
  if (source == consts.VideoSource.YOUTUBE) {
    return parsedURL.query.v;
  } else if (source == consts.VideoSource.VIMEO) {
    var pathArray = parsedURL.pathName.split('/');
    return pathArray[0];
  } else {
    return null;
  }
}


exports.videoSource = function (url) {
  var urlParse = require('url');
  var parsedURL = urlParse.parse(url, true);

  if (parsedURL.host.indexOf("youtube") != -1) {
    return consts.VideoSource.YOUTUBE;
  } else if (parsedURL.host.indexOf("vimeo") != -1) {
    return consts.VideoSource.VIMEO;
  } else {
    return consts.VideoSource.UNKNOWN;
  }
};

