// Defines the Server object
function Server(name)
{
	this.name = name;
	this.type = 'server';
	this.label = name;
	this.clone = function(){return mxUtils.clone(this);};
}