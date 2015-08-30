# LESS AutoCompile

LESS AutoCompile is an extension for the code editor Brackets that adds automatic compilation of LESS files upon saving.


### Installation

LESS AutoCompile is installed from the Brackets Extension Manager. Please restart Brackets after installing the extension.

### Manual Installation

0. Install [NodeJS](https://nodejs.org)
1. Find your extension folder: Choose Help > Show Extensions Folder (or open it manually)
2. Drill down to the user folder
3. Check out the extension from GitHub into the user folder
4. Run `npm i` in the root folder of the extension
5. Run `npm i` in the node folder of the extension

### Compile Options

LESS compile options can be set in the first line of the edited file:

    // out: ../dist/app.css, compress: true, strictMath: true

The following compile options are available:

* out: redirect the css output to a different file
* main: compile a different file instead of this one (ignores all other options)
* compress: compress the css output
* strictMath: require brackets around math expressions
* sourceMap: generate a source map
* autoprefixer: use [autoprefixer](https://github.com/postcss/autoprefixer) (value is passed as browsers to the autoprefixer-plugin, separate multiple entires with a `;` character)
* cleancss: use [clean-css](https://github.com/jakubpawlowicz/clean-css) (value is passed as compatibility to the cleancss-plugin - not compatible with source-maps)

Other less compiler options might also work but are untested at this point. See [Grunt LESS](https://github.com/gruntjs/grunt-contrib-less#options) for a complete list of possible options.


### Project-wide Compile Options

You can tell the extension to always compile a specific set of files in a project independent of the edited file by creating a configuration file called `.brackets.json` or `compile.json` in your project's root folder:

    { "less": [ "path/to/file1.less", "path/to/file2.less" ] }

All file paths must be relative to the project's root folder. To disable less-autocompile for a project, specify an empty list of files:

    { "less": [] }

### FAQ

How can I redirect the output to a separate file?

> Add the following line to the head of your less file:
> 
>     // out: new-file.css

How can I supress compiling this less file / compile a different less file than the one being edited?

> Add a reference to the master.less file to the head of the imported less file:
> 
>     // main: master.less

How can I supress the compilation of a single less file

> Set out to null
>
>     // out: null

### Acknowledgements

* Thanks to [James Lawrence](https://github.com/jlaw90) for enabling relative imports in less.
* Thanks to [Martin Zagora](https://github.com/zaggino) for adding the less verison number to the output.
* Thanks to [Dimitar S.](https://github.com/deemeetar) for allowing users to specify a custom output path.
* Thanks to [FezVrasta](https://github.com/FezVrasta) for tweaking the less compiler settings.
* Thanks to [Kenneth Ruddick](https://github.com/KenRud) for the compile.json configuration addition.
* Thanks to [Florian Fida](https://github.com/piccaso) for kicking off autoprefixer and cleancss support.

### License
The MIT License (MIT)

Copyright (c) 2013 Jonathan Diehl

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
