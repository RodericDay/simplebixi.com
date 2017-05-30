Requires cronjob:

`/etc/cron.d/per_minute:`
```
* * * * * roderic curl https://montreal.bixi.com/data/bikeStations.xml > /var/www/simplebixi.com/latest.xml
```
