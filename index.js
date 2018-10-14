'use strict';

const moduleBundles = require('./assets/modules.json');
const editorBundle = require('./assets/editor.json');
const themeBundles = require('./assets/themes.json');

const DEFAULT_THEME = 'default';

const themeList = Object.keys(themeBundles.theme);
const modules = (() => {
  const bundles = {};

  const isModule = (target) => (target.js || target.css) && Object.keys(target).length <= 2;

  const go = (target, name = '') =>
    Object.keys(target).forEach((key) => {
      let obj = target[key];
      let objName = name ? `${name}/${key}` : key;

      if (isModule(obj)) {
        bundles[objName] = obj;
      } else {
        go(obj, objName);
      }
    });

  go(moduleBundles);

  return bundles;
})();

const getEditor = () => editorBundle.lib.codemirror;
const getCss = ({ css }) => css || '';
const getJs = ({ js }) => js || '';
const getThemeList = () => [...themeList];
const getTheme = (themeName) => themeBundles.theme[themeName];
const getModuleList = () => Object.keys(modules);

const getModule = (name) => {
  const bundle = modules[name];

  return bundle ? { ...bundle } : null;
};

const assignBundles = (target, ...sources) => {
  const { js: targetJs = '', css: targetCss = '' } = target;

  sources.forEach((bundle) => {
    if (!bundle) return;

    const { js = '', css = '' } = bundle;

    targetCss = `${targetCss}${css}`;
    targetJs = `${targetJs}${js}`;
  });

  target.css = targetCss;
  target.js = targetJs;

  return target;
};

const bundle = (includeEditor = true, themeName = DEFAULT_THEME, modules = []) => {
  const bundle = { js: '', css: '' };

  if (includeEditor) {
    assignBundles(bundle, getEditor());
  }

  if (themeName !== DEFAULT_THEME) {
    assignBundles(bundle, getTheme(themeName));
  }

  assignBundles(bundle, ...modules.map((name) => getModule(name)));

  return { js, css };
};

class Editor {
  constructor(includeEditor = true, theme = 'default', modules = []) {
    this.includeEditor = includeEditor;
    this.theme = theme;
    this.modules = modules;
  }

  setTheme(themeName) {
    this.theme = themeName;
  }

  addModule(moduleName) {
    this.modules.push(moduleName);
  }

  clone() {
    return new Editor(this.includeEditor, this.theme, [...this.modules]);
  }

  bundle() {
    return bundle(this.includeEditor, this.theme, this.modules);
  }
}

exports.getEditor = getEditor;
exports.getCss = getCss;
exports.getJs = getJs;
exports.getThemeList = getThemeList;
exports.getTheme = getTheme;
exports.getModuleList = getModuleList;
exports.getModule = getModule;
exports.bundle = bundle;
exports.Editor = Editor;
exports.default = Editor;

Object.defineProperty(exports, '__esModule', { value: true });
