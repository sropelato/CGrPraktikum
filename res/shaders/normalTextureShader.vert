attribute vec3 vertexPosition;

attribute vec3 vertexNormal;
attribute vec3 vertexTangent;
attribute vec3 vertexBitangent;

attribute vec2 vertexTexCoord;

uniform mat4 mvMatrix;
uniform mat4 pMatrix;
uniform mat3 nMatrix;

uniform vec3 lightDirection;
uniform vec3 lightPosition;

uniform int lightType;

varying vec3 transformedNormal;
varying vec3 transformedTangent;
varying vec3 transformedBitangent;

varying vec2 textureCoord;
varying vec3 eyeVector;
varying vec3 lightVector;
varying mat3 tbnMatrix;

void main(void)
{
	gl_Position = pMatrix * mvMatrix * vec4(vertexPosition, 1.0);
	
	textureCoord = vertexTexCoord;
	transformedNormal = normalize(nMatrix * vertexNormal);
	transformedTangent = normalize(nMatrix * vertexTangent);
	transformedBitangent = normalize(nMatrix * vertexBitangent);
	
	tbnMatrix = mat3(transformedTangent.x, transformedTangent.y, transformedTangent.z,
					transformedBitangent.x, transformedBitangent.y, transformedBitangent.z,
					transformedNormal.x, transformedNormal.y, transformedNormal.z);
	
	if(lightType == 0) // directionnal light
	{
		lightVector = normalize(-lightDirection);
	}
	else // point light
	{
		lightVector = normalize(lightPosition - (mvMatrix * vec4(vertexPosition, 1.0)).xyz);
	}
	
	eyeVector = -normalize((mvMatrix * vec4(vertexPosition, 1.0)).xyz);
}