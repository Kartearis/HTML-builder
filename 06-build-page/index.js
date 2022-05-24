
const fs = require('fs');
const path = require('path');

const colors = {
  fgYellow: '\x1b[33m',
  reset: '\x1b[0m'
};

async function copyDir(from, to, topLevel = true) {
  let files = [];
  try {
    await fs.promises.rm(to, {recursive: true});
  } catch (err) {
    // Doing nothing here, it's okay if there is no target folder
  }
  await fs.promises.mkdir(to, {recursive: true});
  try {
    files = await fs.promises.readdir(from, {withFileTypes: true});
  } catch (err) {
    console.error('Could not open directory: ', err);
    process.exit(1);
  }
  files = files.map(x => [x.name, path.join(from, x.name), x.isDirectory()]);
  await Promise.all(files.map(x => x[2] ? copyDir(x[1], path.join(to, x[0]), false) : fs.promises.copyFile(x[1], path.join(to, x[0]))));
  if (topLevel)
    console.log('-> Assets have been copied.');
}

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
  const targetStream = fs.createWriteStream(to);
  targetStream.promisedWrite = function(data) {
    return new Promise(resolve => {
      this.write(data, resolve);
    });
  };
  for (const promise of copyPromises)
  {
    await targetStream.promisedWrite(await promise + '\n');
  }
  console.log('-> Css bundling is finished.');
}

async function replaceTemplateRefs(template) {
  const regex = /{{([\s\S]+?)}}/g;
  const promises = [];
  const matches = [];
  template.replace(regex, (match, p1) => {
    promises.push(fs.promises.readFile(path.join(__dirname, 'components', p1 + '.html')));
    matches.push(p1);
    return match;
  });
  let replacements = await Promise.allSettled(promises);
  replacements = replacements.map((x, index) => {
    if (x.status === 'rejected') {
      console.error(`${colors.fgYellow}Warning: Could not read template file ${matches[index]}${colors.reset}`);
      return '{{' + matches[index] + '}}';
    }
    else return x.value;
  });
  return template.replace(regex, () => replacements.shift());

}

async function buildHtml(template, destination) {
  const templateData = await fs.promises.readFile(template);
  const completed = await replaceTemplateRefs(templateData.toString());
  await fs.promises.writeFile(destination, completed);
  console.log('-> Template is finished.');
}

async function buildApp() {
  const targetPath = path.join(__dirname, 'project-dist');
  const promises = [
    fs.promises.mkdir(targetPath, {recursive: true}),
    copyDir(path.join(__dirname, 'assets'), path.join(targetPath, 'assets')),
    bundleCss(path.join(__dirname, 'styles'), path.join(targetPath, 'style.css')),
    buildHtml(path.join(__dirname, 'template.html'), path.join(targetPath, 'index.html'))
  ];
  await Promise.all(promises);
  console.log('Build complete.');
}


buildApp();