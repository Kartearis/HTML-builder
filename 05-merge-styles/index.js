

const fs = require('fs');
const path = require('path');

async function bundleCss(from, to) {
  let files = [];
  try {
    files = await fs.promises.readdir(from);
  } catch (err) {
    console.error('Could not open directory: ', err);
    process.exit(1);
  }
  let stats = [];
  try {
    stats = await Promise.all(files.map((file) => fs.promises.stat(path.join(from, file))));
  } catch (err) {
    console.error('Could not get stats for file: ', err);
    process.exit(2);
  }
  const copyPromises = files.filter((file, index) => stats[index].isFile() && path.extname(file) === '.css').map(
    file => fs.promises.readFile(path.join(from, file))
  );
  const targetStream = fs.createWriteStream(path.join(to, 'bundle.css'));
  targetStream.promisedWrite = function(data) {
    return new Promise(resolve => {
      this.write(data, resolve);
    });
  };
  for (const promise of copyPromises)
  {
    await targetStream.promisedWrite(await promise + '\n');
  }
  console.log('Bundling is finished.');
}

bundleCss(path.join(__dirname, 'styles'), path.join(__dirname, 'project-dist'));