'use strict';

const moduleBundles = require('./assets/modules.json');

/**
 *
 * @param {String} path
 * @returns {String[]}
 */
const pathToKeys = (path) => {
  if (path === null || path === undefined) {
    return [];
  }

  return String(path).replace(/(^\/+|\/+$)/g, '').split('/') || [];
  // we know exactly that slash(not back-slash) will be used
  // return String(path).replace(/(^[\\\/]+|[\\\/]+$)/g, '').match(/[^\\\/]+/g) || [];
};

/**
 *
 * @param {String[]} keys
 * @returns {String}
 */
const keysToPath = (keys) => {
  if (keys === null || keys === undefined) {
    return '';
  } else if (!(keys instanceof Array)) {
    return String(keys);
  }

  return keys.join('/');
};

/**
 *
 * @param {String[]} keys
 * @param {Object} [target]
 * @param {Number} [index=0]
 * @returns {Object|String}
 */
const getBundleByKeys = (keys, target = moduleBundles, index = 0) => {
  if (!keys || !target) {
    return undefined;
  }

  const key = keys[index];
  if (index < keys.length - 1) {
    return getBundleByKeys(keys, target[key], index + 1);
  }

  return target[key];
};

/**
 *
 * @param {String} path
 * @param {Object} [target]
 */
const getBundle = (path, target = moduleBundles) => getBundleByKeys(pathToKeys(path), target);

/**
 *
 * @param {String} path
 * @param {Object} [target]
 * @returns {Array}
 */
const getKeys = (path = '', target = moduleBundles) => {
  const data = getBundle(path, target);
  if (data && typeof(data) === 'object') {
    return Object.keys(data);
  }

  return [];
};

/**
 *
 * @param {String} path
 * @param {Object} [target]
 * @param {Array} [list=[]]
 * @returns {String[]}
 */
const getPaths = (path, target = moduleBundles, list = []) => {
  if (typeof(target) === 'object') {
    Object.keys(target).map((key) => {
      getPaths(path ? key : `${path}/${key}`, target[key], list);
    });
  } else if (target) {
    list.push(path);
  }

  return list;
};

/**
 * @param {String[]} list
 * @param {Object} paths
 * @returns {Object}
 */
const prepareBlacklist = (list, paths = {}) => {
  list.map((path) => (paths[path] = true));
  return paths;
};

/**
 *
 * @param {String} key
 * @param {Object} target
 * @param {Object} [data={}]
 * @param {String} [basePath='']
 * @param {Object} [skipPaths={}]
 * @returns {Object}
 */
const getModulesFromBundle = (key, target, data = {}, basePath = '', skipPaths = {}) => {
  if (!target) {
    return data;
  }

  const path = basePath ? `${basePath}/${key}` : key;

  if (typeof(target) === 'object') {
    Object.keys(target).forEach((key) => getModulesFromBundle(key, target[key], data, path, skipPaths));
  } else {
    if (!skipPaths[path]) {
      data[key] = (data[key] || '') + target;
    }
    skipPaths[path] = true;
  }

  return data;
};

/**
 *
 * @param {String} [basePath='']
 * @param {Object} [data={}]
 * @param {Object} [skipPaths={}]
 * @returns {Object}
 */
const getModulesByPath = (basePath = '', data = {}, skipPaths = {}) => {
  const target = getBundle(basePath);
  const key = basePath.match(/[^\/]+$/)[0];

  return getModulesFromBundle(
    key,
    target,
    data,
    basePath.substr(0, basePath.length - key.length - 1),
    skipPaths
  );
};

/**
 *
 * @param {String[]} paths
 * @param {Object} [data={}]
 * @param {Object} [skipPaths={}]
 * @returns {Object}
 */
const getModules = (paths, data = {}, skipPaths = {}) => {
  paths
    .filter((path, index) => paths.indexOf(path) === index)
    .forEach((path) => getModulesByPath(path, data, skipPaths));
  return data;
};

module.exports = exports = {
  pathToKeys,
  keysToPath,
  getBundleByKeys,
  getBundle,
  getKeys,
  getPaths,
  prepareBlacklist,
  getModulesFromBundle,
  getModulesByPath,
  getModules,
  default: getModules,
  __esModule: true,
};

//console.log(getModules(['addon/test/a', 'addon/test1/F', 'addon/test1/D', 'addon/test', 'addon/test1']));
