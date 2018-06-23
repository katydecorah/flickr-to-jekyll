#!/usr/bin/env node

const script = require('../index.js');
const argv = require('minimist')(process.argv.slice(2));

process.env.IMG_DIR = argv.img_dir || 'img/posts';
process.env.POSTS_DIR = argv.posts_dir || '_posts';

script.saver({}, null, (err, callback) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(callback);
  process.exit(0);
});
