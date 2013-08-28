Sk8tography
===========

[Sk8tography](http://sk8tography.com/ "Sk8tography") is an open source project that aims to provide one more way to understand and experience skateboarding. 

Sk8tography is a community project and thus we are seeking to get more people involved. Check the list below for ways to help out.  


### **Ways to get involved**

* Watch and tag video clips and photographs of skateboarding
* Use your knowledge of skateboarding to help define the sk8tography taxonomy ([start here](https://github.com/CodeStrumpet/sk8tography/issues?labels=Skateboarding+Taxonomy&page=1&state=open "skateboarding taxonomy issues"))
* Fork the repo and contribute code to make the experience better (start here if you need some ideas)
* Lend your graphic design skills to help improve the aesthetics of the sk8tography experience
* Like the project on Facebook (TODO: create facebook page!!)  


### **Build Instructions**

**clone the repo**

	git clone https://github.com/CodeStrumpet/sk8tography.git
	git submodule init
	git submodule update
  

**install node.js dependencies** (from within the sk8tography directory)
	
	npm install
  

**optional: install forever module** (necessary if you want to use the 'start' and 'stop' scripts)

	sudo npm install -g forever
  

**install dependencies for local video downloading and processing** (without this you can still tag and view content but you won't be able to add new videos)

on ubuntu:

	install ffmpeg: https://ffmpeg.org/trac/ffmpeg/wiki/UbuntuCompilationGuide
	install youtube-dl:   > apt-get install youtube-dl

on os x:

	brew install ffmpeg
	brew install youtube-dl
  

  
**MongoDB Connection**

Option 1: create a .env file in the root sk8tography directory that points towards the MONGOLAB test or production instance 

* email paulmans@gmail.com to get the .env credentials

Option 2:
1. install mongodb locally
2. initiate a 'mongod' process from the command line
3. follow start instructions below and pass '--local_db <db name>' arg to script if you want to connect to a local instance of mongod and use <db name>


**Start the server** (assuming you have forever module installed (see above))

default everything:

	./start

point towards a local mongodb instance (in this case the db is named sk8abase):

	./start --local_db sk8abase

point towards production db:

	NODE_ENV=PRODUCTION ./start


**Stop the server**

	./stop

**To watch the general output and error logs**

general output:

	tail -f out.log

errors:

	tail -f err.log
