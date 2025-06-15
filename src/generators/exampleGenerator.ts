import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'fs-extra'
import { toPascalCase } from '../utils/string.js'
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
      expo: '~53.0.11',
      'expo-build-properties': '~0.14.6',
      'expo-font': '~13.3.1',
      'expo-linking': '~7.1.5',
      'expo-router': '~5.1.0',
      'expo-splash-screen': '~0.30.9',
      'expo-status-bar': '~2.2.3',
      'expo-system-ui': '~5.0.8',
      'expo-web-browser': '~14.1.6',
      react: '19.0.0',
      'react-dom': '19.0.0',
      'react-native': '0.79.3',
      [config.packageName]: '*',
      'react-native-nitro-modules': '^0.26.2',
      'react-native-reanimated': '~3.17.4',
      'react-native-safe-area-context': '5.4.0',
      'react-native-screens': '~4.11.1',
      'react-native-web': '^0.20.0',
    },
    devDependencies: {
      '@babel/core': '^7.27.4',
      '@types/react': '^19.1.8',
      '@types/react-native': '^0.73.0',
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

  const appDir = path.join(exampleDir, 'app')

  const appNotFoundContent = `import { Link, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Text style={styles.title}>This screen doesn't exist.</Text>

        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});
`

  const appIndexContent = `import { StyleSheet } from 'react-native'

import { Text, View } from '@/components/Themed'

export default function TabOneScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tab One</Text>
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
})
`

  const appLayoutContent = `import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import 'react-native-reanimated'

import { useColorScheme } from '@/components/useColorScheme'

export { ErrorBoundary } from 'expo-router'

export const unstable_settings = {
  initialRouteName: '(tabs)',
}

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const colorScheme = useColorScheme()

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  )
}
`

  const appJson = {
    expo: {
      name: 'example',
      slug: 'example',
      version: '1.0.0',
      orientation: 'portrait',
      icon: './assets/images/icon.png',
      scheme: 'example',
      userInterfaceStyle: 'automatic',
      newArchEnabled: true,
      splash: {
        image: './assets/images/splash-icon.png',
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
      },
      ios: {
        supportsTablet: true,
      },
      android: {
        adaptiveIcon: {
          foregroundImage: './assets/images/adaptive-icon.png',
          backgroundColor: '#ffffff',
        },
        edgeToEdgeEnabled: true,
      },
      web: {
        bundler: 'metro',
        output: 'static',
        favicon: './assets/images/favicon.png',
      },
      plugins: ['expo-router'],
      experiments: {
        typedRoutes: true,
      },
    },
  }

  const tsConfig = {
    extends: 'expo/tsconfig.base',
    compilerOptions: {
      strict: true,
      paths: {
        '@/*': ['./*'],
      },
    },
    include: ['**/*.ts', '**/*.tsx', '.expo/types/**/*.ts', 'expo-env.d.ts'],
  }

  const gitignoreContent = `# Learn more https://docs.github.com/en/get-started/getting-started-with-git/ignoring-files

# dependencies
node_modules/

# Expo
.expo/
dist/
web-build/
expo-env.d.ts

# Native
.kotlin/
*.orig.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision

# Metro
.metro-health-check*

# debug
npm-debug.*
yarn-debug.*
yarn-error.*

# macOS
.DS_Store
*.pem

# local env files
.env*.local

# typescript
*.tsbuildinfo
`

  const metroConfigContent = `const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
	path.resolve(projectRoot, "node_modules"),
	path.resolve(monorepoRoot, "node_modules"),
];

module.exports = config;
`

  await fs.writeJson(
    path.join(exampleDir, 'package.json'),
    examplePackageJson,
    {
      spaces: 2,
    },
  )
  await fs.writeJson(path.join(exampleDir, 'app.json'), appJson, {
    spaces: 2,
  })
  await fs.writeJson(path.join(exampleDir, 'tsconfig.json'), tsConfig, {
    spaces: 2,
  })
  await fs.writeFile(path.join(exampleDir, '.gitignore'), gitignoreContent)
  await fs.writeFile(
    path.join(exampleDir, 'metro.config.js'),
    metroConfigContent,
  )

  const componentsDir = path.join(exampleDir, 'components')
  const assetsImagesDir = path.join(exampleDir, 'assets', 'images')
  const currentDir = path.dirname(fileURLToPath(import.meta.url))
  const sourceAssetsDir = path.join(
    currentDir,
    '..',
    '..',
    'src',
    'assets',
    'images',
  )

  const themedComponentContent = `import { Text as DefaultText, useColorScheme, View as DefaultView } from 'react-native';

import Colors from '@/constants/Colors';

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & DefaultView['props'];

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return <DefaultText style={[{ color }, style]} {...otherProps} />;
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}
`

  const useColorSchemeContent = `import { useColorScheme as _useColorScheme } from 'react-native';

export function useColorScheme() {
  return _useColorScheme();
}
`

  const colorsConstantContent = `const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

export default {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
  },
};
`

  const constantsDir = path.join(exampleDir, 'constants')

  await fs.ensureDir(appDir)
  await fs.ensureDir(componentsDir)
  await fs.ensureDir(constantsDir)
  await fs.ensureDir(assetsImagesDir)

  await fs.writeFile(path.join(appDir, '+not-found.tsx'), appNotFoundContent)
  await fs.writeFile(path.join(appDir, 'index.tsx'), appIndexContent)
  await fs.writeFile(path.join(appDir, '_layout.tsx'), appLayoutContent)
  await fs.writeFile(
    path.join(componentsDir, 'Themed.tsx'),
    themedComponentContent,
  )
  await fs.writeFile(
    path.join(componentsDir, 'useColorScheme.tsx'),
    useColorSchemeContent,
  )
  await fs.writeFile(
    path.join(constantsDir, 'Colors.ts'),
    colorsConstantContent,
  )

  // Copy image assets
  const imageFiles = [
    'icon.png',
    'splash-icon.png',
    'adaptive-icon.png',
    'favicon.png',
  ]
  for (const imageFile of imageFiles) {
    const sourcePath = path.join(sourceAssetsDir, imageFile)
    const destPath = path.join(assetsImagesDir, imageFile)
    if (await fs.pathExists(sourcePath)) {
      await fs.copy(sourcePath, destPath)
    }
  }
}
