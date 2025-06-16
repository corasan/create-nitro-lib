import path from 'node:path'
import fs from 'fs-extra'
import { toPascalCase } from '../utils/string.js'
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
    repository: {
      type: 'git',
      url: `https://github.com/${config.author}/${config.name}.git`,
    },
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
  packageDir: string,
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
      postinstall: 'tsc || exit 0;',
      typecheck: 'tsc --noEmit',
      clean: 'rm -rf android/build node_modules/**/android/build lib',
      typescript: 'tsc',
      build: 'rm -rf lib && bun typecheck && bob build',
      specs: 'bun nitro-codegen --logLevel="debug"',
    },
    keywords: ['react-native', 'nitro'],
    repository: {
      type: 'git',
      url: `https://github.com/${config.author}/${config.name}.git`,
    },
    license: 'MIT',
    bugs: `https://github.com/${config.author}/${config.name}/issues`,
    homepage: `https://github.com/${config.author}/${config.name}#readme`,
    publishConfig: {
      registry: 'https://registry.npmjs.org/',
      provenance: true,
    },
    files: [
      'src',
      'lib',
      'nitrogen',
      'cpp',
      'ios',
      'plugin',
      '!**/__tests__',
      '!**/__fixtures__',
      '!**/__mocks__',
      'react-native.config.js',
      'android/build.gradle',
      'android/gradle.properties',
      'android/CMakeLists.txt',
      'android/src',
      'app.plugin.js',
      '*.podspec',
      'README.md',
    ],
    peerDependencies: {
      react: '*',
      'react-native': '*',
      'react-native-nitro-modules': '*',
    },
    devDependencies: {
      '@types/react': '*',
      'nitro-codegen': '^0.26.2',
      'react-native-builder-bob': '^0.33.1',
    },
    codegenConfig: {
      name: `${toPascalCase(config.name)}Spec`,
      type: 'modules',
      jsSrcsDir: 'src',
    },
    'react-native-builder-bob': {
      source: 'src',
      output: 'lib',
      targets: [
        [
          'commonjs',
          {
            esm: true,
          },
        ],
        [
          'module',
          {
            esm: true,
          },
        ],
        [
          'typescript',
          {
            esm: true,
          },
        ],
      ],
    },
  }

  await fs.writeJson(path.join(packageDir, 'package.json'), packageJson, {
    spaces: 2,
  })
}
