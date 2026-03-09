const fs = require('fs');
const path = require('path');

function pathFor(paths) {
  let resolvedPath = path.join(this.theme_dir, 'source', paths);

  if (!fs.existsSync(resolvedPath)) {
    resolvedPath = path.join(this.source_dir, paths);
  }

  return resolvedPath;
}

module.exports = pathFor;
