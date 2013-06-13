
var scope = typeof exports != 'undefined' ? exports : window;

scope.Constantsinople = {};

scope.Constantsinople.VideoStatus = {	
	INVALID : 0,
	ADDED : 1,
	ACQUIRING_INFO : 2,
	DOWNLOADING : 3,
	PROCESSING : 4,
	COMPLETE : 5
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


scope.Constantsinople.errorObj = function(errCode, errMsg) {
	var err = {
		code : errCode,
		msg : errMsg
	};

	return err;
};

scope.Constantsinople.ErrorCodes = {
	UNKNOWN : 0
};