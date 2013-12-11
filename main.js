/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4,
maxerr: 50, browser: true */
/*global $, define, brackets */

define(function (require, exports, module) {
	"use strict";

	var AppInit        = brackets.getModule("utils/AppInit"),
		ProjectManager = brackets.getModule("project/ProjectManager"),
		ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
		NodeConnection = brackets.getModule("utils/NodeConnection"),
		DocumentManager = brackets.getModule("document/DocumentManager");

	// connect to the node server
	function connect(callback) {
		var connection = new NodeConnection();
		var promise = connection.connect(true);
		promise.fail(function (err) {
			callback("Could not connect to node server: " + err);
		});
		promise.done(function () {
			callback(null, connection);
		});
	}

	function loadNodeModule(moduleName, callback) {
		connect(function (err, connection) {
			if (err) {
				callback(err);
				return;
			}

			var path = ExtensionUtils.getModulePath(module, "node/" + moduleName);
			var promise = connection.loadDomains([path], true);
			promise.fail(function (err) {
				callback("Could not load node module " + moduleName + ": " + err);
			});
			promise.done(function () {
				callback(null, connection.domains[moduleName]);
			});
		});
	}

	// a document was saved
	function onDocumentSaved(event, document) {

		// check if the document was truly saved
		if (document.file.isDirty) {
			return;
		}

		// check if it was a .less document
		var path = document.file.fullPath;
		if (path.substr(path.length - 5, 5) === ".less") {

			// connect to the node server
			loadNodeModule("LessCompiler", function (err, compiler) {
				if (err) {
					console.error(err);
					return;
				}
				compiler.compile(path).done(function (result) {
					console.log(result);
				}).fail(function (err) {
					console.error(err);
				});
			});

		}
	}

	AppInit.appReady(function () {
		$(DocumentManager).on("documentSaved", onDocumentSaved);
	});

});