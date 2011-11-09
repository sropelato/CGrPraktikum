function Node()
{
	this.model = null;
	this.parent = null;
	this.children = new Array();
	this.transformation = mat4.create();

	mat4.identity(this.transformation);
}

Node.prototype.assignMaterial = function(material)
{
	if(this.model)
	{
		this.model.setMaterial(material);
	}
	
	$.each(this.children, function()
	{
		this.assignMaterial(material);
	});
}

Node.prototype.draw = function(parentMVMatrix)
{	
	var mvMatrix = mat4.create();
	mat4.multiply(parentMVMatrix, this.transformation, mvMatrix);
	
	if(this.model)
	{
		this.model.draw(mvMatrix);
	}
	
	$.each(this.children, function()
	{
		this.draw(mvMatrix);
	});
}

Node.prototype.append = function(node)
{
	node.parent = this;
	this.children.push(node);
}

Node.prototype.detach = function(node)
{
	
}

Node.prototype.resetTransformation = function()
{
	mat4.identity(this.transformation);
}

Node.prototype.translate = function(vector)
{
	var newTransformation = mat4.create();
	mat4.identity(newTransformation);
	mat4.translate(newTransformation, vector);
	mat4.multiply(newTransformation, this.transformation, this.transformation);
}

Node.prototype.translate2 = function(vector)
{
	mat4.translate(this.transformation, vector);
}

Node.prototype.scale = function(vector)
{
	mat4.scale(this.transformation, vector);
}

Node.prototype.rotate = function(angle, axis)
{
	mat4.rotate(this.transformation, angle, axis);
}

Node.prototype.getAbsoluteTransformation = function()
{
	var absoluteTransformation = mat4.create();
	mat4.set(this.transformation, absoluteTransformation);
	var parentNode = this.parent;
	while(parentNode)
	{
		mat4.multiply(parentNode.transformation, absoluteTransformation, absoluteTransformation);
		parentNode = parentNode.parent;
	}
	return absoluteTransformation;
}

Node.prototype.getPosition = function()
{
	var position = vec3.create();
	var transformationMatrix = this.transformation;
	position[0] = transformationMatrix[12];
	position[1] = transformationMatrix[13];
	position[2] = transformationMatrix[14];
	return position;
}

Node.prototype.getAbsolutePosition = function()
{
	var position = vec3.create();
	var transformationMatrix = this.getAbsoluteTransformation();
	position[0] = transformationMatrix[12];
	position[1] = transformationMatrix[13];
	position[2] = transformationMatrix[14];
	return position;
}

Node.prototype.getScale = function()
{
	var scale = vec3.create();
	var transformationMatrix = this.transformation;
	
	scale[0] = Math.sqrt(Math.pow(transformationMatrix[0], 2) + Math.pow(transformationMatrix[1], 2) + Math.pow(transformationMatrix[2], 2));
	scale[1] = Math.sqrt(Math.pow(transformationMatrix[4], 2) + Math.pow(transformationMatrix[5], 2) + Math.pow(transformationMatrix[6], 2));
	scale[2] = Math.sqrt(Math.pow(transformationMatrix[8], 2) + Math.pow(transformationMatrix[9], 2) + Math.pow(transformationMatrix[10], 2));
	
	return scale;	
}

Node.prototype.getAbsoluteScale = function()
{
	var scale = vec3.create();
	var transformationMatrix = this.getAbsoluteTransformation();
	
	scale[0] = Math.sqrt(Math.pow(transformationMatrix[0], 2) + Math.pow(transformationMatrix[1], 2) + Math.pow(transformationMatrix[2], 2));
	scale[1] = Math.sqrt(Math.pow(transformationMatrix[4], 2) + Math.pow(transformationMatrix[5], 2) + Math.pow(transformationMatrix[6], 2));
	scale[2] = Math.sqrt(Math.pow(transformationMatrix[8], 2) + Math.pow(transformationMatrix[9], 2) + Math.pow(transformationMatrix[10], 2));
	
	return scale;	
}

