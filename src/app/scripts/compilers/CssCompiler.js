/**
 * Tencent is pleased to support the open source community by making KOALA available.
 * Copyright (C) 2014 THL A29 Limited, a Tencent company. All rights reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */


/**
 * CSS min compiler
 */
'use strict';

var fs          = require('fs-extra'),
    path        = require('path'),
    FileManager = global.getFileManager(),
    Compiler    = require(FileManager.appScriptsDir + '/Compiler.js');

/**
 * CSS Compiler
 * @param {object} config compiler config
 */
function CssCompiler(config) {
   Compiler.call(this, config);
}
require('util').inherits(CssCompiler, Compiler);

module.exports = CssCompiler;

/**
 * compile css file
 * @param  {Object} file    compile file object
 * @param  {Object} emitter  compile event emitter
 */
CssCompiler.prototype.compile = function(file, emitter) {
    global.debug(file);
    var cleanCSS = require('clean-css');
    var rootPath = file.src.substring(0, file.src.indexOf(file.name));
    var source = fs.readFileSync(file.src, 'utf-8');
    var iskeepbreaks = file.settings.outputStyle != "yuicompress" || false;
    var minimized;

    // if 'combine import' was chosen
    if (file.settings.combineImport) { 
        minimized = cleanCSS.process(source, { removeEmpty: true, keepBreaks: iskeepbreaks, relativeTo: rootPath });
    }else {
        minimized = cleanCSS.process(source, { removeEmpty: true, keepBreaks: iskeepbreaks, processImport: false });
    }

    // convert background image to base64 & append timestamp
    var result = convertImageUrl(minimized, rootPath, file.settings.appendTimestamp);

    fs.outputFile(file.output, result, function(err) {
        if (err) {
            emitter.emit('fail');
        } else {
            emitter.emit('done');
        }
    });
    emitter.emit('always');
};


/**
 * convert external image file to data URIs
 * @param  {String}     css         css code
 * @param  {String}     rootPath    the css file path
 * @param  {Boolean}    timestamp   whether append timestamp
 * @return {String}                 the converted css code 
 */
function convertImageUrl (css, rootPath, timestamp) {
    css = css.replace(/background.+?url.?\(.+?\)/gi, function (matchStr) {

        var str = matchStr,
            originalUrl = str.match(/url.?\((.+)\)/)[0];    // get original url

        str = str.replace(/\'|\"/g, '').match(/url.?\((.+)\)/)[1].trim();
        var url = str.split('?')[0],
        param = str.split('?')[1];

        if (param !== 'base64' && timestamp === true) {
            return matchStr.replace(originalUrl, 'url('+ url + '?' + createTimestamp() +')');
        }
        // not convert of absolute url
        else if (param !== 'base64' || url.indexOf('/') === 0 || url.indexOf('http') === 0) {
            return matchStr;
        }
        var dataUrl = img2base64(url, rootPath);

        // replace original url with dataurl
        return matchStr.replace(originalUrl, 'url('+ dataUrl +')');
    });
    return css;
}


/**
 * convert image to base64
 * @param  {url} image url
 * @param  {String} rootPath the css file path
 */
function img2base64(url, rootPath){
    var type = url.split('.').pop().toLowerCase(),
        prefix = 'data:image/' + type + ';base64,';

    var file = path.join(rootPath, url);
    try {
        var imageBuf = fs.readFileSync(file); 
        return prefix + imageBuf.toString("base64");
    } catch(err) {
        // the file doesn't exist
        return url;
    }
}

/**
 * create timestamp
 */
function createTimestamp() {
    var date = new Date();
    var year = date.getFullYear().toString().substring(2,4);
    var mon = date.getMonth().toString().length == 2 ? date.getMonth()+1 : '0'+(date.getMonth()+1);
    var day = date.getDate().toString().length == 2 ? date.getDate() : '0'+date.getDate();
    var hour = date.getHours().toString().length == 2 ? date.getHours() : '0'+date.getHours();
    var min = date.getMinutes().toString().length == 2 ? date.getMinutes() : '0'+date.getMinutes();

    return year + mon + day + hour + min;
}
