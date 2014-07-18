define(function (require, exports, module) {
	"use strict";

	var ProjectManager = brackets.getModule("project/ProjectManager"),
		ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
		NodeConnection = brackets.getModule("utils/NodeConnection"),
		FileSystem = brackets.getModule("filesystem/FileSystem"),
		FileUtils = brackets.getModule("file/FileUtils"),
		PreferencesManager = brackets.getModule("preferences/PreferencesManager"),
	  CodeInspection = brackets.getModule("language/CodeInspection"),

		preferences = PreferencesManager.getExtensionPrefs("jdiehl.less-autocompile");

	// default preferences
	$.extend(preferences, {
		"compilePath": ".brackets.json"
	});

	// load a named node module
	function connectToNodeModule(moduleName, callback) {
		var connection = new NodeConnection();
		return connection.connect(true).pipe(function () {
			var path = ExtensionUtils.getModulePath(module, "node/" + moduleName);
			return connection.loadDomains([path], true);
		}).pipe(function () {
			return connection.domains[moduleName];
		});
	}

	// Compile the files listed in the compile config file.
	// Defaults to "compile.json" in the root of project.
	// If no compilation config found, defaults to normal behavior.
	function loadFilesToCompile(compilePath, documentPath) {
		var projectPath = ProjectManager.getProjectRoot().fullPath,
			configFile = FileSystem.getFileForPath(projectPath + compilePath),
			deferred = $.Deferred();
	
		// read the config file
		FileUtils.readAsText(configFile).then(function (text) {
			var files, err;
			try {
				// try to parse it
				files = JSON.parse(text).less;
			} catch (e) {
				err = e;
			}
			if (err) {
				// reject with error if not parsable
				deferred.reject(new Error("Invalid configuration file (compile.json): " + err.message));
			} else {
				// or: read file entries
				files.forEach(function (file, i) {
					files[i] = projectPath + file;
				});
				deferred.resolve(files);
			}
		}).fail(function() {
			deferred.resolve([documentPath]);
		});
		return deferred;
	}

	// use the given compiler to compile the given files
	function compile(compiler, files) {
		var tasks = [];
		files.forEach(function (file) {
			tasks.push(compiler.compile(file));
		});
		return $.when.apply($, tasks);
	}

	function convertError(error) {
		switch (error.code) {
		case "EACCES":
			return { pos: {}, message: "Could not open output file.", type: "FileSystem" };
		default:
			return { pos: { line: error.line - 1, ch: error.index }, message: error.message, type: error.type };
		}
	}

	function compileLess(content, documentPath) {
		var deferred = new $.Deferred();

		// connect to the node server & read the file
		$.when(connectToNodeModule("LessCompiler"), loadFilesToCompile(preferences.compilePath, documentPath)).then(function (compiler, files) {
			compile(compiler, files).then(function (result) {
				deferred.resolve();
			}, function (error) {
				deferred.resolve({ errors: [convertError(error)] });
			});
		});

		return deferred.promise();
	}

	// Register for LESS files
	CodeInspection.register("less", {
		name: "less-autocompile",
		scanFileAsync: compileLess
	});

});
