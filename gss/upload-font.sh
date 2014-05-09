#!/bin/sh

##  * Select fonts from https://fonts.googleapis.com
## Then copy css content of the resulting link url.
##  Eg: https://fonts.googleapis.com/css?family=Poiret+One|Roboto:500|Open+Sans:400italic,400,700

## update this
FP=/static/fonts/lusitana/v2/oCjlVB3OWc0D00Ervq8JG7rIa-7acMAeDBVuclsi6Gc.woff
FN=${FP##/*/}
wget https://themes.googleusercontent.com$FP -O /tmp/$FN
gsutil cp /tmp/$FN gs://mbi-data$FP
gsutil setmeta -h "Cache-Control:public, max-age=86400" gs://mbi-data$FP
rm /tmp/$FN



