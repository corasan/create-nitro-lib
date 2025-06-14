import path from 'node:path'
import fs from 'fs-extra'

export async function createWorkspaceStructure(projectDir: string) {
  await fs.ensureDir(path.join(projectDir, 'package'))
  await fs.ensureDir(path.join(projectDir, 'example'))
  await fs.ensureDir(path.join(projectDir, 'scripts'))
}
