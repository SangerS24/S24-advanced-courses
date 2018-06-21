<?php
/**
 * Setup environments
 * 
 * Set environment based on the current server hostname, this is stored
 * in the $hostname variable
 * 
 * You can define the current environment via: 
 *     define('WP_ENV', 'production');
 * 
 * @package    Studio 24 WordPress Multi-Environment Config
 * @version    1.0
 * @author     Studio 24 Ltd  <info@studio24.net>
 */


/*
 * Set environment based on hostname
 *
 * This uses a slightly different format to normal to accommodate the Sanger hosting environment.
 *
 */

define( 'WP_ENV',
    preg_match( '/^.*[.]wellcomegenomecampus[.]org$/', $hostname )
        ? 'sanger-live'
        : ( preg_match( '/^.*[.](sandbox|dev|staging)[.]sanger[.]ac[.]uk$/', $hostname, $matches )
        ? 'sanger-'.$matches[1]
        : ( preg_match( '/^.*[.]s24[.]net$/', $hostname )
            ? 'staging'
            : ( preg_match( 'local[.]/^.*[.]org$/', $hostname )
                ? 'development'
                : 'development'
            )
        )
    )
);
