/**
 * Tencent is pleased to support the open source community by making KOALA available.
 * Copyright (C) 2014 THL A29 Limited, a Tencent company. All rights reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */


/**
 * window events
 */

'use strict';

var fs          = require('fs'),
    storage     = require('./storage.js'),
    fileWatcher = require('./fileWatcher.js'),
    appConfig   = require('./appConfigManager.js').getAppConfig(),
    appPackage  = require('./appConfigManager.js').getAppPackage(),
    il8n        = require('./il8n.js'),
    mainWindow  = global.mainWindow,
    gui         = global.gui,
    $           = global.jQuery;

/**
 * save current application status
 */
function saveCurrentAppstatus() {
    var historyDb = storage.getHistoryDb();
        historyDb.activeProject = global.activeProject;
        historyDb.window = {
            x: mainWindow.x,
            y: mainWindow.y
        };
    storage.saveHistoryDb(historyDb);
}

/**
 * minimizeToTray
 */
function minimizeToTray () {
    var trayMenu = new gui.Menu(), tray;

    trayMenu.append(new gui.MenuItem({
        label: il8n.__('Open'),
        click: function () {
            mainWindow.show();
            tray.remove();
            tray = null;
        }
    }));
    trayMenu.append(new gui.MenuItem({
        label: il8n.__('Settings'),
        click: function () {
            mainWindow.show();
            $('#settings').trigger('click');
        }
    }));
    trayMenu.append(new gui.MenuItem({type: 'separator'}));
    trayMenu.append(new gui.MenuItem({
        label: il8n.__('Exit'),
        click: function () {
            //TODO
            mainWindow.close();
        }
    }));

    mainWindow.on('minimize', function () {
        this.hide();
        tray = new gui.Tray({icon: appPackage.window.icon});
        tray.menu = trayMenu;
        tray.on('click', function () {
            mainWindow.show();
            this.remove();
            tray = null;
        });
    });

    mainWindow.on('restore', function () {
        if (tray) {
            tray.remove();
            tray = null;
        }
    });
}


//main window onclose
mainWindow.on('close', function () {
    this.hide();

    saveCurrentAppstatus();

    gui.App.quit();
});

/**
 * minimize to tray when window onminimize
 * has bug on ubuntu
 */
if (appConfig.minimizeToTray && process.platform !== 'linux') minimizeToTray();
