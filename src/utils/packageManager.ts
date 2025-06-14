export function detectPackageManager(): string {
  const userAgent = process.env.npm_config_user_agent || ''

  if (userAgent.includes('bun/')) {
    return 'bun'
  }
  if (userAgent.includes('pnpm/')) {
    return 'pnpm'
  }
  if (userAgent.includes('yarn/')) {
    return 'yarn'
  }

  // Fallback: check process.argv[0] for runtime detection
  const runtime = process.argv[0] || ''
  if (runtime.includes('bun')) {
    return 'bun'
  }
  if (runtime.includes('pnpm')) {
    return 'pnpm'
  }
  if (runtime.includes('yarn')) {
    return 'yarn'
  }

  // Check if this was run with bunx, pnpm dlx, or yarn dlx by looking at npm_execpath
  const execPath = process.env.npm_execpath || ''
  if (execPath.includes('bun')) {
    return 'bun'
  }
  if (execPath.includes('pnpm')) {
    return 'pnpm'
  }
  if (execPath.includes('yarn')) {
    return 'yarn'
  }

  return 'npm'
}

export function getInstallCommand(packageManager: string): string {
  return packageManager === 'yarn'
    ? 'yarn install'
    : `${packageManager} install`
}

export function getRunCommand(packageManager: string): string {
  return packageManager === 'npm' ? 'npm run' : `${packageManager} run`
}
