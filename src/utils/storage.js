const browser = chrome;

export default {
  async setItem (key, value) {
    return new Promise((resolve, reject) => {
      browser.storage.sync.set({
        [key]: value
      }, () =>{
        if (browser.runtime.lastError) {
          reject(browser.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  },
  async getItem (key) {
    return new Promise((resolve, reject) => {
      browser.storage.sync.get(key, (res) => {
        if (browser.runtime.lastError) {
          reject(browser.runtime.lastError);
        } else {
          const result = res && res[key];
          resolve(result);
        }
      });
    })
  },
  async removeItem (key) {
    return new Promise((resolve, reject) => {
      browser.storage.sync.remove(key, () =>{
        if (browser.runtime.lastError) {
          reject(browser.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  },
};