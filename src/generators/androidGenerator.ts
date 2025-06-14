import path from 'node:path'
import fs from 'fs-extra'
import type { ProjectConfig } from './types.js'

export async function createAndroidStructure(
  packageDir: string,
  config: ProjectConfig,
) {
  const androidDir = path.join(packageDir, 'android')
  await fs.ensureDir(androidDir)

  const buildGradleContent = `apply plugin: 'com.android.library'
apply plugin: 'kotlin-android'

def safeExtGet(prop, fallback) {
    rootProject.ext.has(prop) ? rootProject.ext.get(prop) : fallback
}

android {
    compileSdkVersion safeExtGet('compileSdkVersion', 34)
    buildToolsVersion safeExtGet('buildToolsVersion', '34.0.0')

    defaultConfig {
        minSdkVersion safeExtGet('minSdkVersion', 21)
        targetSdkVersion safeExtGet('targetSdkVersion', 34)
    }

    externalNativeBuild {
        cmake {
            path "CMakeLists.txt"
            version "3.22.1"
        }
    }
}

dependencies {
    implementation 'com.facebook.react:react-native:+'
    implementation 'com.margelo.nitro:nitro-modules:+'
}
`

  const cmakeContent = `project(${config.name.toLowerCase()})
cmake_minimum_required(VERSION 3.9.0)

set(PACKAGE_NAME ${config.name.toLowerCase()})
set(CMAKE_VERBOSE_MAKEFILE ON)
set(CMAKE_CXX_STANDARD 20)

# Define C++ library and add all sources
add_library(\${PACKAGE_NAME} SHARED
        src/main/cpp/cpp-adapter.cpp
)

# Add Nitrogen specs :)
include(\${CMAKE_SOURCE_DIR}/../nitrogen/generated/android/${config.name.toLowerCase()}+autolinking.cmake)

# Set up local includes
include_directories(
    "src/main/cpp"
    "../cpp"
)

find_library(LOG_LIB log)

# Link all libraries together
target_link_libraries(
    \${PACKAGE_NAME}
    \${LOG_LIB}
    android
)
`

  const gradlePropertiesContent = `android.useAndroidX=true
android.enableJetifier=true
`

  await fs.writeFile(path.join(androidDir, 'build.gradle'), buildGradleContent)
  await fs.writeFile(path.join(androidDir, 'CMakeLists.txt'), cmakeContent)
  await fs.writeFile(
    path.join(androidDir, 'gradle.properties'),
    gradlePropertiesContent,
  )

  const androidSrcDir = path.join(androidDir, 'src', 'main')
  await fs.ensureDir(path.join(androidSrcDir, 'cpp'))
  await fs.ensureDir(
    path.join(androidSrcDir, 'java', 'com', config.name.toLowerCase()),
  )

  const cppAdapterContent = `#include <jni.h>
#include <fbjni/fbjni.h>

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM *vm, void *) {
    return facebook::jni::initialize(vm, [] {
        // Register your JNI methods here
    });
}
`

  await fs.writeFile(
    path.join(androidSrcDir, 'cpp', 'cpp-adapter.cpp'),
    cppAdapterContent,
  )
}
