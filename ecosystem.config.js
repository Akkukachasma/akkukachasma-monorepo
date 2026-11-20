const path = require('path');

module.exports = {
  apps: [
    // ─── NestJS API — 4 instances across 8 CPUs ──────────────────────────────
    {
      name: 'akkukachasma-api',
      cwd: path.resolve(__dirname, 'apps/api'),
      script: 'dist/src/main.js',
      instances: 4,
      exec_mode: 'cluster',
      instance_var: 'INSTANCE_ID',
      autorestart: true,
      max_memory_restart: '800M',
      node_args: '--max-old-space-size=1536',
      env: {
        NODE_ENV: 'production',
        PORT: 8001,
      },
      error_file: path.resolve(__dirname, 'apps/api/logs/api-err.log'),
      out_file: path.resolve(__dirname, 'apps/api/logs/api-out.log'),
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },

    // ─── Next.js Web — 2 instances, standalone build ─────────────────────────
    {
      name: 'akkukachasma-web',
      cwd: path.resolve(__dirname, 'apps/web'),
      script: '.next/standalone/apps/web/server.js',
      instances: 2,
      exec_mode: 'cluster',
      instance_var: 'INSTANCE_ID',
      autorestart: true,
      max_memory_restart: '800M',
      node_args: '--max-old-space-size=1536',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
      },
      error_file: path.resolve(__dirname, 'apps/web/logs/web-err.log'),
      out_file: path.resolve(__dirname, 'apps/web/logs/web-out.log'),
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
