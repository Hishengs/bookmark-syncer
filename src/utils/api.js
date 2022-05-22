import optionsUtil from './options.js';
import { get as i18nGet } from './i18n.js';
import { showNotification } from './notification.js';
import { GITHUB_URL, GITEE_URL } from './constant.js';

let resolve, reject, store, access_token;

const isInit = new Promise((r, j) => {
  resolve = r;
  reject = j;
});

async function init () {
  try {
    const opts = await optionsUtil.fetch();
    store = opts.store;
    access_token = opts.access_token;
    resolve();
  } catch (e) {
    reject(e);
  }
}

init();

const commonHeaders = () => ({
  'Content-Type': 'application/json;charset=UTF-8',
  'Authorization': `token ${access_token || ''}`,
  'Accept': store === 'github' ? 'application/vnd.github.v3+json' : 'application/json',
});

const getUrl = url => (store === 'github' ? GITHUB_URL : GITEE_URL) + url;

export const isGithub = () => store === 'github';

const handleResponse = response => {
  function throwErr (err) {
    showNotification(err.message);
    throw err;
  }
  // check credentials first
  /* const res = response.json();
  if (res.data && res.data.message && res.data.message === 'Bad credentials') {
    optionsUtil.clear();
    throwErr(new Error(i18nGet('invalid_access_token')));
  } */
  // check status
  const isSuccess = (response.status + '').match(/^2\d{2}/);
  if (isSuccess) return response;
  switch (response.status) {
    case 404:
      throwErr(new Error(i18nGet('GIST_NOT_FOUND')));
  }
  throwErr(new Error(response.statusText));
}

export default {
  async get (url, customHeaders = {}) {
    await isInit;
    return fetch(getUrl(url), {
      method: 'GET',
      headers: {
        ...commonHeaders(),
        ...customHeaders,
      }
    }).then(handleResponse);
  },
  async post (url, data, customHeaders = {}) {
    await isInit;
    return fetch(getUrl(url), {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        ...commonHeaders(),
        ...customHeaders,
      }
    }).then(handleResponse);
  },
  async patch (url, data, customHeaders = {}) {
    await isInit;
    return fetch(getUrl(url), {
      method: 'PATCH',
      body: data,
      headers: {
        ...commonHeaders(),
        ...customHeaders,
      }
    }).then(handleResponse);
  },
};