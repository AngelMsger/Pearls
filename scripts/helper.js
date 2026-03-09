hexo.extend.helper.register('jsHex', function jsHexHelper(...args) {
  return require('./lib/js_hex.js').call(hexo, this, ...args);
});

hexo.extend.helper.register('jsLsload', function jsLsloadHelper(...args) {
  return require('./lib/js_lsload.js').call(hexo, this, ...args);
});

hexo.extend.helper.register('cssLsload', function cssLsloadHelper(...args) {
  return require('./lib/css_lsload.js').call(hexo, this, ...args);
});
