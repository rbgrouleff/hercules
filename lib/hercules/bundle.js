(function() {
  var Bundle, Package, fs, glob, path,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  glob = require('glob');

  path = require('path');

  fs = require('fs');

  Package = require("./package");

  module.exports = Bundle = (function() {

    function Bundle(root_dir, options) {
      this.root_dir = root_dir;
      this.options = options;
      this.stripRootDir = __bind(this.stripRootDir, this);
      this.package = new Package(this.root_dir);
    }

    Bundle.prototype.sourceFilesAsJSON = function() {
      var contents, file, files;
      files = (function() {
        var _i, _len, _ref, _results;
        _ref = this.package.sourceFiles();
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          file = _ref[_i];
          contents = fs.readFileSync(path.join(this.root_dir, file), 'utf-8');
          _results.push("'" + file + "': function(exports, require, module) { " + contents + " }");
        }
        return _results;
      }).call(this);
      return "{ " + (files.join()) + " }";
    };

    Bundle.prototype.packageFilesAsJSON = function() {
      var map, package, _i, _len, _ref, _ref2;
      map = {};
      if (this.package.metaData()) map['package.json'] = this.package.metaData();
      _ref = this.package.packages();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        package = _ref[_i];
        if (!((_ref2 = this.options) != null ? _ref2.ignore_node_packages : void 0) && package.requiresNode()) {
          throw new Error('Cannot bundle packages that require node.js');
        }
        if (!package.requiresNode()) {
          map[this.stripRootDir(package.metaDataFile())] = package.metaData();
        }
      }
      return JSON.stringify(map);
    };

    Bundle.prototype.toString = function() {
      var client_js, client_path;
      client_path = path.join(__dirname, 'client.js');
      client_js = fs.readFileSync(client_path, 'utf-8');
      client_js = client_js.replace("'[[source_files]]'", this.sourceFilesAsJSON().replace(/\$/g, "$$$$"));
      return client_js.replace("'[[package_files]]'", this.packageFilesAsJSON());
    };

    Bundle.prototype.stripRootDir = function(path) {
      return path.replace(this.root_dir, '').substring(1);
    };

    return Bundle;

  })();

}).call(this);
