<?php
	//Require the ActiveRecord class
	require_once 'libs/ActiveRecord/php-activerecord/ActiveRecord.php';

	//Set the database configuration and connection
	include('libs/ActiveRecord/Configuration.php');

	//Include models
	include('libs/ActiveRecord/models/GraphModel.php');

	function arToJson($data, $options = null) {
		$out = "[";
		foreach( $data as $row) {
			if ($options != null)
				$out .= $row->to_json($options);
			else
				$out .= $row->to_json();
			$out .= ",";
		}
		$out = rtrim($out, ',');
		$out .= "]";
		return $out;
	}

	function addGraph($name, $xml)
	{
		$result = Graph::create(array('name'=>$name,'content'=>$xml));
		return $result->to_json(array(
   			'except' => array('create_time','update_time')));
	}

	function getGraph($name)
	{
		$result = Graph::find_by_name($name);
		return $result->to_json(array(
   			'except' => array('create_time','update_time')));
	}

	function getGraphById($gid)
	{
		$result = Graph::find_by_gid($gid);
		return $result->to_json(array(
   			'except' => array('create_time','update_time')));
	}

	function getAllGraphs()
	{
		return arToJson(Graph::all(),
			array('except' => array('create_time','update_time')));
	}

	function deleteGraph($gid)
	{
		return Graph::find_by_gid($gid)->delete();
	}

	if(isset($_POST['action']) && !empty($_POST['action'])) {
	    $action = $_POST['action'];
	    switch($action) {

	        case 'addGraph' :
	        {
	        	if(isset($_POST['name']) && !empty($_POST['name'])
	        		&& isset($_POST['xml']) && !empty($_POST['xml']))
        		{
        			$returnValue = addGraph($_POST['name'],$_POST['xml']);
        			if($returnValue != null)
        			{
        				echo $returnValue;
        				exit;
        			}
        		}
	        	break;
	        }

	        case 'deleteGraph' :
	        {
	        	if(isset($_POST['gid']) && !empty($_POST['gid']))
        		{
        			$returnValue = deleteGraph($_POST['gid']);
        			// if($returnValue != null)
        			// {
        				echo $returnValue;
        				exit;
        			// }
        		}
	        	break;
	        }


	        case 'getGraph' :
	        {
	        	if(isset($_POST['name']) && !empty($_POST['name']))
        		{
        			$returnValue = getGraph($_POST['name']);
        			if($returnValue != null)
        			{
        				echo $returnValue;
        				exit;
        			}
        		}
	        	break;
	        }

	        case 'getGraphById' :
	        {
	        	if(isset($_POST['gid']) && !empty($_POST['gid']))
        		{
        			$returnValue = getGraphById($_POST['gid']);
        			if($returnValue != null)
        			{
        				echo $returnValue;
        				exit;
        			}
        		}
	        	break;
	        }

	        case 'getAllGraphs' :
	        {
    			$returnValue = getAllGraphs();
    			if($returnValue != null)
    			{
    				echo $returnValue;
    				exit;
    			}
	        	break;
	        }
	    }
	}
	return false;
?>