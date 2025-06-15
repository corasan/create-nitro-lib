import path from 'node:path'
import fs from 'fs-extra'
import type { ProjectConfig } from './types.js'

export async function createCppImplementation(
  packageDir: string,
  config: ProjectConfig,
) {
  const cppDir = path.join(packageDir, 'cpp')
  await fs.ensureDir(cppDir)

  const pascalName = toPascalCase(config.name)
  const lowercaseName = config.name.toLowerCase()

  const cppContent = `#pragma once

#include "Hybrid${pascalName}Spec.hpp"

namespace margelo::nitro::${lowercaseName} {
  std::string Hybrid${pascalName}::hello(const std::string& name) {
  return "Hello " + name + " from ${pascalName}!";
  }

  double ${pascalName}::add(double a, double b) {
    return a + b;
  }
} // namespace margelo::nitro::${lowercaseName}
`

  const hppContent = `#pragma once

#include "Hybrid${pascalName}Spec.hpp"
#include <string>

namespace margelo::nitro::${lowercaseName} {
class Hybrid${pascalName}: public Hybrid${pascalName}Spec {
  public:
    Hybrid${pascalName}(): HybridObject(TAG) {}

    std::string hello(const std::string& name);
    double add(double a, double b);
  };
} // namespace margelo::nitro::${lowercaseName}
`

  await fs.writeFile(path.join(cppDir, `Hybrid${pascalName}.cpp`), cppContent)
  await fs.writeFile(path.join(cppDir, `Hybrid${pascalName}.hpp`), hppContent)
}

function toPascalCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, word => word.toUpperCase())
    .replace(/\s+/g, '')
    .replace(/[-_]/g, '')
}
