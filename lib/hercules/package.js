(function() {
  var Package, fs, glob, path,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  glob = require('glob');

  path = require('path');

  fs = require('fs');

  module.exports = Package = (function() {

    function Package(root_dir) {
      this.root_dir = root_dir;
      this.stripRootDir = __bind(this.stripRootDir, this);
    }

    Package.prototype.metaData = function() {
      var contents;
      if (!path.existsSync(this.metaDataFile())) return;
      contents = fs.readFileSync(this.metaDataFile(), 'utf-8');
      return JSON.parse(contents);
    };

    Package.prototype.metaDataFile = function() {
      return path.join(this.root_dir, 'package.json');
    };

    Package.prototype.sourceFiles = function() {
      var file, files, glob_search_string, package, _i, _j, _len, _len2, _ref, _ref2,
        _this = this;
      glob_search_string = path.join(this.root_dir, '**.js');
      files = glob.sync(glob_search_string);
      files = files.map(function(f) {
        return _this.stripRootDir(f);
      });
      files = files.filter(function(file) {
        return file.indexOf('node_modules') !== 0;
      });
      _ref = this.packages();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        package = _ref[_i];
        _ref2 = package.sourceFiles();
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          file = _ref2[_j];
          files.push(path.join(this.stripRootDir(package.root_dir), file));
        }
      }
      return files;
    };

    Package.prototype.stripRootDir = function(path) {
      return path.replace(this.root_dir, '').substring(1);
    };

    Package.prototype.packages = function() {
      return this._packages || (this._packages = this.buildPackages());
    };

    Package.prototype.requiresNode = function() {
      var _ref, _ref2;
      return !!((_ref = this.metaData()) != null ? (_ref2 = _ref.engines) != null ? _ref2.node : void 0 : void 0);
    };

    Package.prototype.buildPackages = function() {
      var file, glob_search_string, package, packages, sub_package, _i, _j, _len, _len2, _ref, _ref2;
      packages = [];
      glob_search_string = path.join(this.root_dir, '/node_modules/*/package.json');
      _ref = glob.sync(glob_search_string);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        file = _ref[_i];
        package = new Package(path.dirname(file));
        packages.push(package);
        _ref2 = package.packages();
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          sub_package = _ref2[_j];
          packages.push(sub_package);
        }
      }
      return packages;
    };

    return Package;

  })();

}).call(this);
