/**
 * Tencent is pleased to support the open source community by making KOALA available.
 * Copyright (C) 2014 THL A29 Limited, a Tencent company. All rights reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */


/**
 * FileManager module
 */

'use strict';

var fs   = require('fs'),
    path = require('path'),
    util = require('./util');

exports.rubyExecPath = 'ruby';
var rubyBinPathOfWin32 = path.join(path.dirname(process.execPath), 'ruby/bin/ruby.exe');
if (process.platform === 'win32' && fs.existsSync(rubyBinPathOfWin32)) {
    exports.rubyExecPath = rubyBinPathOfWin32;
}

exports.appRootDir   = process.cwd();
    exports.appBinDir       = path.join(exports.appRootDir, 'bin');
    exports.appDataDir      = path.join(exports.appRootDir, 'app');
        exports.appAssetsDir     = path.join(exports.appDataDir, 'assets');
        exports.appCompilersDir  = path.join(exports.appDataDir, 'scripts/compilers');
        exports.appLocalesDir    = path.join(exports.appDataDir, 'locales');
        exports.appScriptsDir    = path.join(exports.appDataDir, 'scripts');
        exports.appSettingsDir   = path.join(exports.appDataDir, 'settings');
        exports.appViewsDir      = path.join(exports.appDataDir, 'views');
    exports.packageJSONFile = path.join(exports.appRootDir, 'package.json');

exports.oldUserDataDir = path.join(process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'], '.koala');
exports.userDataDir  = path.join(process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'], (process.platform === 'darwin') ? 'Library/Application Support/Koala/UserData' :'.koala');
    exports.userCompilersDir  = path.join(exports.userDataDir, 'compilers');
    exports.userLocalesDir    = path.join(exports.userDataDir, 'locales');
    exports.userCacheDir      = path.join(exports.userDataDir, 'cache');
    exports.errorLogFile      = path.join(exports.userDataDir, 'error.log');
    exports.historyFile       = path.join(exports.userDataDir, 'history.json');
    exports.importsFile       = path.join(exports.userDataDir, 'imports.json');
    exports.projectsFile      = path.join(exports.userDataDir, 'projects.json');
    exports.settingsFile      = path.join(exports.userDataDir, 'settings.json');

// Create it if the directory is not exists
if (!fs.existsSync(exports.userDataDir)) {
    fs.mkdirSync(exports.userDataDir);
}
if (!fs.existsSync(exports.userCompilersDir)) {
    fs.mkdirSync(exports.userCompilersDir);
}
if (!fs.existsSync(exports.userLocalesDir)) {
    fs.mkdirSync(exports.userLocalesDir);
}

/**
 * tmp dir of system
 * @return {String} tmp dir
 */
exports.tmpDir = function () {
    var systemTmpDir =
            process.env.TMPDIR ||
            process.env.TMP ||
            process.env.TEMP ||
            (process.platform === 'win32' ? 'c:\\windows\\temp' : '/tmp');

    return path.join(systemTmpDir, 'koala_temp_' + util.createRdStr());
};

/**
 * get whether the file is for the OS or not.
 * @param  {String}  file The file to test.
 * @return {boolean}      `true` if `file` is for the OS, `false` otherwise.
 */
exports.isOSFile = function (file) {
    // OS X
    if (/^\.(_|DS_Store$)/.test(path.basename(file))) {
        return true;
    }
    // Win
    if (/^thumbs\.db$/i.test(path.basename(file))) {
        return true;
    }
    return false;
};

/**
 * get whether the directory is for the OS or not.
 * @param  {String}  dir The directory to test.
 * @return {boolean}     `true` if `dir` is for the OS, `false` otherwise.
 */
exports.isOSDir = function (dir) {
    // OS X
    if (/^\.(fseventsd|Spotlight-V100|TemporaryItems|Trashes)$/.test(path.basename(dir))) {
        return true;
    }
    return false;
};


exports.getAllPackageJSONFiles = function (dir, skipOSDirs) {
    var packageJSONs = [];

    skipOSDirs = skipOSDirs || true;

    function walk(root, level) {
        var dirList = fs.readdirSync(root);

        for (var i = 0; i < dirList.length; i++) {
            var item = dirList[i];

            if (fs.statSync(path.join(root, item)).isDirectory() && level === 1) {
                // Skip OS directories
                if (!skipOSDirs || !exports.isOSDir(item)) {
                    try {
                        walk(path.join(root, item), level + 1);
                    } catch (e) {}
                }
            } else if (item === "package.json" && level === 2) {
                packageJSONs.push(path.join(root, item));
            }
        }
    }

    walk(dir, 1);

    return packageJSONs;
};
