const browser = chrome

function merge (source, target) {
  return Object.assign({}, source, target)
}

class BookmarkManage {
  axios = window.axios
  options = null

  async init () {
    this.options = await this.getOptions()
    if (!this.options) return
    const { github_token } = this.options
    this.axios = axios.create({
      baseURL: 'https://api.github.com',
      timeout: 6000,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'Authorization': `token ${github_token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    })
  }

  async getLocalBookmark () {
    return new Promise(resolve => {
      browser.bookmarks.getTree((bookmarks) => {
        resolve({
          bookmarks
        });
      });
    })
  }

  async getRemoteBookmark () {
    if (!this.options) return null
    const { gist_id, file_name } = this.options
    const res = await this.axios.get(`/gists/${gist_id}`)
    if (res && res.data) {
      const gistFile = res.data.files[file_name]
      let fileContent
      if (gistFile.truncated) {
        fileContent = await this.axios.get(gistFile.raw_url, { responseType: 'blob' }).then(resp => resp.data.text())
      } else {
        fileContent = gistFile.content
      }
      return fileContent ? JSON.parse(fileContent) : null
    }
  }

  updateLocalBookmark () {
    //
  }

  updateRemoteBookmark (bookmarks) {
    if (!this.options) return
    const { gist_id, file_name } = this.options
    const data = JSON.stringify({
      files: {
        [file_name]: {
          content: JSON.stringify(bookmarks)
        }
      },
      description: file_name
    })
    this.axios.patch(`https://api.github.com/gists/${gist_id}`, data)
      .then(resp => resp.data)
      .then(data => {
        console.log('updateRemoteBookmark.data', data)
      })
      .catch(err => {
        console.log('updateRemoteBookmark.err', err)
      })
  }

  getOptions () {
    return new Promise((resolve, reject) => {
      browser.storage.sync.get('options', (res) => {
        if (browser.runtime.lastError) {
          reject(browser.runtime.lastError);
        } else {
          const options = res && res['options']
          resolve(options && JSON.parse(options));
        }
      });
    })
  }

  setOptions (options = {}) {
    return new Promise((resolve, reject) => {
      browser.storage.sync.set({
        'options': JSON.stringify(options)
      }, () => {
        if (browser.runtime.lastError) {
          reject(browser.runtime.lastError);
        } else {
          this.options = options
          resolve();
        }
      });
    })
  }

  async check () {
    if (!this.options) {
      await this.showMsg("update your setting first", true);
      // browser.runtime.openOptionsPage();
      return false;
    }
    return true;
  }

  async syncFromRemote () {
    if (!(await this.check())) return;
    const confirm = window.confirm('确定要从远端（github）同步书签？本地书签将被完全覆盖！')
    if (!confirm) return;
    const remote = await this.getRemoteBookmark()
    if (!remote || !remote.bookmarks || !remote.bookmarks.length || !remote.bookmarks[0].children.length) return;
    const local = await this.getLocalBookmark()
    if (!local || !local.bookmarks || !local.bookmarks.length || !local.bookmarks[0].children.length) return;
    const remote_bookmark = remote.bookmarks[0].children[0];
    const local_bookmark = local.bookmarks[0].children[0];
    // clear
    await this.clearBookmarks(local_bookmark);
    // create
    await this.createBookmarks(remote_bookmark);
    console.log('syncFromRemote', { remote, local, remote_bookmark, local_bookmark })
  }

  async clearBookmarks (bookmark) {
    return new Promise((resolve, reject) => {
      const promises = bookmark.children.map(node => {
        return new Promise((rs, rj) => {
          try {
            console.log('尝试移除书签', node);
            rs();
            // browser.bookmarks[node.children ? 'removeTree' : 'remove'](node.id, rs);
          } catch (e) {
            rj(e);
          }
        })
      });
      return Promise.all(promises).then(resolve).catch(reject);
    });
  }

  async createBookmarks (bookmark) {
    async function createNode (node, parentId) {
      await new Promise(resolve => {
        const { title, url, children } = node;
        console.log('尝试创建书签', { parentId, title, url });
        if (children && children.length) {
          resolve(Promise.all(children.map(n => createNode(n, (parseInt(parentId) + 1) + ''))))
        } else resolve();
        /* browser.bookmarks.create({ parentId, title, url }, (newNode) => {
          if (children && children.length) {
            resolve(Promise.all(children.map(n => createNode(n, newNode.id))))
          } else resolve();
        }) */
      })
    }
    return bookmark.children.map(node => {
      return createNode(node, '1')
    });
  }

  async syncToRemote () {
    if (!(await this.check())) return;
    const confirm = window.confirm('确定要同步书签到远端（github）？远端书签将被完全覆盖！')
    if (!confirm) return;
    const local = await this.getLocalBookmark()
    await this.updateRemoteBookmark(local)
    console.log('syncToRemote', local)
  }

  async showMsg (msg, alert = false) {
    await new Promise((resolve, reject) => {
      browser.notifications.create({
        type: "basic",
        iconUrl: '../icon/32.png',
        title: '提示',
        message: msg
      }, id => {
        console.log('notifications', id)
        alert && window.alert(msg)
        if (id) resolve()
        else reject()
      });
    })
  }
}

const bm = new BookmarkManage()
bm.init()

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('background:', request)
  if (request.name === 'sync-from-remote') {
    bm.syncFromRemote()
  } else if (request.name === 'sync-to-remote') {
    bm.syncToRemote()
  } else if (request.name === 'setting') {
    browser.runtime.openOptionsPage()
  } else if (request.name === 'update-setting') {
    bm.setOptions(request.options)
    browser.runtime.closeOptionsPage()
  }
})
