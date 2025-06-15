import path from 'node:path'
import fs from 'fs-extra'
import { createAndroidStructure } from './androidGenerator.js'
import { createNitroConfig } from './configGenerator.js'
import { createPackageConfigFiles } from './configGenerator.js'
import { createCppImplementation } from './cppGenerator.js'
import { createIosStructure } from './iosGenerator.js'
import { createIosSwiftImplementation } from './iosGenerator.js'
import { createPackagePackageJson } from './packageJsonGenerator.js'
import type { ProjectConfig } from './types.js'

export async function createPackageStructure(
  projectDir: string,
  config: ProjectConfig,
) {
  const packageDir = path.join(projectDir, 'package')

  await createPackagePackageJson(packageDir, config)
  await createPackageSourceStructure(packageDir, config)
  await createNitroConfig(packageDir, config)
  await createAndroidStructure(packageDir, config)
  await createIosStructure(packageDir, config)
  await createPackageConfigFiles(packageDir, config)
  await createCppImplementation(packageDir, config)
  await createIosSwiftImplementation(packageDir, config)
}

export async function createPackageSourceStructure(
  packageDir: string,
  config: ProjectConfig,
) {
  const srcDir = path.join(packageDir, 'src')
  await fs.ensureDir(srcDir)

  const indexContent = `export * from './specs/${toPascalCase(config.name)}.nitro';
`

  const specsDir = path.join(srcDir, 'specs')
  await fs.ensureDir(specsDir)

  const specContent = `import { HybridObject } from 'react-native-nitro-modules';

export interface ${toPascalCase(config.name)} extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  hello(name: string): string;
  add(a: number, b: number): number;
}
`

  await fs.writeFile(path.join(srcDir, 'index.ts'), indexContent)
  await fs.writeFile(
    path.join(specsDir, `${toPascalCase(config.name)}.nitro.ts`),
    specContent,
  )
}

function toPascalCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, word => word.toUpperCase())
    .replace(/\s+/g, '')
    .replace(/[-_]/g, '')
}
