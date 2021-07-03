import {
  bookmark as bookmarkUtils,
  notification,
  gist,
  options,
  i18n,
} from './utils/index.js';
import { HOME_PAGE } from './utils/constant.js';

const browser = chrome;

const inChrome = /chrome/i.test(window.navigator.userAgent);

async function showMsg (msg, alert = false) {
  const msgId = await notification.open(msg);
  console.log('showMsg', msgId, chrome.runtime.lastError)
  setTimeout(() => {
    notification.close(msgId);
  }, 5000);
  if (/* inChrome ||  */alert) window.alert(msg);
}

class BookmarkManage {

  async getLocalBookmark () {
    const bookmarks = await bookmarkUtils.getTree();
    return { bookmarks };
  }

  async getRemoteBookmark () {
    return await gist.fetch();
  }

  // local => remote
  async updateRemoteBookmark (bookmarks) {
    await gist.update(JSON.stringify(bookmarks, null, 2));
  }

  async syncFromRemote () {
    const confirm = window.confirm(i18n.get('SYNC_FROM_REMOTE_WRN'))
    if (!confirm) return;
    const remote = await this.getRemoteBookmark();
    if (!this.isBookmarkAvailable(remote, i18n.get('REMOTE_BOOKMARK_EMPTY_TIP'))) return;
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
    showMsg(i18n.get('SYNC_FROM_REMOTE_SUCCESS'));
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
    const confirm = window.confirm(i18n.get('SYNC_TO_REMOTE_WRN'));
    if (!confirm) return;
    const local = await this.getLocalBookmark();
    await this.updateRemoteBookmark(local);
    showMsg(i18n.get('SYNC_TO_REMOTE_SUCCESS'));
  }
}

const bm = new BookmarkManage();

browser.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  // console.log('background:', request);
  try {
    switch (request.name) {
      case 'sync-from-remote':
        await bm.syncFromRemote();
        break;
      case 'sync-to-remote':
        await bm.syncToRemote();
        break;
      case 'show-options':
        browser.runtime.openOptionsPage();
        break;
      case 'update-options':
        await options.update(request.options);
        showMsg(i18n.get('OPTIONS_UPDATED'));
        break;
      case 'get-options':
        sendResponse(options.options || {});
        break;
      case 'show-msg':
        showMsg(request.msg);
        break;
      case 'help':
        window.open(HOME_PAGE);
        break;
    }
  } catch (e) {
    showMsg(e.message);
  }
});
