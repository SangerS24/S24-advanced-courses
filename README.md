# Wellcome Genome Campus Advanced Courses and Scientific Conferences

WordPress website for Wellcome Genome Advanced Courses and Scientific Conferences.

Utilises the [Foundation 6 Wordpress Template](https://foundationpress.olefredrik.com/), and the [Fewbricks Wordpress Plugin](https://github.com/folbert/fewbricks) to store ACF configuration in code.

## Site URLs

We host a temporary staging site (S24 Staging). The live and staging website are hosted by the Sanger IT team.

The Sanger institute is run on the Wellcome Genome campus, and pimarily funded by the Wellcome Trust.

* Live: https://coursesandconferences.wellcomegenomecampus.org (TBC)
* Sanger Staging: (TBC)
* S24 Staging: http://wgcacsc.s24.net/
* Development: http://local.wgacsc.org/

## Building the site

To build the site once:

    cd web/wp-content/themes/wgcacsc
    npm run build

And to continuously watch the project for changes run:

    cd web/wp-content/themes/wgcacsc
    npm run watch

## Hosting

Studio24 host a temporary staging site on goldeneye.studio24.net

The Sanger web team host a live and staging site (which are listed above).

## Deployment

### Deploy the site to Sanger live/staging:

To deploy the site live, simply merge any changes into the master branch and send an email to webmaster@sanger.ac.uk requesting that a deployment be made on the Sanger server.

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

## Contacting Sanger

Our primary contact as the Sanger IT team is James Smith (js5@sanger.ac.uk). As of writing, he has been our main contact for the handover of three projects to their IT team.

Our primary contact during the development of the website was Emily Boldy (emily.boldy@wellcomegenomecampus.org) who is a Marketing and Communications Officer. She should be copied into any communications deemed relevant or necessary.

If you need to email their IT team requesting a backup of the database, or uploads directory (or any other technical questions or request), then please email webmaster@sanger.ac.uk and copy in James Smith: js5@sanger.ac.uk

## Documentation

### Wordpress comments

It should be noted that the comments section in the Wordpress admin has been hidden as we aren't using it. You can find the code that hides it in web/wp-content/themes/wgccc/library/theme-custom.php

## Synching tasks

If you require any files syncing (e.g. downloading live site uploads), you will need to contact the Sanger web team to facilitate this.

If you need to contact them about this, please email the Sanger IT team (please see `Contacting Sanger` section above).

## Installation

You will need to import a database from the staging/live site and also pull down the config files from the server as these are not stored in the git repo.

You should also pull down the uploaded assets when you first setup the project.

To download either the files or the database, you will need to email the Sanger IT team (please see `Contacting sanger` section above).

### Requirements

* PHP 7.1+
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
