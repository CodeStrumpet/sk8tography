
var consts = require('../public/js/SharedConstants').Constantsinople;

exports.importVideo = function(video) {

  var importError = false;

	console.log("importing video: " + video.url);

  var vidSource = exports.videoSource(video.url);

  video.source = vidSource;

  if (vidSource == consts.VideoSource.UNKNOWN) {
    console.log("Invalid video");
    video.status = consts.VideoStatus.INVALID;
  } else {
    video.status = consts.VideoStatus.ACQUIRING_INFO;
  }

  video.save(function (err) {
    if (err) {
      // TODO handle error or fail silently
      return;      
    }

    if (video.status == consts.VideoStatus.INVALID) {
      return;
    }

    // use source service api to get info about the video
    var infoURL = exports.videoInfoURL(video);

    if (infoURL == null) {
      // TODO handle error or fail silently
      return;
    }

    // get info for video
    var http = require('http');
    var parsedURL = require('url').parse(infoURL);
    var options = {
      host: parsedURL.host,
      path: parsedURL.path
    };

    callback = function(response) {
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
          console.log("import error");
          importError = true;
          video.status = consts.VideoStatus.INVALID;
        }          

        // save video, and if successful kick off download
        video.save(function (err) {
          if (err) {
            // TODO handle error or fail silently
            return;      
          }

          if (!importError) {
            // kick off video download
            exports.downloadVideo(video);
          }

        });
      });
    }

    http.request(options, callback).end();

  });
};

exports.downloadVideo = function(video) {

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
      video.status = consts.VideoStatus.IMPORTING;
    } else {
      video.status = consts.VideoStatus.INVALID;
    }

    // save video, and if successful kick off download
    video.save(function (err) {
      if (err) {
        // TODO handle error or fail silently
        return;      
      }

      if (video.status == consts.VideoStatus.IMPORTING) {
        console.log("would kick of ffmprobe here...");
        // kick of ffmprobe...

      }

    });

  });

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
    infoURL = "http://gdata.youtube.com/feeds/api/videos/" + video.sourceId() + "?v=2&alt=jsonc";
  }

  return infoURL;
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



/*
  var spawn = require('child_process').spawn,
      longCommand = spawn( "sleep", ["4"]);

  longCommand.stdout.on('data', function (data) {
    console.log('stdout: ' + data);
  });

  longCommand.stderr.on('data', function (data) {
    console.log('stderr: ' + data);
  });

  longCommand.on('exit', function (code) {
    console.log('Child process exited with exit code ' + code);
  });
	*/
