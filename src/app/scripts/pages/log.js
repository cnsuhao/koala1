/**
 * Tencent is pleased to support the open source community by making KOALA available.
 * Copyright (C) 2014 THL A29 Limited, a Tencent company. All rights reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */


/**
 * compile log
 */

'use strict';

var path = require('path'),
    fs   = require('fs');

//Add error event listener
var errorLog = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'] + '/.koala/error.log';
window.addEventListener('error', function (err) {
    var message = '---error---\n' + err.filename + ':' + err.lineno + '\n' + err.message + '\n\n';
    fs.appendFile(errorLog, message);
    alert(message);
}, false);

function renderPage () {
    //distinguish between different platforms
    $('body').addClass(process.platform);

    var items = [];
    global.errorLogCollection.forEach(function (item) {
        items.push(getItemHtml(item));
    });

    var html = '';
    for (var i = items.length -1; i >= 0; i--) {
        html += items[i];
    }

    $('#log ul').html(html);
}

var itemTmpl =$('#log_tmpl')[0].innerHTML;
function getItemHtml(log) {
    var html = itemTmpl;
    for (var k in log) {
        html = html.replace('{'+ k +'}', log[k]);
    }
    return html;
}

renderPage();

//clear log
$('#clear').click(function () {
    global.errorLogCollection = [];
    $('#log ul').html('');
});

//press esc to close
$(document).keydown(function (e) {
    if (e.which === 27) {
        parent.hideFrame();
    }
});
$('#titlebar .close').click(function () {
    parent.hideFrame();
});
