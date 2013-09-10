/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4,
maxerr: 50, node: true */
/*global */

(function () {
	"use strict";
	
	var less = require("less");
	var path = require("path");
	var fs = require("fs");

	// compile the given less file
	function compile(lessFile, cssFile) {
           var parser = new(less.Parser)({
			filename: path.basename(lessFile),
			paths: [path.dirname(lessFile)]
		});
		// read less input
		fs.readFile(lessFile, function (err, data) {
			if (err) {
				console.error(err);
				return;
			}
			
			// parse less
			parser.parse(data.toString(), function (err, tree) {
				if (err) {
					console.error(err);
					return;
				}

				// write css output
				fs.writeFile(cssFile, tree.toCSS(), function (err) {
					if (err) {
						console.error(err);
						return;
					}
				});
			});
		});
	}

    function init(DomainManager) {
        if (!DomainManager.hasDomain("LessCompiler")) {
            DomainManager.registerDomain("LessCompiler", {major: 1, minor: 0});
        }
        DomainManager.registerCommand(
            "LessCompiler",       // domain name
            "compile",    // command name
            compile,   // command handler function
            true,          // this command is asynchronous
            "Compiles a less file",
            ["lessPath", "cssPath"],             // path parameters
            null);
    }
    
    exports.init = init;
	
}());