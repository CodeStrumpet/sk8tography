
var consts = require('../public/js/SharedConstants').Constantsinople;
var mongoose = require('mongoose');
var Clip = mongoose.model("Clip");

exports.importVideoSegment = function(videoSegment, socketSessionId) {

  require('async').series({

    getSource : function(callback) {
      var err = null;
      var vidSource = exports.videoSource(videoSegment.url);
      videoSegment.source = vidSource;

      // set videoSegment status based on source
      if (vidSource == consts.VideoSource.UNKNOWN) {
        videoSegment.status = consts.VideoStatus.INVALID;
      } else {
        videoSegment.status = consts.VideoStatus.ACQUIRING_INFO;
      }

      videoSegment.save(function (saveErr) {
        if (saveErr) {
          err = "error saving video";
        }        

        if (videoSegment.status == consts.VideoStatus.INVALID) {
          err = "invalid video";
        }

        callback(err, null);
      });    
    },

    getInfo : function(callback) {
      var err = null;

      // use source service api to get info about the videoSegment
      var infoURL = exports.videoInfoURL(videoSegment);

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
          if (exports.populateVideoSegmentInfo(videoSegment, info)) {
            videoSegment.status = consts.VideoStatus.DOWNLOADING;
          } else {
            err = "import error";
            videoSegment.status = consts.VideoStatus.INVALID;
          }

          videoSegment.saveWithBroadcast(function (saveErr) {
            if (saveErr) {
              err = "error saving video";
            }

            callback(err, null);
          });
        });
      }).end();

    },

    downloadSegment : function(callback) {

      // check if we have the file in the video cache... (for debugging)
      fs = require('fs');
      var cachePath = "./videos/" + videoSegment.fileName();
      if (fs.existsSync(cachePath)) {
        // copy the video from the cache
        exports.copyVideoSegmentFromCache(videoSegment, callback);
      } else {
        // get the video from the web
        exports.downloadVideoSegment(videoSegment, callback, socketSessionId);
      }      
    },

    processSegment : function(callback) {
      console.log("Processing video...");
      exports.processVideoSegment(videoSegment, callback);
    }
  },

  // final callback
  function(err, results) {
    if (err) {
      console.log("Err:  " + err);
    } else {
      console.log("Finished videoSegment import");
    }

  });
};

exports.downloadVideoSegment = function(videoSegment, callback, socketSessionId) {
  var err = null;

  var sockets = require('../routes/modules').sockets;

	var spawn = require('child_process').spawn,
    youtubedl = spawn( "youtube-dl", ["-o", "videos/" + videoSegment.fileName(), videoSegment.url]);

  youtubedl.stdout.on('data', function (data) {
    var buff = new Buffer(data);
    var dataString = buff.toString('utf8');
    //console.log(dataString);


    if (dataString.length > 18) {
      var sliceString = dataString.slice(12, 18);
      var percentIndex = sliceString.indexOf("%");
      // check if percent exists
      if (percentIndex != -1) {
        sliceString = sliceString.replace('%','');
        sliceString = sliceString.replace(' ','');

        var components = dataString.split(' ');
        var lastComponent = "";
        if (components.length > 1) {
          lastComponent = components[components.length - 1];
        }

        console.log("percent complete: " + sliceString);

        if (socketSessionId) {
          sockets.socket(socketSessionId).emit("videoDownloadStatus", {
            percentComplete: sliceString,
            timeRemaining: lastComponent,
            videoSegmentId : videoSegment._id
          });
        }

      }
    }

    var components = dataString.split(' ');
    //console.log("components length: " + components.length);
    if (components.length > 1) {
      //console.log("last component: " + components[components.length - 1] + "  components length: " + components.length);
    }

    //console.log("more data: " + buff.toString('utf8'));
  });

  youtubedl.stderr.on('data', function (data) {
    console.log('stdout: ' + data);
  });

  youtubedl.on('exit', function (code) {

    console.log('Child process exited with exit code ' + code);

    if (code == 0) {
      videoSegment.status = consts.VideoStatus.PROCESSING;
    } else {
      videoSegment.status = consts.VideoStatus.INVALID;
    }

    // save video, and if successful kick off download
    videoSegment.saveWithBroadcast(function (saveErr) {
      if (saveErr) {
        err = "error saving";
      }

      if (videoSegment.status == consts.VideoStatus.INVALID) {
        err = "Video is invalid";
      }

      // call callback function that was passed in
      callback(err, null);
    });
  });
};

exports.copyVideoSegmentFromCache = function(videoSegment, callback) {

  console.log("copying videoSegment from cache");

  var source = "./videocache/" + videoSegment.fileName();
  var target = "./videos/" + videoSegment.fileName();

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

exports.processVideoSegment = function(videoSegment, callback) {

  
  // use async waterfall control flow to pass result of one operation to the next...
  require('async').waterfall([

    function(waterfallCallback) { // analyze and split
      var err = null;
      var buffers = [];      
      var command = __dirname + "/../children/shotsplitter.py" + " -input " + __dirname + "/../videos/" + videoSegment.fileName() + " -output " +  __dirname + "/../videos";

      console.log("shotsplitter command: " + command);

      var spawn = require('child_process').spawn,
        shotsplitter = spawn(__dirname + "/../children/shotsplitter.py", ["-input", __dirname + "/../videos/" + videoSegment.fileName(), "-output", __dirname + "/../videos"]);

      shotsplitter.stdout.on('data', function (data) {
        var buffer = null;
        buffer = new Buffer(data);
        buffers.push(buffer);
        console.log("data returned: " + buffer.toString('utf8'));
      });

      shotsplitter.stderr.on('data', function (data) {
        //console.log('stderr: ' + data);
        //err = data;
      });

      shotsplitter.on('exit', function (code) {

        if (code == 0 && buffers.length > 0) {

          var buffer = Buffer.concat(buffers);

          console.log("buffer: " + buffer.toString('utf8'));



          var fs = require('fs');
          fs.writeFile("/../videos/" + videoSegment._id + "_times.json", buffer.toString('utf8'), function(err) {
            if (err) {
              console.log("error writing times to fs: " + err);
            } else {
              console.log("Times file saved to fs!");
            }
          });

          var result;
          try {
            result = JSON.parse(buffer.toString('utf8'));
          } catch (e) {
            console.log("meltdown parsing timing buffer: " + JSON.stringify(e));
          }

          // catch error passed back in valid json
          if (result.error || !result.timestamps) {
            err = result.error;
            callback(err, null);
            return;
          }

          // call separate create clips function
          exports.createClips(videoSegment, waterfallCallback, result);
          return;

        } else {
          err = "shotsplitter failed with code: " + code;
        }

        waterfallCallback(err, null);
      });
    },

    function(results, waterfallCallback) { // create thumbnails
      var err = null;
      console.log("create thumbs waterfall method. num results: " + results.length);

      var parallelFunctions = [];

      // add a create thumbnail function for each clip to the parallelFunctions array
      results.forEach(function(clipArray) {

        parallelFunctions.push(function(parallelCallback) {

          if (clipArray.length >= 1) {
            var clip = clipArray[0];

            // call the function that creates the thumb
            exports.addThumbnailToClip(clip, parallelCallback);

          } else {
            parallelCallback("no clip provided to thumbnail function", null);
          }
        });
      }); 

      // make async parallel call
      require('async').parallel(parallelFunctions, function(err, parallelResults) {
        waterfallCallback(err, parallelResults);
      });
    }
  ], 
  function (err, result) {

    // update status and save the videoSegment if there wasn't an error
    if (!err) {
      videoSegment.status = consts.VideoStatus.COMPLETE;
    } else {
      videoSegment.status = consts.VideoStatus.INVALID;
    }

    videoSegment.saveWithBroadcast(function(saveError) {

      if (saveError) {
        console.log("error upon saving the videoSegment: " + JSON.stringify(saveError));
      }

      // call the main callback that was passed into the function
      callback(err, result);
    });
  });
};

exports.addThumbnailToClip = function(clip, callback, timemark) {
  var ffmpeg = require('fluent-ffmpeg');

  // if no time is passed in, we use the middle of the clip
  var time = timemark;
  if (typeof variable ==='undefined') {
    time = clip.duration / 2;
  }
  // format the time
  time = time.toFixed(2);

  var outFileName = clip.fileName().slice(0, -4);
  outFileName = outFileName + "_thumb_" + time;

  var proc = new ffmpeg({ source: __dirname + '/../videos/' + clip.fileName(), nolog: true })
  // set the size of your thumbnails
  .withSize('?x200')
  // take 2 screenshots at predefined timemarks
  .takeScreenshots({ 
    count: 1, 
    timemarks: [ time.toString()],
    filename: outFileName
  }, __dirname + '/../images/', function(err, filenames) {

    if (err) {
      // we don't want to quit if there is an error
      console.log("ignored thumb error: " + err);
      callback(null, clip);
    } else {
      //var outFileName = filenames[0];
      clip.thumbFileName = outFileName + ".jpg";

      clip.save(function (saveErr) {
        if (saveErr) {
          console.log("error saving thumb filename to clip");
        }        

        callback(null, clip);
      });
    }            
  });
};

exports.createClips = function(videoSegment, callback, timestamps) {
  console.log("creating clips for timestamps: " + JSON.stringify(timestamps));

  var fs = require('fs');

  var index = 0;

  var saveClips = [];



  timestamps.timestamps.forEach(function(clipInfo) {    

    console.log("create clip: " + clipInfo.name);

    // make sure video file exists
    var clipPath = "./videos/" + clipInfo.name;

    if (!fs.existsSync(clipPath)) {
      console.log("clip file not on fs: " + clipInfo.name);
      return;
    }

    var clipDuration = clipInfo.duration;
    // handle the last clip
    if (clipDuration == -1) {
      clipDuration = videoSegment.sourceDuration - clipInfo.start;
    }

    if (clipDuration > 1.5) {
      var clip = new Clip({
        videoSegmentId : videoSegment._id,
        index : index,
        fileFormat : videoSegment.fileFormat,
        startTime : clipInfo.start,
        duration : cclipDuration
      });

      // set the skaterRef if it's present in videoSegment extra info
      var skaterRef = videoSegment.extraInfo.skaterRef;
      if (skaterRef) {
        clip.skaterRef = skaterRef;
      }

      // add save function to array so we can execute saves in parallel
      saveClips.push((function(doc) {
        return function(callback) {
          doc.save(callback);
        };
      })(clip));
    }

    index++;
  });

  require('async').parallel(saveClips, function(err, results) {
    console.log(err);
    callback(err, results);
  });
};

exports.populateVideoSegmentInfo = function (videoSegment, videoInfo) {

  if (typeof videoInfo.data != 'undefined') {
    videoSegment.sourceTitle = videoInfo.data.title;
    videoSegment.sourceDesc = videoInfo.data.description;
    videoSegment.sourceSquareThumb = videoInfo.data.thumbnail.sqDefault;
    videoSegment.sourceLargeThumb = videoInfo.data.thumbnail.hqDefault;
    videoSegment.sourceDuration = videoInfo.data.duration;
    videoSegment.sourceViewCount = videoInfo.data.viewCount;
    videoSegment.sourceUploader = videoInfo.data.uploader;

    return true;

  } 

  return false;
};

exports.videoInfoURL = function (videoSegment) {
  ////https://gdata.youtube.com/feeds/api/videos/s0Nbkxy7E48?v=2&alt=json
  var infoURL = null;
  if (videoSegment.source == consts.VideoSource.YOUTUBE) {
    infoURL = "http://gdata.youtube.com/feeds/api/videos/" + videoSegment._id + "?v=2&alt=jsonc";
  }

  return infoURL;
};

exports.videoSegmentSourceId = function(url) {

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

