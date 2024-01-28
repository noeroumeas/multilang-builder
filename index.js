const path = require('node:path');
const fs = require('node:fs');

async function main() {
  const rootPath = process.cwd();
  const configPath = path.join(rootPath, 'multilang.config.js');
  
  if (!fs.existsSync(configPath)) {
    throw new Error(`Configuration file not found at ${configPath}`);
    process.exit(1);
  }

  const config = require(path.join(configPath));
  const srcPath = path.resolve(rootPath, config.src);
  const destPath = path.resolve(rootPath, config.dest);

  const languages = config.languages;
  const textsFiles = config.textsFiles;
  const textSeparator = config.textSeparator;

  const ignored = getIgnoredMap(config.ignored);
  const texts = getTextsFromFiles(rootPath, textsFiles);

  const directoryStructure = [];
  
  const filesToGenerate = [];

  await getFiles(srcPath, '', ignored, directoryStructure, filesToGenerate);
  
  await generateFiles(directoryStructure, filesToGenerate, srcPath, destPath, languages, texts, textSeparator);
}

function getTextsFromFiles(rootPath, files){
  const texts = {};
  files.forEach((file) => {
    const fileTexts = require(`${rootPath}/${file}`);
    Object.keys(fileTexts).forEach((key) => {
      if(!texts[key]){
        texts[key] = fileTexts[key];
      } else {
        Object.assign(texts[key], fileTexts[key]);
      }
    });
  });
  return texts;
}

function getIgnoredMap(ignored){
  const ignoredMap = {};
  ignored.forEach((file) => {
    ignoredMap[file] = true;
  });
  return ignoredMap;
}

async function getFiles(srcPath, destPath, ignored, directoryStructure, filesToGenerate){
  const files = await fs.promises.readdir(srcPath);
  const promises = [];
  files.forEach((file) => {
    if(ignored[file]){
      return;
    }
    const srcFile = path.resolve(srcPath, file);
    const destFile = path.join(destPath, file);
    const stats = fs.statSync(srcFile);
    if(stats.isDirectory()){
      directoryStructure.push(destFile);
      promises.push(getFiles(srcFile, destFile, ignored, directoryStructure, filesToGenerate));
    } else {
      filesToGenerate.push(destFile);
    }
  });
  await Promise.all(promises);
  return;
}

async function replaceTexts(fileContent, texts, textSeparator) {
  const regex = new RegExp(`${textSeparator}(.*?)${textSeparator}`, 'g');
  
  return fileContent.replace(regex, (match, key) => {
    if(!texts[key]){
      throw new Error(`Text ${key} not found`);
    }
    return texts[key];
  });
}

async function generateFiles(directoryStructure, filesToGenerate, srcPath, destPath, languages, texts, textSeparator){

  languages.forEach(async (language) => {
    fs.mkdirSync(path.join(destPath, language), { recursive: true});
    const createDirectoriesPromises = [];
    directoryStructure.forEach((directory) => {
      createDirectoriesPromises.push(fs.promises.mkdir(path.join(destPath, language, directory), { recursive: true}));
    });
    await Promise.all(createDirectoriesPromises);
    const generateFilesPromises = [];
    filesToGenerate.forEach((file) => {
      generateFilesPromises.push(generateFile(file, srcPath, destPath, language, texts, textSeparator));
    });
    await Promise.all(generateFilesPromises);
  });
}

async function generateFile(file, srcPath, destPath, language, texts, textSeparator){
  const srcFile = path.join(srcPath, file);
  const destFile = path.join(destPath, language, file);
  const fileContent = await fs.promises.readFile(srcFile, 'utf8');
  try {
    const newFileContent = await replaceTexts(fileContent, texts[language], textSeparator);
    return await fs.promises.writeFile(destFile, newFileContent);
  } catch (error) {
    throw new Error(`${error.message} in ${srcFile}`);
  }
}

module.exports = {
  main
};