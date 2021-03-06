# bookmark-syncer
A Chrome Extension for Bookmark Sync. [中文文档](./README-CN.md)

> 最新代码支持 chrome extension v3, v2 版本请查看 v2 分支，已不再维护

## features

- sync bookmarks from remote (gists)
- sync bookmarks to remote
- across devices
- no server, no worry about data security and privacy
- support github gists and gitee gists both
- support chrome/edge/qq/360 browser, etc.

> [gists](https://gist.github.com/) of Github / gists of [Gitee](https://gitee.com/) is used to store your bookmarks data (private)


## install

[Chrome Store](https://microsoftedge.microsoft.com/addons/detail/bookmark-syncer/pnhcpopelnamhdhkdccijehenbikojge) , [Edge Store](https://microsoftedge.microsoft.com/addons/detail/bookmark-syncer/pnhcpopelnamhdhkdccijehenbikojge)

## get started

First of all, you should have a github account, which we use it to create a gist, to store your bookmarks.

secondly, generate a github private access token:

go to [https://github.com/settings/tokens](https://github.com/settings/tokens)

click **Generate new token**

![](./assets/img/generate.png)

pick scope: gist

![](./assets/img/scope.png)

copy your access token like: "ghp_xxxxxxxxxxxxx"

fill in the setting

![](./assets/img/setting.png)

and that is all, enjoy this tool

![](./assets/img/popup.png)
