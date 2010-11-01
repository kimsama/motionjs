var backbone = require("backbone");

exports.extend = function(obj) {

  obj.sync = obj.sync || function(data) {
    
  };

  return backbone.Model.extend(obj);
};
