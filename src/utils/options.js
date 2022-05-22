import storage from './storage.js';
import { get as i18nGet } from './i18n.js';
import { OPTIONS_NAME } from './constant.js';

const DEFAULT_OPTIONS = {
  store: 'github', // gist store type, github / gitee
  access_token: '', // access token of gist
  syncFrequency: 5 * 60 * 1000, // 5min
};

const optionsUtil = {
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
    options = Object.assign({}, DEFAULT_OPTIONS);
    // set default options if first time
    await storage.setItem(OPTIONS_NAME, JSON.stringify(options));
    return options;
    // browser.runtime.openOptionsPage();
    // throw new Error(i18nGet('NO_OPTIONS_MSG'));
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

optionsUtil.fetch().catch(err => {});

export default optionsUtil;