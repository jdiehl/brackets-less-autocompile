define(function (require, exports, module) {
  'use strict';

  var ProjectManager = brackets.getModule('project/ProjectManager'),
    ExtensionUtils = brackets.getModule('utils/ExtensionUtils'),
    NodeConnection = brackets.getModule('utils/NodeConnection'),
    FileSystem = brackets.getModule('filesystem/FileSystem'),
    FileUtils = brackets.getModule('file/FileUtils'),
    PreferencesManager = brackets.getModule('preferences/PreferencesManager'),
    CodeInspection = brackets.getModule('language/CodeInspection'),
    DocumentManager = brackets.getModule('document/DocumentManager'),
    EditorManager = brackets.getModule('editor/EditorManager'),

    preferences = PreferencesManager.getExtensionPrefs('jdiehl.less-autocompile');

  // default preferences
  $.extend(preferences, {
    'compilePath': 'compile.json'
  });

  // load a named node module
  function connectToNodeModule(moduleName) {
    var connection = new NodeConnection();
    return connection.connect(true).pipe(function () {
      var path = ExtensionUtils.getModulePath(module, 'node/' + moduleName);
      return connection.loadDomains([path], true);
    }).pipe(function () {
      return connection.domains[moduleName];
    });
  }

  // Compile the files listed in the compile config file.
  // Defaults to 'compile.json' in the root of project.
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
        deferred.reject(new Error('Invalid configuration file (compile.json): ' + err.message));
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
    case 'EACCES':
      return { pos: {}, message: 'Cannot open file \'' + error.path + '\'' };
    default:
      if (error.filename !== EditorManager.getCurrentFullEditor().document.file.name) {
        return { pos: {}, message: 'Error in file \'' + error.filename + '\' on line ' + error.line + ': ' +
          error.message, type: error.type };
      }
      return { pos: { line: error.line - 1, ch: error.index }, message: error.message, type: error.type };
    }
  }

  function compileLess(content, documentPath) {
    var deferred = new $.Deferred(),
    	connection = connectToNodeModule('LessCompiler'),
    	files = loadFilesToCompile(preferences.compilePath, documentPath);

    // connect to the node server & read the file
    $.when(connection, files).then(function (compiler, files) {
      compile(compiler, files).then(function () {
        deferred.resolve();
      }, function (error) {
        deferred.resolve({ errors: [convertError(error)] });
      });
    });

    return deferred.promise();
  }

  // Register for LESS files
  CodeInspection.register('less', {
    name: 'less-autocompile',
    scanFileAsync: compileLess
  });

  // Register for documentSaved events to support inline-editors
  $(DocumentManager).on('documentSaved', function (event, document) {
  	if (EditorManager.getCurrentFullEditor().document !== document) {
  		compileLess(document.getText(), document.file.fullPath);
  	}
  });

});