import { Box, Text, useInput } from 'ink'
import React, { useState, useEffect } from 'react'
import { generateProject } from '../utils/fileGenerator.js'

interface Props {
  projectName: string
  template: string
  skipInstall: boolean
}

interface ProjectConfig {
  name: string
  description: string
  author: string
  packageName: string
}

export default function ProjectSetup({
  projectName,
  template,
  skipInstall,
}: Props) {
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
      generateProject(config, template, skipInstall)
        .then(() => {
          setIsComplete(true)
          setIsGenerating(false)
        })
        .catch(error => {
          console.error('Failed to generate project:', error)
          setIsGenerating(false)
        })
    }
  }, [config, template, skipInstall, isGenerating, isComplete])

  if (isComplete) {
    return (
      <Box flexDirection="column">
        <Text color="green">✅ Project created successfully!</Text>
        <Text>
          Next steps:
          {'\n'} cd {projectName}
          {'\n'} npm run build
          {'\n'} cd example && npm run android
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
