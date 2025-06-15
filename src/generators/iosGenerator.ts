import path from 'node:path'
import fs from 'fs-extra'
import type { ProjectConfig } from './types.js'

export async function createIosStructure(
  packageDir: string,
  config: ProjectConfig,
) {
  const iosDir = path.join(packageDir, 'ios')
  await fs.ensureDir(iosDir)

  const pascaleName = toPascalCase(config.name)

  const podspecContent = `require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "${pascaleName}"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => min_ios_version_supported, :visionos => 1.0 }
  s.source       = { :git => "https://github.com/Developer/${config.packageName}.git", :tag => "#{s.version}" }

  s.source_files = [
    # Implementation (Swift)
    "ios/**/*.{swift}",
    # Autolinking/Registration (Objective-C++)
    "ios/**/*.{m,mm}",
    # Implementation (C++ objects)
    "cpp/**/*.{hpp,cpp}",
  ]

  s.pod_target_xcconfig = {
    # C++ compiler flags, mainly for folly.
    "GCC_PREPROCESSOR_DEFINITIONS" => "$(inherited) FOLLY_NO_CONFIG FOLLY_CFG_NO_COROUTINES"
  }

  load 'nitrogen/generated/ios/${pascaleName}+autolinking.rb'
  add_nitrogen_files(s)

  s.dependency 'React-jsi'
  s.dependency 'React-callinvoker'
  install_modules_dependencies(s)
end
`

  await fs.writeFile(
    path.join(packageDir, `${pascaleName}.podspec`),
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
  const pascaleName = toPascalCase(config.name)

  const swiftContent = `import Foundation
import NitroModules

class Hybrid${pascaleName}: Hybrid${pascaleName}Spec {

    func hello(name: String) -> String {
        return "Hello \\(name) from ${pascaleName}!"
    }

    func add(a: Double, b: Double) -> Double {
        return a + b
    }
}
`

  await fs.writeFile(
    path.join(specsDir, `Hybrid${pascaleName}.swift`),
    swiftContent,
  )
}

function toPascalCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, word => word.toUpperCase())
    .replace(/\s+/g, '')
    .replace(/[-_]/g, '')
}
