# LESS AutoCompile

LESS AutoCompile is an extension for the code editor Brackets that adds automatic compilation of LESS files upon saving. LESS AutoCompile is installed from the Package Manager that is included in Brackets.

To compile the file into a custom output file, add the following line to the beginning of the less file that is compiled:

    //out: NEWFILE.css
  
If you want to prevent LESS AutoCompile from compile a specific file, add to the first line this string:

    //out: none

### Acknowledgements

* Thanks to [James Lawrence](https://github.com/jlaw90) for enabling relative imports in less.
* Thanks to [Martin Zagora](https://github.com/zaggino) for adding the less verison number to the output.
* Thanks to [Dimitar S.](https://github.com/deemeetar) for allowing users to specify a custom output path.
* Thanks to [FezVrasta](https://github.com/FezVrasta) for tweaking the less compiler settings.

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
