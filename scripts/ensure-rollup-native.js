#!/usr/bin/env node
/**
 * Ensures the Rollup native binary for this platform is installed.
 * Works around an npm bug (https://github.com/npm/cli/issues/4828) where
 * optionalDependencies like @rollup/rollup-darwin-arm64 are sometimes skipped.
 * Run as postinstall.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const PLATFORM_PACKAGES = {
  'darwin:arm64': '@rollup/rollup-darwin-arm64',
  'darwin:x64': '@rollup/rollup-darwin-x64',
  'linux:x64': '@rollup/rollup-linux-x64-gnu',
  'win32:x64': '@rollup/rollup-win32-x64-msvc',
};

function getRollupVersion() {
  try {
    const p = path.join(process.cwd(), 'node_modules', 'rollup', 'package.json');
    return JSON.parse(fs.readFileSync(p, 'utf8')).version || '4.52.3';
  } catch {
    return '4.52.3';
  }
}

function main() {
  const key = `${process.platform}:${process.arch}`;
  const pkg = PLATFORM_PACKAGES[key];
  if (!pkg) return;

  try {
    require.resolve(pkg);
    return;
  } catch (e) {
    if (e.code !== 'MODULE_NOT_FOUND') throw e;
  }

  const version = getRollupVersion();
  console.log(`[postinstall] Installing ${pkg}@${version} (npm optionalDeps workaround)`);
  execSync(`npm install ${pkg}@${version} --no-save`, { stdio: 'inherit', cwd: process.cwd() });
}

main();
