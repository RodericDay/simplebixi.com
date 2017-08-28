source ../digital-ocean-config.sh

tsc
qlmanage -t -s 120 -o . icon.svg && mv icon.svg.png icon.png
rsync -at --update --delete --exclude=.git . roderic@$IP:/var/www/simplebixi.com
