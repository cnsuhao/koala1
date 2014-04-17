/**
 * Tencent is pleased to support the open source community by making KOALA available.
 * Copyright (C) 2014 THL A29 Limited, a Tencent company. All rights reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */


/**
 * main.js
 */

'use strict';

var path        = require('path'),
    fs          = require('fs'),
    FileManager = require('./scripts/FileManager');

//Add error event listener
process.on('uncaughtException', function (err) {
    var message = '---uncaughtException---\n' + err.stack + '\n\n';
    fs.appendFile(FileManager.errorLogFile, message);
    jQuery('.koalaui-loading,.koalaui-overlay').remove();
    window.alert(message);
});

window.addEventListener('error', function (err) {
    var message = '---error---\n' + err.filename + ':' + err.lineno + '\n' + err.message + '\n\n';
    fs.appendFile(FileManager.errorLogFile, message);
    jQuery('.koalaui-loading,.koalaui-overlay').remove();
    window.alert(message);
}, false);

//share main context
var gui = require('nw.gui');
global.gui = gui;
global.mainWindow = gui.Window.get();
global.jQuery = jQuery;
global.localStorage = window.localStorage;

global.getFileManager = function () {
    return FileManager;
};
global.debug = function (messge) {
    console.log(messge);
};

//cache current active project
global.activeProject = '';

//distinguish between different platforms
$('body').addClass(process.platform);

// render pages && application initialization
require('./scripts/patch.js');
require('./scripts/renderpage.js');
require('./scripts/compilersManager.js');
require('./scripts/initialization.js');
