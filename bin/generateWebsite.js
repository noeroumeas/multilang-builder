#!/usr/bin/env node

const { generateWebsite } = require('../generateWebsite.js');

function runCli() {
  console.log('Generating translated website...');
  generateWebsite()
}
runCli();