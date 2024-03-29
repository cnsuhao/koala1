/**
 * Tencent is pleased to support the open source community by making KOALA available.
 * Copyright (C) 2014 THL A29 Limited, a Tencent company. All rights reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */


/**
 * render page with locales language
 */

'use strict';

var fs             = require('fs-extra'),
    path           = require('path'),
    configManager  = require('./appConfigManager.js'),
    appConfig      = configManager.getAppConfig(),
    appPackage     = configManager.getAppPackage(),
    util           = require('./util.js'),
    locales        = appConfig.locales,
    FileManager    = global.getFileManager(),
    localStorage   = global.localStorage;

// get template pages
var getTemplates = function (dir) {
    var templates = [];

    function walk(root) {
        var dirList = fs.readdirSync(root);

        for (var i = 0; i < dirList.length; i++) {
            var item = dirList[i];

            if (fs.statSync(path.join(root, item)).isDirectory()) {
                // Skip OS directories
                if (!FileManager.isOSDir(item)) {
                    try {
                        walk(path.join(root, item));
                    } catch (e) {}
                }
            } else if (/jade|html/.test(path.extname(item))) {
                templates.push(path.join(root, item));
            }
        }
    }

    walk(dir);

    return templates;
}

/**
 * compare between current locales with last locales
 * @param  {string} localesPackage locales package file path
 * @return {boolean}               if the same as with the current version
 */
var compareDifferent = function (localesPackage) {
    // for debug
    if (appPackage.window.debug) return true;

    var current = util.readJsonSync(localesPackage) || {},
        last = util.parseJSON(localStorage.getItem('lastLocalesPackage')) || {},
        isChange;

    isChange = ['languageCode', 'version', 'koalaVersion'].some(function (item) {
        return current[item] !== last[item];
    })

    return isChange;
}

//render context json
var renderContext = function (useExpandPack) {
    var contextJson,
        content;

    if (useExpandPack) {
        contextJson = path.join(FileManager.userLocalesDir, locales, 'context.json');
    } else {
        contextJson = path.join(FileManager.appLocalesDir, locales, 'context.json');
    }

    content = fs.readFileSync(contextJson, 'utf8');
    content = util.replaceJsonComments(content);
    localStorage.setItem('localesContent', content);

    // load default language pack
    if (useExpandPack) {
        content = fs.readFileSync(path.join(FileManager.appLocalesDir, 'en_us', 'context.json'), 'utf8');
        content = util.replaceJsonComments(content);
        localStorage.setItem('defaultLocalesContent', content);
    }
}

// render views content
var renderViews = function (viewsJson, useExpandPack) {
    // translate templates
    var templateDir = path.join(FileManager.appViewsDir, 'template'),
        templates = getTemplates(templateDir),
        data = util.readJsonSync(viewsJson) || {},
        defaultData = {};

    if (useExpandPack) {
        defaultData = util.readJsonSync(path.join(FileManager.appLocalesDir, 'en_us', 'views.json'));
    }

    templates.forEach(function (item) {
        var content = fs.readFileSync(item, 'utf8'),
            fields = content.match(/\{\{(.*?)\}\}/g)

        if (fields) {
            var key, val;
            fields.forEach(function (item) {
                key = item.slice(2, -2);
                val = data[key] || defaultData[key] || key.replace(/\[\@(.*?)\]/, '');
                content = content.replace(item, val);
            });
        }

        // Save to localStorage
        var sessionName = item.split(/[\\|\/]template/).pop().replace(/\\|\//g, '-').replace(/\.html|\.jade/, '');
        if (path.extname(item) === '.jade') {
            sessionName = 'jade' + sessionName;

            // Save  jade file path
            localStorage.setItem('fileNameOf-' + sessionName, item);
        } else {
            sessionName = 'views' + sessionName;
        }

        localStorage.setItem(sessionName, content);
    });

    // cache views data
    localStorage.setItem('locales-viewsJson', JSON.stringify(data));
}

// render views and context
var renderInit = function () {
    var viewsJson, useExpandPack, localesPackage;

    // Built-in language packs
    if (appConfig.builtInLanguages.indexOf(locales) > -1) {
        viewsJson = path.join(FileManager.appLocalesDir, locales, 'views.json');
    } else {
        // Installed language packs
        viewsJson = path.join(FileManager.userLocalesDir, locales, 'views.json');

        if (!fs.existsSync(viewsJson)) {
            viewsJson = path.join(FileManager.appLocalesDir, 'en_us', 'views.json');
        } else {
            useExpandPack = true;
        }
    }

    // locales package
    if (useExpandPack) {
        localesPackage = path.join(FileManager.userLocalesDir, locales, 'package.json');
    } else {
        localesPackage = path.join(FileManager.appLocalesDir, locales, 'package.json');
    }

    // Don't need retranslate when current locales is the same as last locales
    if (compareDifferent(localesPackage)) {
        // Render views
        renderViews(viewsJson, useExpandPack);

        // Render context
        renderContext(useExpandPack);

        // Save current locales package
        localStorage.setItem('lastLocalesPackage', fs.readFileSync(localesPackage, 'utf8'));
    }
}

// init
renderInit();
