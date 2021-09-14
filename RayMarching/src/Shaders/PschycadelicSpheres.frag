#version 330 core

uniform vec2 u_Resolution;
uniform float u_Time;
uniform vec3 u_CameraPos;

layout(location = 0) out vec4 color;

// global constants
const float STEP_SIZE = 0.1;
const int MAX_STEPS = 256;
const float MIN_HIT = 0.01;
const float MAX_DIST = 100.0;

// distance functions
float sphere(vec3 pos, float r)
{
    return length(pos) - r;
}

float plane(vec3 pos)
{
    return pos.y;
}

vec3 fold(vec3 pos, vec3 normal)
{
    pos -= 2.0 * min(0.0, dot(pos, normal)) * normal;
    return pos;
}

float box(vec3 pos, vec3 dimensions)
{
    vec3 q = abs(pos) - dimensions;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

vec3 boxFold(vec3 pos, float size)
{
    vec3 absPos = abs(pos);
    return (absPos / pos) * (min(absPos, size) - max(absPos, size) + size);
}

vec3 sphereFold(vec3 pos, float radius)
{
    float magnitude = length(pos);
    float absMag = abs(magnitude);
    float newMag = (absMag / magnitude) * max(min(absMag / (radius * radius), 1.0 / absMag), absMag);

    return newMag * pos / magnitude;
}

float fractal(in vec3 pos)
{
    // need to implement mandelbox fractal ins
    float scale = u_Time / 1000.0;

    int i;
    for (i = 0; i < 100; i++)
    {
        pos = fold(pos, vec3( 1.0,  1.0,  0.0));
        pos = fold(pos, vec3(-1.0,  1.0, -1.0));
        pos = fold(pos, vec3( 1.0, -1.0,  1.0));
        pos = scale * pos - vec3(1.0, 1.0, 0.0) * (scale - 1.0);
    }

    return length(pos) * pow(scale, -float(i));
}

float DE(vec3 pos)
{
    vec3 p = mod(pos, 1.0) - 0.5;
    //return min(sphere(p, 0.5), plane(pos - vec3(0.0, -1.0, 0.0)));
    return sphere(p, 0.1);
}

// calculate surface normal
vec3 calculateNormal(vec3 pos)
{
    const vec3 small_step = vec3(MIN_HIT, 0.0, 0.0);

    float gradient_x = DE(pos + small_step.xyy) - DE(pos - small_step.xyy);
    float gradient_y = DE(pos + small_step.yxy) - DE(pos - small_step.yxy);
    float gradient_z = DE(pos + small_step.yyx) - DE(pos - small_step.yyx);

    vec3 normal = vec3(gradient_x, gradient_y, gradient_z);

    return normalize(normal);
}

float softShadow(in vec3 ro, in vec3 rd, float mint, float maxt, float k)
{
    float res = 1.0;
    float ph = 1e20;
    for(float t = mint; t < maxt;)
    {
        float h = DE(ro + rd*t);
        if(h < 0.001)
            return 0.0;
        float y = h * h / (2.0 * ph);
        float d = sqrt(h * h - y * y);
        res = min( res, k * d/max(0.0, t - y) );
        ph = h;
        t += h;
    }
    return res;
}

// get the brightness of the lights
float getLightBrightness(vec3 lightPos, vec3 pos)
{
    vec3 light = normalize(lightPos - pos);
    vec3 normal = calculateNormal(pos);

    float dif = clamp(dot(normal, light), 0.0, 1.0);

    // calculate shadows
    //dif *= softShadow(pos, light, 0.01, 3.0, 10.0);
    return dif;
}

float march(vec3 rayOrigin, vec3 rayDir)
{
    float distance = 0.01;

    for (int i = 0; i < MAX_STEPS; i++)
    {
        vec3 pos = rayOrigin + rayDir * distance;
        float distEstimate = DE(pos);
        distance += distEstimate;

        if (distEstimate <= MIN_HIT) // hit
            return distance;
        else if (distance >= MAX_DIST) // miss
            break;
    }

    return distance;
}

void main()
{
    vec2 uv = (gl_FragCoord.xy - u_Resolution / 2.0) / u_Resolution.y;
    
    vec3 cameraPosition = vec3(3.0, 1.0, -10) + u_CameraPos;
    vec3 rayOrigin = cameraPosition;
    vec3 rayDir = vec3(uv, 1.0);

    float dist = march(rayOrigin, rayDir);
    vec3 currentPosition = rayOrigin + rayDir * dist;

    vec3 lightPos1 = vec3(0, 10, -10);
    vec3 lightPos2 = vec3(-10, 10, 0);

//    // rotate light
//    float increment = u_Time / 500.0;
//    float radius = 5.0;
//    lightPos1.x += radius * sin(increment);
//    lightPos1.z += radius * cos(increment);

    float brightness1 = getLightBrightness(lightPos1, currentPosition);
//    float brightness2 = getLightBrightness(lightPos2, currentPosition);

    float angle = u_Time / 1000.0 + 2.0 * length(uv);

    vec3 c;//vec3(0.5, 0.6, sin(u_Time / 1000.0) / 2.0 + 0.5);
    c.x = sin(angle) * 0.5 + 0.5; // r
    c.y = cos(angle) * 0.5 + 0.5; // g
    c.z = 0.5;   // b
    c *= 0.8;
    //vec3 c = vec3(0.7, 0.8, 0.9);

    vec3 light = brightness1 * c;//vec3(0.7, 0.8, 0.9);
    //light += brightness2 * vec3(0.5, 0.6, 0.7);

    // fog
    float fogAmount = 1.0 - exp(-dist * 0.01);

    light = mix(light, c, fogAmount);

    color = vec4(light, 1.0);
}