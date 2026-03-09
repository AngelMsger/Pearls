'use strict';

const pathFor = require('./path_for');
const getFileHex = require('./get_file_hex');

function ensureJsPath(assetPath) {
  if (assetPath.includes('?') || assetPath.endsWith('.js')) {
    return assetPath;
  }

  return `${assetPath}.js`;
}

function jsHelper(hexo, ...paths) {
  return paths.reduce((result, entry, index) => {
    const assetPath = ensureJsPath(entry);
    const separator = index > 0 ? '\n' : '';

    if (Array.isArray(entry)) {
      return `${result}${separator}${jsHelper.call(this, hexo, ...entry)}`;
    }

    return `${result}${separator}<script src="${hexo.url_for(assetPath)}?${getFileHex(pathFor.call(this, assetPath))}"></script>`;
  }, '');
}

module.exports = jsHelper;
