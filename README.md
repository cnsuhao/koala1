Koala是一款预处理器语言图形编译工具，支持[Less](http://lesscss.org/)、[Sass](http://www.sass-lang.com/)、[CoffeeScript](http://www.coffeescript.org/)、[Compass framework](http://compass-style.org/)，帮助web开发者更高效地使用它们进行开发。跨平台运行，完美兼容windows、linux、mac。

项目主页：[http://koala-app.com](http://koala-app.com/index-zh.html)

### 功能特性
* **多语言支持** 支持Less、Sass、CoffeeScript 和 Compass Framework。
* **实时编译** 监听文件，当文件改变时自动执行编译，这一切都在后台运行，无需人工操作。
* **编译选项** 可以设置各个语言的编译选项。
* **项目配置** 支持为项目创建一个全局配置，为文件设置统一编译选项。
* **错误提示** 在编译时如果遇到语法的错误，koala将在右下角弹出错误信息，方便开发者定位代码错误位置。
* **跨平台** Windows、Linux、Mac都能完美运行。

### 系统支持及要求
Koala支持跨平台运行，完美兼容Windows、Linux与Mac. Sass编译要求Windows/Linux系统已安装好Ruby运行环境。

### 截图

![linux](http://oklai.github.com/koala/img/screenshots/linux.png)

### 开发文档
Koala基于[node-webkit](https://github.com/rogerwang/node-webkit)进行开发。node-webkit 是 NodeJS 与 Webkit 的结合所提供的一个跨平台客户端应用开发底层构架。这也就意味着基于 node-webkit 之上，使用 Web技术 ( Node.JS，JavaScript，HTML5 )就可以编写客户端应用程序。

#### 如何编译Koala源码
1. 首先克隆Koala源码到你的本地, `$ git clone https://github.com/oklai/koala.git Koala`；
2. 下载与你系统环境相对应已编译好的node-webkit(<=0.8.x)文件，（见 `node-webkit` 项目介绍页中的下载链接）；
3. **windows系统：**复制 `nw.exe, nw.pak, icudt.dll` 到 `koala/src` 目录，并安装 [Ruby](http://www.ruby-lang.org/) 到 `koala/src/ruby` 目录；**Linux系统：**复制 `nw, nw.pak`，并安装ruby环境：`sudo apt-get install ruby`; **Mac OSX系统：**复制 `node-webkit.app`，Mac OSX已内置ruby，无需额外安装；
4. 最后运行`nw`可执行程序。

更多关于`node-webkit`开发文档可参考其官方[wiki](https://github.com/rogerwang/node-webkit/wiki)。

### 版权声明
Koala's code uses the Apache license, Version 2.0, see our LICENSE file.
