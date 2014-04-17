/**
 * Tencent is pleased to support the open source community by making KOALA available.
 * Copyright (C) 2014 THL A29 Limited, a Tencent company. All rights reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */


/**
 * locales message services
 */

'use strict';

var fs             = require('fs'),
    util           = require('./util.js'),
    appConfig      = require('./appConfigManager.js').getAppConfig(),
    locales        = appConfig.locales,
    localStorage   = global.localStorage;

/**
 * get message of current language
 * @param  {String} id message id
 * @return {String}    message
 */
exports.__ = function (id) {
    var message = '',
        data = util.parseJSON(localStorage.getItem('localesContent')) || {},
        defaultData = {};

    // get default data if the locales pack not is built-in pack
    if (appConfig.builtInLanguages.indexOf(locales) === -1) {
        defaultData = util.parseJSON(localStorage.getItem('defaultLocalesContent')) || {};
    }

    message = data[id] || defaultData[id] || id;
    if (message && arguments.length) {
        for (var i = 1; i < arguments.length; i++) {
            message = message.replace('${' + i + '}', arguments[i]);
        }
    }

    return message;
};


