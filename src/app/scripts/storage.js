/**
 * Tencent is pleased to support the open source community by making KOALA available.
 * Copyright (C) 2014 THL A29 Limited, a Tencent company. All rights reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */


/**
 * data storage module
 */

'use strict';

/*
//prject item
class projectItem
    String id
    Object project

prject model
class project{
    String id
    String name
    String src
    Object files
    Object config
}

file item
class files{
    String id
    Object file
}
file model
class file{
    String id
    String pid
    String extension
    String type
    String name
    String src
    String output
    Boolean compile
    Array  imports
    Object settings{
        String outputStyle [nested] //outputstyle
    }
}
*/

var fs          = require('fs'),
    path        = require('path'),
    util        = require('./util'),
    FileManager = global.getFileManager(),
    projectsDb  = {};    //projects datatable object

/**
 * projectDb initializition
 */
function projectDbinitialize() {
    //To read data from the file
    if (!fs.existsSync(FileManager.projectsFile)) {
        fs.appendFile(FileManager.projectsFile, '{}');
    } else {
        projectsDb = util.readJsonSync(FileManager.projectsFile);
    }
}

projectDbinitialize();

/**
 * get projects datatable
 * @return {Object} projects datatable
 */
exports.getProjects = function () {
    return projectsDb;
};

//save projects to file
exports.updateJsonDb = function () {
    fs.writeFileSync(FileManager.projectsFile, JSON.stringify(projectsDb, null, '\t'));
};

/**
 * get import files record
 * @return {Obeject} importsCollection
 */
exports.getImportsDb = function () {
    //read data from file
    var data = {};

    if (fs.existsSync(FileManager.importsFile)) {
        data = util.readJsonSync(FileManager.importsFile);
    }

    return data;
};

/**
 * save import files record
 */
exports.saveImportsDb = function (json) {
    var fd = fs.openSync(FileManager.importsFile, 'w');
    fs.writeSync(fd, json);
    fs.closeSync(fd);
};

/**
 * get history data
 * @return {Object}
 */
exports.getHistoryDb = function () {
    return JSON.parse(global.localStorage.getItem('historyDb') || '{}');
};

/**
 * save history data
 * @param  {String} json
 */
exports.saveHistoryDb = function (data) {
    global.localStorage.setItem('historyDb', JSON.stringify(data));
};
