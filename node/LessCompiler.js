/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4,
maxerr: 50, node: true */
/*global */

(function () {
	"use strict";
	
	var less = require("less");
	var fs = require("fs");

	// compile the given less file
	function compile(lessFile, cssFile) {

		// read less input
		fs.readFile(lessFile, function (err, data) {
			if (err) {
				console.error(err);
				return;
			}

			// render less
			less.render(data.toString(), function (err, css) {
				if (err) {
					console.error(err);
					return;
				}

				// write css output
				fs.writeFile(cssFile, css, function (err) {
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