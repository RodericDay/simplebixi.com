source ../config.sh

rsync -at --delete . roderic@$IP:/var/www/simplebixi.com
