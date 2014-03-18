/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4,
maxerr: 50, browser: true */
/*global $, define, brackets */

define(function (require, exports, module) {
	"use strict";

	var AppInit        = brackets.getModule("utils/AppInit"),
		ProjectManager = brackets.getModule("project/ProjectManager"),
		ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
		NodeConnection = brackets.getModule("utils/NodeConnection"),
		DocumentManager = brackets.getModule("document/DocumentManager"),
		PanelManager   = brackets.getModule("view/PanelManager"),
        FileSystem      = brackets.getModule("filesystem/FileSystem"),
        FileUtils       = brackets.getModule("file/FileUtils"),
        PreferencesManager = brackets.getModule("preferences/PreferencesManager");
    
	var panel, $panel;

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

	function onCompileSuccess(result) {
		if (panel) {
			panel.hide();
		}
		// todo: update live preview
	}

	function onCompileError(err) {
		if (!panel) {
			$panel = $("<div id='less-parser-error' class='bottom-panel'>");
			panel = PanelManager.createBottomPanel("jdiehl.less-autocompile", $panel);
		}
		$panel.html("<p>" + err.message + " at line " + err.line + "</p>");
		panel.show();
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
                
                // Compile the files listed in the compile config file.
                // Defaults to "compile.json" in the root of project.
                // If no compilation config found, defaults to normal behavior.
                getCompileConfigPath(function(configPath) {
                    var configFile = FileSystem.getFileForPath(configPath),
                        projectPath = ProjectManager.getProjectRoot().fullPath,
                        promise, paths;
                
                    FileUtils.readAsText(configFile).done(function(text) {
                        paths = JSON.parse(text).less;
                        paths.forEach(function(path) {
                            promise = compiler.compile(projectPath + path);
                            promise.done(onCompileSuccess).fail(onCompileError);
                        });
                    }).fail(function() {
                        compiler.compile(path).done(onCompileSuccess).fail(onCompileError);
                    });
                });
			});

		}
	}
    
    function getCompileConfigPath(callback) {
        var defaultPath = 'compile.json',
            projectPath = ProjectManager.getProjectRoot().fullPath,
            prefs;

        getExtensionName(function(name) {
            prefs = PreferencesManager.getExtensionPrefs(name);
            callback(projectPath + (prefs.get('compilePath') || defaultPath));
        });
    }
    
    function getExtensionName(callback) {
        var packagePath = ExtensionUtils.getModulePath(module, 'package.json'),
            packageFile = FileSystem.getFileForPath(packagePath);
                
        FileUtils.readAsText(packageFile).done(function(text) {
            callback(JSON.parse(text).name); 
        });
    }
    
	AppInit.appReady(function () {
		$(DocumentManager).on("documentSaved", onDocumentSaved);
	});

});