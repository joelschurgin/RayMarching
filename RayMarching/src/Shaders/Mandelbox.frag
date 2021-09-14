#version 330 core

uniform vec2 u_Resolution;
uniform float u_Time;
uniform vec3 u_CameraPos;

layout(location = 0) out vec4 color;

// global constants
const int MAX_STEPS = 256;
const float MIN_HIT = 0.01;
const float MAX_DIST = 100.0;

const float scale = 2.0;

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

void boxFold(inout vec3 pos)
{
    const float size = 1.0;
    pos = clamp(pos, -size, size) * 2.0 - pos;
}

void sphereFold(inout vec3 pos, inout float dr)
{
    const float minR = 0.5;
    const float fixedR = 1.0;

    const float minR2 = minR * minR;
    const float fixedR2 = fixedR * fixedR;

    float r = fixedR2 / clamp(dot(pos, pos), minR2, fixedR2);
    pos *= r;
    dr *= r;
}

float fractal(in vec3 pos)
{
    vec3 offset = pos;
    float dr = 1.0;

    for (int n = 0; n < 15; n++)
    {
        boxFold(pos);
        sphereFold(pos, dr);

        pos = scale * pos + offset;
        dr = dr * abs(scale) + 1.0;
    }

    return length(pos) / abs(dr);
}

float DE(vec3 pos)
{
    return fractal(pos);
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

float march(vec3 rayOrigin, vec3 rayDir, out float glow)
{
    float distance = 0.01;

    int i;
    for (i = 0; i < MAX_STEPS; i++)
    {
        vec3 pos = rayOrigin + rayDir * distance;
        float distEstimate = DE(pos);
        distance += distEstimate;

        if (distEstimate <= MIN_HIT) // hit
            return distance;
        else if (distance >= MAX_DIST) // miss
            break;
    }

    glow = float(i) / float(MAX_STEPS);
    return distance;
}

void main()
{
    vec2 uv = (gl_FragCoord.xy - u_Resolution / 2.0) / u_Resolution.y;
    
    // initiallize camera
    vec3 cameraPosition = vec3(0.0, 0.0, -20.0) + u_CameraPos;
    vec3 rayOrigin = cameraPosition;
    vec3 rayDir = vec3(uv, 1.0);

    // march
    float glow = 0.0;
    float dist = march(rayOrigin, rayDir, glow);
    vec3 currentPosition = rayOrigin + rayDir * dist;

    // calculate lights
    vec3 lightPos1 = vec3(-25, 100, -100);
    vec3 lightPos2 = vec3(100, 100, -100);
    
    float brightness1 = getLightBrightness(lightPos1, currentPosition);
    float brightness2 = getLightBrightness(lightPos2, currentPosition);
    
    vec3 light = brightness1 * vec3(0.7, 0.8, 0.9) * 0.7;
    light += brightness2 * vec3(1.0, 0.5, 0.4) * 0.2;

    // glow
    float background = max(glow, 0.1);
    glow = pow(glow, 0.9);
    light += glow * vec3(1.0, 0.5, 0.4) + background * vec3(0.7, 0.8, 0.9);

    // output the final color
    color = vec4(light, 1.0);
}