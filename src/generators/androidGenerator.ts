import path from 'node:path'
import fs from 'fs-extra'
import { toPascalCase } from '../utils/string.js'
import type { ProjectConfig } from './types.js'

export async function createAndroidStructure(
  packageDir: string,
  config: ProjectConfig,
) {
  const androidDir = path.join(packageDir, 'android')
  await fs.ensureDir(androidDir)
  const pascalName = toPascalCase(config.name)

  const buildGradleContent = `buildscript {
  repositories {
    google()
    mavenCentral()
  }

  dependencies {
    classpath "com.android.tools.build:gradle:8.10.1"
  }
}

def reactNativeArchitectures() {
  def value = rootProject.getProperties().get("reactNativeArchitectures")
  return value ? value.split(",") : ["armeabi-v7a", "x86", "x86_64", "arm64-v8a"]
}

def isNewArchitectureEnabled() {
  return rootProject.hasProperty("newArchEnabled") && rootProject.getProperty("newArchEnabled") == "true"
}

apply plugin: "com.android.library"
apply plugin: 'org.jetbrains.kotlin.android'
apply from: '../nitrogen/generated/android/${pascalName}+autolinking.gradle'

if (isNewArchitectureEnabled()) {
  apply plugin: "com.facebook.react"
}

def getExtOrDefault(name) {
  return rootProject.ext.has(name) ? rootProject.ext.get(name) : project.properties["${pascalName}_" + name]
}

def getExtOrIntegerDefault(name) {
  return rootProject.ext.has(name) ? rootProject.ext.get(name) : (project.properties["${pascalName}_" + name]).toInteger()
}

android {
  namespace "com.margelo.nitro.${pascalName}"

  ndkVersion getExtOrDefault("ndkVersion")
  compileSdkVersion getExtOrIntegerDefault("compileSdkVersion")

  defaultConfig {
    minSdkVersion getExtOrIntegerDefault("minSdkVersion")
    targetSdkVersion getExtOrIntegerDefault("targetSdkVersion")
    buildConfigField "boolean", "IS_NEW_ARCHITECTURE_ENABLED", isNewArchitectureEnabled().toString()

    externalNativeBuild {
      cmake {
        cppFlags "-frtti -fexceptions -Wall -Wextra -fstack-protector-all"
        arguments "-DANDROID_STL=c++_shared", "-DANDROID_SUPPORT_FLEXIBLE_PAGE_SIZES=ON"
        abiFilters (*reactNativeArchitectures())

        buildTypes {
          debug {
            cppFlags "-O1 -g"
          }
          release {
            cppFlags "-O2"
          }
        }
      }
    }
  }

  externalNativeBuild {
    cmake {
      path "CMakeLists.txt"
    }
  }

  packagingOptions {
    excludes = [
            "META-INF",
            "META-INF/**",
            "**/libc++_shared.so",
            "**/libfbjni.so",
            "**/libjsi.so",
            "**/libfolly_json.so",
            "**/libfolly_runtime.so",
            "**/libglog.so",
            "**/libhermes.so",
            "**/libhermes-executor-debug.so",
            "**/libhermes_executor.so",
            "**/libreactnative.so",
            "**/libreactnativejni.so",
            "**/libturbomodulejsijni.so",
            "**/libreact_nativemodule_core.so",
            "**/libjscexecutor.so"
    ]
  }

  buildFeatures {
    buildConfig true
    prefab true
  }

  buildTypes {
    release {
      minifyEnabled false
    }
  }

  lintOptions {
    disable "GradleCompatible"
  }

  compileOptions {
    sourceCompatibility JavaVersion.VERSION_1_8
    targetCompatibility JavaVersion.VERSION_1_8
  }

  sourceSets {
    main {
      if (isNewArchitectureEnabled()) {
        java.srcDirs += [
          // React Codegen files
          "\${project.buildDir}/generated/source/codegen/java"
        ]
      }
    }
  }
}

repositories {
  mavenCentral()
  google()
}


dependencies {
  // For < 0.71, this will be from the local maven repo
  // For > 0.71, this will be replaced by \`com.facebook.react:react-android:$version\` by react gradle plugin
  //noinspection GradleDynamicVersion
  implementation "com.facebook.react:react-native:+"

  // Add a dependency on NitroModules
  implementation project(":react-native-nitro-modules")
}
`

  const cmakeContent = `project(${pascalName})
cmake_minimum_required(VERSION 3.9.0)

set(PACKAGE_NAME ${pascalName})
set(CMAKE_VERBOSE_MAKEFILE ON)
set(CMAKE_CXX_STANDARD 20)

# Define C++ library and add all sources
add_library(\${PACKAGE_NAME} SHARED
        src/main/cpp/cpp-adapter.cpp
)

# Add Nitrogen specs :)
include(\${CMAKE_SOURCE_DIR}/../nitrogen/generated/android/\${PACKAGE_NAME}+autolinking.cmake)

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

  const gradlePropertiesContent = `${pascalName}_kotlinVersion=2.0.21
${pascalName}_minSdkVersion=23
${pascalName}_targetSdkVersion=35
${pascalName}_compileSdkVersion=34
${pascalName}_ndkVersion=27.1.12297006
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
    path.join(
      androidSrcDir,
      'java',
      'com',
      'margelo',
      'nitro',
      config.name.toLowerCase(),
    ),
  )

  const cppAdapterContent = `#include <jni.h>
#include "${pascalName}OnLoad.hpp"

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  return margelo::nitro::${config.name.toLowerCase()}::initialize(vm);
}
`

  const javaPackageContent = `package com.margelo.nitro.${config.name.toLowerCase()};

import android.util.Log;

import androidx.annotation.Nullable;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.module.model.ReactModuleInfoProvider;
import com.facebook.react.TurboReactPackage;
import com.margelo.nitro.core.HybridObject;

import java.util.HashMap;
import java.util.function.Supplier;

public class ${pascalName}Package extends TurboReactPackage {
  @Nullable
  @Override
  public NativeModule getModule(String name, ReactApplicationContext reactContext) {
    return null;
  }

  @Override
  public ReactModuleInfoProvider getReactModuleInfoProvider() {
    return () -> {
        return new HashMap<>();
    };
  }

  static {
    ${pascalName}OnLoad.initializeNative();
  }
}
`

  const androidManifestContent = `<manifest xmlns:android="http://schemas.android.com/apk/res/android">
</manifest>
`

  await fs.writeFile(
    path.join(androidSrcDir, 'cpp', 'cpp-adapter.cpp'),
    cppAdapterContent,
  )
  await fs.writeFile(
    path.join(
      androidSrcDir,
      'java',
      'com',
      'margelo',
      'nitro',
      config.name.toLowerCase(),
      `${pascalName}Package.java`,
    ),
    javaPackageContent,
  )
  await fs.writeFile(
    path.join(androidSrcDir, 'AndroidManifest.xml'),
    androidManifestContent,
  )
}
