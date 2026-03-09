const crypto = require('crypto');
const fs = require('fs');

function getFileHexSync(filepath) {
  const buffer = fs.readFileSync(filepath);
  const fileHash = crypto.createHash('md5');

  fileHash.update(buffer);

  return fileHash.digest('base64');
}

module.exports = getFileHexSync;
