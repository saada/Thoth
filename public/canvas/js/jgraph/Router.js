// Defines the Router object
function Router(name)
{
	this.name = name;
	this.type = 'router';
	this.label = name;
	this.clone = function(){return mxUtils.clone(this);};
}