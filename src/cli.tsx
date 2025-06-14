#!/usr/bin/env node
import { render } from 'ink'
import App from './components/App.js'

const args = process.argv.slice(2)
const projectName = args[0]

const flags = {
  template: 'basic',
  skipInstall: false,
}

// Parse flags
for (let i = 1; i < args.length; i++) {
  const arg = args[i]
  if (arg === '--template' || arg === '-t') {
    flags.template = args[i + 1] || 'basic'
    i++ // Skip next argument
  } else if (arg === '--skip-install') {
    flags.skipInstall = true
  }
}

if (!projectName) {
  console.log(`
Usage: create-nitro-lib <project-name>

Options:
  --template, -t  Template type (default: basic)
  --skip-install  Skip npm install

Examples:
  create-nitro-lib my-nitro-module
  create-nitro-lib my-module --template advanced
`)
  process.exit(1)
}

render(<App projectName={projectName} flags={flags} />)
