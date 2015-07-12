define(function (require, exports, module) {
  'use strict';

  var ProjectManager = brackets.getModule('project/ProjectManager'),
    ExtensionUtils = brackets.getModule('utils/ExtensionUtils'),
    NodeConnection = brackets.getModule('utils/NodeConnection'),
    FileSystem = brackets.getModule('filesystem/FileSystem'),
    FileUtils = brackets.getModule('file/FileUtils'),
    CodeInspection = brackets.getModule('language/CodeInspection'),
    DocumentManager = brackets.getModule('document/DocumentManager'),
    EditorManager = brackets.getModule('editor/EditorManager');

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

  function loadProjectConfig(callback) {
    var projectPath = ProjectManager.getProjectRoot().fullPath,
      file = FileSystem.getFileForPath(projectPath + '.brackets.json');
    FileUtils.readAsText(file).then(callback, function () {
      var file = FileSystem.getFileForPath(projectPath + 'compile.json');
      FileUtils.readAsText(file).then(callback, function () {
        callback();
      });
    });
  }

  // Loads a compilation config file in the root of project.
  // Defualts to 'compile.json' and '.brackets.json'
  // If no compilation config found, defaults to normal behavior.
  function loadOptions(documentPath) {
    var projectPath = ProjectManager.getProjectRoot().fullPath,
      deferred = $.Deferred();

    // read the config file
    loadProjectConfig(function (text) {
      var options,
        err,
        defaults = { less: [documentPath] };

      if (!text) {
        deferred.resolve(defaults);
      }
      try {
        // try to parse it
        // defaults to the document path if not overridden
        options = JSON.parse(text);
      } catch (e) {
        err = e;
      }
      // if JSON has been parsed and it contains an array of less files
      if (!err && options.less && (options.less instanceof Array)) {
        // or: read file entries
        options.less.forEach(function (file, i) {
          options.less[i] = projectPath + file;
        });
      }
      options = $.extend({}, defaults, options);
      deferred.resolve(options);
    });
    return deferred;
  }

  // use the given compiler to compile the given files
  function compile(compiler, options) {
    var tasks = [];
    options.less.forEach(function (file) {
      tasks.push(compiler.compile(file, options));
    });
    return $.when.apply($, tasks);
  }

  function convertError(error) {
    if (typeof error === 'string') {
      return { pos: {}, message: error };
    }
    switch (error.code) {
    case 'EACCES':
    case 'ENOENT':
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
      options = loadOptions(documentPath);

    // connect to the node server & read the file
    $.when(connection, options).then(function (compiler, options) {
      compile(compiler, options).then(function () {
        deferred.resolve();
      }, function (error) {
        deferred.resolve({ errors: [convertError(error)] });
      });
    }, function (error) {
      deferred.resolve({ errors: [error] });
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
    if (EditorManager.getCurrentFullEditor().document !== document && document.getLanguage().getId() === 'less') {
      compileLess(document.getText(), document.file.fullPath);
    }
  });

});
