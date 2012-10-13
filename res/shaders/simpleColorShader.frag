#ifdef GL_ES
precision highp float;
#endif

uniform vec3 color;
uniform float alpha;

varying vec3 lightedColor;

void main(void)
{
	gl_FragColor = vec4(color * lightedColor, alpha);
}