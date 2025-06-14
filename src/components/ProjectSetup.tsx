import { Box, Text } from 'ink'
import { useEffect, useState } from 'react'
import { generateProject } from '../utils/fileGenerator.js'
import { detectPackageManager, getRunCommand } from '../utils/packageManager.js'

interface Props {
  projectName: string
  skipInstall: boolean
}

interface ProjectConfig {
  name: string
  description: string
  author: string
  packageName: string
}

export default function ProjectSetup({ projectName, skipInstall }: Props) {
  const [config] = useState<ProjectConfig>({
    name: projectName,
    description: 'A React Native Nitro module',
    author: 'Developer',
    packageName: `react-native-${projectName}`,
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (!isGenerating && !isComplete) {
      setIsGenerating(true)
      generateProject(config, skipInstall)
        .then(() => {
          setIsComplete(true)
          setIsGenerating(false)
        })
        .catch(error => {
          console.error('Failed to generate project:', error)
          setIsGenerating(false)
        })
    }
  }, [config, skipInstall, isGenerating, isComplete])

  if (isComplete) {
    const packageManager = detectPackageManager()
    const runCommand = getRunCommand(packageManager)

    return (
      <Box flexDirection="column">
        <Text color="green">✅ Project created successfully!</Text>
        <Text>
          Next steps:
          {'\n'} cd {projectName}
          {'\n'} {runCommand} build
          {'\n'} cd example && {runCommand} android
        </Text>
      </Box>
    )
  }

  if (isGenerating) {
    return <Text color="yellow">🔧 Generating project files...</Text>
  }

  return (
    <Box flexDirection="column">
      <Text>Using default configuration:</Text>
      <Text>Description: {config.description}</Text>
      <Text>Author: {config.author}</Text>
      <Text>Package: {config.packageName}</Text>
    </Box>
  )
}
