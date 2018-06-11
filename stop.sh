# Stop meteor app and mongo process using this script
# Make file executable before running it: using chmod +x
# Run as ./stop-app.sh

echo Stopping app
export PORT=3000
export MONGO_PORT=3001
fuser -k $PORT/tcp
fuser -k $MONGO_PORT/tcp
echo Stopped app
