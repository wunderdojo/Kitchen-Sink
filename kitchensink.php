<?php

/**
  Plugin Name: Kitchen Sink
  Version: 1.0.0
  Plugin URI: http://wunderdojo.com/plugins/kitchensink
  Description: Restores the "kitchen sink" label in TinyMCE. Inspired by @kitchensinkwp
  Author: James Currie
  Author URI: http://www.wunderdojo.com
  Text-Domain: dojo-ks
  Domain Path: /languages

------------------------------------------------------------------------
Copyright 2016 wunderdojo, LLC

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see http://www.gnu.org/licenses.
 * 
*/

if ( ! class_exists( 'Kitchen_Sink' ) ) {
    
    class Kitchen_Sink {
	
	public function __construct(){
	    
	    add_action( 'admin_init', array( __CLASS__, 'init_localization' ) );   
	    
	}
	
	
	static public function init_localization() {
	    
	    $loaded = load_plugin_textdomain( 'dojo-ks', false, basename( dirname( __FILE__ ) ) . '/languages/' );

        }
        
    }
    
}