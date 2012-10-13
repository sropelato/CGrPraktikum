function Light()
{
	this.type = 0;	// 0 = directional light
					// 1 = point light

	this.direction = [0, -1, 0];
	this.position = [0, 0, 0];
	this.ambientColor = [0.2, 0.2, 0.2];
	this.diffuseColor = [1.0, 1.0, 1.0];
	
	// light direction relative to camera
	this.relativeDirection = [0, -1, 0];
	this.relativePosition = [0, 0, 0];
}