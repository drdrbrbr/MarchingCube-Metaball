import { Tweakable } from './modules/Tweakable';
import * as $ from './modules/Util';
import type { EventManager } from './modules/Util';
import * as THREE from 'three';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
import { MarchingCubes } from './MarchingCubes';
import { MarchingCubes2 } from './MarchingCubes2';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';

class MyObject extends Tweakable {
  public position: { x: number; y: number };
  public size: number;
  public color: string;
  private div!: HTMLDivElement;
  
  constructor() {
    super();
    this.position = { x: 0, y: 0 };
    this.size = 10;
    this.color = '#ff0000';
    this.setupProp('position',{
      x: {min: 0, max: 500},
      y: {min: 0, max: 500},
    });
    this.setupProp('size');
    this.setupProp('color');
    this.addHtml()
  }

  private addHtml() {
    this.div = document.createElement('div');
    this.updateHtml()
    document.body.appendChild(this.div);
  }
  private updateHtml() {
    this.div.style.width = `${this.size}px`;
    this.div.style.height = `${this.size}px`;
    this.div.style.backgroundColor = this.color;
    this.div.style.position = 'absolute';
    this.div.style.top = `${this.position.y}px`;
    this.div.style.left = `${this.position.x}px`;
  }
  change() {
    super.change()
    this.updateHtml()
  }
}

class MyScene {
  private scene: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private devicePixelRatio: number;
  private canvas: HTMLCanvasElement;
  private controls!: TrackballControls;
  private startTime: number;
  private marchingCubes: MarchingCubes;
  private marchingCubes2: MarchingCubes2;
  private cube!: THREE.Mesh;
  private effect!: EffectComposer;
  constructor() {
    this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
    });

    this.devicePixelRatio = window.devicePixelRatio;
    this.renderer.setPixelRatio(this.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0xffffff);
    console.log('Renderer size:', this.renderer.getSize(new THREE.Vector2()));
    this.scene = new THREE.Scene();
    this.startTime = new Date().getTime() + Math.random() * 40000; // start timeをランダムにする。
    this.init();

    // this.marchingCubes = new MarchingCubes(this.renderer, this.scene, this.camera);
    // this.scene.add(this.marchingCubes.mesh);

    this.marchingCubes2 = new MarchingCubes2();
    this.scene.add(this.marchingCubes2.mesh);
  }
  init() {
    this.addCamera();
    this.addControls(this.camera, this.renderer);
    // this.addLight();  // この行を追加
    // this.addBox();
    // this.addShaderObj();
    this.addLight();
    this.addPostEffect();
  }
  addPostEffect() {
    const renderPass = new RenderPass(this.scene, this.camera);
    this.effect = new EffectComposer(this.renderer);
    const bokehPass = new BokehPass(this.scene, this.camera, {
      focus: 1000,
      aperture: .02,
      maxblur: 0.01,
      aspect: window.innerWidth / window.innerHeight
    });
  
    this.effect.addPass(renderPass);
    this.effect.addPass(bokehPass);
    this.effect.render();
  }
  addCamera() {
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    this.camera.position.set(0, 0, 1000);  // カメラの位置を少し後ろに下げる
    this.camera.lookAt(0, 0, 0);
    this.camera.updateProjectionMatrix();
  }
  addControls(camera: THREE.Camera, renderer: THREE.WebGLRenderer) {
    this.controls = new TrackballControls(camera, renderer.domElement);
  }
  addShaderObj(){
    const geometry = new THREE.BufferGeometry();
    let positions = [];
    let colors = [];
    let x, y, z;
    for(let i = 0; i < 1000; i++){
      x = Math.random() * 2.0 - 1.0;
      y = Math.random() * 2.0 - 1.0;
      z = Math.random() * 2.0 - 1.0;
      if(x * x + y * y + z * z <= 1) {
        positions.push(x * 50.0);
        positions.push(y * 1.0);
        positions.push(z * 50.0);
        colors.push(Math.random() * 255.0);
        colors.push(Math.random() * 255.0);
        colors.push(Math.random() * 255.0);
        colors.push(Math.random() * 255.0);
      }
    }
    let positionAttribute = new THREE.Float32BufferAttribute(positions, 3);
    const colorAttribute = new THREE.Float32BufferAttribute(colors, 4);
    colorAttribute.normalized = true;
    geometry.setAttribute('position', positionAttribute);
    geometry.setAttribute('color', colorAttribute);
    
    

    var ParamsShaderMaterial = {
      uniforms: {
        "time": {value: 1.0}
      },
      vertexShader: [
        "precision mediump float;",
        "attribute vec4 color;",
        "varying vec4 vColor;",
        "void main() {",
        "vColor = color;",
        "gl_PointSize = 1.5;",
        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
        "}"
      ].join( "\n" ),
      fragmentShader: [
        "precision mediump float;",
        "uniform float time;",
        "varying vec4 vColor;",
        "void main() {",
        "float t = time * 0.001;",
        "gl_FragColor = vec4( vColor.r * abs(sin(t)), vColor.g * abs(cos(t)), vColor.b * abs(sin(t)), 1.0 );",
        "}"
      ].join( "\n" ),
      side: THREE.DoubleSide,
      transparent: true,
      wireframe: true
    }
    const material = new THREE.ShaderMaterial(ParamsShaderMaterial);
    const mesh = new THREE.Points(geometry, material);
    this.scene.add(mesh);
  }
  addBox() {
    const geometry = new THREE.BoxGeometry(10, 10, 10);
    const material = new THREE.MeshLambertMaterial({color: 0xff0000,wireframe: true});
    this.cube = new THREE.Mesh(geometry, material);
    this.scene.add(this.cube);
  }
  addLight() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    this.scene.add(directionalLight);
    
    console.log('Lights added');
  }
  render() {
    const time = new Date().getTime() - this.startTime;
    this.controls.update();
    // this.marchingCubes.update(time);
    this.marchingCubes2.render(time);
    // this.renderer.render(this.scene, this.camera);
    // this.cube.rotation.x += 0.01;
    // this.cube.rotation.y += 0.01;
    this.effect.render();
  }
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.render();
  }
  resize(w: number, h: number) {
    const aspectRatio =  w / h;
    this.renderer.setSize(w, h);

    this.camera.aspect = aspectRatio;
    this.camera.updateProjectionMatrix();

    this.controls.handleResize();

    this.render();
  }
}

class App {
  public myScene: MyScene;
  public eventManager: EventManager;
  constructor() {
    this.myScene = new MyScene();
    this.eventManager = new $.EventManager();
    this.init();
  }
  init() {
    this.eventManager.add(document, 'DOMContentLoaded', this.loaded.bind(this));
    this.eventManager.add(window, 'resize', this.resize.bind(this));
  }
  animate() {
    this.myScene.animate = this.myScene.animate.bind(this.myScene);
    this.myScene.animate();
  }

  loaded() {
    $.addClass(document.body, 'loaded');
    this.resize();
    this.animate();
  }
  resize() {
    window.winW = window.innerWidth;
    window.winH = window.innerHeight;
    this.myScene.resize(window.winW, window.winH);
  }
}

declare global {
  interface Window { 
    app: App;
    winW: number;
    winH: number;
  }
}

window.app = new App();