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

define('AUTH_KEY',         '=j`St,=r-J>|xxC-3FHycf(J&x:r@g6iw:3Z={-iLL7vq34`oQ@h(dUCDO}{3*${');
define('SECURE_AUTH_KEY',  '?}c&TyRVL1ea%sk2f*oMJDvt-vFw A!`[`:_H?3w)0OC2cB.7`t7u[;YGc~K8JC)');
define('LOGGED_IN_KEY',    '}q,V;qEdE7WtO0+kbOo{63?Lh/4r)T`}{E?pACsDCU-kmeWj.]MGHOVlmXt|}FR|');
define('NONCE_KEY',        'o+X.y~GU8E$rG=9Pk5Kr}8;0-oJq?V@DSW;+YxiRwXafdcd&CCgw@6Bw+nhUBpp:');
define('AUTH_SALT',        'Zj*8HbIW-}x7; _hH;/t{@/gqIx>w+|5%O)P|3d1 +OT LE-I:H9V2FAJ])9Oy%2');
define('SECURE_AUTH_SALT', '6<m>W%Z>*{}:>e8EV2I[v:Vom)Y~::m/$^:wi&0=24Yz^=_)0q_E>D5XZwZ!(Ghy');
define('LOGGED_IN_SALT',   'PCCY_?-dzu@:2&;oHk]PN^+jSB1}yzR%_yO(#:rEj>j:a5RdA|zvDpd/CEMbI8F|');
define('NONCE_SALT',       'wsjkbGwND%uQ+R2Yb0ZDbE0yy~EXoV>j(>GpPT3;K|HGE,x|OK?rO-|EGg-SYO/$');


$table_prefix = 'woeuhf8_';

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
