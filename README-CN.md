# bookmark-syncer
一个用于同步 chrome 书签的插件

## 功能特点

- 从远端同步书签 (gists)
- 同步书签到远端
- 跨设备同步
- 无服务端，无需担心数据安全和隐私
- 同时支持 github 或者 gitee 存储
- 支持 chrome/edge/qq/360 等浏览器

> 使用 Github 的 [gists](https://gist.github.com/) 或者 [Gitee](https://gitee.com/) 的 gists 服务来存储你的书签数据

## 如何使用

首先，你必须先有一个 Github 账号

然后，生成一个 access token :

访问 [https://github.com/settings/tokens](https://github.com/settings/tokens)

点击 **Generate new token**

![](./assets/img/generate.png)

选择 scope: gist

![](./assets/img/scope.png)

复制你的 access token，类似于 "ghp_xxxxxxxxxxxxx"

在设置面板中填入

![](./assets/img/setting.png)

万事俱备，开始同步你的书签吧~

![](./assets/img/popup.png)
