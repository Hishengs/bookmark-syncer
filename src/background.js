import {
  storage,
  bookmark as bookmarkUtils,
  notification,
  gist
} from './utils/index.js';

const browser = chrome;

const inChrome = /chrome/i.test(window.navigator.userAgent);

async function showMsg (msg, alert = false) {
  const msgId = await notification.open(msg);
  console.log('showMsg', msgId, chrome.runtime.lastError)
  setTimeout(() => {
    notification.close(msgId);
  }, 5000);
  if (inChrome || alert) window.alert(msg);
}

class BookmarkManage {
  options = null

  async init () {
    this.options = await this.getOptions();
  }

  async getOptions () {
    const options = await storage.getItem('options');
    return options && JSON.parse(options);
  }

  async setOptions (options = {}) {
    this.options = options;
    return await storage.setItem('options', JSON.stringify(options));
  }

  async getLocalBookmark () {
    const bookmarks = await bookmarkUtils.getTree();
    return { bookmarks };
  }

  async getRemoteBookmark () {
    if (!(await this.checkOptions())) return null;
    try {
      return await gist.fetch();
    } catch (e) {
      showMsg(e.message);
      return null;
    }
  }

  // local => remote
  async updateRemoteBookmark (bookmarks) {
    if (!(await this.checkOptions())) return;
    await gist.update(JSON.stringify(bookmarks, null, 2));
  }

  async checkOptions () {
    if (!this.options) {
      await showMsg("配置为空，请先更新你的配置信息");
      return false;
    }
    return true;
  }

  async syncFromRemote () {
    if (!(await this.checkOptions())) return;
    const confirm = window.confirm('确定要从远端（github）同步书签？本地书签将被完全覆盖！')
    if (!confirm) return;
    const remote = await this.getRemoteBookmark();
    if (!this.isBookmarkAvailable(remote, '远端书签记录为空，请先同步本地书签至远端')) return;
    const local = await this.getLocalBookmark();
    if (!this.isBookmarkAvailable(local)) return;
    // 只操作【书签栏】的书签，不处理【其他书签】
    const remoteBookmark = remote.bookmarks[0].children[0];
    const localBookmark = local.bookmarks[0].children[0];
    // clear
    await this.clearBookmarks(localBookmark);
    // create
    await this.createBookmarks(remoteBookmark);
    // console.log('syncFromRemote', { remote, local, remoteBookmark, localBookmark });
    showMsg('远端书签已同步至本地');
  }

  isBookmarkAvailable (bm, msg) {
    const valid = Boolean(bm && bm.bookmarks && bm.bookmarks.length && bm.bookmarks[0].children.length);
    if (!valid && msg) showMsg(msg);
    return valid;
  }

  async clearBookmarks (bookmark) {
    // await bookmark.children.map(node => console.log('移除书签', node));
    await bookmark.children.map(node => bookmarkUtils.remove(node));
  }

  async createBookmarks (bookmark) {
    // await bookmark.children.map(node => console.log('创建书签', node, bookmark.id));
    await bookmark.children.map(node => bookmarkUtils.create(node, bookmark.id));
  }

  async syncToRemote () {
    if (!(await this.checkOptions())) return;
    const confirm = window.confirm('确定要同步书签到远端（github）？远端书签将被完全覆盖！')
    if (!confirm) return;
    const local = await this.getLocalBookmark();
    await this.updateRemoteBookmark(local);
    // console.log('本地书签已同步至远端', local);
    showMsg('本地书签已同步至远端');
  }
}

// storage.setItem('gist', null);
// storage.setItem('options', null);

const bm = new BookmarkManage();
bm.init();

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  // console.log('background:', request);
  try {
    switch (request.name) {
      case 'sync-from-remote':
        bm.syncFromRemote();
        break;
      case 'sync-to-remote':
        bm.syncToRemote();
        break;
      case 'show-options':
        browser.runtime.openOptionsPage();
        break;
      case 'update-options':
        await bm.setOptions(request.options);
        showMsg('配置已更新');
        break;
      case 'get-options':
        sendResponse(bm.options);
        break;
      case 'show-msg':
        showMsg(request.msg);
        break;
      case 'help':
        window.open('https://github.com/hishengs/bookmark-syncer');
        break;
    }
  } catch (e) {
    showMsg(e.message);
  }
});
