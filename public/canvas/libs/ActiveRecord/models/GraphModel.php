<?php
	class Graph extends ActiveRecord\Model {

		// Explicit name of table, implicitly it's the plural of the name
		// static $table_name = 'graphs';
	 
	    # explicit pk since our pk is not "id" 
	    static $primary_key = 'gid';

	    // static $db = 'drupal';

	    public function addGraph($title,$code){
	    	$attributes = array('name' => $title, 'content' => $code);
	    	return $this->create($attributes);
	    }

	    public function getGraph($name){
	    	return $this->find_by_name($name);
	    }
	}
?>
