import path from 'node:path'
import fs from 'fs-extra'
import type { ProjectConfig } from './types.js'

export async function createCppImplementation(
  packageDir: string,
  config: ProjectConfig,
) {
  const cppDir = path.join(packageDir, 'cpp')
  await fs.ensureDir(cppDir)

  const cppContent = `#pragma once

#include "Hybrid${toPascalCase(config.name)}Spec.hpp"

namespace margelo::nitro::${config.name.toLowerCase()} {
  std::string ${toPascalCase(config.name)}::hello(const std::string& name) {
    return "Hello " + name + " from ${toPascalCase(config.name)}!";
  }

  double ${toPascalCase(config.name)}::add(double a, double b) {
    return a + b;
  }
} // namespace margelo::nitro::${toPascalCase(config.name)}
`

  const hppContent = `#pragma once

#include "Hybrid${toPascalCase(config.name)}Spec.hpp"
#include <string>

namespace margelo::nitro::${config.name.toLowerCase()} {
class Hybrid${toPascalCase(config.name)}: public Hybrid${toPascalCase(config.name)}Spec {
  public:
    Hybrid${toPascalCase(config.name)}(): HybridObject(TAG) {}

    std::string hello(const std::string& name);
    double add(double a, double b);
  };
} // namespace margelo::nitro::${config.name.toLowerCase()}
`

  await fs.writeFile(
    path.join(cppDir, `Hybrid${toPascalCase(config.name)}.cpp`),
    cppContent,
  )
  await fs.writeFile(
    path.join(cppDir, `Hybrid${toPascalCase(config.name)}.hpp`),
    hppContent,
  )
}

function toPascalCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, word => word.toUpperCase())
    .replace(/\s+/g, '')
    .replace(/[-_]/g, '')
}
