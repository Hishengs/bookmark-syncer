const browser = chrome;

export default {
  async getTree () {
    return new Promise(resolve => {
      browser.bookmarks.getTree(resolve);
    });
  },
  async remove (node) {
    const isFolder = node.children || !node.url;
    return new Promise((resolve) => {
      browser.bookmarks[isFolder ? 'removeTree' : 'remove'](node.id, resolve);
    });
  },
  async create (node, parentId) {
    return new Promise((resolve) => {
      const { title, url, children } = node;
      browser.bookmarks.create({ parentId, title, url }, (newNode) => {
        if (children && children.length) {
          const promises = children.map(n => {
            return this.create(n, newNode.id);
          });
          Promise.all(promises).then(() => {
            resolve(newNode);
          });
        } else resolve(newNode);
      });
    });
  }
}