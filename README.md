sk8tography
===========

git clone https://github.com/CodeStrumpet/sk8tography.git
git submodule init
git submodule update

sudo npm install -g forever  (necessary if you want to use the 'start' and 'stop' scripts)

from within the sk8tography directory:   nom install

to support local video downloading and processing:
	on ubuntu
	install ffmpeg: https://ffmpeg.org/trac/ffmpeg/wiki/UbuntuCompilationGuide
	install youtube-dl:   > apt-get install youtube-dl

	on os x
	brew install ffmpeg
	brew install youtube-dl



MongoDB Connection:
option1: add the .env file that points towards the MONGOLAB test or production instance
option2: 
1 install mongodb locally
2 initiate a 'mongod' process from the command line


To Start:

option1: run ./start script
(pass '--local_db <db name>' arg to script if you want to connect to a local instance of mongod and use <db name>)
pass NODE_ENV=PRODUCTION to run in production mode:  > NODE_ENV=PRODUCTION ./start
option2: run 'node app.'s'

To Stop:
option1: run .stop script (if you started w/ forever)


To Watch logs:
tail -f out.log
