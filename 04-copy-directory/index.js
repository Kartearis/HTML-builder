
const fs = require('fs');
const path = require('path');

async function copyDir(from, to) {
  from = path.join(__dirname, from);
  to = path.join(__dirname, to);
  let files = [];
  try {
    await fs.promises.rm(to, {recursive: true});
  } catch (err) {
    // Doing nothing here, it's okay if there is no target folder
  }
  await fs.promises.mkdir(to, {recursive: true});
  try {
    files = await fs.promises.readdir(from);
  } catch (err) {
    console.error('Could not open directory: ', err);
    process.exit(1);
  }
  files = files.map(x => [x, path.join(from, x)]);
  await Promise.all(files.map(x => fs.promises.copyFile(x[1], path.join(to, x[0]))));
  console.log('All files have been copied');

}

copyDir('files', 'files-copy');
