#ifdef GL_ES
precision highp float;
#endif

uniform vec3 lightAmbientColor;
uniform vec3 lightDiffuseColor;

uniform vec3 color;
uniform float alpha;

varying float lightIntensity;

void main(void)
{
	float myLightIntensity;

	if(lightIntensity > 0.75)
		myLightIntensity = 1.0;
	else if(lightIntensity > 0.5)
		myLightIntensity = 0.75;
	else if(lightIntensity > 0.25)
		myLightIntensity = 0.5;
	else
		myLightIntensity = 0.0;
		
	vec4 ambientColor = vec4(lightAmbientColor, 1.0);
	vec4 diffuseColor = vec4(lightDiffuseColor, 1.0);
	
	gl_FragColor = vec4((ambientColor + (diffuseColor-ambientColor) * myLightIntensity).rgb * color, alpha);

	//gl_FragColor = vec4(color * myLightIntensity, alpha);
}