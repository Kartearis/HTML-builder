
const fs = require('fs');
const path = require('path');
const stream = require('stream');


const fileStream = fs.createWriteStream(path.join(__dirname, 'text.txt'));
const keywordParserStream = new stream.Transform();
keywordParserStream._transform = (chunk, encoding, callback) => {
  if(/^\s*exit\s*$/.test(chunk.toString()))
    onExit();
  keywordParserStream.push(chunk);
  callback();
};

function onExit() {
  console.log('Thank your for your kind words, farewell.');
  fileStream.end(() => process.exit(0));
}

process.on('SIGINT', onExit);
process.on('SIGTERM', onExit);
process.on('SIGHUP', onExit);

process.stdin.pipe(keywordParserStream).pipe(fileStream);
process.stdout.write('Hello! Input some text below. Ctrl-c or writing "exit" terminates program.\n');

