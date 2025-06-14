import path from 'node:path'
import fs from 'fs-extra'
import type { ProjectConfig } from './types.js'

export async function createCppImplementation(
  packageDir: string,
  config: ProjectConfig,
) {
  const cppDir = path.join(packageDir, 'cpp')
  await fs.ensureDir(cppDir)

  const cppContent = `#include "${toPascalCase(config.name)}.hpp"

namespace ${toPascalCase(config.name)} {

std::string ${toPascalCase(config.name)}::hello(const std::string& name) {
    return "Hello " + name + " from ${toPascalCase(config.name)}!";
}

double ${toPascalCase(config.name)}::add(double a, double b) {
    return a + b;
}

} // namespace ${toPascalCase(config.name)}
`

  const hppContent = `#pragma once

#include <NitroModules/HybridObject.hpp>
#include <string>

namespace ${toPascalCase(config.name)} {

using namespace margelo::nitro;

class ${toPascalCase(config.name)} : public HybridObject {
public:
    std::string hello(const std::string& name);
    double add(double a, double b);

public:
    // Hybrid Object setup
    void loadHybridMethods() override {
        registerHybridMethod("hello", &${toPascalCase(config.name)}::hello, this);
        registerHybridMethod("add", &${toPascalCase(config.name)}::add, this);
    }
};

} // namespace ${toPascalCase(config.name)}
`

  await fs.writeFile(
    path.join(cppDir, `${toPascalCase(config.name)}.cpp`),
    cppContent,
  )
  await fs.writeFile(
    path.join(cppDir, `${toPascalCase(config.name)}.hpp`),
    hppContent,
  )
}

function toPascalCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, word => word.toUpperCase())
    .replace(/\s+/g, '')
    .replace(/[-_]/g, '')
}
