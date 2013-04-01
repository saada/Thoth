//This is where the graph app starts up
$(function() {
	addCustomButtons();		// prepend custom buttons to toolabar
	loadGraphs();			// load graph list from database
	attachButtonEvents();	// the name is self explanatory
});

function addCustomButtons(){
	$('#toolbarContainer')
		.prepend('<select id="graphList"></select>​'
				+'<button id="clearBtn">Clear Graph</button>'
		    	+'<button id="deleteBtn">Delete Graph</button>'
		    	+'<button id="loadBtn">Load Graph</button>');
}

// <AJAX>
function loadGraphs(){
	$.ajax({
		url: "/canvas/commands.php",
		type: "POST",
		data: {action : "getAllGraphs"},
		dataType: "json",
		success:function(result){
			console.log("===DEBUG=== loadGraphs()");
			console.log(result);

			//populate dropdownlist
			$.each(result, function(k, v){
				$("#graphList").append(
					'<option value="'+v.gid+'">'+v.name+'</option>');
			});

			main(document.getElementById('graphContainer'),
				document.getElementById('toolbarContainer'),
				document.getElementById('sidebarContainer'),
				document.getElementById('statusContainer'));
		},
		error:function(xhr,opt,e){
			alert("Error requesting " + opt.url + ": " + xhr.status + " " + xhr.statusText);
		}
	});
}

function addGraph(name, xml)
{
	$.ajax({
		url: "/canvas/commands.php",
		type: "POST",
		data: {action : "addGraph", name: name, xml: xml},
		dataType: "json",
		success:function(result){
			console.log("===DEBUG=== addGraph()");
			console.log(result);
			alert("Successfully added "+result.name+"!");
			$("#graphList")
				.append('<option value="'+result.gid+'">'+result.name+'</option>')
				.val(result.gid);
		},
		error:function(xhr,opt,e){
			alert("Error requesting " + opt.url + ": " + xhr.status + " " + xhr.statusText);
		}
	});
}

function getGraph(name)
{
	var myGraph = null;
	$.ajax({
		url: "/canvas/commands.php",
		type: "POST",
		data: {action : "getGraph", name: name},
		dataType: "json",
		async: false,
		success:function(result){
			// alert("Successfully got graph: "+result.name+". Id="+result.gid);
			myGraph = result.content;
		},
		error:function(xhr,opt,e){
			alert("Error requesting " + opt.url + ": " + xhr.status + " " + xhr.statusText);
		}
	});
	return myGraph;
}

function getGraphById(gid)
{
	var myGraph = null;
	$.ajax({
		url: "/canvas/commands.php",
		type: "POST",
		data: {action : "getGraphById", gid: gid},
		dataType: "json",
		async: false,
		success:function(result){
			// alert("Successfully got graph: "+result.name+". Id="+result.gid);
			myGraph = result.content;
		},
		error:function(xhr,opt,e){
			alert("Error requesting " + opt.url + ": " + xhr.status + " " + xhr.statusText);
		}
	});
	return myGraph;
}

function deleteGraph()
{
	gid = $('#graphList').val();
	$.ajax({
		url: "/canvas/commands.php",
		type: "POST",
		data: {action : "deleteGraph", gid: gid},
		async: true,
		success:function(result){
			clearGraph();
			alert("Successfully removed graph");
			console.log(result);
			$("#graphList option[value="+gid+"]").remove();
			loadGraph();
		},
		error:function(xhr,opt,e){
			alert("Error requesting " + opt.url + ": " + xhr.status + " " + xhr.statusText);
		}
	});
}

// </AJAX>

function loadGraph()
{
	if($('#graphList').children("option").length > 0)
	{
		startLoadingScreen();
		initLoad(getGraphById($('#graphList').val()));	//on change, change graph with selection from dropdown
	}
}

function edgeExists(source,target)
{
	for (var i = 0; i < source.getEdgeCount(); i++) {
		var tmp = source.getEdgeAt(i);
		if(tmp.getTerminal(false) == target)
			return true;
	}
	return false;
}

function getAvailableEthernets(cell)
{
	var eths = [];
	for (var i = 0; i < NUM_INTERFACES; i++) {
		eths.push(i);
	}console.log(eths);
	for (var j = 0; j < cell.getEdgeCount(); j++) {
		var ethId = cell.getEdgeAt(j).value.ethernet;
		console.log(ethId);
		for(var m=0; m<eths.length;m++)
		{
			if(eths[m] == ethId)
			{
				eths.remove(m);
				break;
			}
		}
		console.log(eths);
	}
	return eths;
}

function getValidName(name)
{
	var count = 0;
	var index = $.inArray(name, CELLS);
	var tmp = name;
	while(index != -1) //if exists
	{
		count++;
		tmp = name.concat(count);
		index = $.inArray(tmp, CELLS);
	}
	return tmp;
}

function clearGraph(){
	startLoadingScreen();
	initLoad('<mxGraphModel><root><mxCell id="0"/><mxCell id="1" parent="0"/></root></mxGraphModel>');
}

function startLoadingScreen () {
	$('#splash').fadeToggle();
}

function stopLoadingScreen () {
	$('#splash').fadeToggle();
}

//Helper functions
Array.prototype.remove = function(from, to) {
	var rest = this.slice((to || from) + 1 || this.length);
	this.length = from < 0 ? this.length + from : from;
	return this.push.apply(this, rest);
};

//Attach button events
function attachButtonEvents(){
	$('#graphList').change(function() {
		loadGraph();
	});

	$('#loadBtn').click(function() {
		loadGraph();
	});

	$('#clearBtn').click(function(){
		clearGraph();
	});

	$('#deleteBtn').click(function(){
		if(confirm("Delete graph?"))
			deleteGraph();
	});
}