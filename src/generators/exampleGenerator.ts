import path from 'node:path'
import fs from 'fs-extra'
import type { ProjectConfig } from './types.js'

export async function createExampleStructure(
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

function toPascalCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, word => word.toUpperCase())
    .replace(/\s+/g, '')
    .replace(/[-_]/g, '')
}
