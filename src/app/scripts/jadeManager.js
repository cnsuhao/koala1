/**
 * Tencent is pleased to support the open source community by making KOALA available.
 * Copyright (C) 2014 THL A29 Limited, a Tencent company. All rights reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */


/**
 * render page content from jade template
 */

"use strict";

var jade           = require("jade"),
    fs             = require("fs"),
    path           = require('path'),
    storage        = require('./storage.js'),
    util           = require('./util.js'),
    configManager  = require('./appConfigManager.js'),
    compilersManager = require('./compilersManager.js'),
    fileTypesManager = require('./fileTypesManager.js'),
    $              = global.jQuery,
    localStorage   = global.localStorage;


/**
 * translate option's visible property
 * @param  {string} text
 * @return {string} translated text
 */
var viewsJsonData = JSON.parse(localStorage.getItem('locales-viewsJson') || '{}');
var translate = function (text) {
    return viewsJsonData[text] || text;
}

/**
 * render project list
 * @param  {Array} data  projects data
 * @return {Object}      project list elements
 */
exports.renderFolders  = function (data) {
    var fn = jade.compile(localStorage.getItem('jade-main-folders'), {filename: localStorage.getItem('fileNameOf-jade-main-folders')});
    return fn({folders: data});
};

/**
 * render file list
 * @param  {Array}  data files data
 * @return {Object} file list elements
 */
exports.renderFiles  = function (data) {
    data = util.clone(data);

    var pid = data[0].pid,
        parentSrc = storage.getProjects()[pid].src,
        ext;

    //shorten the path
    data.forEach(function (item) {
        item.shortSrc = path.relative(parentSrc, item.src);
        item.shortOutput = path.relative(parentSrc, item.output);
        
        ext = path.extname(item.src).substr(1);
        item.icon = fileTypesManager.getFileTypeByExt(ext).icon;
    });

    var fn = jade.compile(localStorage.getItem('jade-main-files'), {filename: localStorage.getItem('fileNameOf-jade-main-files')});
    return fn({files: data, parentSrc: parentSrc});
};

/**
 * render file settings
 * @param  {Object} file data
 * @param  {FileType} fileType file type
 * @param  {Compiler} compiler
 * @return {Object} file elements
 */
exports.renderSettings = function (file) {
    var compiler = compilersManager.getCompilerByName(file.compiler),
        options = [],
        settings = file.settings;

    if (!compiler) return '';
    
    // get display options
    compiler.options.forEach(function (item) {
        if (settings.hasOwnProperty(item.name)) {
            item.value = settings[item.name];
        } else {
            item.value = item.default;
        }
        options.push(item);
    });

    file.name = path.basename(file.src);

    var fn = jade.compile(localStorage.getItem('jade-main-settings'), {filename: localStorage.getItem('fileNameOf-jade-main-settings')});
    
    return fn({file: file, options: options, compilerName: compiler.display, __: translate });
};

/**
 * render app settings
 * @param  {Object} compilers   all compilers
 * @param  {Array}  languages   [description]
 * @param  {Object} translator  [description]
 * @param  {Object} maintainers [description]
 * @param  {String} appVersion  [description]
 * @return {Object}             setting elements
 */
exports.renderAppSettings = function () {
    var appConfig = configManager.getAppConfig(),
        appPackage = configManager.getAppPackage(),
        translator  = require('./localesManager.js').getLocalesPackage(appConfig.locales).translator,
        compilers =  compilersManager.getCompilersAsArray();

    compilers.forEach(function (compiler) {
        var compilerName = compiler.name;
        // apply global default options
        if (appConfig.compilers[compilerName]) {
            var globalSettings = configManager.getGlobalSettingsOfCompiler(compilerName);
            compiler.options.forEach(function (item) {
                item.value = globalSettings.options[item.name];

            });
            compiler.advanced.forEach(function (item) {
                item.value = globalSettings.advanced[item.name];
            });
        }
    });

    var fn = jade.compile(localStorage.getItem('jade-settings-inner'), {filename: localStorage.getItem('fileNameOf-jade-settings-inner')});
    
    return fn({
        compilers: compilers,
        translator: translator,
        appPackage: appPackage,
        appConfig: appConfig,
        __: translate
    });
};
