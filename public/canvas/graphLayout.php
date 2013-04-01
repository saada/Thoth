<title>VLAB</title>

<?php
	//display in order
	showWelcomeMessage();
	showVLAB("100%","500");

	function showWelcomeMessage(){
		global $user;
		if ($user->uid) {
			$greeting = 'Welcome to VLAB, <strong>'.$user->name.'</strong>!<br>';
			$greeting .= 'Your email is: <strong>'.$user->mail.'</strong><br>';
			$greeting .= 'Your session id is: <strong>'.$user->sid.'</strong><br>';
			$greeting .= 'Your hostname is: <strong>'.$user->hostname.'</strong><br>';
			$greeting .= 'Your account was created on: <strong>'.date('m/d/Y', $user->created).'</strong><br>';
			
			// Display user roles
			$i=0;
			$len = count($user->roles);
			$greeting .= ' Your roles are: ';
			foreach ($user->roles as $value) {
				if ($i == $len-1)
					$greeting .= '<strong>'.$value.'</strong>';
				else
					$greeting .= '<strong>'.$value.'</strong> | ';
				$i++;
			}
		}
		else {
			$greeting = 'Welcome visitor to the VLAB playground!';
		}
		echo "<h1 style='color:navy'>".$greeting."</h1>";
	}

	function showVLAB($width,$height){
		echo '<iframe id="VLAB_iframe" src="canvas/vlab.html" '
			.'width="'.$width.'" height="'.$height.'"></iframe>';
	}



	// Sample create command using ActiveRecord:
	// $graph = Graph::create(array('name'=>,'content'=>));
?>
