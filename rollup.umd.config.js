import uglify from 'rollup-plugin-uglify';

const umdConfig = {
  output: {
    format: 'umd',
    name: 'Promise',
  },
  plugins: []
};

if (process.env.NODE_ENV === 'production') {
  umdConfig.plugins.push(
    uglify({
      compress: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        warnings: false,
        ie8: true
      },
      mangle: {
        ie8: true
      },
      output: {
        ie8: true
      }
    })
  );
}

export default umdConfig;
