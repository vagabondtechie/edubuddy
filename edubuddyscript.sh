sudo fuser -n tcp 2810 -k
sudo fuser -n tcp 8080 -k
(cd /app/bundle/programs/server && npm install)
export MONGO_URL='mongodb://localhost:27017/meteor'
export ROOT_URL='http://localhost'
export PORT 8080
cd /app/bundle
node main.js
