const path = require('path');

module.exports = {
  apps: [
    {
      name: 'akkukachasma-api',
      cwd: path.resolve(__dirname, 'apps/api'),
      script: 'dist/src/main.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 8001,
      },
      error_file: path.resolve(__dirname, 'apps/api/logs/api-err.log'),
      out_file: path.resolve(__dirname, 'apps/api/logs/api-out.log'),
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
    {
      name: 'akkukachasma-web',
      cwd: path.resolve(__dirname, 'apps/web'),
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: path.resolve(__dirname, 'apps/web/logs/web-err.log'),
      out_file: path.resolve(__dirname, 'apps/web/logs/web-out.log'),
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
