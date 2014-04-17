/**
 * Tencent is pleased to support the open source community by making KOALA available.
 * Copyright (C) 2014 THL A29 Limited, a Tencent company. All rights reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */


var win = require('nw.gui').Window.get();
    win.setAlwaysOnTop(true);

$('#close').click(function () {
    win.close();
});
//press esc to close
$(document).keydown(function (e) {
    if (e.which === 27) {
        win.close();
    }
});

// auto close
var notificationTimeId,
    autoClose = function () {
        notificationTimeId = setTimeout(function () {
            win.close();
        }, 5000);
    }

autoClose();

$(document.body).on('mouseenter', function () {
    if (notificationTimeId) clearTimeout(notificationTimeId);
}).on('mouseleave', function () {
    autoClose();
});
