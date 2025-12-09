const path = require('path');

// Use require.resolve to find modules properly
const rootDir = path.resolve(__dirname, '..');

const plugins = [];

// Add tailwindcss
try {
  const tailwindcss = require(require.resolve('tailwindcss', { paths: [rootDir] }));
  plugins.push(tailwindcss({
    config: path.resolve(rootDir, 'tailwind.config.ts'),
  }));
} catch (e) {
  console.error('Failed to load tailwindcss:', e.message);
}

// Add autoprefixer if available (optional)
try {
  const autoprefixer = require(require.resolve('autoprefixer', { paths: [rootDir] }));
  plugins.push(autoprefixer());
} catch (e) {
  // Autoprefixer is optional
}

module.exports = {
  plugins,
}
