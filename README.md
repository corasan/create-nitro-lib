# Create Nitro Module CLI

A command-line tool to generate React Native Nitro Modules templates quickly and consistently.

## Installation

```bash
npm install -g create-nitro-lib
```

## Usage

Create a new Nitro module project:

```bash
create-nitro-lib my-awesome-module
```

With options:

```bash
create-nitro-lib my-module --template advanced --skip-install
```

## Features

- 🚀 Interactive project setup
- 📦 Complete project structure generation
- 🔧 TypeScript support out of the box
- 📱 Example app included
- 🏗️ Android and iOS native code structure
- 📋 Ready-to-use configuration files

## Project Structure

The generated project includes:

```
my-module/
├── src/                    # TypeScript source code
├── android/               # Android native implementation
├── ios/                   # iOS native implementation
├── example/               # Example React Native app
├── package.json
├── tsconfig.json
└── README.md
```

## Development

To work on this CLI tool:

```bash
git clone <repo-url>
cd nitro-lib-template-cli
npm install
npm run build
npm link
```

Then you can test it locally:

```bash
create-nitro-lib test-module
```

## Scripts

- `npm run build` - Build the CLI
- `npm run dev` - Run in development mode with tsx

## License

MIT
