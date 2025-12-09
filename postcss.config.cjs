const path = require('path');

// Use require.resolve to find modules
const tailwindcssPath = require.resolve('tailwindcss', { paths: [__dirname] });
const autoprefixerPath = require.resolve('autoprefixer', { paths: [__dirname] });

module.exports = {
  plugins: [
    require(tailwindcssPath)({
      config: path.resolve(__dirname, 'tailwind.config.ts'),
    }),
    require(autoprefixerPath)(),
  ],
}
