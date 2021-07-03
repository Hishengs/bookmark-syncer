import storage from './storage.js';
import options from './options.js';
import notification from './notification.js';
import * as i18n from './i18n.js';

const GITHUB_URL = 'https://api.github.com';
const GIST_DESC = 'my gist for bookmark sync';
const FILE_NAME = 'bookmark';

async function onCatch (err, throwError = false) {
  const id = await notification.open(err.message);
  // console.log('>>> onCatch', err.message);
  setTimeout(() => {
    notification.close(id);
  }, 5000);
  if (throwError) throw new Error(err);
}

function setInterceptors (axios) {
  axios.interceptors.request.use(function (config) {
    // console.log('>>> interceptors.request', config);
    return config;
  }, function (error) {
    // console.log('>>> interceptors.request.err', error);
    onCatch(error);
    return Promise.reject(error);
  });
  axios.interceptors.response.use(function (response) {
    // console.log('>>> interceptors.response', response);
    return response;
  }, function (error) {
    // console.log('>>> interceptors.response.err', error);
    let err = error;
    const res = error.response || {};
    if (res.data && res.data.message && res.data.message === 'Bad credentials') {
      options.clear();
      err = new Error(i18n.get('invalid_github_token'));
      err.stack = error.stack;
    }
    onCatch(err);
    return Promise.reject(err);
  });
}

export default {
  axios: null,
  gist: null,
  async getAxios () {
    if (this.axios) return this.axios;
    return await options.fetch().then(options => {
      const { github_token } = options;
      this.axios = window.axios.create({
        baseURL: GITHUB_URL,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'Authorization': `token ${github_token}`,
          'Accept': 'application/vnd.github.v3+json',
        }
      });
      setInterceptors(this.axios);
      return this.axios;
    });
  },
  async getGist () {
    if (this.gist) return this.gist;
    let gist = await storage.getItem('gist');
    gist = gist && JSON.parse(gist);
    if (gist) {
      this.gist = gist;
      return gist;
    }
    return await this.createGist();
  },
  async setGist (gist) {
    if (!gist) {
      this.gist = null;
      await storage.setItem('gist', null);
      return;
    }
    // for small size
    delete gist.files;
    delete gist.history;
    this.gist = gist;
    await storage.setItem('gist', JSON.stringify(gist));
  },
  async createGist () {
    // 先查询 gist 是否已存在
    const gists = await this.fetchGists();
    const gist = gists.find(g => g.files[FILE_NAME]);
    if (gist) {
      await this.setGist(gist);
      return gist;
    }
    const axios = await this.getAxios();
    // see: https://docs.github.com/en/rest/reference/gists#create-a-gist
    return await axios.post('/gists', {
      description: GIST_DESC,
      files: {
        [FILE_NAME]: {
          content: '{}'
        }
      },
      public: false,
    }).then(async (res) => {
      if (res.status !== 201) throw new Error(res.statusText);
      const gist = res.data;
      await this.setGist(gist);
      return gist;
    });
  },
  async update (content) {
    const gist = await this.getGist();
    const axios = await this.getAxios();
    // see: https://docs.github.com/en/rest/reference/gists#update-a-gist
    const data = JSON.stringify({
      files: {
        [FILE_NAME]: {
          content,
        }
      },
    }); 
    return await axios.patch(`/gists/${gist.id}`, data)
      .then(async (res) => {
        if (res.status !== 200) throw new Error(res.statusText);
        const gist = res.data;
        await this.setGist(gist);
        return gist;
      })
      .catch(this.ifNotFound);
  },
  async fetch () {
    const gist = await this.getGist();
    const axios = await this.getAxios();
    // see: https://docs.github.com/en/rest/reference/gists#get-a-gist
    return await axios.get(`/gists/${gist.id}`)
      .then(async (res) => {
        if (res.status !== 200) throw new Error(res.statusText);
        if (res && res.data) {
          const gistFile = res.data.files[FILE_NAME];
          let fileContent;
          if (gistFile.truncated) {
            fileContent = await axios.get(gistFile.raw_url, { responseType: 'blob' }).then(resp => resp.data.text());
          } else {
            fileContent = gistFile.content;
          }
          return fileContent ? JSON.parse(fileContent) : null;
        }
        return null;
      })
      .catch(this.ifNotFound);
  },
  async fetchGists () {
    const axios = await this.getAxios();
    // see: https://docs.github.com/en/rest/reference/gists#list-gists-for-the-authenticated-user
    return await axios.get(`/gists`).then(async (res) => {
      if (res.status !== 200) throw new Error(res.statusText);
      return res.data;
    });
  },
  async ifNotFound (err) {
    if (err.status === 404) {
      await this.setGist(null);
      throw new Error(i18n.get('GIST_NOT_FOUND'));
    } else throw new Error(err);
  },
}