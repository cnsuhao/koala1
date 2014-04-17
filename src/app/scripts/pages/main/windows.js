/**
 * Tencent is pleased to support the open source community by making KOALA available.
 * Copyright (C) 2014 THL A29 Limited, a Tencent company. All rights reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */


/**
 * window management
 */

'use strict';

var path        = require('path'),
    appPackage  = require('../../appConfigManager.js').getAppPackage(),
    FileManager = global.getFileManager(),
    gui         = global.gui,
    $           = global.jQuery,
    document    = global.mainWindow.window.document;


var showFrame = function (url) {
    $('#frame')[0].src = url;
    $('#frame').show();
    $('.koalaui-overlay').show();
}

//open settings window
$(document).on('click', '#settings', function (e) {
    showFrame(path.join(FileManager.appViewsDir, 'release/settings.html'));
});

//open log window
$(document).on('click', '#log', function () {
    showFrame(path.join(FileManager.appViewsDir, 'release/log.html'));
});

//open external link
$(document).on('click', '.externalLink', function () {
    gui.Shell.openExternal($(this).attr('href'));
    return false;
});

var hideFrame = global.mainWindow.window.hideFrame = function () {
    $('#frame').hide();
    $('#frame')[0].src = "about:blank";
    $('.koalaui-overlay').hide();
};

$(document).keydown(function (e) {
    // press esc to close frame
    if (e.which === 27) {
        hideFrame();
    }

    // press F12 open devtools
    if (appPackage.window.debug && e.which === 123) {
        global.mainWindow.showDevTools();
    }
});


//window minimize & close
if (process.platform === 'win32') {
    $(document).on('click', '#titlebar .minimize', function () {
        global.mainWindow.minimize();
    });
    $(document).on('click', '#titlebar .close', function () {
        global.mainWindow.close();
    });
}
