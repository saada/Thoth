//*****************************
// This is where VLAB starts!
//*****************************

requirejs.config({
    //By default load any module IDs from js/vendors
    baseUrl: 'js/vendors',
    //except, if the module ID starts with "jgraph",
    //load it from the js/jgraph directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths: {
        jgraph: '../jgraph'
    }
});

require(["jquery"],
function(){
	
	// Load Widgets
	$(function() {

		// Graph Widget
		$("#graphWidget").load("graph.html", function(response, status, xhr) {
			if (status == "error") {
				var msg = "Sorry but there was an error: ";
				$("#error").html(msg + xhr.status + " " + xhr.statusText);
			}
			else
			{
				// Need to include Zoomooz
				// $("#graphWidget").zoomTarget();
			}
		});
	});

});