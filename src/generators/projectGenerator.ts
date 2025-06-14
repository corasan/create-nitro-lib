import path from 'node:path'
import fs from 'fs-extra'
import { createRootConfigFiles } from './configGenerator.js'
import { installDependencies } from './dependencyInstaller.js'
import { createExampleStructure } from './exampleGenerator.js'
import { createPackageStructure } from './packageGenerator.js'
import { createRootPackageJson } from './packageJsonGenerator.js'
import type { ProjectConfig } from './types.js'
import { createWorkspaceStructure } from './workspaceGenerator.js'

export async function generateProject(
  config: ProjectConfig,
  skipInstall: boolean,
): Promise<void> {
  const projectDir = path.join(process.cwd(), config.name)

  await fs.ensureDir(projectDir)

  await createRootPackageJson(projectDir, config)
  await createWorkspaceStructure(projectDir)
  await createPackageStructure(projectDir, config)
  await createExampleStructure(projectDir, config)
  await createRootConfigFiles(projectDir, config)

  if (!skipInstall) {
    await installDependencies(projectDir)
  }
}
