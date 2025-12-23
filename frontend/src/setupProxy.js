const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    createProxyMiddleware({
      pathFilter: ['/api/**', '/ganache/**'],
      target: 'http://backend:5000',
      changeOrigin: true,
      router: {
        '/ganache': 'http://ganache:8545'
      },
      pathRewrite: {
        '^/ganache': '',
      },
    })
  );
};