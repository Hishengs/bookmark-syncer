import storage from './storage.js';
import { get as i18nGet } from './i18n.js';

// const browser = chrome;
const OPTIONS_NAME = 'options';

const OPTS = {
  options: null,
  changeCbs: [],
  async fetch () {
    if (this.options) return this.options;
    let options = await storage.getItem(OPTIONS_NAME);
    if (options) {
      options = JSON.parse(options);
      this.options = options;
      return this.options;
    }
    // browser.runtime.openOptionsPage();
    throw new Error(i18nGet('NO_OPTIONS_MSG'));
  },
  async update (options) {
    if (!options) return;
    if (this.options && JSON.stringify(options) !== JSON.stringify(this.options)) {
      this.changeCbs.forEach(cb => cb && cb());
    }
    this.options = options;
    return await storage.setItem(OPTIONS_NAME, JSON.stringify(options));
  },
  async clear () {
    this.options = null;
    await storage.removeItem(OPTIONS_NAME);
  },
  onChange (cb) {
    if (typeof cb === 'function') this.changeCbs.push(cb);
  }
};

OPTS.fetch().catch(err => {});

export default OPTS;