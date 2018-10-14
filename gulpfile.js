const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const uglify = require('gulp-uglify');
const gulpif = require('gulp-if');
const gutil = require('gulp-util');
const css = require('gulp-clean-css');

const through2 = require('through2');

const PATH = (() => {
  const search = 'codemirror';
  const fullPath = require
    .resolve(search)
    .match(new RegExp(`^.*[\\\\\\/]${search}[\\\\\\/$]`))[0];
  return path.resolve(fullPath);
})(); //path.resolve('./node_modules/codemirror');

const putDataInto = (path, data, target = {}) => {
  const name = path.shift();

  if (path.length) {
    target[name] = putDataInto(path, data, target[name]);
  } else {
    target[name] = data;
  }

  return target;
};

const loadDataPath = (path, data) => {
  return new Promise((res, rej) => {
    gulp
      .src(path)
      .pipe(gulpif(stream => stream.path.match(/\.css$/), css()))
      .pipe(gulpif(stream => stream.path.match(/\.js$/), uglify()))
      .on("error", function(err) {
        gutil.log(gutil.colors.red("[Error]"), err.toString());
      })
      .pipe(createStream(data))
      .pipe(gulp.dest('./tmp/'))
      .on('end', () => {
        res(data);
      });
  });
};

const createStream = data => {
  return through2.obj((target, enc, cb) => {
    let { dir, ext, name } = path.parse(target.path);
    dir = path.relative(PATH, dir);
    console.log('Add module: ', path.relative(PATH, target.path));
    putDataInto(
      [...dir.split(/[\\\/]+/), name, ext.substr(1)],
      target.contents.toString(),
      data
    );
    cb();
  });
};

const loadData = (paths, data = {}) =>
  new Promise((res, rej) => {
    Promise.all(paths.map(path => loadDataPath(path, data)))
      .then(() => res(data))
      .catch(rej);
  });

const createBundle = (fileName, paths) => {
  console.log(` == Bundling "${fileName}" using "${paths.join('", "')}"`);

  return loadData(paths.map(value => `${PATH}/${value}/**/*.@(js|css)`)).then(data => {
    if (!fs.existsSync('./assets')) {
      fs.mkdirSync('./assets');
    }

    fs.writeFileSync(
      `./assets/${fileName}.json`,
      JSON.stringify(data, null, 2)
    );
  });
};

  gulp.task('editor', () => createBundle('editor', ['lib']));
  gulp.task('themes', () => createBundle('themes', ['theme']));
  gulp.task('modules', () => createBundle('modules', ['addon', 'keymap', 'mode']));
  gulp.task('default', ['editor', 'themes', 'modules']);
