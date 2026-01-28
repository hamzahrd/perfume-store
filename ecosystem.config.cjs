module.exports = {
  apps: [{
    name: 'perfume-backend',
    script: './dist/index.js',
    cwd: '/var/www/perfume-store',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      JWT_SECRET: 'change-this-to-a-long-random-string',
      DATABASE_URL: 'mongodb://mazayaparfum:MZParfums%402026%40123@127.0.0.1:27017/perfume_store',
      PUBLIC_DIR: '/var/www/perfume-store/dist/public',
      UPLOAD_DIR: '/var/www/uploads/perfume-store',
      VITE_APP_ID: 'prod'
    }
  }]
};
