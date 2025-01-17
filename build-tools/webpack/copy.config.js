const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const NoEmitPlugin = require('no-emit-webpack-plugin');
const setDefaults = require('./../common/set-defaults');
/**
 *
 * @param {object[]} entries
 * @returns {import('webpack').Configuration['plugins']}
 */
module.exports = function getCopyConfig(entries) {
  /** @type import('webpack').Configuration */
  let config = {
    name: 'copy',
    entry: {
      tobedeleted: path.resolve(__dirname, '../../package.json'),
    },
    plugins: [new CopyWebpackPlugin(entries), new NoEmitPlugin()],
  };

  return setDefaults(config, false);
};
