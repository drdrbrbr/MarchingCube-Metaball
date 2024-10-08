precision highp float;

attribute vec3 position;
attribute float vertexId;

uniform float time;
uniform vec3 numCells;
uniform vec3 cellSize;
uniform sampler2D triTableTexture;

uniform float effectValue;
uniform float smoothUnionValue;

uniform mat4 modelViewMatrix;
uniform mat3 normalMatrix;
uniform mat4 projectionMatrix;
uniform vec3 cameraPosition;
uniform vec4 randomValues[NUM_SPHERES];
uniform float sphereInnerMoveRange;
uniform float sphereOuterMoveRange;
uniform float sphereInnerRadius;
uniform float sphereOuterRadius;
uniform float sphereSpeed;
uniform int numInnerSphere;
uniform float sphereOuterPos;

varying vec3 vPos;
varying vec3 vNormal;
varying float vDiscard;

const float PI = 3.1415926535897932384626433832795;
vec3 rotateVec3(vec3 p, float angle, vec3 axis) {
  vec3 a = normalize(axis);
  float s = sin(angle);
  float c = cos(angle);
  float r = 1.0 - c;
  mat3 m = mat3(a.x * a.x * r + c, a.y * a.x * r + a.z * s, a.z * a.x * r - a.y * s, a.x * a.y * r - a.z * s, a.y * a.y * r + c, a.z * a.y * r + a.x * s, a.x * a.z * r + a.y * s, a.y * a.z * r - a.x * s, a.z * a.z * r + c);
  return m * p;
}

const float PI2 = PI * 2.0;
const vec3 AXIS_X = vec3(1.0, 0.0, 0.0);
const vec3 AXIS_Y = vec3(0.0, 1.0, 0.0);
const vec3 AXIS_Z = vec3(0.0, 0.0, 1.0);

// 球の距離関数
float sphere(vec3 p, float r) {
  float d = length(p) - r;
  return d * 0.6; // 影響範囲を広げる
}

// メタボールをランダムに動かす
float randomObj(vec3 p, int i, vec4 randomValues) {
  float num_spheres = float(NUM_SPHERES);
  float num = float(i);
  float num_inner = float(numInnerSphere);

  // 球体の中心位置を計算
  vec3 sphereCenter = (randomValues.xyz * 2.0 - 1.0) * 10.0 * num;

  // 球体の中心からの距離を計算
  float distanceFromCenter = length(sphereCenter);

  // 距離に基づいて速度を計算（中心が1.0、最も遠い位置が0.2）
  float speed = mix(sphereSpeed, 0.1, distanceFromCenter / 1000.0);

  float t = mod(time * sphereSpeed * (0.2 + randomValues.w) + randomValues.z * 100.0, PI2);
  // 1つ目の球体は内側を動かし、それ以外は外側を動かす
  float movementRange = (i < numInnerSphere) ? sphereInnerMoveRange : sphereOuterMoveRange;

  // z軸の動きを減らす
  vec3 movement = vec3(randomValues.x * 2.0 - 1.0, randomValues.y * 2.0 - 1.0, (randomValues.z * 2.0 - 1.0) * 0.4  // z軸の動きを20%に減らす
  );

  vec3 movementCorrection;
  if(num < num_inner) {
    movementCorrection = vec3(0.0, 0.0, 0.0);
  } else if(num_inner <= num && num < num_spheres / 4.0) {
    movementCorrection = vec3(sphereOuterPos + 5.0 * (num - num_inner), 0.0, 0.0);
  } else if(num_spheres / 4.0 <= num && num < num_spheres * 2.0 / 4.0) {
    movementCorrection = vec3(0.0, sphereOuterPos + 5.0 * (num - num_spheres / 4.0), 0.0);
  } else if(num_spheres * 2.0 / 4.0 <= num && num < num_spheres * 3.0 / 4.0) {
    movementCorrection = vec3(-sphereOuterPos - 5.0 * (num - num_spheres * 2.0 / 4.0), 0.0, 0.0);
  } else if(num_spheres * 3.0 / 4.0 <= num) {
    movementCorrection = vec3(0.0, -sphereOuterPos - 5.0 * (num - num_spheres * 3.0 / 4.0), 0.0);
  }
  vec3 translate = movement * movementRange * sin(t) + movementCorrection;

  // float r = sphereMinRadius + randomValues.x * (sphereMaxRadius - sphereMinRadius);

  // 中心の球体（インデックス0）だけ小さくする
  float r = (i < numInnerSphere) ? sphereInnerRadius : sphereOuterRadius;

  float l = cellSize.x;
  p -= translate;
  return sphere(p, r);
}

// Smooth Union
float opSmoothUnion(float d1, float d2, float k) {
  float h = clamp(0.5 + 0.5 * (d2 - d1) / k, 0.0, 1.0);
  return mix(d2, d1, h) - k * h * (1.0 - h) * 0.9;
}

// 最終的な距離関数
float getDistance(vec3 p) {
  // 適当に回転
  // float theta = mod(time * 0.0001, PI2);
  // p = rotateVec3(p, theta, AXIS_Z);
  // p = rotateVec3(p, theta, AXIS_X);

  float result = 20000.0; // 大きな初期値
  float d;
  for(int i = 0; i < NUM_SPHERES; i++) {
    d = randomObj(p, i, randomValues[i]);
    result = opSmoothUnion(result, d, smoothUnionValue);
  }
  return result;
}

// 法線を算出
vec3 getNormal(vec3 p) {
  float d = 0.1;
  return normalize(vec3(getDistance(p + vec3(d, 0.0, 0.0)) - getDistance(p - vec3(d, 0.0, 0.0)), getDistance(p + vec3(0.0, d, 0.0)) - getDistance(p - vec3(0.0, d, 0.0)), getDistance(p + vec3(0.0, 0.0, d)) - getDistance(p - vec3(0.0, 0.0, d))));
}

// v0, v1の値をもとにp0, p1を補間した値を返す
vec3 interpolate(vec3 p0, vec3 p1, float v0, float v1) {
  return mix(p0, p1, -v0 / (v1 - v0));
}

// 論理演算用
int modi(int x, int y) {
  return x - y * (x / y);
}

// 論理和
int or(int a, int b) {
  int result = 0;
  int n = 1;
  for(int i = 0; i < 8; i++) {
    if((modi(a, 2) == 1) || (modi(b, 2) == 1))
      result += n;
    a = a / 2;
    b = b / 2;
    n = n * 2;
    if(!(a > 0 || b > 0))
      break;
  }
  return result;
}

void main(void) {
  // vertexIdは0から1499までの値を取る
  float cellId = floor(vertexId / 15.0); // セルのID
  float vertexIdInCell = mod(vertexId, 15.0); // セル内での頂点のID

  // セルの基準点を算出
  vec3 cellIndices = vec3(mod(cellId, numCells.x), mod(cellId, (numCells.x * numCells.y)) / numCells.x, cellId / (numCells.x * numCells.y));
  cellIndices = floor(cellIndices); // y,zの値を整数化

  // セルの基準点 (立方体の向かって左下奥)
  vec3 c0 = (0.5 * numCells - cellIndices) * cellSize;

  // セルの各頂点
  vec3 c1 = c0 + cellSize * vec3(1.0, 0.0, 0.0);
  vec3 c2 = c0 + cellSize * vec3(1.0, 0.0, 1.0);
  vec3 c3 = c0 + cellSize * vec3(0.0, 0.0, 1.0);
  vec3 c4 = c0 + cellSize * vec3(0.0, 1.0, 0.0);
  vec3 c5 = c0 + cellSize * vec3(1.0, 1.0, 0.0);
  vec3 c6 = c0 + cellSize * vec3(1.0, 1.0, 1.0);
  vec3 c7 = c0 + cellSize * vec3(0.0, 1.0, 1.0);

  // セルの各頂点のボクセル値を求める (ボクセル値はメタボールまでの距離)
  float v0 = getDistance(c0);
  float v1 = getDistance(c1);
  float v2 = getDistance(c2);
  float v3 = getDistance(c3);
  float v4 = getDistance(c4);
  float v5 = getDistance(c5);
  float v6 = getDistance(c6);
  float v7 = getDistance(c7);

  // ルックアップテーブルの参照

  // まずはポリゴンの張り方の256通りのうちどのパターンになるか調べる
  float cubeIndex = 0.0;
  cubeIndex = mix(cubeIndex, float(or(int(cubeIndex), 1)), 1.0 - step(0.0, v0) // 内側なら1.0、外側なら0.0
  );
  cubeIndex = mix(cubeIndex, float(or(int(cubeIndex), 2)), 1.0 - step(0.0, v1));
  cubeIndex = mix(cubeIndex, float(or(int(cubeIndex), 4)), 1.0 - step(0.0, v2));
  cubeIndex = mix(cubeIndex, float(or(int(cubeIndex), 8)), 1.0 - step(0.0, v3));
  cubeIndex = mix(cubeIndex, float(or(int(cubeIndex), 16)), 1.0 - step(0.0, v4));
  cubeIndex = mix(cubeIndex, float(or(int(cubeIndex), 32)), 1.0 - step(0.0, v5));
  cubeIndex = mix(cubeIndex, float(or(int(cubeIndex), 64)), 1.0 - step(0.0, v6));
  cubeIndex = mix(cubeIndex, float(or(int(cubeIndex), 128)), 1.0 - step(0.0, v7));

  // 続いて現在の頂点がどの辺上に配置されるかを調べる
  // つまり、ルックアップテーブルのどの値を参照するかのインデックスを求める
  float edgeIndex = texture2D(triTableTexture, vec2((cubeIndex * 16.0 + vertexIdInCell) / 4096.0, 0.0)).r * 255.0;
  vec3 pos = position;

  vDiscard = 0.0;
  if(edgeIndex == 255.0) {
    // edgeIndexが255の場合、頂点は破棄
    vNormal = vec3(0.0, 0.0, 1.0);
    pos = position;
    vDiscard = 1.0;
  } else if(edgeIndex == 0.0) {
    pos = interpolate(c0, c1, v0, v1);
  } else if(edgeIndex == 1.0) {
    pos = interpolate(c1, c2, v1, v2);
  } else if(edgeIndex == 2.0) {
    pos = interpolate(c2, c3, v2, v3);
  } else if(edgeIndex == 3.0) {
    pos = interpolate(c3, c0, v3, v0);
  } else if(edgeIndex == 4.0) {
    pos = interpolate(c4, c5, v4, v5);
  } else if(edgeIndex == 5.0) {
    pos = interpolate(c5, c6, v5, v6);
  } else if(edgeIndex == 6.0) {
    pos = interpolate(c6, c7, v6, v7);
  } else if(edgeIndex == 7.0) {
    pos = interpolate(c4, c7, v4, v7);
  } else if(edgeIndex == 8.0) {
    pos = interpolate(c0, c4, v0, v4);
  } else if(edgeIndex == 9.0) {
    pos = interpolate(c1, c5, v1, v5);
  } else if(edgeIndex == 10.0) {
    pos = interpolate(c2, c6, v2, v6);
  } else if(edgeIndex == 11.0) {
    pos = interpolate(c3, c7, v3, v7);
  }

  vNormal = getNormal(pos);

  // エフェクト
  vec3 effectSize = cellSize * 1.5;
  pos = mix(pos, floor(pos / effectSize + 0.5) * effectSize, effectValue);

  vPos = pos;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}