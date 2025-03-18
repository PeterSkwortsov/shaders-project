   
export default /*glsl*/`

uniform float uSize;
uniform vec2 uResolution;
uniform float uProgress;

attribute float aSize;
attribute float aTimeMultiplaer;

float remap(float value, float originMin, float originMax, float destinationMin, float destinationMax)
{
    return destinationMin + (value - originMin) * (destinationMax - destinationMin) / (originMax - originMin);
}

void main() {

  float progress = uProgress * aTimeMultiplaer;
  vec3 newPosition = position;

  float explodingProgress = remap(progress, 0.0, 1.0, 0.0, 1.0);
  // newPosition *= explodingProgress;
  explodingProgress = clamp(explodingProgress, 0.0, 1.0);
  explodingProgress = 1.0 - pow(1.0 - explodingProgress, 3.0);
  newPosition *= explodingProgress;

  float faillingProgress = remap(progress, 0.0, 1.0, 0.0, 1.0);
  faillingProgress = clamp(faillingProgress, 0.0, 1.0);
  faillingProgress = 1.0 - pow(1.0 - faillingProgress, 3.0);
  newPosition.y -= faillingProgress * 0.2;

  // мерцание
  float twinklingProgress = remap(progress, 0.2, 0.8, 0.0, 1.0);
  twinklingProgress = clamp(twinklingProgress, 0.0, 1.0);
  float sizeTwinkLing = sin(progress * 30.0) * 0.5 + 0.5;
  sizeTwinkLing = 1.0 - sizeTwinkLing * twinklingProgress;


  // размер
  float sizeOpeningProgress = remap(progress, 0.0, 0.125, 0.0, 1.0);
  float sizeClosingProgress = remap(progress, 0.125, 1.0, 1.0, 0.0);
  float sizeProgress = min(sizeOpeningProgress, sizeClosingProgress);
  sizeProgress = clamp(sizeProgress, 0.0, 1.0);

  // финальная позиция
  vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0 );
  vec4 viewPosition = viewMatrix * modelPosition;
  gl_Position = projectionMatrix * viewPosition;

  gl_PointSize = uSize * uResolution.y * aSize * sizeProgress * sizeTwinkLing;
  gl_PointSize *= 1.0 / -viewPosition.z; // перспектива

  if (gl_PointSize < 1.0) 
    gl_Position = vec4(9999.9);
}

`;
