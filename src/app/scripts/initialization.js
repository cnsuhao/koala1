/**
 * Tencent is pleased to support the open source community by making KOALA available.
 * Copyright (C) 2014 THL A29 Limited, a Tencent company. All rights reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */


/**
 * Application initialization
 */

'use strict';

var fs              = require('fs'),
    configManager   = require('./appConfigManager.js'),
    storage         = require('./storage.js'),
    jadeManager     = require('./jadeManager.js'),
    fileWatcher     = require('./fileWatcher.js'),
    projectManager  = require('./projectManager.js'),
    projectSettings = require('./projectSettings.js'),
    notifier        = require('./notifier.js'),
    il8n            = require('./il8n.js'),
    util            = require('./util.js'),
    historyDb       = storage.getHistoryDb(),
    $               = global.jQuery,
    mainWindow      = global.mainWindow;

/**
 * render main window view
 */
function renderMainWindow () {
    var mainView = mainWindow.window.localStorage.getItem('views-main');
    $('#window').append(mainView);
}

/**
 * render projects view
 */
function renderProjects() {
    projectManager.checkStatus(); //filter invalid forder

    var projectsDb = storage.getProjects() || {},
        projectsList = [],
        activeProjectId,
        historyActiveProjectId = historyDb.activeProject,
        activeProject,
        activeProjectFiles = [];

    //read projects list
    for (var k in projectsDb) {
        projectsList.push(projectsDb[k]);
        activeProjectId = k;
    }

    //load prev active project files
    if (historyActiveProjectId && projectsDb[historyActiveProjectId]) {
        activeProject = projectsDb[historyActiveProjectId];
        activeProjectId = historyActiveProjectId;
    } else {
        activeProject = projectsDb[activeProjectId];
    }

    //read active project files
    if (!activeProject || !activeProject.files) {
        $('#addprojecttips').show();
        return false;
    }

    for (k in activeProject.files) {
        activeProjectFiles.push(activeProject.files[k])
    }

    //render page
    if (projectsList.length > 0) {
        var foldersHtml = jadeManager.renderFolders(projectsList);
        $('#folders').html(foldersHtml);
    }

    if (activeProjectFiles.length > 0) {
        var filesHtml = jadeManager.renderFiles(activeProjectFiles);
        $('#files ul').html(filesHtml);
    }

    //trigger active project
    global.activeProject = activeProjectId;
    $('#' + activeProjectId).addClass('active');
}

/**
 * resume main window position and size
 * @return {[type]} [description]
 */
function resumeWindow () {
    if (util.isEmptyObject(historyDb) || !historyDb.window) return false;

    var x = historyDb.window.x,
        y = historyDb.window.y,
        availWidth = mainWindow.window.screen.availWidth,
        availHeight = mainWindow.window.screen.availHeight;

    if (historyDb.window.x >= availWidth || historyDb.window.x <= (-availWidth - mainWindow.width) || historyDb.window.y >= availHeight || historyDb.window.y < 0) {
        x = null;
        y = null;
    }

    if (historyDb.window) {
        if (x) mainWindow.x = x;
        if (y) mainWindow.y = y;
    }
}

/**
 * show main window
 */
function showMainWindow () {
    if (!global.startup) {

        if (configManager.getAppConfig().minimizeOnStartup) {
            mainWindow.minimize()
        } else {
            mainWindow.show();
        }

        global.startup = true;
    }
}

/**
 * star watch projects
 */
function startWatchProjects() {
    //get projects data
    var projectsDb = storage.getProjects(),
        compileFiles = [],
        settingsFiles = [];

    for (var k in projectsDb) {
        var files = projectsDb[k].files,
            item;
        for (var j in files) {
            item = files[j];
            if (item.compile && item.watch !== false) {
                compileFiles.push({
                    pid: k,
                    src: item.src
                });
            }
        }

        var source = projectsDb[k].config.source;
        if (source) {
            settingsFiles.push(source)
        }
    }

    if (compileFiles.length > 0) {
        //add watch listener
        fileWatcher.add(compileFiles);
    }

    // watch settings file
    if (settingsFiles.length > 0) {
        projectSettings.watchSettingsFile(settingsFiles);
    }
}

/**
 * add watch listener to imports
 */
function startWatchImports () {
    var importsDb = storage.getImportsDb(),
        fileList = [];
    for (var k in importsDb) {
        fileList.push(k);
    }

    fileWatcher.setImportsCollection(importsDb);

    if (fileList.length > 0) {
        fileWatcher.watchImport(fileList);
    }
}

/**
 * Detect Language Pack Update
 */
function detectLanguagePackUpdate () {
    require('./localesManager.js').detectUpdate();
}

/**
 * Detect Extensions Packs Update
 */
function detectCompilersPacksUpdate () {
    require('./compilersManager.js').detectUpdate();
}

/**
 * check upgrade
 */
function checkUpgrade () {
    var appPackage = configManager.getAppPackage(),
        url = appPackage.maintainers.upgrade,
        currentVersion = appPackage.version;

    util.checkUpgrade(url, currentVersion, function (data, hasNewVersion) {
        // if not has new version koala, then detect locales and compilers
        if (!hasNewVersion) {
            detectLanguagePackUpdate();
            detectCompilersPacksUpdate();
            return false;
        }

        var message = il8n.__('New Version Found', data.version),
            locales = configManager.getAppConfig().locales;
        $.koalaui.confirm(message, function () {
            global.gui.Shell.openExternal(data.download[locales] || data.download.en_us);
        });
    });
}

//rander main window view
renderMainWindow();
renderProjects();

//start watch files
startWatchProjects();
startWatchImports();

//bind dom events
require('./pages/main/init.js');

//bind contextmenu events
require('./contextmenu.js');

//bind main window events
require('./windowEvents.js');

resumeWindow();
showMainWindow();

//check upgrade
checkUpgrade();
