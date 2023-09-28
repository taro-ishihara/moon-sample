import { useRef } from "react";
import {
  TextureLoader,
  Vector3,
  ShaderMaterial,
  BufferGeometry,
  BufferAttribute,
  RepeatWrapping,
} from "three";
import { useLoader } from "@react-three/fiber";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";
import Hexasphere from "../lib/hexasphere/hexasphere";

const cartesianCoordsToSphericalCoords = (cartesianCoords: Vector3) => {
  const radius = Math.sqrt(
    cartesianCoords.x * cartesianCoords.x +
      cartesianCoords.y * cartesianCoords.y +
      cartesianCoords.z * cartesianCoords.z
  );
  const phi = Math.acos(cartesianCoords.z / radius);
  const theta = Math.atan2(cartesianCoords.y, cartesianCoords.x);
  return { radius, phi, theta };
};

const getUV = (vertex: Vector3) => {
  const { phi, theta } = cartesianCoordsToSphericalCoords(vertex);
  const V = phi / Math.PI;
  const U = theta / Math.PI;
  return { U, V };
};

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
uniform sampler2D colorMap;

void main() {
  gl_FragColor = texture2D(colorMap, vUv);
}
`;

export const Moon = () => {
  const colorMap = useLoader(TextureLoader, "textures/moon_color.png");
  colorMap.wrapS = RepeatWrapping;
  colorMap.wrapT = RepeatWrapping;
  const displacementMap = useLoader(
    TextureLoader,
    "textures/moon_displacement.jpg"
  );

  const radius = 3;

  var subDivisions = 36; // Divide each edge of the icosohedron into this many segments
  var tileWidth = 0.98; // Add padding (1.0 = no padding; 0.1 = mostly padding)
  var hexasphere = new Hexasphere(radius, subDivisions, tileWidth);

  const geometries = hexasphere.tiles.map((tile) => {
    const geometry = new BufferGeometry();
    const edgeVertices = tile.boundary.map(
      (element: any) => new Vector3(element.x, element.y, element.z)
    );
    const centerVertex = new Vector3(
      tile.centerPoint.x,
      tile.centerPoint.y,
      tile.centerPoint.z
    );
    const points = [...edgeVertices, centerVertex];
    geometry.setFromPoints(points);
    if (edgeVertices.length == 6) {
      geometry.setIndex([0, 1, 6, 1, 2, 6, 2, 3, 6, 3, 4, 6, 4, 5, 6, 5, 0, 6]);
    } else {
      geometry.setIndex([0, 1, 5, 1, 2, 5, 2, 3, 5, 3, 4, 5, 4, 0, 5]);
    }
    const uvs = new Float32Array(points.length * 2);
    const centerUV = getUV(centerVertex);
    points.forEach((element: any, index: number) => {
      const { U, V } = getUV(element);
      uvs[index * 2] = Math.abs(centerUV.U - U) > 0.5 ? -U / 2 : U / 2;
      uvs[index * 2 + 1] = Math.abs(centerUV.V - V) > 0.5 ? -V : V;
    });
    geometry.setAttribute("uv", new BufferAttribute(uvs, 2));
    geometry.computeVertexNormals();
    return geometry;
  });

  const geometry = BufferGeometryUtils.mergeGeometries(geometries);
  const material = useRef<ShaderMaterial>(null);
  return (
    <mesh geometry={geometry}>
      <shaderMaterial
        ref={material}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          radius: { value: radius },
          colorMap: { value: colorMap },
          displacementMap: { value: displacementMap },
        }}
      />
    </mesh>
  );
};
