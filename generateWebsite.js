const path = require('node:path');
const fs = require('node:fs');

async function generateWebsite() {
  const rootPath = process.cwd();
  const configPath = path.join(rootPath, 'multilang.config.js');
  
  if (!fs.existsSync(configPath)) {
    throw new Error(`Configuration file not found at ${configPath}`);
    process.exit(1);
  }

  const { generateWebsiteConfig } = require(path.join(configPath));
  
  const srcPath = path.resolve(rootPath, generateWebsiteConfig.src);
  const destPath = path.resolve(rootPath, generateWebsiteConfig.dest);

  const languages = generateWebsiteConfig.languages;
  const textsFiles = generateWebsiteConfig.textsFiles;
  const textSeparator = generateWebsiteConfig.textSeparator;
  const textsSrc = path.resolve(rootPath, generateWebsiteConfig.textsSrc);//getTextsFromFile(rootPath, textsFiles);

  const ignored = getIgnoredMap(generateWebsiteConfig.ignored);

  const directoryStructure = [];
  
  const filesToGenerate = [];


  await getFiles(srcPath, '', ignored, directoryStructure, filesToGenerate);
  
  await generateWebsiteLanguages(directoryStructure, filesToGenerate, srcPath, destPath, languages, textsSrc, textSeparator);
}

function getTextsFromFile(src, file, language, textsMap){
  //change the extension to js
  const filePath = path.join(src, file.replace(/\.\w+$/, '.js'));
  const texts = textsMap.get(path);
  if(texts){
    return texts[language];
  }
  try{
    const fileTexts = require(filePath);
    textsMap.set(filePath, fileTexts);
    return fileTexts[language];
  } catch (error) {
    if(error.code !== 'MODULE_NOT_FOUND'){
      throw new Error(`Text file missing : ${filePath}`);
    }
    throw new Error(`Error reading file ${filePath}`);
  }
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

async function generateWebsiteLanguages(directoryStructure, filesToGenerate, srcPath, destPath, languages, textsSrc, textSeparator){
  const texts = new Map();
  const generateWebsitePromises = [];
  
  languages.forEach((language) => generateWebsitePromises.push(generateWebsiteLanguage(directoryStructure, filesToGenerate, language, srcPath, destPath, textsSrc, textSeparator, texts)));
  return await Promise.all(generateWebsitePromises);
}

async function generateWebsiteLanguage(directoryStructure, filesToGenerate, language, srcPath, destPath, textsSrc, textSeparator, texts){
  fs.mkdirSync(path.join(destPath, language), { recursive: true});
  const createDirectoriesPromises = [];
  directoryStructure.forEach((directory) => {
    createDirectoriesPromises.push(fs.promises.mkdir(path.join(destPath, language, directory), { recursive: true}));
  });
  await Promise.all(createDirectoriesPromises);
  const generateFilesPromises = [];
  filesToGenerate.forEach(async (file) => {
    const fileTexts = await getTextsFromFile(textsSrc, file, language, texts);
    generateFilesPromises.push(generateFile(file, srcPath, destPath, language, fileTexts, textSeparator));
  });
  return await Promise.all(generateFilesPromises);
}

async function generateFile(file, srcPath, destPath, language, texts, textSeparator){
  const srcFile = path.join(srcPath, file);
  const destFile = path.join(destPath, language, file);
  const fileContent = await fs.promises.readFile(srcFile, 'utf8');
  try {
    const newFileContent = await replaceTexts(fileContent, texts, textSeparator);
    return await fs.promises.writeFile(destFile, newFileContent);
  } catch (error) {
    console.log(error);
    throw new Error(`${error.message} in ${srcFile}`);
  }
}

module.exports = {
  generateWebsite
};