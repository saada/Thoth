// Defines the Switch object
function Switch(name)
{
	this.name = name;
	this.type = 'switch';
	this.label = name;
	this.clone = function(){return mxUtils.clone(this);};
}