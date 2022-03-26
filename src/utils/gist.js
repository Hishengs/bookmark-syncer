import storage from './storage.js';
import options from './options.js';
import $api, { isGithub } from './api.js';
import { GIST_DESC, FILE_NAME } from './constant.js';

const Gist = {
  gist: null,
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
      await storage.removeItem('gist');
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
    // see: https://docs.github.com/en/rest/reference/gists#create-a-gist
    return await $api.post('/gists', {
      description: GIST_DESC,
      files: {
        [FILE_NAME]: {
          content: '{}'
        }
      },
      public: false,
    }).then(async (res) => {
      if (res.status !== 201) throw new Error(res.statusText);
      const gist = await res.json();
      await this.setGist(gist);
      return gist;
    });
  },
  async update (content) {
    const gist = await this.getGist();
    // see: https://docs.github.com/en/rest/reference/gists#update-a-gist
    const data = {
      files: {
        [FILE_NAME]: {
          content: !isGithub() ? encodeURIComponent(content) : content,
        }
      },
    };
    return await $api.patch(`/gists/${gist.id}`, JSON.stringify(data))
      .then(async (res) => {
        if (res.status !== 200) throw new Error(res.statusText);
        const gist = await res.json();
        await this.setGist(gist);
        return gist;
      });
  },
  async fetch () {
    const gist = await this.getGist();
    // see: https://docs.github.com/en/rest/reference/gists#get-a-gist
    return await $api.get(`/gists/${gist.id}`)
      .then(async (res) => {
        const data = await res.json();
        if (data) {
          const gistFile = data.files[FILE_NAME];
          let fileContent;
          if (gistFile.truncated) {
            fileContent = await $api.get(gistFile.raw_url, { responseType: 'blob' }).then(resp => resp.text());
          } else {
            fileContent = gistFile.content;
          }
          const isGitee = !isGithub();
          return fileContent ? JSON.parse(isGitee ? decodeURIComponent(fileContent) : fileContent) : null;
        }
        return null;
      });
  },
  async fetchGists () {
    // see: https://docs.github.com/en/rest/reference/gists#list-gists-for-the-authenticated-user
    return await $api.get(`/gists`).then(async (res) => {
      return await res.json();
    });
  },
  async reset () {
    this.gist = null;
    await storage.removeItem('gist');
  }
};

options.onChange(Gist.reset.bind(Gist));

export default Gist;