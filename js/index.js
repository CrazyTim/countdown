import * as util from './util.js';
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r127/three.module.min.js';
import * as TWEEN from 'https://cdnjs.cloudflare.com/ajax/libs/tween.js/18.6.4/tween.esm.min.js';

const _ringCount = 7;
const _ringTubeRadius = 2.8;
const _ringRadius = 50;
const _distanceBetweenRings = 18;

const _color = {
  light: 0xffffff,
  ring: 0xfad9b4,
  background: 0x000000,
  ground: 0x191E32,
};

// Miliseconds.
const _duration = {
  beforeShow: 800,
  afterShowRing: .08 * 1000,
  beforeBeginFlipping: 500,
  step: .47 * 1000,
  flipRing: .15 * 1000,
};

const _lightPositions = [
  {x:0, y:30, z:55},
  {x:55, y:30, z:0},
  {x:0, y:30, z:-55},
  {x:-55, y:30, z:0},
];

class Countdown {

  constructor(container) {

    this.container = container;
    this.scene = new THREE.Scene();
    this.initRenderer();
    this.initCamera();
    this.initLights();
    this.registerEvents();
    this.createRings();
    this.render();
    this.begin();

  };

  async begin() {

    let step = 1;
    const stepCount = util.binToDec("1".repeat(_ringCount)); // The number of steps we need to take for the given number of rings.

    await util.delay(_duration.beforeShow);

    // Make each ring appear one after the other:
    for (const ring of this.rings) {
      ring.position.y = 0;
      await util.delay(_duration.afterShowRing);
    }

    await util.delay(_duration.beforeBeginFlipping);

    // Flip all rings once:
    for (const ring of this.rings) {
      this.animateFlipRing(ring);
    }

    await util.delay(_duration.step);

    do {

      // loop through rings and flip them if required...

      // Convert `step` to a binary string and reverse it.
      const binaryString =
        (step)
        .toString(2)
        .split("")
        .reverse()
        .join("");

      for (let i = 0; i < binaryString.length; i++) {

        // Check if the state of the ring is different, then we need to animate it to the correct state.
        if (this.rings[i].state != binaryString.charAt(i)) {

          this.animateFlipRing(this.rings[i]);

          if (this.rings[i].state == "0") {
            this.rings[i].state = "1";
          } else {
            this.rings[i].state = "0";
          }

        }

      }

      step += 1;

      await util.delay(_duration.step);

    } while (step <= stepCount);

    console.log("end");

  }

  // Flip ring by 90 degrees.
  animateFlipRing(ring) {

    ring.animate_flip = util.animateXyz(
      ring.rotation,
      {x: ring.rotation.x + THREE.Math.degToRad(90)},
      {duration: _duration.flipRing}
    );

  }

  initCamera() {

    this.camera = new THREE.PerspectiveCamera(75, this.container.clientWidth / this.container.clientWidth, 0.1, 3000);
    this.camera.position.set((_ringRadius *-1), 630, -130);
    this.camera.rotation.set(THREE.Math.degToRad(-98), THREE.Math.degToRad(-21), 0);
    this.camera.updateProjectionMatrix();

  }

  initRenderer() {

    this.renderer = new THREE.WebGLRenderer({antialias: true});
    this.renderer.setSize(this.container.clientWidth, this.container.clientWidth);
    this.renderer.setClearColor(_color.background, 1);
    this.renderer.domElement.id = "canvas3d";
    this.container.appendChild(this.renderer.domElement);

  }

  registerEvents() {

    window.onresize = e => this.onResize();

    // Allow user to interact with the camera:
    this.renderer.domElement.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.renderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.renderer.domElement.addEventListener('mouseup', this.onMouseUp.bind(this));

  }

  onResize() {
    this.renderer.setSize(this.container.clientWidth, this.container.clientWidth);
  }

  initLights() {

    for (const p of _lightPositions) {
      const l = new THREE.DirectionalLight(_color.lights, 1);
      l.position.set(p.x, p.y, p.z);
      this.scene.add(l);
    }

  }

  createRings() {

    this.rings = [];
    this.ringGroup = new THREE.Group();
    this.scene.add(this.ringGroup);

    const jumpDistance = ((_ringRadius + (_ringTubeRadius * 2)) * 2) + _distanceBetweenRings;
    const circleRadius = _ringRadius - (_ringTubeRadius * 2.5);

    const ringMaterial = new THREE.MeshPhongMaterial({
      color: _color.ring,
    });

    // Create the ground:
    const groundGeometry = new THREE.PlaneBufferGeometry(2000, _ringRadius * 7, 8, 8);
    const groundMaterial = new THREE.MeshBasicMaterial({
      color: _color.ground,
      side: THREE.DoubleSide,
      transparent: true,
      blending: THREE.SubtractiveBlending // Use subtractive blending and multiple layers to achieve a "depth" effect.
    });

    for (let i = 0; i < 40; i++) {
      this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
      this.ground.position.set(0, i * -1.2, 0);
      this.ground.rotation.x = THREE.Math.degToRad(90);
      this.scene.add(this.ground );
    }

    let geometry;

    // Create start circle:
    geometry = new THREE.CylinderGeometry(circleRadius, circleRadius, 1, 100);
    const circle = new THREE.Mesh(geometry, ringMaterial);
    circle.position.x = jumpDistance * -1;
    circle.position.y = 1;
    this.scene.add(circle);

    // Create the first ring around the start circle:
    geometry = new THREE.TorusGeometry(_ringRadius, _ringTubeRadius, 20, 100);
    let ring = new THREE.Mesh(geometry, ringMaterial);
    ring.position.x = jumpDistance * -1;
    ring.rotation.x = THREE.Math.degToRad(90);
    this.scene.add(ring);

    // Create the other rings:
    for (let i = 0; i < _ringCount; ++i ) {
      geometry = new THREE.TorusGeometry(_ringRadius, _ringTubeRadius, 20, 100);

      ring = new THREE.Mesh(geometry, ringMaterial);
      ring.position.x = i * jumpDistance;
      ring.position.y = 9000; // Hide outside scene.
      ring.rotation.x = THREE.Math.degToRad(90);
      ring.state = "0";

      this.ringGroup.add(ring);
      this.rings.push(ring);
    }

  }

  render() {
    this.renderer.render(this.scene, this.camera);
    TWEEN.update();
    requestAnimationFrame(this.render.bind(this));
  }

  onMouseMove(e) {
    if (!this.mouseDown) return;
    e.preventDefault();
    this.rotateScene(e.movementX, e.movementY);
  }

  onMouseDown(e) {
    e.preventDefault();
    this.mouseDown = true;
  }

  onMouseUp(e) {
    e.preventDefault();
    this.mouseDown = false;
  }

  rotateScene(deltaX, deltaY) {
    this.scene.rotation.y += deltaX / 100;
    this.scene.rotation.x += deltaY / 100;
  }

}

window.c = new Countdown(document.querySelector('body'));
