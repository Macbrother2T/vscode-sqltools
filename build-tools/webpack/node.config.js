const path = require('path');
const setDefaults = require('./../common/set-defaults');
const parseEntries = require('./../common/parse-entries');

/**
 *
 * @param {object} entries
 * @param {string} packagePath
 * @returns {import('webpack').Configuration['plugins']}
 */
module.exports = function getNodeConfig({ entries, packagePath, externals = {} }) {
  const { entry, outDir, babelOptions } = parseEntries(entries, packagePath);

  /** @type import('webpack').Configuration */
  let config = {
    name: 'ls',
    target: 'node',
    entry,
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: [
            process.env.NODE_ENV !== 'development' && { loader: 'babel-loader', options: babelOptions },
            { loader: 'ts-loader', options: { transpileOnly: true } },
          ].filter(Boolean),
          exclude: /node_modules|\.test\..+/i,
        },
        process.env.NODE_ENV !== 'development' && {
          test: /\.js$/,
          use: [{ loader: 'babel-loader', options: babelOptions }],
          exclude: /\.test\..+/i,
        },
      ].filter(Boolean),
    },
    resolve: {
      extensions: ['.ts', '.js', '.json'],
      modules: ['node_modules', path.join(packagePath, '..', '..', 'node_modules')],
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
