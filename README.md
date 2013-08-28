Sk8tography
===========

[Sk8tography](http://sk8tography.com/ "Sk8tography") is an open source project that aims to provide one more way to understand and experience skateboarding. 

Sk8tography is a community project and thus we are seeking to get more people involved. Check the list below for ways to help out.

#### Ways to get involved

* Watch and tag video clips and photographs of skateboarding
* Use your knowledge of skateboarding to help define the sk8tography taxonomy ([start here](https://github.com/CodeStrumpet/sk8tography/issues?labels=Skateboarding+Taxonomy&page=1&state=open "skateboarding taxonomy issues"))
* Fork the repo and contribute code to make the experience better (start here if you need some ideas)
* Lend your graphic design skills to help improve the aesthetics of the sk8tography experience
* Like the project on Facebook (TODO: create facebook page!!)



#### Build Instructions

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

