#!/usr/bin/env node
/**
 * Ensures the Rollup native binary for this platform is installed.
 * Works around an npm bug (https://github.com/npm/cli/issues/4828) where
 * optionalDependencies like @rollup/rollup-darwin-arm64 are sometimes skipped.
 * Run as postinstall. Can also be run manually: npm run fix:rollup
 *
 * On darwin we install BOTH arm64 and x64 so it works whether Node is native
 * or Rosetta, and whether the user runs "nvm use" after "npm install".
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const VERSION = '4.52.3';

const PLATFORM_PACKAGES = {
  'darwin:arm64': '@rollup/rollup-darwin-arm64',
  'darwin:x64': '@rollup/rollup-darwin-x64',
  'linux:x64': '@rollup/rollup-linux-x64-gnu',
  'win32:x64': '@rollup/rollup-win32-x64-msvc',
};

function pkgDir(pkg) {
  return path.join(process.cwd(), 'node_modules', pkg);
}

function hasPkg(pkg) {
  return fs.existsSync(path.join(pkgDir(pkg), 'package.json'));
}

function tryInstall(pkg) {
  if (hasPkg(pkg)) return true;
  const cmd = `npm install ${pkg}@${VERSION} --no-audit --no-fund --ignore-scripts`;
  console.log(`[ensure-rollup] Installing ${pkg}@${VERSION} (npm optionalDeps workaround)`);
  try {
    execSync(cmd, { stdio: 'inherit', cwd: process.cwd() });
  } catch (err) {
    return false;
  }
  return hasPkg(pkg);
}

function main() {
  if (process.platform === 'darwin') {
    const arm = tryInstall(PLATFORM_PACKAGES['darwin:arm64']);
    const x64 = tryInstall(PLATFORM_PACKAGES['darwin:x64']);
    if (!arm && !x64) {
      console.error('[ensure-rollup] Could not install Rollup native for darwin. Run:\n  npm run fix:rollup');
      process.exit(1);
    }
    return;
  }

  const key = `${process.platform}:${process.arch}`;
  const pkg = PLATFORM_PACKAGES[key];
  if (!pkg) return;
  if (hasPkg(pkg)) return;
  if (!tryInstall(pkg)) {
    console.error(`[ensure-rollup] Install failed. Run:\n  npm install ${pkg}@${VERSION} --no-audit --no-fund --ignore-scripts`);
    process.exit(1);
  }
}

main();
