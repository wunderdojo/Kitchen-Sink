<?php

/**
  Plugin Name: Kitchen Sink
  Version: 1.0.0
  Plugin URI: http://wunderdojo.com/plugins/kitchensink
  Description: Restores the kitchen sink label in TinyMCE. Inspired by @kitchensinkwp
  Author: James Currie
  Author URI: http://www.wunderdojo.com
  Text-Domain: kitchensink
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
	    
	    add_action( 'plugins_loaded', array( __CLASS__, 'init_localization' ) );  
	    
	    add_filter( 'wp_mce_translation', array( __CLASS__, 'custom_tooltips' ), 10, 1 );
	    
	}
	
	
	static public function init_localization() {

	    load_plugin_textdomain( 'kitchensink', false, basename( dirname( __FILE__ ) ) . '/languages/' );

        }
	
	public function custom_tooltips( $mce_translation ){

	    $mce_translation['Toolbar Toggle'] = __( 'Kitchen Sink', 'kitchensink' );
	    
	    return $mce_translation;
	}
        
    }
    
   $kitchen_sink = new Kitchen_Sink;
    
}