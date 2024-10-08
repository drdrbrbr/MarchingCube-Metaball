// import { MarchingCubes } from 'three/addons/objects/MarchingCubes.js';
// import { SimplexNoise } from "three/addons/math/SimplexNoise.js";
// import { Tweakable } from './modules/Tweakable';
// import * as THREE from 'three';

// export class MarchingCubes2 extends Tweakable {
//   public mesh: MarchingCubes;
//   private resolution: number;
//   private materials: any;
//   private numBlobs: number;
//   private noise: SimplexNoise;
//   constructor() {
//     super();
//     this.resolution = 50;
//     this.materials = this.generateMaterials();
//     this.mesh = new MarchingCubes(this.resolution, this.materials['basic']);
//     this.mesh.position.set( 0, 0, 0 );
//     this.mesh.scale.set( 500, 500, 500 ); // individual setting
//     this.mesh.enableUvs = false;
//     this.mesh.enableColors = false;
//     this.mesh.isolation = 39;

//     this.noise = new SimplexNoise();

//     this.numBlobs = 5;

//     this.init();
//     console.log(this.mesh);

//   }
//   init() {
    
//   }
//   generateMaterials() {
//     const materials = {
    
//       'wire': new THREE.MeshBasicMaterial({
//         color: 0x6699FF,
//         wireframe:true,
//       }),

//       'basic': new THREE.MeshBasicMaterial({color: 0x08cd4d}),
  
//       // 'shader':new THREE.ShaderMaterial({
//       //   uniforms : { 
//       //     uPixelRation : {value:PixelRation},
//       //     uResolution: {value: new THREE.Vector2(window.innerWidth, window.innerHeight)},
//       //     uTime: { value: 1.0},
//       //     uColor: { value: new THREE.Color(0x42a9f1)},
//       //     viewVector: { value: new THREE.Vector3(0, 0, 20)},
//       //   },
//       //   vertexShader:Vertex,
//       //   fragmentShader: Fragment,
//       //   side:THREE.DoubleSide,
//       //   transparent:true,
//       //   wireframe: false,
//       // }),
  
//     };
  
//     return materials;
//   }

//   render(time:number) {
//     this.updateCubes( this.mesh, time/3000, this.numBlobs);
//   }

//   updateCubes( object:MarchingCubes, time:number, numblobs:number ) {

//     object.reset(); // Delete marching cubes
  
//     const subtract = 50;
//     const strength = 1.2 / ( ( Math.sqrt( numblobs ) - 1 ) / 4 + 1 );
//     object.addBall( 0.5, 0.5, 0.5, 6, 40 );
//     object.addBall( 0.15, 0.5, 0.5, 2, 20 );
//     object.addBall( 0.85, 0.5, 0.5, 2, 20 );


//     // for ( let i = 0; i < numblobs; i ++ ) {
//     //   // Postion Animation
//     //   const ballx = 0.5*Math.sin(time + i) + 0.5; 
//     //   const ballz = 0.5;
//     //   const bally = 0.5 + this.noise.noise( i * .2 + time*0.2, i * .2 + time*0.2 ) * 0.2;
//     //   console.log(ballx, bally, ballz);
//     //   object.addBall( ballx, bally, ballz, strength, subtract );
//     // }
  
//     object.update();
//   }
  
// }