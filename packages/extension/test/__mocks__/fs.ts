'use strict';

const fs: any = jest.genMockFromModule('fs');

const mockFiles: any = {};
function readFileSync(directoryPath) {
  if (!mockFiles.hasOwnProperty(directoryPath)) {
    throw new Error('File not found!');
  }
  return mockFiles[directoryPath];
}

function unlinkSync(directoryPath) {
  if (!mockFiles.hasOwnProperty(directoryPath)) {
    throw new Error('File not found!');
  }
  delete mockFiles[directoryPath];
  mockFiles[directoryPath] = undefined;
}

function existsSync(directoryPath) {
  return !!mockFiles[directoryPath];
}

function writeFileSync(directoryPath, content) {
  mockFiles[directoryPath] = new Buffer(content);
}

fs.readFileSync = readFileSync;
fs.writeFileSync = writeFileSync;
fs.unlinkSync = unlinkSync;
fs.existsSync = existsSync;

module.exports = fs;
