attribute vec3 vertexPosition;
attribute vec3 vertexNormal;
attribute vec2 vertexTexCoord;

uniform mat4 mvMatrix;
uniform mat4 pMatrix;
uniform mat3 nMatrix;

uniform vec3 lightDirection;
uniform vec3 lightPosition;

uniform bool ignoreLighting;
uniform int lightType;

varying float lightIntensity;

void main(void)
{
	gl_Position = pMatrix * mvMatrix * vec4(vertexPosition, 1.0);
	
	if(!ignoreLighting)
	{
		vec3 transformedNormal = normalize(nMatrix * vertexNormal);
		vec3 direction;
		
		if(lightType == 0)
		{
			direction = normalize(lightDirection * -1.0);
		}
		else
		{
			direction = normalize(lightPosition - (mvMatrix * vec4(vertexPosition, 1.0)).xyz);
		}
		
		lightIntensity = max(dot(transformedNormal, direction), 0.0);
	}
	else
	{
		lightIntensity = 1.0;
	}
}