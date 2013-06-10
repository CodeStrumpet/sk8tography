
var scope = typeof exports != 'undefined' ? exports : window;

scope.Constantsinople = {};

scope.Constantsinople.VideoStatus = {	
	UNKNOWN : 0,
	DOWNLOADING : 1,
	IMPORTING : 2,
	AVAILABLE : 3
};


scope.Constantsinople.VideoSource = {
	YOUTUBE : 0,
	VIMEO : 1
};

scope.Constantsinople.VideoFileFormat = {
	MP4 : 0,
	FLV : 1
};


scope.Constantsinople.videoFileFormatString = function(format) {
	switch (format) {
		case scope.Constantsinople.VideoFileFormat.MP4:
			return "mp4";
			break;
		case scope.Constantsinople.VideoFileFormat.FLV:
			return "flv";
			break;
		default:
			return "?????";
	}
}


scope.Constantsinople.hashCode = function(s){
  return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);              
}