#!/usr/bin/env node
/**
 * Ensures the Rollup native binary for this platform is installed.
 * Works around an npm bug (https://github.com/npm/cli/issues/4828) where
 * optionalDependencies like @rollup/rollup-darwin-arm64 are sometimes skipped.
 * Run as postinstall. Can also be run manually: npm run fix:rollup
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

function getVersion(pkg) {
  try {
    const p = path.join(process.cwd(), 'package.json');
    const raw = JSON.parse(fs.readFileSync(p, 'utf8')).optionalDependencies?.[pkg] || '';
    const m = (raw || '').match(/(\d+\.\d+\.\d+)/);
    return m ? m[1] : '4.52.3';
  } catch {
    return '4.52.3';
  }
}

function resolvePkg(pkg) {
  try {
    require.resolve(pkg, { paths: [process.cwd()] });
    return true;
  } catch (e) {
    if (e.code !== 'MODULE_NOT_FOUND') throw e;
    return false;
  }
}

function main() {
  const key = `${process.platform}:${process.arch}`;
  const pkg = PLATFORM_PACKAGES[key];
  if (!pkg) return;

  if (resolvePkg(pkg)) return;

  const version = getVersion(pkg);
  const cmd = `npm install ${pkg}@${version} --no-audit --no-fund --ignore-scripts`;
  console.log(`[ensure-rollup] Installing ${pkg}@${version} (npm optionalDeps workaround)`);
  try {
    execSync(cmd, { stdio: 'inherit', cwd: process.cwd() });
  } catch (err) {
    console.error(`[ensure-rollup] Install failed. Run manually:\n  ${cmd}`);
    process.exit(1);
  }
  if (!resolvePkg(pkg)) {
    console.error(`[ensure-rollup] ${pkg} still not found after install. Run:\n  ${cmd}`);
    process.exit(1);
  }
}

main();
