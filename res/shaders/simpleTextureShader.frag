#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D textureSampler;
uniform float alpha;
uniform bool useTextureAlpha;

varying vec2 textureCoord;
varying vec3 lightedColor;

void main(void)
{
	vec4 textureColor = texture2D(textureSampler, vec2(textureCoord.s, textureCoord.t));
	
	if(useTextureAlpha)
	{
		gl_FragColor = vec4(textureColor.rgb * lightedColor, textureColor.a * alpha);
	}
	else
	{
		gl_FragColor = vec4(textureColor.rgb * lightedColor, alpha);
	}
}