import { Box, Text } from 'ink'
import React from 'react'
import ProjectSetup from './ProjectSetup.js'

interface Props {
  projectName?: string
  flags: {
    template: string
    skipInstall: boolean
  }
}

export default function App({ projectName, flags }: Props) {
  if (!projectName) {
    return (
      <Box flexDirection="column">
        <Text color="red">Error: Project name is required</Text>
        <Text>Usage: create-nitro-lib &lt;project-name&gt;</Text>
      </Box>
    )
  }

  return (
    <Box flexDirection="column">
      <Text color="blue" bold>
        🚀 Creating Nitro Module: {projectName}
      </Text>
      <ProjectSetup
        projectName={projectName}
        template={flags.template}
        skipInstall={flags.skipInstall}
      />
    </Box>
  )
}
