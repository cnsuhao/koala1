/**
 * Tencent is pleased to support the open source community by making KOALA available.
 * Copyright (C) 2014 THL A29 Limited, a Tencent company. All rights reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */


/**
 * Compiler Class
 */

'use strict';

var util          = require('./util.js'),
	storage       = require('./storage.js'),
	configManager = require('./appConfigManager.js'),
	notifier      = require('./notifier.js'),
	fileWatcher   = require('./fileWatcher.js'),
	FileManager   = require('./FileManager.js');

/**
 * Compile Class
 * @param {object} config compiler config
 */
function Compiler (config) {
	for (var k in config) {
		this[k] = config[k];
	}
}

module.exports = Compiler;

/**
 * Compile Method
 * @param  {object} file     file object
 * @param  {Object} handlers  compile event handlers
 */
Compiler.prototype.compile = function(file, handlers) {
	// this method will be overwritten
};

/**
 * Get Global Settings Of Compile
 * @param  {string} compileName compiler name
 * @return {object}             settings
 */
Compiler.prototype.getGlobalSettings = function(compileName) {
	return util.clone(configManager.getGlobalSettingsOfCompiler(compileName || this.name));
};

/**
 * Get App Config
 * @return {object} app config
 */
Compiler.prototype.getAppConfig = function () {
	return util.clone(configManager.getAppConfig());
};

/**
 * Get Project Data By Project ID
 * @param  {string} pid project id
 * @return {object}     project data
 */
Compiler.prototype.getProjectById= function (pid) {
	return util.clone(storage.getProjects()[pid]);
};

/**
 * throw error message
 * @param  {string} message  error message
 * @param  {string} filePath file path
 */
Compiler.prototype.throwError = function(message, filePath) {
	notifier.throwError(message, filePath);
};

/**
 * watch import files
 * @param  {array} imports    import array
 * @param  {string} sourceFile sourcr file
 */
Compiler.prototype.watchImports = function (imports, sourceFile) {
	fileWatcher.addImports(imports, sourceFile);
}
