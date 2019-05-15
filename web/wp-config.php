<?php

define( 'ABSPATH',     dirname(__FILE__) . '/' );

// STANDARD REQUIRES...
  require_once( ABSPATH.'sanger-conf/default.php'    ); ## Default configuration
  require_once( ABSPATH.'sanger-conf/server-cac.php'  ); ## Now the server specific configuration
  require_once( ABSPATH.'sanger-conf/setup.php'      ); ## Copy those configs....
  require_once( ABSPATH.'sanger-conf/encrypt-wp.php' ); ## Session encryption keys!
// OPTIONAL REQUIRES...
//require_once( ABSPATH.'sanger-conf/wpcache.php'    ); ## wp cache configuration..!
//require_once( ABSPATH.'sanger-conf/multisite.php'  ); ## Multi-site
  require_once( ABSPATH.'sanger-conf/webcache.php'   ); ## Web-cache
// Include the settings file...
  require_once( ABSPATH.'wp-settings.php'            );
