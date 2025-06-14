import path from 'node:path'
import fs from 'fs-extra'
import type { ProjectConfig } from './types.js'

export async function createIosStructure(
  packageDir: string,
  config: ProjectConfig,
) {
  const iosDir = path.join(packageDir, 'ios')
  await fs.ensureDir(iosDir)

  const podspecContent = `Pod::Spec.new do |s|
  s.name         = "${config.packageName}"
  s.version      = "0.1.0"
  s.summary      = "${config.description}"
  s.homepage     = "https://github.com/${config.author}/${config.name}"
  s.license      = "MIT"
  s.author       = { "Author" => "${config.author}" }
  s.platform     = :ios, "13.0"
  s.source       = { :git => "https://github.com/${config.author}/${config.name}.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm,swift,cpp}"
  s.public_header_files = "ios/**/*.h"

  s.dependency "React-Core"
  s.dependency "NitroModules"
end
`

  await fs.writeFile(
    path.join(packageDir, `${config.packageName}.podspec`),
    podspecContent,
  )
}

export async function createIosSwiftImplementation(
  packageDir: string,
  config: ProjectConfig,
) {
  const iosDir = path.join(packageDir, 'ios')
  const specsDir = path.join(iosDir, 'specs')
  await fs.ensureDir(specsDir)

  const swiftContent = `import Foundation
import NitroModules

class Hybrid${toPascalCase(config.name)}: Hybrid${toPascalCase(config.name)}Spec {

    func hello(name: String) -> String {
        return "Hello \\(name) from ${toPascalCase(config.name)}!"
    }

    func add(a: Double, b: Double) -> Double {
        return a + b
    }
}
`

  await fs.writeFile(
    path.join(specsDir, `Hybrid${toPascalCase(config.name)}.swift`),
    swiftContent,
  )
}

function toPascalCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, word => word.toUpperCase())
    .replace(/\s+/g, '')
    .replace(/[-_]/g, '')
}
