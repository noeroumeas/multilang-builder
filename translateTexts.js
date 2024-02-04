const path = require('node:path');
const fs = require('node:fs');
const deepl = require('deepl-node');

async function translateTexts(){
  const rootPath = process.cwd();
  const configPath = path.join(rootPath, 'multilang.config.js');
  
  if (!fs.existsSync(configPath)) {
    throw new Error(`Configuration file not found at ${configPath}`);
    process.exit(1);
  }

  const { translatingTextsConfig } = require(path.join(configPath));
  const srcPath = path.resolve(rootPath, translatingTextsConfig.src);

  const inputLanguage = translatingTextsConfig.inputLanguage;
  const outputLanguages = translatingTextsConfig.outputLanguages;

  const ignored = getIgnoredMap(translatingTextsConfig.ignored);
  
  const deeplApiKey = translatingTextsConfig.deeplApiKey;
  const translator = new deepl.Translator(deeplApiKey);
  
  await translateFiles(srcPath, ignored, inputLanguage, outputLanguages, translator);

  const usage = await translator.getUsage();
  if (usage.anyLimitReached()) {
      console.log('Translation limit exceeded.');
  }
  if (usage.character) {
      console.log(`Characters: ${usage.character.count} of ${usage.character.limit}`);
  }
}


function getIgnoredMap(ignored){
  const ignoredMap = {};
  ignored.forEach((file) => {
    ignoredMap[file] = true;
  });
  return ignoredMap;
}

async function translateFiles(srcPath, ignored, inputLanguage, outputLanguages, translator){
  const files = await fs.promises.readdir(srcPath);
  const promises = [];
  files.forEach((file) => {
    if(ignored[file]){
      return;
    }
    const srcFile = path.resolve(srcPath, file);
    const stats = fs.statSync(srcFile);
    if(stats.isDirectory()){
      promises.push(translateFiles(srcFile, ignored, inputLanguage, outputLanguages, translator));
    } else {
      promises.push(translateFile(srcFile, inputLanguage, outputLanguages, translator));
    }
  });
  await Promise.all(promises);
  return;
}

async function translateFile(file, inputLanguage, outputLanguages, translator){
  const fileTexts = require(file);
  
  const inputTexts = Object.values(fileTexts[inputLanguage]);
  if(inputTexts.length === 0){
    return;
  }
  const inputTextsKeys = Object.keys(fileTexts[inputLanguage]);
  const promises = [];
  outputLanguages.forEach(async (outputLanguage) => {
    promises.push(translateText(inputTexts, inputLanguage, outputLanguage, translator));
  });
  
  const translations = await Promise.all(promises);
  translations.forEach((translation, index) => {
    fileTexts[outputLanguages[index]] = {};
    inputTextsKeys.forEach((key, keyIndex) => {
      fileTexts[outputLanguages[index]][key] = translation[keyIndex];
    });
  });
  return await fs.promises.writeFile(file, 'module.exports = ' + JSON.stringify(fileTexts, null, 2) + ";");
}

async function translateText(texts, inputLanguage, outputLanguage, translator){
  if(texts.length < 50){
    const translations = await translator.translateText(texts, inputLanguage, outputLanguage, { preserveFormatting: true });
    return translations.map((translation, index) => {
      return translation.text;
    });
  }

  const promises = [];
  for (let i = 0; i < texts.length; i += 50) {
    const chunk = texts.slice(i, i + 50);
    promises.push(translator.translateText(chunk, inputLanguage, outputLanguage, { preserveFormatting: true }));
  }
  const translationsResponses = await Promise.all(promises);
  let translations = [];
  translationsResponses.forEach((response) => {
    translations = translations.concat(response);
  });
  return translations.map((translation, index) => {
    return translation.text;
  });
}

module.exports = { 
  translateTexts
};