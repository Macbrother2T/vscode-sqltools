const setDefaults = require('./../common/set-defaults');
const parseEntries = require('./../common/parse-entries');
/**
 *
 * @param {object} entries
 * @param {string} packagePath
 * @returns {import('webpack').Configuration['plugins']}
 */
module.exports = function getExtensionConfig({ entries, packagePath, externals = {} }) {
  /** @type import('webpack').Configuration */
  const { entry, outDir } = parseEntries(entries, packagePath);
  let config = {
    name: 'ext',
    target: 'node',
    entry,
    module: {
      rules: [
        {
          test: /\.ts?$/,
          loaders: [{ loader: 'ts-loader', options: { transpileOnly: true } }],
          exclude: /node_modules|\.test\..+/i,
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.js', '.json'],
    },
    output: {
      filename: '[name].js',
      libraryTarget: 'commonjs2',
      ...(outDir
        ? {
            path: outDir,
          }
        : {}),
    },
  };

  config.externals = {
    ...externals,
  };

  return setDefaults(config);
};
