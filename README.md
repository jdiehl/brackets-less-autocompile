# LESS AutoCompile

LESS AutoCompile is an extension for the code editor Brackets that adds automatic compilation of LESS files upon saving. LESS AutoCompile is installed from the Package Manager that is included in Brackets.

To compile the file into a custom output file, add the following line to the beginning of the less file:

    // out: NEWFILE.css

To tell the extension to compile another file instead of this one (typically used for imported files), add the following line instead:

    // main: MAINFILE.less

You can also specify custom compiler settings in this line (this can be combined with out but not with main):

    // out: ../dist/app.css, compress: true, strictMath: true

You can tell the extension to always compile a specific set of files by creating a file called `compile.json` in your project's root folder:

    { "less": [ "path/to/file1.less", "path/to/file2.less" ] }

All file paths must be relative to the project's root folder.


### Acknowledgements

* Thanks to [James Lawrence](https://github.com/jlaw90) for enabling relative imports in less.
* Thanks to [Martin Zagora](https://github.com/zaggino) for adding the less verison number to the output.
* Thanks to [Dimitar S.](https://github.com/deemeetar) for allowing users to specify a custom output path.
* Thanks to [FezVrasta](https://github.com/FezVrasta) for tweaking the less compiler settings.
* Thanks to [Kenneth Ruddick](https://github.com/KenRud) for the compile.json configuration addition.


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
