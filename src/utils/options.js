import storage from './storage.js';
import { NO_OPTIONS_MSG } from './constant.js';

// const browser = chrome;
const OPTIONS_NAME = 'options';

const OPTS = {
  options: null,
  async fetch (throwError = true) {
    if (this.options) return this.options;
    let options = await storage.getItem(OPTIONS_NAME);
    if (options) {
      options = JSON.parse(options);
      this.options = options;
      return this.options;
    }
    // browser.runtime.openOptionsPage();
    if (throwError) {
      throw new Error(NO_OPTIONS_MSG);
    }
  },
  async update (options) {
    if (!options) return;
    this.options = options;
    return await storage.setItem(OPTIONS_NAME, JSON.stringify(options));
  },
  async clear () {
    this.options = null;
    await storage.setItem(OPTIONS_NAME, null);
  }
};

OPTS.fetch();

export default OPTS;