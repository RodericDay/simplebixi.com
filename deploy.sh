source ../digital-ocean-config.sh

tsc
qlmanage -t -s 64 -o . icon.svg && mv icon.svg.png icon.png
rsync -at --delete --exclude=.git . roderic@$IP:/var/www/simplebixi.com
