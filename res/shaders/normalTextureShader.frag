#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D textureSampler;
uniform sampler2D normalMapSampler;

uniform vec3 lightAmbientColor;
uniform vec3 lightDiffuseColor;
uniform float shininess;

varying vec2 textureCoord;
varying vec3 eyeVector;
varying vec3 lightVector;
varying mat3 tbnMatrix;


void main(void)
{
	vec3 textureColor = texture2D(textureSampler, vec2(textureCoord.s, textureCoord.t)).rgb;
	vec3 normal = tbnMatrix * normalize(texture2D(normalMapSampler, textureCoord).grb * 2.0 - 1.0);
	
	vec3 reflectionVector = normalize(-reflect(lightVector, normal));
	
	float diffuseIntensity;
	float specularIntensity;
	
	//if(dot((tbnMatrix * vec3(0.0, 0.0, 1.0)), lightVector) > 0.0)
	//{
		diffuseIntensity = max(0.0, dot(lightVector, normal));
		specularIntensity = pow(max(0.0, dot(reflectionVector, eyeVector)), shininess);
	//}
	//else
	//{
	//	diffuseIntensity = 0.0;
	//	specularIntensity = 0.0;
	//}	
	
	if(diffuseIntensity == 0.0)
		specularIntensity = 0.0;
	
	gl_FragColor = vec4(textureColor.rgb * (diffuseIntensity * lightDiffuseColor + lightAmbientColor) + specularIntensity * vec3(1.0, 1.0, 1.0), 1.0);	
	//gl_FragColor = vec4(normal, 1.0);
}
