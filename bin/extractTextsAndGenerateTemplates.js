#!/usr/bin/env node

const { extractTextsAndGenerateTemplates } = require('../extractTextsAndGenerateTemplates.js');

function runCli() {
  console.log('Extracting texts and creating template...');
  extractTextsAndGenerateTemplates();
}
runCli();