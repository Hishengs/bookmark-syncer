const browser = chrome

function merge (source, target) {
  return Object.assign({}, source, target)
}

class BookmarkManage {
  axios = window.axios

  async init () {
    const options = await this.getOptions()
    this.axios = axios.create({
      baseURL: 'https://api.github.com',
      timeout: 6000,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'Authorization': `token ${options.github_token}`,
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
    const options = await this.getOptions()
    const res = await this.axios.get(`/gists/${options.gist_id}`)
    if (res && res.data) {
      const gistFile = res.data.files[options.file_name]
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

  updateRemoteBookmark (options, bookmarks) {
    const data = JSON.stringify({
      files: {
        [options.file_name]: {
          content: JSON.stringify(bookmarks)
        }
      },
      description: options.file_name
    })
    this.axios.patch(`https://api.github.com/gists/${options.gist_id}`, data)
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
          console.log('getOptions:', res)
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
          resolve();
        }
      });
    })
  }

  async sync () {
    // TODO: 同步步骤
    // 1. 递归遍历对比本地和远程书签树
    // 2. 相同 id 比较 date 取 date 较新的
    // 3. ......

    /* const file = await this.getRemoteBookmark()
    console.log('getRemoteBookmark:', file) */

    /* const options = await this.getOptions()
    console.log('options:', options)
    const local = await this.getLocalBookmark()
    this.updateRemoteBookmark(options, local); */

    /* const remote = this.getRemoteBookmark()
    const merged = merge(local, remote)
    this.updateLocalBookmark(merged)
    this.updateRemoteBookmark(merged)
    console.log('merged:', merged) */
  }
}

const bm = new BookmarkManage()
bm.init()

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('background:', request)
  if (request.name === 'sync') {
    bm.sync()
  } else if (request.name === 'setting') {
    browser.runtime.openOptionsPage()
  } else if (request.name === 'update-setting') {
    bm.setOptions(request.options)
  }
})
