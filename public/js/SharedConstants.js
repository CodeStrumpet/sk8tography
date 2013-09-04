
var scope = typeof exports != 'undefined' ? exports : window;

scope.Constantsinople = {};

scope.Constantsinople.ObjType = {
	BRAND : "BRAND",
	CLIP : "CLIP",
	FEEDBACK : "FEEDBACK",
	SKATER : "SKATER",
	SPOT : "SPOT",
	TAG : "TAG",
	TRICK : "TRICK",
	TRICK_TYPE : "TRICK_TYPE",
	USER : "USER",
	USER_EDIT : "USER_EDIT",
	VIDEO : "VIDEO",
	VIDEO_SEGMENT : "VIDEO_SEGMENT"
};

scope.Constantsinople.Stance = {
	UNKNOWN : 0x0,
	NATURAL : 0x1,
	NOLLIE : 0x2,
	SWITCH : 0x4,
	FAKIE : 0x8
};

scope.Constantsinople.TerrainType = {
	UNKNOWN : 0x0,
	FLATGROUND : 0x1,
	BANK : 0x2,
	LEDGE : 0x4,
	STAIRS : 0x8,
	RAIL : 0x10,
	GAP : 0x20,
	QUARTERPIPE : 0x40,
	MINIRAMP : 0x80,
	HALFPIPE : 0x100,
	LAUNCHRAMP : 0x200
};

// from wikipedia
scope.Constantsinople.TrickCategory = {
	UNKNOWN : 0x0,
	OLLIE : 0x1,
	AERIAL : 0x2,
	FLIPTRICK : 0x4,
	FREESTYLE : 0x8,
	SLIDE : 0x10,
	GRIND : 0x20,
	LIPTRICK : 0x40
};

// Field Names

scope.Constantsinople.fields = {
	SKATER : "skater",
	VIDEO_NAME : "videoName",
	YEAR : "year",
	COMPANY : "company"
};

// Clips

scope.Constantsinople.ClipStatus = {
	ADDED : 0,
	TAGGED : 1,
	REMOVED : 2
};

// Video

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