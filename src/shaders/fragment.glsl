uniform sampler2D uTexture;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

float circle(vec2 uv, vec2 circlePosition, float radius) {
	float dist = distance(circlePosition, uv);
	return 1. - smoothstep(0.0, radius, dist);
}

void main() {
	vec4 finalTexture = texture2D(uTexture, vUv);
	csm_DiffuseColor = finalTexture;
	// csm_DiffuseColor = vec4(1., 0., 0., 1.);
}