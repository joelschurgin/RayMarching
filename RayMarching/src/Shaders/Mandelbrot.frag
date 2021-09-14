#version 330 core

uniform vec2 u_Resolution;
uniform float u_Time;
uniform vec3 u_CameraPos;

layout(location = 0) out vec4 color;

vec2 complexMultiplication(vec2 a, vec2 b)
{
	return vec2(a.x * b.x - a.y * b.y, a.x * b.y + b.x * a.y);
}

vec2 complexPow(in vec2 a, int p)
{
	vec2 z = a;
	for (int i = 0; i < p - 1; i++)
		z = complexMultiplication(z, a);

	return z;
}

float mandelbrot(vec2 c)
{
	vec2 z = vec2(0.0);

	const int nIter = 100;
	for (int i = 0; i < nIter; i++)
	{
		z = complexPow(z, 2) + c;

		float nDot = dot(z, z);
		if (nDot > 45678.0) // if the point escapes
		{
			return (float(i) - log2(log2(nDot)) + 4.0) / float(nIter);
		}
	}

	return 0.0;
}

vec4 getColor(float col)
{
	vec3 ogColor = vec3(0.2, 0.8, 1.0);
    return vec4(0.5 + 0.5 * cos(2.5 + col * 35.0 + ogColor), 1.0);
}

void main()
{
	vec2 uv = (gl_FragCoord.xy - u_Resolution / 2.0) / u_Resolution.y;
	uv *= 2.5;
	uv.x -= 0.5;

	color = vec4(0.0);

	const int nSamples = 10;
	for (int i = 0; i < nSamples; i++)
	{
		color += getColor(mandelbrot(uv));
	}

	color /= float(nSamples);
}