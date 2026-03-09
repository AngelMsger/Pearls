'use strict';

const fs = require('fs');
const pathFor = require('./path_for');
const getFileHex = require('./get_file_hex');

function normalizeEntry(entry) {
  if (typeof entry === 'string') {
    return {
      path: entry,
      key: entry,
    };
  }

  return entry;
}

function ensureJsPath(assetPath) {
  if (assetPath.includes('?') || assetPath.endsWith('.js')) {
    return assetPath;
  }

  return `${assetPath}.js`;
}

function jsHelper(hexo, ...entries) {
  return entries.reduce((result, entry, index) => {
    const separator = index > 0 ? '\n' : '';

    if (Array.isArray(entry)) {
      return `${result}${separator}${jsHelper.call(this, hexo, ...entry)}`;
    }

    const normalized = normalizeEntry(entry);
    const assetPath = ensureJsPath(normalized.path);
    const localPath = pathFor.call(this, assetPath);
    const assetHash = fs.existsSync(localPath) ? `?${getFileHex(localPath)}` : '';

    return `${result}${separator}<script>lsloader.load("${normalized.key}","${hexo.url_for(assetPath)}${assetHash}", true)</script>`;
  }, '');
}

module.exports = jsHelper;
