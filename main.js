define(function (require, exports, module) {
	"use strict";

	var AppInit = brackets.getModule("utils/AppInit"),
		ProjectManager = brackets.getModule("project/ProjectManager"),
		ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
		NodeConnection = brackets.getModule("utils/NodeConnection"),
		DocumentManager = brackets.getModule("document/DocumentManager"),
		PanelManager = brackets.getModule("view/PanelManager"),
		FileSystem = brackets.getModule("filesystem/FileSystem"),
		FileUtils = brackets.getModule("file/FileUtils"),
		PreferencesManager = brackets.getModule("preferences/PreferencesManager"),

		preferences = PreferencesManager.getExtensionPrefs("jdiehl.less-autocompile"),
		panel,
		$panel;

	// default preferences
	$.extend(preferences, {
		"compilePath": "compile.json"
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

	function interpretError(err) {
		if (err === undefined || err === null) {
			return "Unkonwn error";
		}

		// node error
		if (err.code) {
			switch (err.code) {
			case "ENOENT":
				return "Could not open file: " + err.path;
			}
		}

		// less error
		if (err.type) {
			switch (err.type) {
			case "Parse":
				return err.message + " in " + err.filename + ":" + err.line;
			}

		}

		return err.message ? err.message : err;
	}

	AppInit.appReady(function () {
		$(DocumentManager).on("documentSaved", function (event, document) {
			var documentPath = document.file.fullPath;

			// check if the document was truly saved and is a less document
			if (document.file.isDirty || documentPath.substr(documentPath.length - 5, 5) !== ".less") {
				return;
			}

			// connect to the node server & read the file
			$.when(connectToNodeModule("LessCompiler"), loadFilesToCompile(preferences.compilePath, documentPath))
				// compile
				.then(compile)
				// update the panel
				.then(function () {
					if (panel) {
						panel.hide();
					}
				}, function () {
					if (!panel) {
						$panel = $("<div id='less-parser-error' class='bottom-panel'>");
						panel = PanelManager.createBottomPanel("jdiehl.less-autocompile", $panel);
					} else {
						$panel.html("");
					}
					Array.prototype.forEach.call(arguments, function (err) {
						if (err) {
							$panel.append($("<p>" + interpretError(err) + "</p>"));
						}
					});
					panel.show();
				});
		});
	});

});