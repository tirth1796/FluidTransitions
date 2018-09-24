/* eslint-disable import/no-extraneous-dependencies */
const fs = require('fs-extra');
const rimraf = require('rimraf');

function copy(source, destination) {
  console.log(`Cleaning "${destination}"`);
  rimraf(destination, () => {
    console.log(`Copying "${source}" to "${destination}"`);
    fs.copy(source, destination, (err) => {
      if (err) console.error(err);
    });
  });
}

copy(
  'node_modules/swipe-transitions/src',
  '../src',
);
