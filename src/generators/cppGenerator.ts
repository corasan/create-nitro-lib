import path from 'node:path'
import fs from 'fs-extra'
import { toPascalCase } from '../utils/string.js'
import type { ProjectConfig } from './types.js'

export async function createCppImplementation(
  packageDir: string,
  config: ProjectConfig,
) {
  const cppDir = path.join(packageDir, 'cpp')
  await fs.ensureDir(cppDir)

  const pascalName = toPascalCase(config.name)
  const lowercaseName = pascalName.toLowerCase()

  const cppContent = `#include "Hybrid${pascalName}.hpp"

namespace margelo::nitro::${lowercaseName} {
  std::string Hybrid${pascalName}::hello(const std::string& name) {
    return "Hello " + name + " from ${pascalName}!";
  }

  double Hybrid${pascalName}::add(double a, double b) {
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
