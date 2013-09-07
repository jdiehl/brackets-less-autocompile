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
				compiler.compile(path, path.substr(0, path.length - 5) + ".css");
			});

		}
	}

	AppInit.appReady(function () {
		$(DocumentManager).on("documentSaved", onDocumentSaved);
	});


	// Helper function that chains a series of promise-returning
	// functions together via their done callbacks.
	function chain() {
		var functions = Array.prototype.slice.call(arguments, 0);
		if (functions.length > 0) {
			var firstFunction = functions.shift();
			var firstPromise = firstFunction.call();
			firstPromise.done(function () {
				chain.apply(null, functions);
			});
		}
	}

	/*
	AppInit.appReady(function () {
		// Create a new node connection. Requires the following extension:
		// https://github.com/joelrbrandt/brackets-node-client
		var nodeConnection = new NodeConnection();
		
		// Every step of communicating with node is asynchronous, and is
		// handled through jQuery promises. To make things simple, we
		// construct a series of helper functions and then chain their
		// done handlers together. Each helper function registers a fail
		// handler with its promise to report any errors along the way.
		
		
		// Helper function to connect to node
		function connect(callback) {
			var connectionPromise = nodeConnection.connect(true);
			connectionPromise.fail(function () {
				console.error("[brackets-simple-node] failed to connect to node");
			});
			return connectionPromise;
		}
		
		// Helper function that loads our domain into the node server
		function loadSimpleDomain() {
			var path = ExtensionUtils.getModulePath(module, "node/compile");
			var loadPromise = nodeConnection.loadDomains([path], true);
			loadPromise.fail(function () {
				console.log("[brackets-simple-node] failed to load domain");
			});
			return loadPromise;
		}
		
		// Helper function that runs the simple.getMemory command and
		// logs the result to the console
		function logMemory() {
			var memoryPromise = nodeConnection.domains.simple.getMemory();
			memoryPromise.fail(function (err) {
				console.error("[brackets-simple-node] failed to run simple.getMemory", err);
			});
			memoryPromise.done(function (memory) {
				console.log(
					"[brackets-simple-node] Memory: %d of %d bytes free (%d%)",
					memory.free,
					memory.total,
					Math.floor(memory.free * 100 / memory.total)
				);
			});
			return memoryPromise;
		}

		// Call all the helper functions in order
		chain(connect, loadSimpleDomain, logMemory);
		
	});
*/

});