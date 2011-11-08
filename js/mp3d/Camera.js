function Camera()
{
	this.node = null;
}

Camera.prototype.getTransformation = function()
{
	if(this.node)
	{
		return this.node.getAbsoluteTransformation();
	}
	else
	{
		return mat4.identity(mat4.create());
	}
}

Camera.prototype.lookAt = function(vector)
{
	var currentPosition = this.node.getAbsolutePosition();
	
	var xDiff = vector[0] - currentPosition[0];
	var yDiff = vector[1] - currentPosition[1];
	var zDiff = vector[2] - currentPosition[2];
	var xzDiff = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(zDiff, 2));
	
	var yawAngle = 0;
	var pitchAngle = 0;
	
	// calculate camera's yaw angle
	if(zDiff < 0)
	{
		yawAngle = Math.atan(xDiff / zDiff);
	}
	else if(zDiff > 0)
	{
		yawAngle = Math.atan(xDiff / zDiff) + Mp3D.degToRad(180);
	}
	else
	{
		if(xDiff > 0)
		{
			yawAngle = Mp3D.degToRad(90);
		}
		else if(xDiff < 0)
		{
			yawAngle = Mp3D.degToRad(-90);
		}
		else
		{
			yawAngle = 0;
		}
	}
	
	// calculate camera's pitch angle
	if(xzDiff < 0)
	{
		pitchAngle = Math.atan(yDiff / xzDiff);
	}
	else if(xzDiff > 0)
	{
		pitchAngle = Math.atan(yDiff / xzDiff);
	}
	else
	{
		if(yDiff > 0)
		{
			pitchAngle = Mp3D.degToRad(90);
		}
		else if(yDiff < 0)
		{
			pitchAngle = Mp3D.degToRad(-90);
		}
		else
		{
			pitchAngle = 0;
		}
	}
		
	var relativeNodePosition = this.node.getPosition();

	this.node.resetTransformation();
	this.node.translate(relativeNodePosition);
	
	this.node.rotate(yawAngle, [0, 1, 0]);
	this.node.rotate(pitchAngle, [1, 0, 0]);
}
