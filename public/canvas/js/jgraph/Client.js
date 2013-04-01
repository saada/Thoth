// Defines the client object
function Client(name)
{
	this.name = name;
	this.type = 'client';
	this.label = name;
	this.clone = function(){return mxUtils.clone(this);};
}