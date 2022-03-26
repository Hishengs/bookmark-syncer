import { delay } from './funcs.js';

const browser = chrome;

export async function open (args) {
  let opt = { title: 'Tip', message: '' };
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
}

export async function close (id) {
  await new Promise((resolve) => {
    browser.notifications.clear(id,  resolve);
  });
}

export async function showNotification (msg, delayTime = 5000) {
  window.alert(msg);
  /* const msgId = await open(msg);
  await delay(delayTime);
  close(msgId); */
}