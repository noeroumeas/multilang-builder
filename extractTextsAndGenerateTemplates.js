const path = require('node:path');
const fs = require('node:fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const PARENT_TAGS_TO_EXCLUDE = ['STYLE', 'SCRIPT'];

async function extractTextsAndGenerateTemplates(){
  const rootPath = process.cwd();
  const configPath = path.join(rootPath, 'multilang.config.js');
  
  if (!fs.existsSync(configPath)) {
    throw new Error(`Configuration file not found at ${configPath}`);
    process.exit(1);
  }

  const { extractTextsAndGenerateTemplateConfig } = require(path.join(configPath));
  const srcPath = path.resolve(rootPath, extractTextsAndGenerateTemplateConfig.src);
  const textsDestPath = path.resolve(rootPath, extractTextsAndGenerateTemplateConfig.textsDest);
  const templatesDestPath = path.resolve(rootPath, extractTextsAndGenerateTemplateConfig.templatesDest);
  
  const language = extractTextsAndGenerateTemplateConfig.language;
  const textSeparator = extractTextsAndGenerateTemplateConfig.textSeparator;

  const ignored = getIgnoredMap(extractTextsAndGenerateTemplateConfig.ignored);
  

  const directoryStructure = [];
  
  const filesToGenerate = [];

  await getFiles(srcPath, '', ignored, directoryStructure, filesToGenerate);
  await generateFiles(directoryStructure, filesToGenerate, srcPath, templatesDestPath, textsDestPath, language, textSeparator);
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

async function generateFiles(directoryStructure, filesToGenerate, srcPath, templatesDestPath, textsDestPath, language, textSeparator){
  
  fs.mkdirSync(templatesDestPath, { recursive: true});
  fs.mkdirSync(textsDestPath, { recursive: true});

  const createDirectoriesPromises = [];
  directoryStructure.forEach((directory) => {
    createDirectoriesPromises.push(fs.promises.mkdir(path.join(templatesDestPath, directory), { recursive: true}));
    createDirectoriesPromises.push(fs.promises.mkdir(path.join(textsDestPath, directory), { recursive: true}));
  });
  await Promise.all(createDirectoriesPromises);

  const generateFilesPromises = [];
  filesToGenerate.forEach((file) => {
    generateFilesPromises.push(generateFile(file, srcPath, templatesDestPath, textsDestPath, language, textSeparator));
  });
  await Promise.all(generateFilesPromises);
}

async function generateFile(file, srcPath, templatesDestPath, textsDestPath, language, textSeparator){
  const srcFile = path.join(srcPath, file);
  const templatesDestFile = path.join(templatesDestPath, file);
  const textsDestFile = path.join(textsDestPath, file.replace('.php', '.js'));

  const dom = await JSDOM.fromFile(srcFile);
  const promises = [];
  promises.push(generateTextFile(dom, textsDestFile, language, textSeparator));
  promises.push(generateTemplateFile(dom, templatesDestFile));
  await Promise.all(promises);
}

async function generateTextFile(dom, destPath, language, textSeparator){
  const textsMap = {};
  const NodeFilter = dom.window.NodeFilter;
  const document = dom.window.document;
  textNodesUnder(document, NodeFilter, textSeparator, textsMap);
  const finalTexts = {};
  finalTexts[language] = textsMap;
  await fs.writeFileSync(destPath, 'module.exports = ' + JSON.stringify(finalTexts, null, 2) + ";");
}

async function generateTemplateFile(dom, destPath){
  const htmlNotCorrected = dom.serialize();
  const finalHtml = htmlNotCorrected.replace(/<!--\?php([\s\S]*?)\?-->/g, '<?php $1 ?>');
  await fs.writeFileSync(destPath, finalHtml);
}


function textNodesUnder(el, NodeFilter, textSeparator, textsMap) {
  let counter = 0;
  walkNodeTree(el, NodeFilter.SHOW_TEXT, {
      inspect: textNode => !PARENT_TAGS_TO_EXCLUDE.includes(textNode.parentElement?.nodeName)
  }, el, NodeFilter, textSeparator, textsMap, counter);
}


function walkNodeTree(root, whatToShow = NodeFilter.SHOW_ALL, { inspect, collect, callback } = {}, document, NodeFilter, textSeparator, textsMap, counter) {
  const walker = document.createTreeWalker(
      root,
      whatToShow,
      {
          acceptNode(node) {
              if (inspect && !inspect(node)) { return NodeFilter.FILTER_REJECT; }
              if (collect && !collect(node)) { return NodeFilter.FILTER_SKIP; }
              return NodeFilter.FILTER_ACCEPT;
          }
      }
  );

  let n;
  while (n = walker.nextNode()) {
      callback?.(n);
      if(n.textContent != undefined && n.textContent.trim() != ''){
        textsMap[counter] = n.textContent;
        n.textContent = textSeparator + counter + textSeparator;
        counter++;
      }
  }

}

module.exports = {
  extractTextsAndGenerateTemplates
};