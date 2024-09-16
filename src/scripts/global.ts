import { Tweakable } from './modules/Tweakable';
import * as $ from './modules/Util';
import type { EventManager } from './modules/Util';
import * as THREE from 'three';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
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
  constructor() {
    this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
    });

    this.devicePixelRatio = window.devicePixelRatio;
    this.renderer.setPixelRatio(this.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.scene = new THREE.Scene();
    this.startTime = new Date().getTime() + Math.random() * 40000; // start timeをランダムにする。
    this.init();
  }
  init() {
    this.addCamera();
    this.addControls(this.camera, this.renderer);
    this.addBox();
    this.addLight();
  }
  addCamera() {
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    this.camera.position.z = 100;
    this.camera.lookAt(0, 0, 0);
  }
  addControls(camera: THREE.Camera, renderer: THREE.WebGLRenderer) {
    this.controls = new TrackballControls(camera, renderer.domElement);
  }
  addBox() {
    const geometry = new THREE.BoxGeometry(10, 10, 10);
    const material = new THREE.MeshBasicMaterial();
    const cube = new THREE.Mesh(geometry, material);
    this.scene.add(cube);
  }
  addLight() {
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(10, 10, 10);
    this.scene.add(light);
  }
  render() {
    const time = new Date().getTime() - this.startTime;
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
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