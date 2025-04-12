const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';
module.exports = (options, webpack) => {
  const lazyImports = [
    '@nestjs/microservices/microservices-module',
    '@nestjs/websockets/socket-module',
    // '@fastify/view',
    // '@fastify/static',
  ];

  return {
    ...options,
    mode,
    output: {
      ...options.output,
      library: {
        name: 'handler',
        type: 'umd',
      },
    },
    entry: ['./src/main.ts'],
    externals: [],
    module: {
      ...options.module,
      rules: [
        {
          test: /\.(t|j)s$/,
          loader: 'unlazy-loader',
        },
        ...(options.module?.rules ?? []),
      ],
    },
    plugins: [
      ...options.plugins,
      new webpack.IgnorePlugin({
        checkResource(resource) {
          if (lazyImports.includes(resource)) {
            try {
              require.resolve(resource);
            } catch (err) {
              return true;
            }
          }
          return false;
        },
      }),
    ],
  };
};
