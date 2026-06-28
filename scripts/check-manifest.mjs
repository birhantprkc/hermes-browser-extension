import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const packagePath = path.join(root, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const manifestPath = path.join(root, 'extension', 'manifest.json');
const rootManifestPath = path.join(root, 'manifest.json');
const distManifestPath = path.join(root, 'dist', 'manifest.json');
const distBuildInfoPath = path.join(root, 'dist', 'build-info.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const rootManifest = fs.existsSync(rootManifestPath) ? JSON.parse(fs.readFileSync(rootManifestPath, 'utf8')) : null;
const distManifest = fs.existsSync(distManifestPath) ? JSON.parse(fs.readFileSync(distManifestPath, 'utf8')) : null;
const distBuildInfo = fs.existsSync(distBuildInfoPath) ? JSON.parse(fs.readFileSync(distBuildInfoPath, 'utf8')) : null;
const requiredFiles = [
  manifest.background?.service_worker,
  manifest.side_panel?.default_path,
  ...(manifest.content_scripts || []).flatMap((entry) => entry.js || []),
  'sidepanel.css',
  'sidepanel.js',
  'request-permissions.html',
  'request-permissions.js',
  'voice-dictation.html',
  'voice-dictation.js',
  'lib/common.mjs',
  'assets/fonts/Sigurd-Variable.woff2',
  'assets/fonts/CourierPrime-Regular.woff2',
  'assets/img/hermes-badge.webp',
  'assets/img/hermes-browse.webp',
  'assets/img/ray-field.svg',
  'assets/icons/icon-16.png',
  'assets/icons/icon-32.png',
  'assets/icons/icon-48.png',
  'assets/icons/icon-128.png',
].filter(Boolean);

const errors = [];

if (manifest.manifest_version !== 3) errors.push('manifest_version must be 3');
if (manifest.version !== packageJson.version) {
  errors.push(`extension/manifest.json version ${manifest.version} must match package.json version ${packageJson.version}`);
}
if (rootManifest && rootManifest.version !== packageJson.version) {
  errors.push(`root manifest.json version ${rootManifest.version} must match package.json version ${packageJson.version}`);
}
if (distManifest && distManifest.version !== packageJson.version) {
  errors.push(`dist/manifest.json version ${distManifest.version} must match package.json version ${packageJson.version}; run npm run build`);
}
if (distManifest && !distBuildInfo) {
  errors.push('dist/build-info.json missing; run npm run build so update checks can compare the loaded build commit to GitHub main');
}
if (distBuildInfo) {
  if (distBuildInfo.version !== packageJson.version) {
    errors.push(`dist/build-info.json version ${distBuildInfo.version} must match package.json version ${packageJson.version}; run npm run build`);
  }
  if (distBuildInfo.commit && !/^[0-9a-f]{7,40}$/i.test(String(distBuildInfo.commit))) {
    errors.push('dist/build-info.json commit must be a git SHA');
  }
}
if (!manifest.permissions?.includes('sidePanel')) errors.push('sidePanel permission missing');
if (!manifest.permissions?.includes('storage')) errors.push('storage permission missing');
if (manifest.permissions?.includes('debugger')) errors.push('debugger permission is intentionally not allowed in v0.1');
if (!manifest.optional_permissions?.includes('audioCapture')) errors.push('audioCapture optional permission missing for runtime microphone prompt');
if (manifest.permissions?.includes('audioCapture')) errors.push('audioCapture should be optional so dictation can request it on click');
if (manifest.permissions?.includes('microphone') || manifest.optional_permissions?.includes('microphone')) {
  errors.push('microphone is a Web Permission name, not a Chrome extension manifest permission; use the request-permissions page instead');
}
if (!manifest.host_permissions?.includes('http://127.0.0.1/*')) errors.push('localhost gateway host permission missing');

for (const file of requiredFiles) {
  const filePath = path.join(root, 'extension', file);
  if (!fs.existsSync(filePath)) errors.push(`Missing manifest asset: ${file}`);
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log(`Manifest OK: ${manifest.name} ${manifest.version}`);
