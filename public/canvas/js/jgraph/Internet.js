// Defines the internet object
function Internet(name)
{
	this.name = name;
	this.type = 'internet';
	this.label = name;
	this.clone = function(){return mxUtils.clone(this);};
}