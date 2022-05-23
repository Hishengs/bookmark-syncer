import gist from './utils/gist.js';
import { get as i18nGet } from './utils/i18n.js';
import bookmarkUtils from './utils/bookmark.js';
import { showNotification } from './utils/notification.js';

const winConfirm = window.confirm;

class BookmarkManager {

  async getLocalBookmark () {
    const bookmarks = await bookmarkUtils.getTree();
    return { bookmarks };
  }

  async getRemoteBookmark () {
    return await gist.fetch();
  }

  // TODO: works to be continued...
  async autoSyncBookmark () {
    const local = await this.getLocalBookmark();
    const remote = await this.getRemoteBookmark();
    // const isGroup = node => !!node.children;
    function diffNodes (localNodes, remoteNodes, localParent, remoteParent) {
      let i = 0, total = remoteNodes.length > localNodes.length ? remoteNodes.length : localNodes.length;
      while (i < total) {
        let local = localNodes[i];
        let remote = remoteNodes[i];
        if (local && remote) {
          // const isRemoteNewer = remote.
        } else if (local & !remote) {
          // if remote newer than local
          if (localParent && remoteParent && remoteParent.dateGroupModified > localParent.dateGroupModified) {
            // remove local
            delete localNodes[i];
          }
        } else if (!local & remote) {
          // if remote newer than local
          if (localParent && remoteParent && remoteParent.dateGroupModified > localParent.dateGroupModified) {
            // add local
            localNodes[i] = remote;
          }
        }
        i--;
      }
    }
    diffNodes(local.bookmarks, remote.bookmarks);
  }

  // local => remote
  async updateRemoteBookmark (bookmarks) {
    await gist.update(JSON.stringify(bookmarks, null, 2));
  }

  async syncFromRemote () {
    let confirm = await winConfirm(i18nGet('SYNC_FROM_REMOTE_WRN'));
    if (!confirm) return;
    const remote = await this.getRemoteBookmark();
    if (!this.isBookmarkAvailable(remote, i18nGet('REMOTE_BOOKMARK_EMPTY_TIP'))) return;
    // check if empty
    if (this.isEmpty(remote)) {
      confirm = await winConfirm(i18nGet('remote_empty_confirm'));
      if (!confirm) return;
    }
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
    showNotification(i18nGet('SYNC_FROM_REMOTE_SUCCESS'));
  }

  isBookmarkAvailable (bm, msg) {
    const valid = Boolean(bm && bm.bookmarks && bm.bookmarks.length && bm.bookmarks[0].children.length);
    if (!valid && msg) showNotification(msg);
    return valid;
  }

  isEmpty (bm) {
    if (!this.isBookmarkAvailable(bm)) return;
    const bookmark = bm && bm.bookmarks && bm.bookmarks.length && bm.bookmarks[0].children[0];
    return !(bookmark && bookmark.children.length);
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
    let confirm = await winConfirm(i18nGet('SYNC_TO_REMOTE_WRN'));
    if (!confirm) return;
    const local = await this.getLocalBookmark();
    // check if empty
    if (this.isEmpty(local)) {
      confirm = await winConfirm(i18nGet('local_empty_confirm'));
      if (!confirm) return;
    }
    await this.updateRemoteBookmark(local);
    showNotification(i18nGet('SYNC_TO_REMOTE_SUCCESS'));
  }

  async clearLocal () {
    const confirm = await winConfirm(i18nGet('clear_local_confirm'));
    if (!confirm) return;
    const local = await this.getLocalBookmark();
    if (!this.isBookmarkAvailable(local)) return;
    const localBookmark = local.bookmarks[0].children[0];
    // clear
    await this.clearBookmarks(localBookmark);
    showNotification(i18nGet('clear_success'));
  }
}

export const bookmarkManager = new BookmarkManager();
