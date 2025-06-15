import path from 'node:path'
import fs from 'fs-extra'
import type { ProjectConfig } from './types.js'

export async function createNitroConfig(
  packageDir: string,
  config: ProjectConfig,
) {
  const nitroConfig = {
    $schema: 'https://nitro.margelo.com/nitro.schema.json',
    cxxNamespace: [config.name.toLowerCase()],
    ios: {
      iosModuleName: config.name.toLowerCase(),
    },
    android: {
      androidNamespace: [config.name.toLowerCase()],
      androidCxxLibName: config.name.toLowerCase(),
    },
    autolinking: {},
    ignorePaths: ['**/node_modules'],
  }

  await fs.writeJson(path.join(packageDir, 'nitro.json'), nitroConfig, {
    spaces: 2,
  })
}

export async function createPackageConfigFiles(
  packageDir: string,
  config: ProjectConfig,
) {
  const tsconfigContent = {
    include: ['src'],
    compilerOptions: {
      composite: true,
      rootDir: 'src',
      allowUnreachableCode: false,
      allowUnusedLabels: false,
      esModuleInterop: true,
      forceConsistentCasingInFileNames: true,
      jsx: 'react-jsx',
      lib: ['esnext'],
      module: 'esnext',
      target: 'esnext',
      moduleResolution: 'node',
      noEmit: false,
      noFallthroughCasesInSwitch: true,
      noImplicitReturns: true,
      noImplicitUseStrict: false,
      noStrictGenericChecks: false,
      noUncheckedIndexedAccess: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      resolveJsonModule: true,
      skipLibCheck: true,
      strict: true,
    },
  }

  const reactNativeConfigContent = `module.exports = {
  dependency: {
    platforms: {
      android: {
        sourceDir: '../android',
        packageImportPath: 'import com.${config.name.toLowerCase()}.${toPascalCase(config.name)}Package;',
      },
      ios: {
        podspecPath: '../${config.packageName}.podspec',
      },
    },
  },
};
`

  await fs.writeJson(path.join(packageDir, 'tsconfig.json'), tsconfigContent, {
    spaces: 2,
  })
  await fs.writeFile(
    path.join(packageDir, 'react-native.config.js'),
    reactNativeConfigContent,
  )
}

export async function createRootConfigFiles(
  projectDir: string,
  config: ProjectConfig,
) {
  const tsconfigContent = {
    compilerOptions: {
      target: 'ES2020',
      module: 'ESNext',
      moduleResolution: 'node',
      lib: ['ES2020'],
      declaration: true,
      outDir: './lib',
      rootDir: './src',
      strict: true,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      resolveJsonModule: true,
      jsx: 'react-jsx',
    },
    include: ['package/src/**/*'],
    exclude: [
      'node_modules',
      'package/lib',
      'package/android',
      'package/ios',
      'example',
    ],
  }

  const biomeConfigContent = {
    $schema: 'https://biomejs.dev/schemas/1.9.4/schema.json',
    vcs: {
      enabled: true,
      clientKind: 'git',
      useIgnoreFile: true,
    },
    files: {
      ignoreUnknown: false,
      ignore: ['node_modules', 'lib', 'android/build', 'ios/build'],
    },
    formatter: {
      enabled: true,
      indentStyle: 'tab',
    },
    organizeImports: {
      enabled: true,
    },
    linter: {
      enabled: true,
      rules: {
        recommended: true,
      },
    },
    javascript: {
      formatter: {
        quoteStyle: 'double',
      },
    },
  }

  const gitignoreContent = `node_modules/
lib/
*.log
.DS_Store
android/build/
ios/build/
package/android/build/
package/ios/build/
package/lib/
example/ios/build/
example/android/build/
*.xcworkspace
*.xcuserdata
.expo/
dist/
.gradle/
`

  const readmeContent = `# ${config.packageName}

${config.description}

## Installation

\`\`\`sh
npm install ${config.packageName}
\`\`\`

## Usage

\`\`\`javascript
import { ${toPascalCase(config.name)}Spec } from '${config.packageName}';
import { NitroModules } from 'react-native-nitro-modules';

const ${toPascalCase(config.name)} = NitroModules.create<${toPascalCase(config.name)}Spec>('${toPascalCase(config.name)}');

const result = ${toPascalCase(config.name)}.hello('World');
console.log(result);
\`\`\`

## API

### \`hello(name: string): string\`

Returns a greeting message.

### \`add(a: number, b: number): number\`

Adds two numbers and returns the result.

## Development

This project uses a workspace structure with:
- \`package/\` - The nitro module source code
- \`example/\` - Example app demonstrating usage

### Setup

\`\`\`sh
npm install
npm run build
\`\`\`

### Running the example

\`\`\`sh
cd example
npm run ios
# or
npm run android
\`\`\`

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository.

## License

MIT
`

  await fs.writeJson(path.join(projectDir, 'tsconfig.json'), tsconfigContent, {
    spaces: 2,
  })
  await fs.writeJson(path.join(projectDir, 'biome.json'), biomeConfigContent, {
    spaces: 2,
  })
  await fs.writeFile(path.join(projectDir, '.gitignore'), gitignoreContent)
  await fs.writeFile(path.join(projectDir, 'README.md'), readmeContent)
}

function toPascalCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, word => word.toUpperCase())
    .replace(/\s+/g, '')
    .replace(/[-_]/g, '')
}
