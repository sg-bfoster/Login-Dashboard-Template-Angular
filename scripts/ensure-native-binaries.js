#!/usr/bin/env node
/**
 * Ensures native binaries (esbuild, Rollup) match the current Node architecture.
 *
 * Problem: npm installs platform-specific binaries based on the Node arch at install time.
 * If you later switch Node versions (e.g., x64 Rosetta -> arm64 native), builds fail.
 *
 * Solution: Run this at postinstall AND before each build to detect/fix mismatches.
 *
 * Usage:
 *   postinstall: Installs binaries for current arch
 *   prestart/prebuild: Detects mismatch and installs correct binaries if needed
 *   manual: npm run fix:native
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const platform = process.platform;
const arch = process.arch;
const key = `${platform}:${arch}`;

// Get versions from package-lock.json or use defaults
function getInstalledVersion(pkgName) {
  try {
    const lockPath = path.join(process.cwd(), 'package-lock.json');
    if (fs.existsSync(lockPath)) {
      const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
      const entry = lock.packages?.[`node_modules/${pkgName}`];
      if (entry?.version) return entry.version;
    }
  } catch (e) {}
  return null;
}

// Native binary packages by platform:arch
const ESBUILD_PACKAGES = {
  'darwin:arm64': '@esbuild/darwin-arm64',
  'darwin:x64': '@esbuild/darwin-x64',
  'linux:x64': '@esbuild/linux-x64',
  'win32:x64': '@esbuild/win32-x64',
};

const ROLLUP_PACKAGES = {
  'darwin:arm64': '@rollup/rollup-darwin-arm64',
  'darwin:x64': '@rollup/rollup-darwin-x64',
  'linux:x64': '@rollup/rollup-linux-x64-gnu',
  'win32:x64': '@rollup/rollup-win32-x64-msvc',
};

function nodeModulesPath(pkg) {
  return path.join(process.cwd(), 'node_modules', pkg);
}

function isInstalled(pkg) {
  return fs.existsSync(path.join(nodeModulesPath(pkg), 'package.json'));
}

function install(pkg, version) {
  const spec = version ? `${pkg}@${version}` : pkg;
  console.log(`[native-binaries] Installing ${spec} for ${key}...`);
  try {
    execSync(`npm install ${spec} --no-save --no-audit --no-fund --ignore-scripts`, {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
    return isInstalled(pkg);
  } catch (err) {
    console.error(`[native-binaries] Failed to install ${pkg}`);
    return false;
  }
}

function ensurePackage(pkg, fallbackVersion) {
  if (isInstalled(pkg)) return true;

  // Try to get version from lockfile first
  const version = getInstalledVersion(pkg) || fallbackVersion;
  return install(pkg, version);
}

function ensureDarwinBothArchs(packages, fallbackVersion) {
  // On macOS, install BOTH arm64 and x64 to handle Node version switching
  const arm64Pkg = packages['darwin:arm64'];
  const x64Pkg = packages['darwin:x64'];

  let success = true;

  if (!isInstalled(arm64Pkg)) {
    const v = getInstalledVersion(arm64Pkg) || fallbackVersion;
    if (!install(arm64Pkg, v)) success = false;
  }

  if (!isInstalled(x64Pkg)) {
    const v = getInstalledVersion(x64Pkg) || fallbackVersion;
    if (!install(x64Pkg, v)) success = false;
  }

  return success;
}

function main() {
  const nodeModules = path.join(process.cwd(), 'node_modules');
  if (!fs.existsSync(nodeModules)) {
    // No node_modules yet, nothing to do (npm install will create them)
    return;
  }

  console.log(`[native-binaries] Checking binaries for ${key}...`);

  let hasErrors = false;

  // Handle esbuild
  if (platform === 'darwin') {
    if (!ensureDarwinBothArchs(ESBUILD_PACKAGES, null)) {
      hasErrors = true;
    }
  } else {
    const esbuildPkg = ESBUILD_PACKAGES[key];
    if (esbuildPkg && !ensurePackage(esbuildPkg, null)) {
      hasErrors = true;
    }
  }

  // Handle Rollup
  if (platform === 'darwin') {
    if (!ensureDarwinBothArchs(ROLLUP_PACKAGES, '4.52.3')) {
      hasErrors = true;
    }
  } else {
    const rollupPkg = ROLLUP_PACKAGES[key];
    if (rollupPkg && !ensurePackage(rollupPkg, '4.52.3')) {
      hasErrors = true;
    }
  }

  if (hasErrors) {
    console.error('\n[native-binaries] Some binaries could not be installed.');
    console.error('Try: rm -rf node_modules && npm install');
    process.exit(1);
  }

  console.log(`[native-binaries] All binaries OK for ${key}`);
}

main();
