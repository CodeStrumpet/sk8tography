
toTitleCase = function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};


exports.importTricks = function() {

  var mongoose = require('mongoose');
  var TrickType = mongoose.model("TrickType");

  // read file
  var fs = require('fs');
  var filename = __dirname + "/../../videos/trick_options.xml";

  fs.readFile(filename, 'utf8', function(err, data) {
    if (err) {
      throw err;
    }    
    
    console.log("data length: " + data.length);    

    var parseString = require('xml2js').parseString;  

    parseString(data, function (err, result) {
      console.log("error: " + err);

      var trickTypes = result.options.option;

      for (var i = 0; i < trickTypes.length; i++) {
        var tType = trickTypes[i];
        var name = tType['_'];
        var url = "http://theberrics.com/" + tType['$'].value;        

        // remove HD
        if (name.substr(name.length - 2) == 'HD') {
          // skip...
          // name = name.substring(0, name.length - 2);
        } else {
          // change the name to title case
          name = toTitleCase(name);

          // create new trick type
          var newTrickType = new TrickType({
            name: name           
          });
          newTrickType.infoUrls.push(url);

          newTrickType.save(function (saveErr) {
            if (saveErr) {
              console.log("saveErr: " + saveErr);              
            }
          });  
        }        
      }
    });
  });
};

