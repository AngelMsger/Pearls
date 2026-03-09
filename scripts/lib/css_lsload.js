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

function ensureCssPath(assetPath) {
  if (assetPath.includes('?') || assetPath.endsWith('.css')) {
    return assetPath;
  }

  return `${assetPath}.css`;
}

function cssHelper(hexo, ...entries) {
  return entries.reduce((result, entry, index) => {
    const separator = index > 0 ? '\n' : '';

    if (Array.isArray(entry)) {
      return `${result}${separator}${cssHelper.call(this, hexo, ...entry)}`;
    }

    const normalized = normalizeEntry(entry);
    const assetPath = ensureCssPath(normalized.path);
    const localPath = pathFor.call(this, assetPath);
    const assetHash = fs.existsSync(localPath) ? `?${getFileHex(localPath)}` : '';

    return `${result}${separator}<style id="${normalized.key}"></style><script>if(typeof window.lsLoadCSSMaxNums === "undefined")window.lsLoadCSSMaxNums = 0;window.lsLoadCSSMaxNums++;lsloader.load("${normalized.key}","${hexo.url_for(assetPath)}${assetHash}",function(){if(typeof window.lsLoadCSSNums === "undefined")window.lsLoadCSSNums = 0;window.lsLoadCSSNums++;if(window.lsLoadCSSNums === window.lsLoadCSSMaxNums)document.documentElement.style.display="";}, false)</script>`;
  }, '');
}

module.exports = cssHelper;
