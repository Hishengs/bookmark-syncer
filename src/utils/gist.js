import storage from './storage.js';
import notification from './notification.js';

const GITHUB_URL = 'https://api.github.com';
const GIST_DESC = 'my gist for bookmark sync';
const FILE_NAME = 'bookmark';

export default {
  axios: null,
  options: null,
  gist: null,
  async getAxios () {
    if (this.axios) return this.axios;
    return await this.getOptions().then(options => {
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
      return this.axios;
    });
  },
  async getOptions () {
    if (this.options) return this.options;
    return await storage.getItem('options').then((options) => {
      if (!options) {
        const msg = '配置为空，请先更新你的配置信息';
        notification.open(msg);
        throw new Error(msg);
      }
      this.options = options && JSON.parse(options);
      return this.options;
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
  updateGist (gist) {
    // for small size
    delete gist.files;
    delete gist.history;
    this.gist = gist;
    storage.setItem('gist', JSON.stringify(gist));
  },
  async createGist () {
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
    }).then(res => {
      if (res.status !== 201) throw new Error(res.statusText);
      const gist = res.data;
      this.updateGist(gist);
      return gist;
    });
  },
  async update (content) {
    const gist = await this.getGist();
    const axios = await this.getAxios();
    // see: https://docs.github.com/en/rest/reference/gists#update-a-gist
    return await axios.patch(`/gists/${gist.id}`, JSON.stringify({
      files: {
        [FILE_NAME]: {
          content,
        }
      },
    })).then(res => {
      if (res.status !== 200) throw new Error(res.statusText);
      const gist = res.data;
      this.updateGist(gist);
      return gist;
    });
  },
  async fetch () {
    const gist = await this.getGist();
    const axios = await this.getAxios();
    // see: https://docs.github.com/en/rest/reference/gists#get-a-gist
    return await axios.get(`/gists/${gist.id}`).then(async (res) => {
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
    });
  },
  async fetchAll () {
    const axios = await this.getAxios();
    // see: https://docs.github.com/en/rest/reference/gists#list-gists-for-the-authenticated-user
    return await axios.get(`/gists`).then(async (res) => {
      if (res.status !== 200) throw new Error(res.statusText);
      return res.data;
    });
  }
}