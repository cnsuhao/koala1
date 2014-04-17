/**
 * Tencent is pleased to support the open source community by making KOALA available.
 * Copyright (C) 2014 THL A29 Limited, a Tencent company. All rights reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */


/**
 * UglifyJS compiler
 */

'use strict';

var fs          = require('fs'),
    path        = require('path'),
    FileManager = global.getFileManager(),
    Compiler    = require(FileManager.appScriptsDir + '/Compiler.js');

function UglifyJSCompiler(config) {
    Compiler.apply(this, arguments);
}
require('util').inherits(UglifyJSCompiler, Compiler);
module.exports = UglifyJSCompiler;

var _getImports = function (srcFile) {
    //match imports from code
    var reg = /@koala-(prepend|append)\s+["']([^.]+?|.+?js)["']/g,
        result, type, importPath,

        //get fullpath of imports
        dirname = path.dirname(srcFile),
        fullPathImports = {prepend: [], append: []},

        code = fs.readFileSync(srcFile, 'utf8');

    while ((result = reg.exec(code)) !== null) {
        type = result[1];
        importPath = result[2];
        if (path.extname(importPath) !== '.js') {
            importPath += '.js';
        }

        importPath = path.resolve(dirname, importPath);

        if (fs.existsSync(importPath)) {
            fullPathImports[type].push(importPath);
        }
    }

    return fullPathImports;
};

var getCombinedFile = function (filePath, importedFiles) {
    if (typeof importedFiles === "undefined") {
        importedFiles = [];
    }

    if (importedFiles.indexOf(filePath) !== -1) {
        return [];
    }
    var prepend = [],
        append  = [],
        files   = _getImports(filePath);

    importedFiles.push(filePath);

    files.prepend.forEach(function (importedFilePath) {
        if (importedFiles.indexOf(importedFilePath) === -1) {
            prepend.push.apply(prepend, getCombinedFile(importedFilePath, importedFiles));
        }
    });

    files.append.forEach(function (importedFilePath) {
        if (importedFiles.indexOf(importedFilePath) === -1) {
            append.push.apply(append, getCombinedFile(importedFilePath, importedFiles));
        }
    });

    return prepend.concat(filePath, append);
};

/**
 * compile js file
 * @param  {Object} file      compile file object
 * @param  {Object} emitter  compile event emitter
 */
UglifyJSCompiler.prototype.compile = function (file, emitter) {
    //compile file by use system command
    var globalSettings = this.getGlobalSettings();
    this.compileWithLib(file, emitter);
}

/**
 * compile js file with node lib
 * @param  {Object} file      compile file object
 * @param  {Object} handlers  compile event handlers
 */
UglifyJSCompiler.prototype.compileWithLib = function (file, emitter) {
    var files = getCombinedFile(file.src),

        triggerError = function (message) {
            emitter.emit('fail');
            emitter.emit('always');

            this.throwError(message, file.src);
        }.bind(this),
        
        minify = function () {
            var UglifyJS = require('uglify-js'),
                options  = file.settings,
                code;
            try {
                if (options.compress) {
                    code = UglifyJS.minify(files, {fromString: true}).code;
                } else {
                    code = files.join('\n\n');
                }
                // write output
                fs.writeFile(file.output, code, "utf8", function (err) {
                    if (err) {
                        triggerError(err.message);
                    } else {
                        emitter.emit('done');
                        emitter.emit('always');
                    }
                }.bind(this));
            } catch (err) {
                triggerError(err.message);
            }
        }.bind(this),

        abort = false,
        numberOfRemainingFiles = files.length,
        gotCode = function (err, code) {
            if (err) {
                abort = true;
                return triggerError(err.message);
            }

            files[this] = code;
            numberOfRemainingFiles--;
            if (numberOfRemainingFiles === 0) {
                minify();
            }
        },

        index;

    // read code
    for (index = 0; index < files.length && !abort; index++) {
        fs.readFile(files[index], "utf8", gotCode.bind(index));
    }
};
