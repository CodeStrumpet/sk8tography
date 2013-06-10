


exports.importVideo = function(url) {
	console.log("importing video: " + url);

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

	/*
	var spawn = require('child_process').spawn,

    youtubedl = spawn( "youtube-dl", ["-o", "videos/file.mp4", "http://www.youtube.com/watch?v=u5aLtRr3_38"]);

    youtubedl.stdout.on('data', function (data) {
      console.log('stdout: ' + data);
    });

    youtubedl.stderr.on('data', function (data) {
      console.log('stderr: ' + data);
    });
	*/
};
