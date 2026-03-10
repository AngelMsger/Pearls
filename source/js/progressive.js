/* global $, NProgress, prettyPrint, HanabiBrowser */

(function progressiveTheme(window, document) {
  'use strict';

  var config = window.materialThemeConfig || {};
  var enhancers = window.materialThemeEnhancers || {};

  function onReady(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
      return;
    }

    callback();
  }

  function onLoad(callback) {
    if (document.readyState === 'complete') {
      callback();
      return;
    }

    window.addEventListener('load', callback, { once: true });
  }

  function updateCopyright() {
    var target = document.querySelector('span[year]');

    if (!target) {
      return;
    }

    var now = new Date().getFullYear();
    var since = target.getAttribute('year');
    var parsedSince = parseInt(since, 10);

    if (!parsedSince || parsedSince === now) {
      target.textContent = String(now);
      return;
    }

    target.textContent = parsedSince + ' - ' + now;
  }

  function markReadyState() {
    document.body.classList.add('is-enhanced');
    window.requestAnimationFrame(function revealBody() {
      document.body.classList.add('is-ready');
    });
  }

  function createObserver(callback, rootMargin) {
    if (!('IntersectionObserver' in window)) {
      return null;
    }

    return new window.IntersectionObserver(function observe(entries, observer) {
      entries.forEach(function eachEntry(entry) {
        if (!entry.isIntersecting) {
          return;
        }

        callback(entry.target);
        observer.unobserve(entry.target);
      });
    }, {
      rootMargin: rootMargin || '160px 0px',
    });
  }

  function loadBackgroundBlock(element) {
    if (!element || element.classList.contains('is-ready')) {
      return;
    }

    var cssValue = element.style.getPropertyValue('--progressive-bg');
    var match = cssValue && cssValue.match(/url\((['"]?)(.*?)\1\)/);
    var src = match && match[2];

    if (!src) {
      element.classList.remove('is-loading');
      element.classList.add('is-ready');
      return;
    }

    var image = new Image();

    image.onload = function onImageLoad() {
      element.style.backgroundImage = 'url("' + src + '")';
      element.classList.remove('is-loading');
      element.classList.add('is-ready');
    };

    image.onerror = function onImageError() {
      element.classList.remove('is-loading');
      element.classList.add('is-error');
    };

    image.src = src;
  }

  function initProgressiveBackgrounds() {
    var nodes = document.querySelectorAll('[data-progressive-bg]');
    var observer = createObserver(loadBackgroundBlock);

    Array.prototype.forEach.call(nodes, function eachNode(node) {
      if (observer) {
        observer.observe(node);
      } else {
        loadBackgroundBlock(node);
      }
    });
  }

  function markImageReady(image) {
    image.classList.remove('is-loading');
    image.classList.add('is-ready');
  }

  function markImageError(image) {
    image.classList.remove('is-loading');
    image.classList.add('is-error');
  }

  function initContentImages() {
    var images = document.querySelectorAll('#post-content img, .post_entry-module img, .daily-pic img, .something-else img');

    Array.prototype.forEach.call(images, function eachImage(image) {
      image.loading = image.loading || 'lazy';
      image.classList.add('progressive-image');

      if (image.complete && image.naturalWidth > 0) {
        markImageReady(image);
        return;
      }

      image.classList.add('is-loading');
      image.addEventListener('load', function onImageLoad() {
        markImageReady(image);
      }, { once: true });
      image.addEventListener('error', function onImageError() {
        markImageError(image);
      }, { once: true });
    });
  }

  function renderLocalSearchResults(entries, keywords, container) {
    var hasResult = false;
    var html = '<ul class="search-result-list">';

    entries.forEach(function eachEntry(entry) {
      var title = entry.title.trim().toLowerCase();
      var content = entry.content.trim().replace(/<[^>]+>/g, '').toLowerCase();
      var url = entry.url;
      var firstIndex = -1;
      var matched = title !== '' || content !== '';

      keywords.forEach(function eachKeyword(keyword, index) {
        var titleIndex = title.indexOf(keyword);
        var contentIndex = content.indexOf(keyword);

        if (titleIndex < 0 && contentIndex < 0) {
          matched = false;
          return;
        }

        if (firstIndex < 0 && contentIndex >= 0) {
          firstIndex = contentIndex;
        } else if (firstIndex < 0 && titleIndex >= 0 && index === 0) {
          firstIndex = 0;
        }
      });

      if (!matched) {
        return;
      }

      hasResult = true;
      html += '<li><a href="' + url + '" class="search-result-title" target="_self">' + entry.title + '</a>';

      if (firstIndex >= 0) {
        var raw = entry.content.trim().replace(/<[^>]+>/g, '');
        var start = Math.max(firstIndex - 20, 0);
        var end = Math.min(firstIndex + 80, raw.length);
        var excerpt = raw.slice(start, end);

        keywords.forEach(function replaceKeyword(keyword) {
          excerpt = excerpt.replace(new RegExp(keyword, 'gi'), '<em class="search-keyword">' + keyword + '</em>');
        });

        html += '<p class="search-result">' + excerpt + '...</p>';
      }

      html += '</li>';
    });

    html += '</ul>';
    container.innerHTML = hasResult ? html : '<p class="search-empty">No results.</p>';
  }

  function initLocalSearch() {
    if (!config.search || config.search.use !== 'local') {
      return;
    }

    var input = document.querySelector('#search');
    var result = document.querySelector('#local-search-result');
    var path = config.search.path;
    var cachedEntries = null;
    var pendingRequest = null;

    if (!input || !result || !window.jQuery) {
      return;
    }

    function fetchEntries() {
      if (cachedEntries) {
        return window.Promise.resolve(cachedEntries);
      }

      if (pendingRequest) {
        return pendingRequest;
      }

      result.classList.add('is-loading');
      result.innerHTML = '<p class="search-status">Loading search index...</p>';

      pendingRequest = new window.Promise(function createRequest(resolve) {
        $.ajax({
          url: path,
          dataType: 'xml',
        }).done(function onSuccess(xml) {
          cachedEntries = $('entry', xml).map(function mapEntry() {
            return {
              title: $('title', this).text(),
              content: $('content', this).text(),
              url: $('url', this).text(),
            };
          }).get();
          pendingRequest = null;
          result.classList.remove('is-loading');
          result.classList.remove('is-error');
          resolve(cachedEntries);
        }).fail(function onError() {
          pendingRequest = null;
          result.classList.remove('is-loading');
          result.classList.add('is-error');
          result.innerHTML = '<p class="search-status">Search is temporarily unavailable.</p>';
          resolve([]);
        });
      });

      return pendingRequest;
    }

    input.addEventListener('focus', fetchEntries, { once: true });
    input.addEventListener('input', function onInput() {
      var value = this.value.trim().toLowerCase();

      if (!value) {
        result.innerHTML = '';
        result.classList.remove('is-error');
        return;
      }

      fetchEntries().then(function onEntries(entries) {
        var keywords = value.split(/[\s-]+/).filter(Boolean);
        renderLocalSearchResults(entries, keywords, result);
      });
    });
  }

  function loadScript(src, onLoad, onError) {
    var script = document.createElement('script');

    script.async = true;
    script.src = src;

    if (typeof onLoad === 'function') {
      script.onload = onLoad;
    }

    if (typeof onError === 'function') {
      script.onerror = onError;
    }

    document.body.appendChild(script);
  }

  function markCommentState(shell, state, message) {
    var status = shell.querySelector('.comment-status');

    shell.classList.remove('is-loading', 'is-ready', 'is-error');
    shell.classList.add(state);

    if (status && message) {
      status.textContent = message;
    }
  }

  function initDisqusComments() {
    var shell = document.querySelector('[data-comment-provider="disqus"]');

    if (!shell) {
      return;
    }

    var thread = shell.querySelector('#disqus_thread');
    var shortname = (thread && thread.getAttribute('data-shortname')) || shell.getAttribute('data-shortname');

    if (!shortname) {
      markCommentState(shell, 'is-error', 'Comments are unavailable.');
      return;
    }

    function mount() {
      if (shell.getAttribute('data-mounted') === 'true') {
        return;
      }

      shell.setAttribute('data-mounted', 'true');
      markCommentState(shell, 'is-loading', 'Loading comments...');

      loadScript('//' + shortname + '.disqus.com/embed.js', function onLoad() {
        markCommentState(shell, 'is-ready', 'Comments loaded.');
      }, function onError() {
        markCommentState(shell, 'is-error', 'Failed to load comments.');
      });
    }

    var observer = createObserver(mount, '240px 0px');

    if (observer) {
      observer.observe(shell);
    } else {
      mount();
    }
  }

  function initDisqusClickComments() {
    var shell = document.querySelector('[data-comment-provider="disqus_click"]');

    if (!shell) {
      return;
    }

    var thread = shell.querySelector('#disqus_thread');
    var shortname = (thread && thread.getAttribute('data-shortname')) || shell.getAttribute('data-shortname');
    var button = shell.querySelector('.disqus_click_btn');

    function mount() {
      if (shell.getAttribute('data-mounted') === 'true') {
        return;
      }

      shell.setAttribute('data-mounted', 'true');
      markCommentState(shell, 'is-loading', 'Loading comments...');

      loadScript('//' + shortname + '.disqus.com/embed.js', function onLoad() {
        markCommentState(shell, 'is-ready', 'Comments loaded.');
        if (button) {
          button.hidden = true;
        }
      }, function onError() {
        shell.setAttribute('data-mounted', 'false');
        markCommentState(shell, 'is-error', 'Failed to load comments.');
        if (button) {
          button.hidden = false;
        }
      });
    }

    if (button) {
      button.hidden = true;
      button.addEventListener('click', mount);
    }

    $.ajax({
      url: 'https://disqus.com/next/config.json',
      timeout: 4000,
      type: 'GET',
    }).done(mount).fail(function onProbeError() {
      markCommentState(shell, 'is-error', 'Comments are not reachable. You can retry manually.');
      if (button) {
        button.hidden = false;
      }
    });
  }

  function initLivereComments() {
    var shell = document.querySelector('[data-comment-provider="livere"]');

    if (!shell) {
      return;
    }

    var observer = createObserver(function mount() {
      markCommentState(shell, 'is-loading', 'Loading comments...');
      loadScript('https://cdn-city.livere.com/js/embed.dist.js', function onLoad() {
        markCommentState(shell, 'is-ready', 'Comments loaded.');
      }, function onError() {
        markCommentState(shell, 'is-error', 'Failed to load comments.');
      });
    }, '240px 0px');

    if (observer) {
      observer.observe(shell);
    }
  }

  function initBingBackground() {
    if (!config.background || !config.background.bing || !config.background.bingUrl) {
      return;
    }

    document.body.style.setProperty('--progressive-bg', 'url("' + config.background.bingUrl + '")');
    document.body.setAttribute('data-progressive-bg', 'body');
    document.body.classList.add('progressive-bg', 'is-loading');
    loadBackgroundBlock(document.body);
  }

  function initCodeEnhancers() {
    if (enhancers.prettify && window.prettyPrint) {
      Array.prototype.forEach.call(document.querySelectorAll('pre'), function eachPre(pre) {
        pre.classList.add('prettyprint', 'linenums');
        pre.style.overflow = 'auto';
      });
      prettyPrint();
    }

    if (enhancers.hanabi && window.HanabiBrowser) {
      if (!enhancers.hanabiIncludeDefaultColors) {
        HanabiBrowser.clearColors();
      }

      if (enhancers.hanabiColors) {
        if (typeof enhancers.hanabiColors === 'string') {
          HanabiBrowser.putColor(enhancers.hanabiColors);
        } else {
          enhancers.hanabiColors.forEach(function eachColor(color) {
            HanabiBrowser.putColor(color);
          });
        }
      }

      HanabiBrowser.start('pre code', enhancers.hanabiLineNumber);
    }
  }

  onReady(function init() {
    updateCopyright();
    initProgressiveBackgrounds();
    initContentImages();
    initLocalSearch();
    initDisqusComments();
    initDisqusClickComments();
    initLivereComments();
    initCodeEnhancers();
    initBingBackground();
    markReadyState();
  });

  onLoad(function afterLoad() {
    var tocWrap = document.querySelector('.post-toc-wrap');

    if (tocWrap && tocWrap.parentElement && tocWrap.parentElement.classList.contains('mdl-menu__container')) {
      tocWrap.parentElement.style.position = 'fixed';
    }

    if (window.NProgress) {
      NProgress.done();
    }
  });
}(window, document));
