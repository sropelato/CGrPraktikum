#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D textureSampler;
uniform float alpha;
uniform bool useTextureAlpha;
uniform int blendMode;

varying vec2 textureCoord;
varying vec3 lightedColor;

void main(void)
{
	vec4 textureColor = texture2D(textureSampler, vec2(textureCoord.s, textureCoord.t));
	
	if(blendMode == 1) // multiply
	{
		if(useTextureAlpha)
		{
			gl_FragColor = vec4(textureColor.rgb * lightedColor * vec3(textureColor.a * alpha, textureColor.a * alpha, textureColor.a * alpha), 1);
		}
		else
		{
			gl_FragColor = vec4(textureColor.rgb * lightedColor * vec3(alpha, alpha, alpha), 1);
		}
	}
	else // alpha
	{
		if(useTextureAlpha)
		{
			gl_FragColor = vec4(textureColor.rgb * lightedColor, textureColor.a * alpha);
		}
		else
		{
			gl_FragColor = vec4(textureColor.rgb * lightedColor, alpha);
		}
	}
}