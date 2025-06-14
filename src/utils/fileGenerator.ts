import { execSync } from 'node:child_process'
import path from 'node:path'
import fs from 'fs-extra'

interface ProjectConfig {
  name: string
  description: string
  author: string
  packageName: string
}

export async function generateProject(
  config: ProjectConfig,
  template: string,
  skipInstall: boolean,
): Promise<void> {
  const projectDir = path.join(process.cwd(), config.name)

  await fs.ensureDir(projectDir)

  // Create root workspace structure
  await createRootPackageJson(projectDir, config)
  await createWorkspaceStructure(projectDir)

  // Create package directory (the actual nitro module)
  await createPackageStructure(projectDir, config)

  // Create example directory
  await createExampleStructure(projectDir, config)

  // Create root level config files
  await createRootConfigFiles(projectDir, config)

  if (!skipInstall) {
    await installDependencies(projectDir)
  }
}

async function createRootPackageJson(
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

async function createWorkspaceStructure(projectDir: string) {
  await fs.ensureDir(path.join(projectDir, 'package'))
  await fs.ensureDir(path.join(projectDir, 'example'))
  await fs.ensureDir(path.join(projectDir, 'scripts'))
}

async function createPackageStructure(
  projectDir: string,
  config: ProjectConfig,
) {
  const packageDir = path.join(projectDir, 'package')

  // Create package.json for the nitro module
  await createPackagePackageJson(packageDir, config)

  // Create source structure
  await createPackageSourceStructure(packageDir, config)

  // Create nitro.json
  await createNitroConfig(packageDir, config)

  // Create native structures
  await createAndroidStructure(packageDir, config)
  await createIosStructure(packageDir, config)

  // Create config files
  await createPackageConfigFiles(packageDir, config)

  // Create C++ implementation
  await createCppImplementation(packageDir, config)

  // Create iOS Swift implementation
  await createIosSwiftImplementation(packageDir, config)
}

async function createPackagePackageJson(
  packageDir: string,
  config: ProjectConfig,
) {
  const packageJson = {
    name: config.packageName,
    version: '0.1.0',
    description: config.description,
    main: './lib/commonjs/index.js',
    module: './lib/module/index.js',
    types: './lib/typescript/commonjs/src/index.d.ts',
    'react-native': 'src/index',
    source: 'src/index',
    scripts: {
      build: 'rm -rf lib && bun typecheck && bob build',
      typecheck: 'tsc --noEmit',
      clean:
        'rm -rf android/build node_modules/**/android/build lib android/.cxx node_modules/**/android/.cxx',
      release: 'release-it',
      specs:
        'bun typecheck && nitro-codegen --logLevel="debug" && bun run build',
      'specs:pod': 'bun specs && bun --cwd ../example pod',
    },
    keywords: ['react-native', 'nitro'],
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
      'ios/specs/**/*.swift',
      'app.plugin.js',
      '*.podspec',
      'README.md',
    ],
    repository: `https://github.com/${config.author}/${config.name}.git`,
    author: config.author,
    license: 'MIT',
    bugs: `https://github.com/${config.author}/${config.name}/issues`,
    homepage: `https://github.com/${config.author}/${config.name}#readme`,
    publishConfig: {
      registry: 'https://registry.npmjs.org/',
      provenance: true,
    },
    devDependencies: {
      '@expo/config-plugins': '^9.0.10',
      'nitro-codegen': '^0.22.1',
      'react-native-builder-bob': '^0.35.2',
    },
    peerDependencies: {
      react: '*',
      'react-native': '*',
      'react-native-nitro-modules': '*',
    },
    'release-it': {
      npm: {
        publish: true,
      },
      git: false,
      github: {
        release: false,
      },
      hooks: {
        'before:init': 'bun typecheck',
        'after:bump': 'bun build',
      },
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
    eslintIgnore: ['node_modules/', 'lib/'],
  }

  await fs.writeJson(path.join(packageDir, 'package.json'), packageJson, {
    spaces: 2,
  })
}

async function createPackageSourceStructure(
  packageDir: string,
  config: ProjectConfig,
) {
  const srcDir = path.join(packageDir, 'src')
  await fs.ensureDir(srcDir)

  // Create basic index.ts
  const indexContent = `// Export your HybridObjects here
export * from './specs/${toPascalCase(config.name)}Spec';
`

  // Create specs directory
  const specsDir = path.join(srcDir, 'specs')
  await fs.ensureDir(specsDir)

  // Create example spec
  const specContent = `import { HybridObject } from 'react-native-nitro-modules';

export interface ${toPascalCase(config.name)}Spec extends HybridObject<{ ios: '${toPascalCase(config.name)}'; android: '${toPascalCase(config.name)}' }> {
  hello(name: string): string;
  add(a: number, b: number): number;
}
`

  await fs.writeFile(path.join(srcDir, 'index.ts'), indexContent)
  await fs.writeFile(
    path.join(specsDir, `${toPascalCase(config.name)}Spec.ts`),
    specContent,
  )
}

async function createNitroConfig(packageDir: string, config: ProjectConfig) {
  const nitroConfig = {
    $schema: 'https://nitro.margelo.com/nitro.schema.json',
    cxxNamespace: [toPascalCase(config.name)],
    ios: {
      iosModuleName: toPascalCase(config.name),
    },
    android: {
      androidNamespace: [`com.${config.name.toLowerCase()}`],
      androidCxxLibName: config.name.toLowerCase(),
    },
    autolinking: {},
    ignorePaths: ['**/node_modules'],
  }

  await fs.writeJson(path.join(packageDir, 'nitro.json'), nitroConfig, {
    spaces: 2,
  })
}

async function createAndroidStructure(
  packageDir: string,
  config: ProjectConfig,
) {
  const androidDir = path.join(packageDir, 'android')
  await fs.ensureDir(androidDir)

  const buildGradleContent = `apply plugin: 'com.android.library'
apply plugin: 'kotlin-android'

def safeExtGet(prop, fallback) {
    rootProject.ext.has(prop) ? rootProject.ext.get(prop) : fallback
}

android {
    compileSdkVersion safeExtGet('compileSdkVersion', 34)
    buildToolsVersion safeExtGet('buildToolsVersion', '34.0.0')

    defaultConfig {
        minSdkVersion safeExtGet('minSdkVersion', 21)
        targetSdkVersion safeExtGet('targetSdkVersion', 34)
    }

    externalNativeBuild {
        cmake {
            path "CMakeLists.txt"
            version "3.22.1"
        }
    }
}

dependencies {
    implementation 'com.facebook.react:react-native:+'
    implementation 'com.margelo.nitro:nitro-modules:+'
}
`

  const cmakeContent = `cmake_minimum_required(VERSION 3.22.1)

project(${config.name.toLowerCase()})

set(CMAKE_VERBOSE_MAKEFILE ON)
set(CMAKE_CXX_STANDARD 20)

find_package(fbjni REQUIRED CONFIG)
find_package(ReactAndroid REQUIRED CONFIG)

add_library(
    ${config.name.toLowerCase()}
    SHARED
    src/main/cxx/JNI_OnLoad.cpp
    ../cpp/${toPascalCase(config.name)}.cpp
)

target_link_libraries(
    ${config.name.toLowerCase()}
    ReactAndroid::jsi
    ReactAndroid::reactnativejni
    fbjni::fbjni
    android
    log
)
`

  const gradlePropertiesContent = `android.useAndroidX=true
android.enableJetifier=true
`

  await fs.writeFile(path.join(androidDir, 'build.gradle'), buildGradleContent)
  await fs.writeFile(path.join(androidDir, 'CMakeLists.txt'), cmakeContent)
  await fs.writeFile(
    path.join(androidDir, 'gradle.properties'),
    gradlePropertiesContent,
  )

  // Create Android source structure
  const androidSrcDir = path.join(androidDir, 'src', 'main')
  await fs.ensureDir(path.join(androidSrcDir, 'cxx'))
  await fs.ensureDir(
    path.join(androidSrcDir, 'java', 'com', config.name.toLowerCase()),
  )

  const jniContent = `#include <jni.h>
#include <fbjni/fbjni.h>

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM *vm, void *) {
    return facebook::jni::initialize(vm, [] {
        // Register your JNI methods here
    });
}
`

  await fs.writeFile(
    path.join(androidSrcDir, 'cxx', 'JNI_OnLoad.cpp'),
    jniContent,
  )
}

async function createIosStructure(packageDir: string, config: ProjectConfig) {
  const iosDir = path.join(packageDir, 'ios')
  await fs.ensureDir(iosDir)

  const podspecContent = `Pod::Spec.new do |s|
  s.name         = "${config.packageName}"
  s.version      = "0.1.0"
  s.summary      = "${config.description}"
  s.homepage     = "https://github.com/${config.author}/${config.name}"
  s.license      = "MIT"
  s.author       = { "Author" => "${config.author}" }
  s.platform     = :ios, "13.0"
  s.source       = { :git => "https://github.com/${config.author}/${config.name}.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm,swift,cpp}"
  s.public_header_files = "ios/**/*.h"

  s.dependency "React-Core"
  s.dependency "NitroModules"
end
`

  await fs.writeFile(
    path.join(packageDir, `${config.packageName}.podspec`),
    podspecContent,
  )
}

async function createCppImplementation(
  packageDir: string,
  config: ProjectConfig,
) {
  const cppDir = path.join(packageDir, 'cpp')
  await fs.ensureDir(cppDir)

  const cppContent = `#include "${toPascalCase(config.name)}.hpp"

namespace ${toPascalCase(config.name)} {

std::string ${toPascalCase(config.name)}::hello(const std::string& name) {
    return "Hello " + name + " from ${toPascalCase(config.name)}!";
}

double ${toPascalCase(config.name)}::add(double a, double b) {
    return a + b;
}

} // namespace ${toPascalCase(config.name)}
`

  const hppContent = `#pragma once

#include <NitroModules/HybridObject.hpp>
#include <string>

namespace ${toPascalCase(config.name)} {

using namespace margelo::nitro;

class ${toPascalCase(config.name)} : public HybridObject {
public:
    std::string hello(const std::string& name);
    double add(double a, double b);

public:
    // Hybrid Object setup
    void loadHybridMethods() override {
        registerHybridMethod("hello", &${toPascalCase(config.name)}::hello, this);
        registerHybridMethod("add", &${toPascalCase(config.name)}::add, this);
    }
};

} // namespace ${toPascalCase(config.name)}
`

  await fs.writeFile(
    path.join(cppDir, `${toPascalCase(config.name)}.cpp`),
    cppContent,
  )
  await fs.writeFile(
    path.join(cppDir, `${toPascalCase(config.name)}.hpp`),
    hppContent,
  )
}

async function createIosSwiftImplementation(
  packageDir: string,
  config: ProjectConfig,
) {
  const iosDir = path.join(packageDir, 'ios')
  const specsDir = path.join(iosDir, 'specs')
  await fs.ensureDir(specsDir)

  const swiftContent = `import Foundation
import NitroModules

class ${toPascalCase(config.name)}: HybridObject {

    func hello(name: String) -> String {
        return "Hello \\(name) from ${toPascalCase(config.name)}!"
    }

    func add(a: Double, b: Double) -> Double {
        return a + b
    }

    var hybridContext = margelo.nitro.HybridContext()

    var memorySize: Int {
        return getSizeOf(self)
    }
}
`

  await fs.writeFile(
    path.join(specsDir, `${toPascalCase(config.name)}.swift`),
    swiftContent,
  )
}

async function createPackageConfigFiles(
  packageDir: string,
  config: ProjectConfig,
) {
  const tsconfigContent = {
    extends: '../tsconfig.json',
    compilerOptions: {
      outDir: './lib/typescript',
      rootDir: './src',
    },
    include: ['src/**/*'],
    exclude: ['node_modules', 'lib', 'android', 'ios'],
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

async function createExampleStructure(
  projectDir: string,
  config: ProjectConfig,
) {
  const exampleDir = path.join(projectDir, 'example')

  const examplePackageJson = {
    name: 'example',
    main: 'expo-router/entry',
    version: '1.0.0',
    scripts: {
      start: 'expo start',
      android: 'expo run:android',
      ios: 'expo run:ios',
      web: 'expo start --web',
      prebuild: 'expo prebuild',
      pod: 'pod install --project-directory=ios',
    },
    dependencies: {
      '@expo/vector-icons': '^14.0.2',
      '@react-navigation/native': '^7.0.14',
      expo: '~52.0.37',
      'expo-build-properties': '~0.13.2',
      'expo-font': '~13.0.4',
      'expo-linking': '~7.0.5',
      'expo-router': '~4.0.17',
      'expo-splash-screen': '~0.29.22',
      'expo-status-bar': '~2.0.1',
      'expo-system-ui': '~4.0.8',
      'expo-web-browser': '~14.0.2',
      react: '18.3.1',
      'react-dom': '18.3.1',
      'react-native': '0.76.7',
      [config.packageName]: '*',
      'react-native-nitro-modules': '^0.22.1',
      'react-native-reanimated': '~3.16.1',
      'react-native-safe-area-context': '4.12.0',
      'react-native-screens': '~4.4.0',
      'react-native-web': '~0.19.13',
    },
    devDependencies: {
      '@babel/core': '^7.25.2',
      '@types/react': '~18.3.12',
    },
    'release-it': {
      npm: {
        publish: false,
      },
      git: false,
      github: {
        release: false,
      },
    },
    private: true,
    expo: {
      autolinking: {
        nativeModulesDir: '../node_modules',
        searchPaths: ['../node_modules', '../package'],
      },
    },
  }

  const appContent = `import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Alert } from 'react-native';
import { ${toPascalCase(config.name)}Spec } from '${config.packageName}';
import { NitroModules } from 'react-native-nitro-modules';

const ${toPascalCase(config.name)} = NitroModules.create<${toPascalCase(config.name)}Spec>('${toPascalCase(config.name)}');

export default function App() {
  const handleHello = () => {
    try {
      const result = ${toPascalCase(config.name)}.hello('World');
      Alert.alert('Hello Result', result);
    } catch (error) {
      Alert.alert('Error', String(error));
    }
  };

  const handleAdd = () => {
    try {
      const result = ${toPascalCase(config.name)}.add(5, 3);
      Alert.alert('Add Result', \`5 + 3 = \${result}\`);
    } catch (error) {
      Alert.alert('Error', String(error));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>${toPascalCase(config.name)} Example</Text>
      <Button title="Say Hello" onPress={handleHello} />
      <View style={styles.spacer} />
      <Button title="Add Numbers" onPress={handleAdd} />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  spacer: {
    height: 10,
  },
});
`

  await fs.writeJson(
    path.join(exampleDir, 'package.json'),
    examplePackageJson,
    {
      spaces: 2,
    },
  )
  await fs.writeFile(path.join(exampleDir, 'App.tsx'), appContent)
}

async function createRootConfigFiles(
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

async function installDependencies(projectDir: string): Promise<void> {
  try {
    console.log('Installing dependencies...')
    execSync('npm install', {
      cwd: projectDir,
      stdio: 'inherit',
    })
  } catch (error) {
    console.warn(
      "Failed to install dependencies automatically. Please run 'npm install' manually.",
    )
  }
}

function toPascalCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, word => word.toUpperCase())
    .replace(/\s+/g, '')
    .replace(/-/g, '')
    .replace(/_/g, '')
}
