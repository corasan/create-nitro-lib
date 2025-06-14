import path from 'node:path'
import fs from 'fs-extra'
import type { ProjectConfig } from './types.js'

export async function createRootPackageJson(
  projectDir: string,
  config: ProjectConfig,
) {
  const packageJson = {
    name: config.packageName,
    version: '0.1.0',
    description: 'Nitro module workspace',
    main: './package/lib/commonjs/index.js',
    module: './package/lib/module/index.js',
    types: './package/lib/typescript/src/index.d.ts',
    'react-native': './package/src/index',
    source: './package/src/index',
    author: config.author,
    scripts: {
      postinstall: 'tsc -p ./package --noEmit || exit 0;',
      typescript: 'bun tsc -p ./package --noEmit',
      clean:
        'rm -rf package/tsconfig.tsbuildinfo package/node_modules package/lib',
      specs: 'bun --cwd ./package specs',
      'specs:pod':
        'bun --cwd ./package specs && cd example/ios && pod install && cd ../../',
      build: 'bun --cwd package build',
      release: 'release-it',
    },
    keywords: ['react-native', 'nitro'],
    workspaces: ['package', 'example'],
    files: [
      'package/src',
      'package/react-native.config.js',
      'package/lib',
      'package/nitrogen',
      'package/cpp',
      'package/android/build.gradle',
      'package/android/gradle.properties',
      'package/android/CMakeLists.txt',
      'package/android/src',
      'package/ios/**/*.h',
      'package/ios/**/*.m',
      'package/ios/**/*.mm',
      'package/ios/**/*.cpp',
      'package/ios/**/*.swift',
      'package/app.plugin.js',
      'package/*.podspec',
      'README.md',
    ],
    repository: `https://github.com/${config.author}/${config.name}.git`,
    license: 'MIT',
    bugs: `https://github.com/${config.author}/${config.name}/issues`,
    homepage: `https://github.com/${config.author}/${config.name}#readme`,
    publishConfig: {
      registry: 'https://registry.npmjs.org/',
      provenance: true,
    },
    devDependencies: {
      '@biomejs/biome': '^1.9.4',
      '@release-it-plugins/workspaces': '^4.2.0',
      '@release-it/bumper': '^7.0.2',
      '@release-it/conventional-changelog': '^10.0.0',
      'release-it': '^18.1.2',
      typescript: '^5.7.3',
    },
    resolutions: {
      'release-it': '^18.1.2',
    },
    'release-it': {
      npm: {
        publish: false,
        versionArgs: ['--allow-same-version'],
      },
      github: {
        release: true,
        releaseName: '${version}',
      },
      hooks: {
        'after:bump': 'bun specs',
        'before:release': 'bun run build',
      },
      git: {
        commitMessage: 'chore: release ${version}',
        tagName: 'v${version}',
        requireCleanWorkingDir: false,
      },
      plugins: {
        '@release-it/bumper': {
          out: [
            {
              file: 'package/package.json',
              path: 'version',
            },
            {
              file: 'example/package.json',
              path: 'version',
            },
          ],
        },
        '@release-it-plugins/workspaces': true,
        '@release-it/conventional-changelog': {
          preset: {
            name: 'conventionalcommits',
            types: [
              {
                type: 'feat',
                section: '✨ Features',
              },
              {
                type: 'fix',
                section: '🐞 Fixes',
              },
              {
                type: 'chore(deps)',
                section: '🛠️ Dependency Upgrades',
              },
              {
                type: 'perf',
                section: '🏎️ Performance Improvements',
              },
              {
                type: 'docs',
                section: '📚 Documentation',
              },
            ],
          },
        },
      },
    },
  }

  await fs.writeJson(path.join(projectDir, 'package.json'), packageJson, {
    spaces: 2,
  })
}

export async function createPackagePackageJson(
  projectDir: string,
  config: ProjectConfig,
) {
  const packageJson = {
    name: config.packageName,
    version: '0.1.0',
    description: config.description,
    main: './lib/commonjs/index.js',
    module: './lib/module/index.js',
    types: './lib/typescript/src/index.d.ts',
    'react-native': './src/index',
    source: './src/index',
    author: config.author,
    scripts: {
      'run-android': 'npx react-native run-android',
      'run-ios': 'npx react-native run-ios',
      'nitro-codegen': 'nitro-codegen --logLevel info',
      prepack: 'cp ../README.md README.md',
      postpack: 'rm -f README.md',
      dev: 'nitro-codegen --watch',
      build: 'nitro-codegen --outputOnlyAbi',
      specs: 'nitro-codegen --validate',
    },
    keywords: ['react-native', 'nitro'],
    repository: `https://github.com/${config.author}/${config.name}.git`,
    license: 'MIT',
    bugs: `https://github.com/${config.author}/${config.name}/issues`,
    homepage: `https://github.com/${config.author}/${config.name}#readme`,
    publishConfig: {
      registry: 'https://registry.npmjs.org/',
      provenance: true,
    },
    files: [
      'src',
      'react-native.config.js',
      'lib',
      'nitrogen',
      'cpp',
      'android/build.gradle',
      'android/gradle.properties',
      'android/CMakeLists.txt',
      'android/src',
      'ios/**/*.h',
      'ios/**/*.m',
      'ios/**/*.mm',
      'ios/**/*.cpp',
      'ios/**/*.swift',
      'app.plugin.js',
      '*.podspec',
      'README.md',
    ],
    peerDependencies: {
      'react-native': '*',
      'react-native-nitro-modules': '*',
    },
    devDependencies: {
      '@types/react': '^18.2.6',
      '@types/react-native': '^0.73.0',
      react: '^18.2.0',
      'react-native': '^0.75.0',
      'react-native-nitro-modules': '^0.15.0',
    },
    codegenConfig: {
      name: `${toPascalCase(config.name)}Spec`,
      type: 'modules',
      jsSrcsDir: 'src',
    },
  }

  await fs.writeJson(
    path.join(projectDir, 'package', 'package.json'),
    packageJson,
    { spaces: 2 },
  )
}

function toPascalCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, word => word.toUpperCase())
    .replace(/\s+/g, '')
    .replace(/[-_]/g, '')
}
