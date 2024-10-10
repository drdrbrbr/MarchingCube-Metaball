import { Tweakable } from './modules/Tweakable';
import * as $ from './modules/Util';
import type { EventManager } from './modules/Util';
import * as THREE from 'three';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
import { MarchingCubes } from './MarchingCubes';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { BokehPass, type BokehPassParamters } from 'three/addons/postprocessing/BokehPass.js';

class MyScene extends Tweakable{
  private scene: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private devicePixelRatio: number;
  private canvas: HTMLCanvasElement;
  private controls!: TrackballControls;
  private startTime: number;
  private marchingCubes: MarchingCubes;
  private effect!: EffectComposer;
  private bokehPass!: BokehPass;
  private bokehPassParams!: BokehPassParamters;
  private focus: number = 100;
  private aperture: number = 0.005;
  private maxblur: number = 0.01;
  private debugCubes: THREE.Mesh[] = [];
  private debugCubeFlg: boolean = false;
  private isStop: boolean = false;
  constructor() {
    super();
    this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
    });

    this.devicePixelRatio = window.devicePixelRatio;
    this.renderer.setPixelRatio(this.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0xffffff);

    this.scene = new THREE.Scene();
    this.startTime = new Date().getTime() + Math.random() * 40000; // start timeをランダムにする。

    this.init();
    this.marchingCubes = new MarchingCubes(this.renderer, this.scene, this.camera);
    
    this.initSetTweakable();
    
  }
  init() {
    this.addCamera();
    console.log(this.bokehPassParams)
    
    this.addControls(this.camera, this.renderer);
    // this.addLight();  // この行を追加
    this.addDebugCubes();
    this.addLight();
    // this.addPostEffect();
  }
  initSetTweakable() {
    this.pane = this.marchingCubes.pane
    this.folder = this.marchingCubes.folder
    this.setupProp('debugCubeFlg', {type: 'boolean',label: "グリッドキューブ"});
    this.setupProp('isStop', {type: 'boolean', label: "停止"});
  }
  change() {
    super.change()
    // this.bokehPass.uniforms['focus'].value = this.focus;
    // this.bokehPass.uniforms['aperture'].value = this.aperture;
    // this.bokehPass.uniforms['maxblur'].value = this.maxblur;

    this.debugCubes.forEach((cube) => {
      cube.visible = this.debugCubeFlg;
    });
  }
  addDebugCubes(cubeColNum: number = 10, cubeRowNum: number = 10, cubeDepthNum: number = 10) {
    this.setupProp('debugCubeFlg', {type: 'boolean'});
    const geometry = new THREE.BoxGeometry(5, 5, 5);
    const material = new THREE.MeshNormalMaterial();
    for (let i = 0; i < cubeColNum; i++) {
      for (let j = 0; j < cubeRowNum; j++) {
        for (let k = 0; k < cubeDepthNum; k++) {
          const cube = new THREE.Mesh(geometry, material);
          cube.scale.set(5,5,5);
          cube.position.set(i * 200 - 1000, j * 200 - 1000, k * 200 - 1000);
          this.scene.add(cube);
          this.debugCubes.push(cube);
        }
      }
    }
    this.debugCubes.forEach((cube) => {
      cube.visible = this.debugCubeFlg;
    });
  }
  addPostEffect() {
    const renderPass = new RenderPass(this.scene, this.camera);
    this.effect = new EffectComposer(this.renderer);
  
    this.effect.addPass(renderPass);
    // this.bokehPassParams = {
    //   focus: 100,
    //   aperture: 0.005,
    //   maxblur: 0.01,
    //   aspect: window.innerWidth / window.innerHeight
    // };
    this.focus = 934
    this.aperture = .0001
    this.maxblur = 0.0025
    console.log(this.bokehPassParams)
    this.bokehPass = new BokehPass(this.scene, this.camera, {
      focus: this.focus,  // カメラの位置に合わせて調整
      aperture: this.aperture,
      maxblur: this.maxblur,
      aspect: window.innerWidth / window.innerHeight
    });

    console.log(this.bokehPass)
    this.setupProp('focus', {min: 0, max: 2000});
    this.setupProp('aperture', {min: 0, max: .010000,
      format: (v: number) => v.toFixed(4),
    });
    this.setupProp('maxblur', {min: 0, max: 0.02});
    
    this.effect.addPass(this.bokehPass);
    this.effect.render();
  }
  addCamera() {
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 10000);
    this.camera.position.set(0, 0, 1000);  // カメラの位置を少し後ろに下げる
    this.camera.lookAt(0, 0, 0);
    this.camera.updateProjectionMatrix();
  }
  addControls(camera: THREE.Camera, renderer: THREE.WebGLRenderer) {
    this.controls = new TrackballControls(camera, renderer.domElement);
  }
  
  addLight() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    this.scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    this.scene.add(directionalLight);
    
  }
  render() {
    if(this.isStop) return;
    const time = new Date().getTime() - this.startTime;
    this.controls.update();
    this.marchingCubes.update(time);
    this.renderer.render(this.scene, this.camera);
    // this.effect.render();
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