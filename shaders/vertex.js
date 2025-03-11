   
export default /*glsl*/`

uniform float uSize;
attribute float aScale;
varying vec3 vColor;
uniform float uTime;
attribute vec3 aRandomness;

        void main()
        {

          vec4 modelPosition = modelMatrix * vec4(position, 1.0);

          float angle = atan(modelPosition.x, modelPosition.z);
          float distanceToCentre = length(modelPosition.xz);
          float angleOffset = (1.0 / distanceToCentre) * uTime * 0.09;
          angle += angleOffset;
          modelPosition.x = cos(angle) * distanceToCentre;
          modelPosition.z = sin(angle) * distanceToCentre;

          modelPosition.x += aRandomness.x;
          modelPosition.y += aRandomness.y;
          modelPosition.z += aRandomness.z;

                vec4 viewPosition = viewMatrix * modelPosition;
                vec4 projectedPosition = projectionMatrix * viewPosition;
                gl_Position = projectedPosition;

                gl_PointSize = uSize * aScale;
                gl_PointSize *= (1.0 / - viewPosition.z); // изменятет размер объекта в зависимости от расстояния

                vColor = color;
      
    }
`;
