#!/bin/bash
export DATABASE_URL="mongodb://mazayaparfum:MZParfums%402026%40123@127.0.0.1:27017/perfume_store"
export JWT_SECRET="change-this-to-a-long-random-string"
export NODE_ENV="production"
export PORT="5000"
export PUBLIC_DIR="/var/www/perfume-store/dist/public"
export UPLOAD_DIR="/var/www/uploads/perfume-store"
export VITE_APP_ID="prod"
node /var/www/perfume-store/dist/index.js
