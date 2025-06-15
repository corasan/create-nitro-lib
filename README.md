# Create Nitro Lib CLI

A command-line tool to generate React Native Nitro Modules templates quickly and consistently, following industry best practices and modern tooling.

## Usage

Create a new Nitro module project:

```bash
bunx create-nitro-lib my-module
```

With options:

```bash
bunx create-nitro-lib my-module --skip-install
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
react-native-my-module/
├── package/               # The nitro module package
│   ├── src/              # TypeScript source code with specs
│   ├── android/          # Android native implementation
│   ├── ios/              # iOS native implementation
│   ├── cpp/              # C++ shared implementation
│   └── nitro.json        # Nitro configuration
├── example/              # Expo example app
├── scripts/              # Build scripts
├── package.json          # Workspace configuration
├── tsconfig.json
└── README.md
```

## Development

To work on this CLI tool:

```bash
git clone <repo-url>
cd nitro-lib-template-cli
bun install
bun run build
bun link
```

Then you can test it locally:

```bash
create-nitro-lib test-module
```

## Scripts

- `bun run build` - Build the CLI
- `bun run dev` - Run in development mode
- `bun run test` - Test the CLI by generating a project
- `bun run publish:npm` - Publish to NPM
- `bun run publish:dry` - Dry run to see what will be published

## Publishing

When you're ready to publish:

```bash
# Test everything works
bun run test

# Check what will be published
bun run publish:dry

# Publish to NPM (you'll need 2FA code)
bun run publish:npm
```

## License

MIT
