import * as i18n from './i18n.js';

const browser = chrome;

export default {
  async open (args) {
    let opt = { title: i18n.get('tip'), message: '' };
    if (typeof args === 'string') {
      opt.message = args;
    }
    if (Object.prototype.toString.call(args) === '[object Object]') {
      opt = Object.assign(opt, args);
    }
    return await new Promise(resolve => {
      browser.notifications.create({
        type: "basic",
        iconUrl: '../../icon/32.png',
        title: opt.title,
        message: opt.message
      }, resolve);
    });
  },
  async close (id) {
    await new Promise((resolve) => {
      browser.notifications.clear(id,  resolve);
    });
  }
}