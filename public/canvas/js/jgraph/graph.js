// Program starts here. Creates a sample graph in the
// DOM node with the specified ID. This function is invoked
// from the onLoad event handler of the document (see below).

//GLOBAL VARIABLES

var GLOBAL_GRAPH = null;	//global instance of the graph
var NUM_INTERFACES = 4;		//constant number of interfaces for non-switch cells

var CELLS = [];				//tracks the list of cells on the graph

function main(container, toolbar, sidebar, status)
{

	// Checks if the browser is supported
	if (!mxClient.isBrowserSupported())
	{
		// Displays an error message if the browser is not supported.
		mxUtils.error('Browser is not supported!', 200, false);
	}
	else
	{
		// Enables guides
		mxGraphHandler.prototype.guidesEnabled = true;

		// Workaround for Internet Explorer ignoring certain CSS directives
		if (mxClient.IS_IE)
		{
			new mxDivResizer(container);
			new mxDivResizer(toolbar);
			new mxDivResizer(sidebar);
			new mxDivResizer(status);
		}

		// Creates a wrapper editor with a graph inside the given container.
		// The editor is used to create certain functionality for the
		// graph, such as the rubberband selection, but most parts
		// of the UI are custom in this example.
		var editor = new mxEditor();
		var graph = editor.graph;
		GLOBAL_GRAPH = graph;
		var model = graph.getModel();

		// Hook to return the mxImage used for the connection icon
		graph.connectionHandler.getConnectImage = function(state)
		{
			return new mxImage('images/connector.gif', 16, 16);
		};

		// Does not allow dangling edges
		graph.setAllowDanglingEdges(false);

		// Sets the graph container and configures the editor
		editor.setGraphContainer(container);

		//graph.ingnoreScrollbars = true;

		var config = mxUtils.load(
		'./config/keyhandler-commons.xml').
				getDocumentElement();
		editor.configure(config);

		// Shows a "modal" window when double clicking a vertex.
		// Enables new connections
		graph.setConnectable(true);

		//disable tooltips
		graph.setTooltips(false);

		// Disables HTML labels for swimlanes to avoid conflict
		// for the event processing on the child cells. HTML
		// labels consume events before underlying cells get the
		// chance to process those events.
		//
		// NOTE: Use of HTML labels is only recommended if the specific
		// features of such labels are required, such as special label
		// styles or interactive form fields. Otherwise non-HTML labels
		// should be used by not overidding the following function.
		// See also: configureStylesheet.
		graph.isHtmlLabel = function(cell)
		{
			return true;
		};

		//...
		graph.getLabel = function(cell){
			if(cell.value!==null){
				if(cell.isEdge())
				{
					if(cell.getTerminal().value.type == "switch")
					{
						for (var i = 0; i < cell.getTerminal(true).getEdgeCount(); i++) {
							if(cell.getTerminal(true).getEdgeAt(i) == cell)
							{
								return "eth"+cell.value.ethernet+":"+cell.value.ip;
							}
						}
					}
					return "";
					// return cell.getTerminal(false).value.edgeFields
				}
				else(cell.isVertex())
				{
					// Generate the label with icon and name
				}
				return cell.value.name;
			}
			return mxGraph.prototype.getLabel.apply(this,arguments);
		};


		//Prevent and validate edge connections
		graph.getEdgeValidationError  = function(edge, source, target){
			if(source.getId() != target.getId())
			{
				if(source.value.type != 'switch')
				{
					if(target.value.type == 'switch')
					{
						if(source.getEdgeCount() < NUM_INTERFACES)	//Anything not a switch
						{
							if(!edgeExists(source,target))					//Prevent duplicate edges
							{
								return mxGraph.prototype.getEdgeValidationError.apply(this, arguments); // "supercall"
							}
							else
								return "Already connected!";
						}
						else
							return "No more interfaces available for "+source.value.name+"!";
					}
					else
						return "Target must be a Switch!";
				}
				else
					return "Switch cannot target other elements!";
			}
			else
				return "Element cannot target itself!";
		};

		model.cellRemoved = function(cell){
			if(cell.isVertex())
			{
				console.log("***CELL REMOVED");
				CELLS.remove(CELLS.indexOf(cell.value.name));
				console.log(CELLS);
				console.log(cell);
			}
			else if (cell.isEdge())
			{

			}
			return mxGraphModel.prototype.cellRemoved.apply(this, arguments);
		};

		//on load graph
		model.cellAdded = function(cell){
			if(cell.isVertex())
			{
				cell.value.name = getValidName(cell.value.name);
				console.log("***Adding cell...");
				CELLS.push(cell.value.name);
				console.log(cell);
				console.log("***Cell added!");
				console.log(CELLS);
			}
			else if(cell.isEdge())
			{
			}
			return mxGraphModel.prototype.cellAdded.apply(this, arguments);
		};

		//on drag and drop new cell
		graph.addCell = function(cell,parent,index,source,target){
			if(cell.isVertex()){

			}
			else if(cell.isEdge())
			{
				var eths = getAvailableEthernets(source);
				cell.setValue(new Interface(
								eths[0],
								"192.168.2.1",
								"255.255.255.0",
								"172.168.0.1"
							));
				console.log("***Adding edge...");
				console.log(cell);
				console.log("***Edge added!");
			}
			return mxGraph.prototype.addCell.apply(this, arguments);

		};


		// Adds all required styles to the graph (see below)
		configureStylesheet(graph);

		var tmpCell = new mxCell(null, new mxGeometry(0,0,140,140));
		tmpCell.setVertex(true);
		tmpCell.setConnectable(true);

		tmpCell = mxUtils.clone(tmpCell);
		tmpCell.setValue(new Client('myClient'));
		tmpCell.setStyle(tmpCell.value.type);
		addSidebarIcon(graph, sidebar,tmpCell,'images/icons48/'+tmpCell.value.type+'2.png');

		tmpCell = mxUtils.clone(tmpCell);
		tmpCell.setValue(new Internet('myInternet'));
		tmpCell.setStyle(tmpCell.value.type);
		addSidebarIcon(graph, sidebar,tmpCell,'images/icons48/'+tmpCell.value.type+'2.png');

		tmpCell = mxUtils.clone(tmpCell);
		tmpCell.setValue(new Router('myRouter'));
		tmpCell.setStyle(tmpCell.value.type);
		addSidebarIcon(graph, sidebar,tmpCell,'images/icons48/'+tmpCell.value.type+'2.png');

		tmpCell = mxUtils.clone(tmpCell);
		tmpCell.setValue(new Server('myServer'));
		tmpCell.setStyle(tmpCell.value.type);
		addSidebarIcon(graph, sidebar,tmpCell,'images/icons48/'+tmpCell.value.type+'2.png');

		tmpCell = mxUtils.clone(tmpCell);
		tmpCell.setValue(new Switch('mySwitch'));
		tmpCell.setStyle(tmpCell.value.type);
		addSidebarIcon(graph, sidebar,tmpCell,'images/icons48/'+tmpCell.value.type+'2.png');

		// Defines a new export action
		editor.addAction('export', function(editor, cell)
		{
			if(!isIconConnected(graph))
			{
				alert("some icons are not connected");
			}else
			{
			var xmlform = new mxForm();

			var textarea = document.createElement('textarea');
			textarea.style.width = '400px';
			textarea.style.height = '400px';
			var enc = new mxCodec(mxUtils.createXmlDocument());
			var node = enc.encode(editor.graph.getModel());
			textarea.value =mxUtils.getPrettyXml(node);
			var xmlfield = xmlform.addField('',textarea);

			// Defines the function to be executed when the
			// OK button is pressed in the dialog
			var okFunction = function()
			{
				mxUtils.save('\\<?php echo $_GET["lab_id"] . ".xml"; ?>.xml',xmlfield.value);
				alert("the xml file has been saved.");
				wnd.destroy();
			};
			var cancelFunction = function()
			{
				wnd.destroy();
			};
			xmlform.addButtons(okFunction, cancelFunction);
			wnd = showModalWindow(graph,'XML',xmlform.table, 410, 460);
			}
		});

		addToolbarButton(editor, toolbar, 'export', 'Export', 'images/export1.png');

		// ---
		// Defines the icon configure action
		editor.addAction('configure', function(editor, cell)
		{
			if (typeof(cell) == 'undefined')
			{
				cell = graph.getSelectionCell();
			}
			showProperties(graph, cell);
		});

		addToolbarButton(editor, toolbar, 'save', 'Save', 'images/export1.png');

		// Defines a save action for DB ~function written by Moody
		editor.addAction('save', function(editor, cell)
		{
			if(!isIconConnected(graph))
			{
				alert("some icons are not connected");
			}else
			{
				var xmlform = new mxForm();

				var namefield = document.createElement('textarea');
				namefield.style.width = '370px';
				namefield.style.height = '20px';
				namefield.value = "Graph1";
				var gName = xmlform.addField('Name',namefield);

				var textarea = document.createElement('textarea');
				textarea.style.width = '370px';
				textarea.style.height = '300px';
				var enc = new mxCodec(mxUtils.createXmlDocument());
				var node = enc.encode(editor.graph.getModel());
				textarea.value =mxUtils.getPrettyXml(node);
				textarea.setAttribute('readOnly','readonly');
				var xmlfield = xmlform.addField('XML',textarea);

				// Defines the function to be executed when the
				// OK button is pressed in the dialog
				var okFunction = function()
				{
					// mxUtils.save('\\<?php echo $_GET["lab_id"] . ".xml"; ?>.xml',xmlfield.value);
					addGraph(gName.value,xmlfield.value);

					wnd.destroy();
				};
				var cancelFunction = function()
				{
					wnd.destroy();
				};
				xmlform.addButtons(okFunction, cancelFunction);
				wnd = showModalWindow(graph,'Information Form',xmlform.table, 410, 380);
			}
		});

		// Installs context menu
		graph.panningHandler.factoryMethod = function(menu, cell, evt)
		{
			if(cell !== null)
			{
				if(graph.getModel().isVertex(cell))

				{
					menu.addItem('Copy', null, function()
					{
						editor.execute('copy');
					});
					menu.addItem('Paste', null, function()
					{
						editor.execute('paste');
					});
					menu.addItem('Delete', null, function()
					{
						editor.execute('delete');
					});
					menu.addItem('Configure', null, function()
					{
						editor.execute('configure');
					});
				}

				else if(graph.getModel().isEdge(cell))
				{
					menu.addItem('Delete', null, function()
					{
						editor.execute('delete');
					});
					menu.addItem('Configure', null, function()
					{
						editor.execute('configure');
					});
				}
			}

			else
			{
					menu.addItem('Paste', null, function()
					{
						editor.execute('paste');
					});
			}
		};

		var e = document.getElementById('toolbarContainer');
		e.appendChild(mxUtils.button('Zoom In', function()
		{
			graph.zoomIn();
		}));
		e.appendChild(mxUtils.button('Zoom Out', function()
		{
			graph.zoomOut();
		}));

		// Fades-out the splash screen after the UI has been loaded.
		stopLoadingScreen();

		//Initialize with default graph
		loadGraph();	//init graph current selection from dropdown
	}
}

function addToolbarButton(editor, toolbar, action, label, image)
{
	var button = document.createElement('button');
	// button.style.fontSize = '10';
	if (image !== null)
	{
		var img = document.createElement('img');
		img.setAttribute('src', image);
		img.style.width = '16px';
		img.style.height = '16px';
		img.style.verticalAlign = 'middle';
		img.style.marginRight = '2px';
		button.appendChild(img);
	}
	mxEvent.addListener(button, 'click', function(evt)
	{
		editor.execute(action);
	});
	//Creates a text node for the given string and appends it to the given parent.
	mxUtils.write(button, label);
	toolbar.appendChild(button);
}

function showModalWindow(graph, title, content, width, height)
{
	var background = document.createElement('div');
	background.style.position = 'absolute';
	background.style.left = '0px';
	background.style.top = '0px';
	background.style.right = '0px';
	background.style.bottom = '0px';
	background.style.background = 'black';
	mxUtils.setOpacity(background, 50);
	document.body.appendChild(background);

	if (mxClient.IS_IE)
	{
		new mxDivResizer(background);
	}

	var x = Math.max(0, document.body.scrollWidth/2-width/2);
	var y = Math.max(10, (document.body.scrollHeight ||
				document.documentElement.scrollHeight)/2-height*2/3);
	var wnd = new mxWindow(title, content, x, y, width, height, false, true);
	wnd.setClosable(true);

	// Fades the background out after after the window has been closed
	wnd.addListener(mxEvent.DESTROY, function(evt)
	{
		graph.setEnabled(true);
		mxEffects.fadeOut(background, 50, true,
			10, 30, true);
	});
	wnd.setVisible(true);
	return wnd;
}

function addSidebarIcon(graph, sidebar, prototype, image)
{
	// Function that is executed when the image is dropped on
	// the graph. The cell argument points to the cell under
	// the mousepointer if there is one.

	var funct = function(graph, evt, cell, x, y)
	{
		var pt = graph.getPointForEvent(evt);
		var parent = graph.getDefaultParent();
		var model = graph.getModel();
		var v1 = model.cloneCell(prototype);

		model.beginUpdate();
		try
		{
			// NOTE: For non-HTML labels the image must be displayed via the style
			// rather than the label markup, so use 'image=' + image for the style.
			// as follows: v1 = graph.insertVertex(parent, null, label,
			// pt.x, pt.y, 120, 120, 'image=' + image);
			//v1 = graph.insertVertex(parent, null, prototype, x, y, 100, 100);
			//v1.setConnectable(true);
			v1.geometry.x = pt.x;
			v1.geometry.y = pt.y;
			graph.addCell(v1, parent);
		}
		finally
		{
			model.endUpdate();
		}

		graph.setSelectionCell(v1);
	};

	// Creates the image which is used as the sidebar icon (drag source)
	var img = document.createElement('img');
	img.setAttribute('src', image);
	img.style.width = '48px';
	img.style.height = '48px';
	img.title = 'Drag this to the diagram to create a new '+prototype.value.type+' cell.';
	sidebar.appendChild(img);

	// Creates the image which is used as the drag icon (preview)
	var dragImage = img.cloneNode(true);
	var ds = mxUtils.makeDraggable(img, graph, funct, dragImage);
	ds.setGuidesEnabled(true);
}

function configureStylesheet(graph)
{
	var style = {};

	//VERTEX STYLE
	// style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RECTANGLE;
	style[mxConstants.STYLE_PERIMETER] = mxConstants.PERIMETER_ELLIPSE;
	style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
	// style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_MIDDLE;
	style[mxConstants.STYLE_GRADIENTCOLOR] = '#41B9F5';
	style[mxConstants.STYLE_FILLCOLOR] = '#8CCDF5';
	style[mxConstants.STYLE_STROKECOLOR] = '#1B78C8';
	style[mxConstants.STYLE_ROUNDED] = false;
	// style[mxConstants.STYLE_OPACITY] = '80';

	//LABEL STYLES
	style[mxConstants.STYLE_VERTICAL_LABEL_POSITION] = mxConstants.ALIGN_BOTTOM;
	// style[mxConstants.STYLE_VERTICAL_LABEL_POSITION] = mxConstants.ALIGN_MIDDLE;
	style[mxConstants.STYLE_SPACING_BOTTOM] = '140';
	style[mxConstants.STYLE_FONTCOLOR] = '#000000';
	style[mxConstants.STYLE_FONTSIZE] = '16';
	style[mxConstants.STYLE_FONTSTYLE] = 1;
	style[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = "#FFFFFF";

	//IMAGE STYLES
	style[mxConstants.STYLE_IMAGE_ASPECT] = 0;	//do not preserve aspect
	style[mxConstants.STYLE_IMAGE_WIDTH] = '24';
	style[mxConstants.STYLE_IMAGE_HEIGHT] = '24';
	// style[mxConstants.STYLE_IMAGE_BACKGROUND] = "#8CCDF5";
	// style[mxConstants.STYLE_IMAGE_BORDER] = "#1B78C8";
	graph.getStylesheet().putDefaultVertexStyle(style);

	//Apply all icon styles
	style = mxUtils.clone(style);
	//client
	style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_IMAGE;
	style[mxConstants.STYLE_IMAGE] = 'images/icons48/client2.png';
	graph.getStylesheet().putCellStyle('client', style);
	//internet
	style = mxUtils.clone(style);
	style[mxConstants.STYLE_IMAGE] = 'images/icons48/internet2.png';
	graph.getStylesheet().putCellStyle('internet', style);
	//router
	style = mxUtils.clone(style);
	style[mxConstants.STYLE_IMAGE] = 'images/icons48/router2.png';
	graph.getStylesheet().putCellStyle('router', style);
	//server
	style = mxUtils.clone(style);
	style[mxConstants.STYLE_IMAGE] = 'images/icons48/server2.png';
	graph.getStylesheet().putCellStyle('server', style);
	//switch
	style = mxUtils.clone(style);
	style[mxConstants.STYLE_IMAGE] = 'images/icons48/switch2.png';
	graph.getStylesheet().putCellStyle('switch', style);

	//EDGE STYLE
	style = graph.getStylesheet().getDefaultEdgeStyle();
	style[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = '#FFFFFF';
	style[mxConstants.STYLE_STROKEWIDTH] = '2';
	style[mxConstants.STYLE_ROUNDED] = true;
	graph.getStylesheet().putDefaultEdgeStyle(style);


}

function showProperties(graph, cell){
	// Creates a form for the user object inside
	// the cell
	var form = new mxForm('configure');

	if(cell.isVertex())
	{
		// Adds a field for the columnname
		//var id = form.addText('id', cell.id);
		var nameField = form.addText('Name', cell.value.name);
		var typeField = form.addCombo('Type', false, 1);
		form.addOption(typeField,'client','client',(cell.value.type=='client'));
		form.addOption(typeField,'internet','internet',(cell.value.type=='internet'));
		form.addOption(typeField,'router','router',(cell.value.type=='router'));
		form.addOption(typeField,'server','server',(cell.value.type=='server'));
		form.addOption(typeField,'switch','switch',(cell.value.type=='switch'));

		var wnd = null;
		// Defines the function to be executed when the
		// OK button is pressed in the dialog
		var okFunction = function()
		{
			var clone = null;
			var type = typeField.value;

			console.log(cell.value);
			CELLS.remove(CELLS.indexOf(cell.value.name));

			if(type == "switch")
				clone = new Switch(getValidName(nameField.value));
			else if(type == "router")
				clone = new Router(getValidName(nameField.value));
			else if(type == "server")
				clone = new Server(getValidName(nameField.value));
			else if(type == "client")
				clone = new Client(getValidName(nameField.value));
			else if(type == "internet")
				clone = new Internet(getValidName(nameField.value));

			CELLS.push(clone.name);
			console.log(CELLS);

			graph.model.beginUpdate();
			try{
				graph.model.setStyle(cell, clone.type);
				graph.model.setValue(cell,clone);
			}
			finally
			{
				graph.model.endUpdate();
			}
			// debugPrintCells(graph);
			wnd.destroy();
		};
		var cancelFunction = function()
		{
			wnd.destroy();
		};
		form.addButtons(okFunction, cancelFunction);
		var name = cell.value.name;
	}
	else if(cell.isEdge())
	{
		var source = cell.getTerminal(true);
		var eths = getAvailableEthernets(source);
		var ethernet = form.addCombo("ethernet",false,1);
		form.addOption(ethernet,"eth"+cell.value.ethernet,cell.value.ethernet,true);
		// eths.remove(eths.indexOf(cell.value.ethernet));
		for (var x = 0; x < eths.length; x++) {
			form.addOption(ethernet,"eth"+eths[x],eths[x],false);
		}
		var ipField = form.addText('IP Address',cell.value.ip);
		var netmaskField = form.addText('Netmask',cell.value.netmask);
		var gatewayField = form.addText('Gateway',cell.value.gateway);

		var okFunction = function(){
			var clone = mxUtils.clone(cell.value);
			console.log(ethernet.value);
			clone = new Interface(ethernet.value,ipField.value,netmaskField.value,gatewayField.value);
			graph.model.beginUpdate();
			graph.model.setValue(cell, clone);
			graph.model.endUpdate();
			wnd.destroy();
		};

		var cancelFunction = function(){
			wnd.destroy();
		};

		form.addButtons(okFunction, cancelFunction);
		// LATER ON I WANNA SAVE THE TEXT USING SETATTRIBUTE
		// cell.setAttribute("dude","dude");

	}
	wnd = showModalWindow(graph,name,form.table, 300, 200);
}

//check whether all icons are connected
function isIconConnected(graph)
{
	var root = graph.getModel().getCell(1);
	var cell = new mxCell();

	for (var i = 0; i < root.getChildCount(); i++) {
		cell = root.getChildAt(i);
		if(cell === null)
		{
			break;
		}else if(cell.isVertex())
		{
			if(cell.getEdgeCount() === 0)
			{
				return false;
			}
		}
	}
	return true;
}

//Console debugging: print all cells
function debugPrintCells(graph)
{
	console.log("\n=====================================================\n"+
				"======================DEBUGGING======================\n"+
				"=====================================================");
	//var isCell = true;

	var root = graph.getModel().getCell(1);
	var cell = new mxCell();

	for (var i = 0; i < root.getChildCount(); i++) {
		cell = root.getChildAt(i);

		console.log("===DEBUG=== Cell: "+cell.id);
		console.log(cell);
		console.log("Edge count: "+graph.getModel().getEdgeCount(cell));
		if(cell.value !== null)
			console.log("Type: "+ cell.value.type);

	}
}

function initLoad(xml)
{
	CELLS = [];		//reset cells array
	if(typeof(GLOBAL_GRAPH) != 'undefined')
	{
		GLOBAL_GRAPH.getModel().beginUpdate();
		var doc;
		if(xml === null)
			doc = mxUtils.parseXml(getGraph('<?php echo $_GET["lab_id"]; ?>'));
		else
			doc = mxUtils.parseXml(xml);
		var dec = new mxCodec(doc);
		dec.decode(doc.documentElement, GLOBAL_GRAPH.getModel());
		GLOBAL_GRAPH.getModel().endUpdate();

		//debugging calls
		debugPrintCells(GLOBAL_GRAPH);
	}
	stopLoadingScreen();
}