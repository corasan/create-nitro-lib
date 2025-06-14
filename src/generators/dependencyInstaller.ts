import { execSync } from 'node:child_process'
import {
  detectPackageManager,
  getInstallCommand,
} from '../utils/packageManager.js'

export async function installDependencies(projectDir: string): Promise<void> {
  const packageManager = detectPackageManager()
  const installCommand = getInstallCommand(packageManager)

  try {
    console.log(`Installing dependencies with ${packageManager}...`)
    execSync(installCommand, {
      cwd: projectDir,
      stdio: 'inherit',
    })
  } catch (error) {
    console.warn(
      `Failed to install dependencies automatically. Please run '${installCommand}' manually.`,
    )
  }
}
