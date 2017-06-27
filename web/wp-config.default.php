<?php
/**
 * Default config settings
 *
 * Enter any WordPress config settings that are default to all environments
 * in this file. These can then be overridden in the environment config files.
 *
 * Please note if you add constants in this file (i.e. define statements)
 * these cannot be overridden in environment config files.
 *
 * @package    Studio 24 WordPress Multi-Environment Config
 * @version    1.0
 * @author     Studio 24 Ltd  <info@studio24.net>
 */

/** Database Charset to use in creating database tables. */
define('DB_CHARSET', 'utf8');

/** The Database Collate type. Don't change this if in doubt. */
define('DB_COLLATE', '');

define('AUTH_KEY',         'e*,qD]m!A_=$4m-w.f)P`h,_>>O&ML1KeAwH=e!-0~s)r^J&HK&NF:Ue6vLg,?#!');
define('SECURE_AUTH_KEY',  '3L.Lj%ih(!9Ltyf3+fW3fDCyJ R6b. 1D#}Lj}HEv~ cP-yKc%(fo[S^-kLE,5h0');
define('LOGGED_IN_KEY',    ' s{t[5ztu>fIPNa)S6v^OXs1)(lR!XEDneq^3F|V4&I[c]#Mo0@L`z8-+EQCR!d>');
define('NONCE_KEY',        'eFh-jdr`{Fz)lWwH+`UW#xDGxypYEo>_tj?Tp4|IY~S$,_o~r}+vIpcbcUUxnAA@');
define('AUTH_SALT',        '4(|*gu |U;L?f-Qwac+_0b*DR5XaG`<-_Hmvz6e7rv[gnzD;gY23P >C _R^de;%');
define('SECURE_AUTH_SALT', '|saL}pd~&B22@2S|3N[/Q8.YHd]4Gk0U<R3T7W<z-T~+?1_g?^MOG+(OE^vIyUJ}');
define('LOGGED_IN_SALT',   'KR.t1QW2^am_0L0cvcN4vh2`f-q>uirs$NS}s7-g*R/^ga3|7z |O<&U|U|vx?1c');
define('NONCE_SALT',       ',sY-SxMme6!B1:*eJbeCdxSV-05V4 -54k7j8.Z*>z>m;`M9f#BAI c<*PEf4=|=');


$table_prefix = 'wp_';

/**
 * WordPress Localized Language, defaults to English.
 *
 * Change this to localize WordPress. A corresponding MO file for the chosen
 * language must be installed to wp-content/languages. For example, install
 * de_DE.mo to wp-content/languages and set WPLANG to 'de_DE' to enable German
 * language support.
 */
define('WPLANG', '');

/**
 * Increase memory limit.
 */
define('WP_MEMORY_LIMIT', '128M');
