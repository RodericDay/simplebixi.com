source ../digital-ocean-config.sh

qlmanage -t -s 64 -o . icon.svg && mv icon.svg.png icon.png
tsc
rsync -at --delete --exclude=.git . roderic@$IP:/var/www/simplebixi.com
