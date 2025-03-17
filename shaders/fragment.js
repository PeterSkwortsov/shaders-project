
export default /*glsl*/`
varying vec3 vPosition;
uniform float uTime;
varying vec3 vNormal;
uniform vec3 uColor;

void main()
{
    vec3 normal = normalize(vNormal);
    if(!gl_FrontFacing)
        normal *= -1.0;

    float stripes = mod((vPosition.y - uTime * 0.2) * 15.0, 1.0);
    stripes = pow(stripes, 3.0);

    vec3 viewDirection = normalize(vPosition - cameraPosition);
    float fresnel = dot(viewDirection, normal) + 1.0;
    fresnel = pow(fresnel, 2.0);

    float falloff = smoothstep(3.0, 0.0, fresnel);


    float holographic = stripes * fresnel;
    holographic += fresnel * 0.25;
    holographic *= falloff;


    gl_FragColor = vec4(uColor, holographic);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
        
`;