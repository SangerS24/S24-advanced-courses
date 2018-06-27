# Wellcome Genome Campus Advanced Courses and Scientific Conferences

WordPress website for Wellcome Genome Advanced Courses and Scientific Conferences.

Utilises the [Foundation 6 Wordpress Template](https://foundationpress.olefredrik.com/), and the [Fewbricks Wordpress Plugin](https://github.com/folbert/fewbricks) to store ACF configuration in code.

## Site URLs

* Live: https:// ??? .wellcomegenomecampus.org/
* Sanger Staging: http://wt- ??? .sandbox.sanger.ac.uk/
* S24 Staging: http://wgcacsc.s24.net/
* Development: http://wgacsc.dev

## Building the site

To build the site once:

    cd web/wp-content/themes/wgcacsc
    npm run build

And to continuously watch the project for changes run:

    cd web/wp-content/themes/wgcacsc
    npm run watch

## Hosting

The Studio24 staging site is hosted on: ?? new server ??, the Sanger web team host a live and staging site (which are listed above).

## Deployment

### Deploy the site to Sanger live/staging:

To deploy the site live, simply merge any changes into the master branch and send an email to web@sanger.ac.uk requesting that a deployment be made on the Sanger server.

If database changes need to be made, then these can be made on the Sanger staging site (http://wt- ??? .sandbox.sanger.ac.uk/) using the sdunwoody login stored in Bitbucket (we need to get this changed to a Studio24 username, but this hasn't been actioned yet). If database changes are made to the Sanger staging site, you will also need to notify the web team that these changes need pulling in with your deploy.

### Deploy the site to Studio24 staging:

This is currently just a git pull on the server.

```
#!bash
ssh studio24@goldeneye.studio24.net
su root
cd /var/www/wgcc/wascc/staging/
git pull
## This part might not be needed
cd ..
chown -R apache:apache wgccc.s24.net
```

## Documentation

### Wordpress comments

It should be noted that the comments section in the Wordpress admin has been hidden as we aren't using it. You can find the code that hides it in web/wp-content/themes/wgccc/library/theme-custom.php

## Synching tasks

### Sync files from live to staging

Run on your local Mac. Remove *-n* to run this live.

```
#!bash
TBC
```

### Sync files from live to local dev

Run on your local Mac. Remove *-n* to run this live.

```
#!bash
TBC
```

### Sync files from local dev to staging

Run on your local Mac, note that you may need to change the local path for this to work.

```
#!bash
TBC
```

### Staging → Development

```
#!bash
rsync -e 'ssh' -av studio24@goldeneye.studio24.net:/var/www/wgcc/wascc/staging/web/wp-content/uploads/ ~/Sites/wellcome-genome-campus-advanced-courses-and-scientific/web/wp-content/uploads/
```

## Installation

You will need to import a database from the staging/live site and also pull down the config files from the server as these are not stored in the git repo.

You should also pull down the uploaded assets when you first setup the project, you can do this by executing the following command (you may need to change the local path):

```
#!bash
TBC
```

### Requirements

* PHP 5.6+
* [Bower](http://bower.io/) 
* [Gulp](http://gulpjs.com/) 
* [Node](https://nodejs.org) 4.5.0

### Bower

The project uses Bower for JavaScript dependencies. For the initial build run:

    nvm use 4.5.0
    cd web/wp-content/themes/wgcacsc
    bower install

### Gulp

This project uses Gulp to build the Sass and JavaScript. For the initial build run:

    cd web/wp-content/themes/wgcacsc
    # Install project dependencies
    sudo npm install

    # Build the site for the first time
    npm run build