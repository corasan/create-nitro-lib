import path from 'node:path'
import fs from 'fs-extra'
import { createRootConfigFiles } from './configGenerator'
import { installDependencies } from './dependencyInstaller'
import { createExampleStructure } from './exampleGenerator'
import { createPackageStructure } from './packageGenerator'
import { createRootPackageJson } from './packageJsonGenerator'
import type { ProjectConfig } from './types'
import { createWorkspaceStructure } from './workspaceGenerator'

export async function generateProject(
  config: ProjectConfig,
  template: string,
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
