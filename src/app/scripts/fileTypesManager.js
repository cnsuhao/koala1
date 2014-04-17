/**
 * Tencent is pleased to support the open source community by making KOALA available.
 * Copyright (C) 2014 THL A29 Limited, a Tencent company. All rights reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */


/**
 * compilers manager module
 */

'use strict';

exports.fileTypes = {};

/**
 * Add File Type Object
 * @param {object} typeObj File Type Object
 */
exports.addFileType = function (typeObj) {
	for (var k in typeObj) {
		exports.fileTypes[k] = typeObj[k];
	}
}

/**
 * Get File Types
 * @return {object} file types
 */
exports.getFileTypes = function () {
	return exports.fileTypes;
}

/**
 * Get File Types As A Array
 * @return {array} file types
 */
exports.getFileTypesAsArray = function () {
	var fileTypes = [];
	for (var k in exports.fileTypes) {
		fileTypes.push(exports.fileTypes[k]);
	}
	return fileTypes;
}

/**
 * Get File Type Object By File Extension
 * @param  {string} ext file extension
 * @return {object}     file type
 */
exports.getFileTypeByExt = function (ext) {
	return exports.fileTypes[ext];
}

/**
 * Get Extensions
 * @return {array} extensions
 */
exports.getExtensions = function () {
	return Object.keys(exports.fileTypes);
}

/**
 * Get Extensions Of Category
 * @param  {string} category category name
 * @return {array}          extensions
 */
exports.getExtsByCategory = function (category) {
	var exts = [];

	for (var k in exports.fileTypes) {
		if (exports.fileTypes[k].category === category) {
			exts.push(k);
		}
	}
	
	return exts;
}
