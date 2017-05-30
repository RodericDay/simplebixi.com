source ../config.sh

tsc
rsync -at --delete --exclude=.git . roderic@$IP:/var/www/simplebixi.com
