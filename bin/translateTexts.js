#!/usr/bin/env node

const { translateTexts } = require('../translateTexts.js');

function runCli() {
  console.log('Translating...');
  translateTexts()
}
runCli();