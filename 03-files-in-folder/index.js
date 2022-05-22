
const fs = require('fs');
const path = require('path');

function humanReadableSize(size) {
  const breakPoints = {
    b: 0,
    kb: 1024,
    mb: 1024 ** 2,
    gb: 1024 ** 3
  };
  let breakPoint = Object.entries(breakPoints).sort((a,b) => b[1] - a[1]).find(x => size >= x[1]);
  return `${breakPoint[1] > 0 ? size / breakPoint[1] : size}${breakPoint[0]}`;
}

async function getDirData(dir){
  let files = [];
  try {
    files = await fs.promises.readdir(path.join(__dirname, dir), {withFileTypes: true});
  } catch (err) {
    console.error('Could not open directory: ', err);
    process.exit(1);
  }
  let stats = [];
  try {
    stats = await Promise.all(files.map((file) => fs.promises.stat(path.join(__dirname, dir, file.name))));
  } catch (err) {
    console.error('Could not get stats for file: ', err);
    process.exit(2);
  }
  stats.forEach((stat, index) => {
    if (stat.isFile()) {
      const filePath = path.join(__dirname, dir, files[index].name);
      const ext = path.extname(filePath).replace(/^\./,  '');
      const fileName = path.basename(filePath, '.' + ext);
      console.log(`${fileName} - ${ext} - ${humanReadableSize(stat.size)}`);
    }
  });
}

getDirData('secret-folder');
