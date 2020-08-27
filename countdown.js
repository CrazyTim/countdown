class Countdown {

  constructor(container) {

    this.container = container;

    // settings
    this.ringCount = 7;
    this.duration = {
      beforeShow: 800,
      afterShowRing: .08 * 1000,
      beforeBeginFlipping: 500,
      step: .47 * 1000,
      flipRing: .15 * 1000,
    };
    this.ringColor = 0xfad9b4;
    this.backgroundColor = 0x000000;
    this.groundColor = 0x191E32;
    this.ringTubeRadius = 2.8;
    this.ringRadius = 50;
    this.distanceBetweenRings = 18;

    // begin
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

    // Calc the number of steps we need to take for the given number of rings:
    this.stepCount = binToDec("1".repeat(this.ringCount));

    this.step = 1;// Calc the number of steps in the sequence for the given number of rings

    await delay(this.duration.beforeShow);

    // Make each ring appear one after the other:
    for (var i = 0; i < this.ringCount; i++) {
      this.rings[i].position.y = 0;
      await delay(this.duration.afterShowRing);
    }

    await delay(this.duration.beforeBeginFlipping);

    // Flip all rings once:
    for (let i = 0; i < this.ringCount; ++i ) {
      this.flipRing(i);
    }

    await delay(this.duration.step);

    do {

      // loop through rings and flip them if required...

      // Convert `this.step` to a binary string and reverse.
      const binaryString =
        (this.step)
        .toString(2)
        .split("")
        .reverse()
        .join("");

      for (let i = 0; i < binaryString.length; i++) {

        // Check if the state of the ring is different, then we need to animate it to the correct state.
        if (this.rings[i].state != binaryString.charAt(i)) {

          //console.log("switch: " + i + " > " + state);

          this.flipRing(i);

          if (this.rings[i].state == "0") {
            this.rings[i].state = "1";
          } else {
            this.rings[i].state = "0";
          }

        }

        //console.log("ring: " + i + ", ring_state: " + this.rings[i].state);

      }

      this.step += 1;

      await delay(this.duration.step);

    } while (this.step <= this.stepCount);

    console.log("end");

  }

  // Animate ring flip by 90 degrees.
  flipRing(i) {

      const ring = this.rings[i];

      ring.animate_flip = animate(
        ring.rotation,
        {x: ring.rotation.x + THREE.Math.degToRad(90)},
        {duration: this.duration.flipRing}
      );

      ring.animate_flip.start();

  }

  initCamera() {

    this.camera = new THREE.PerspectiveCamera( 75, this.container.clientWidth / this.container.clientWidth, 0.1, 3000 );
    this.camera.position.set((this.ringRadius *-1), 630, -130);
    this.camera.rotation.set(THREE.Math.degToRad(-98), THREE.Math.degToRad(-21), 0);
    this.camera.updateProjectionMatrix();

  }

  initRenderer(callback) {

    this.renderer = new THREE.WebGLRenderer({antialias: true});
    this.renderer.setSize(this.container.clientWidth, this.container.clientWidth);
    this.renderer.setClearColor( this.backgroundColor, 1 );
    this.renderer.domElement.id = "canvas3d";
    this.container.appendChild(this.renderer.domElement);

  }

  registerEvents() {

    window.onresize = () => this.onResize();

    // Allow user to interact with the camera:
    this.renderer.domElement.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.renderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.renderer.domElement.addEventListener('mouseup', this.onMouseUp.bind(this));

  }

  onResize() {
    this.renderer.setSize(this.container.clientWidth, this.container.clientWidth);
  }

  initLights() {

    let light;

    light = new THREE.DirectionalLight( 0xffffff, 1 );
    light.position.set( 0, 30, 55 );
    this.scene.add( light );

    light = new THREE.DirectionalLight( 0xffffff, 1 );
    light.position.set( 55, 30, 0 );
    this.scene.add( light );

    light = new THREE.DirectionalLight( 0xffffff, 1 );
    light.position.set( 0, 30, -55 );
    this.scene.add( light );

    light = new THREE.DirectionalLight( 0xffffff, 1 );
    light.position.set( -55, 30, 0 );
    this.scene.add( light );

    /*
    // ------------------------------------------------
    // XYZ lines
    // ------------------------------------------------
    let geometry;
    let line;

    geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3( 0, 0, 0 ),new THREE.Vector3( 0, 500, 0 ));
    line = new THREE.Line( geometry, lineM );
    this.scene.add( line );

    geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3( 0, 0, 0 ),new THREE.Vector3( 500, 0, 0 ));
    line = new THREE.Line( geometry, lineM );
    this.scene.add( line );

    geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3( 0, 0, 0 ),new THREE.Vector3( 0, 0, 500 ));
    line = new THREE.Line( geometry, lineM );
    this.scene.add( line );
    */

  }

  createRings() {

    this.rings = [];
    this.ringGroup = new THREE.Group();
    this.scene.add(this.ringGroup);

    const jumpDistance = ((this.ringRadius + (this.ringTubeRadius * 2)) * 2) + this.distanceBetweenRings;
    const circleRadius = this.ringRadius - (this.ringTubeRadius * 2.5);

    const ringMaterial = new THREE.MeshPhongMaterial({
      color: this.ringColor
      //, emissive: 0xe8cb95
    });

    // Create the ground:
    const groundGeometry = new THREE.PlaneBufferGeometry(2000, this.ringRadius * 7, 8,8);
    const groundMaterial = new THREE.MeshBasicMaterial({
      color: this.groundColor,
      side: THREE.DoubleSide,
      transparent: true,
      blending: THREE.SubtractiveBlending // Use subtractive blending and multiple layers to acheive a "depth" effect.
    });

    for (let i = 0; i < 40; i++) {
      this.ground = new THREE.Mesh( groundGeometry, groundMaterial );
      this.ground.position.set(0, i * -1.2,0);
      this.ground.rotation.x = THREE.Math.degToRad(90);
      this.scene.add(this.ground );
    }

    let geometry;

    // Create start circle.
    geometry = new THREE.CylinderGeometry( circleRadius, circleRadius, 1, 100 );
    const circle = new THREE.Mesh(geometry, ringMaterial);
    circle.position.x = jumpDistance * -1;
    circle.position.y = 1;
    this.scene.add(circle);

    // Create the first ring around the start circle.
    geometry = new THREE.TorusGeometry( this.ringRadius, this.ringTubeRadius, 20, 100 );
    let ring = new THREE.Mesh(geometry, ringMaterial);
    ring.position.x = jumpDistance * -1;
    ring.rotation.x = THREE.Math.degToRad(90);
    this.scene.add(ring);

    // Create the other rings.
    for (let i = 0; i < this.ringCount; ++i ) {
      geometry = new THREE.TorusGeometry( this.ringRadius, this.ringTubeRadius, 20, 100 );

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
    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
    TWEEN.update();
  }

  onMouseMove(e) {
    if (!this.mouseDown) { return }
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

// ------------------------------------------------
// Generic functions:
// ------------------------------------------------

// Wrapper for `setTimeout` that can be awaited.
// Resolve after a certain duration (in milliseconds).
function delay(duration) {
  return new Promise(resolve => setTimeout(resolve, duration));
}

// Convert a binary number (string) to an int.
function binToDec(bstr) {
  return parseInt((bstr + '').replace(/[^01]/gi, ''), 2);
}

function animate(objToAnimate, target, options) {

  options = options || {};
  const to = target || {};
  const easing = options.easing || TWEEN.Easing.Quadratic.In;
  const duration = options.duration || 2000;

  const tw = new TWEEN.Tween(objToAnimate)
    .to({x: to.x, y: to.y, z: to.z}, duration)
    .easing(easing)
    .onUpdate(function(d) {
      if(options.update){
        options.update(d);
      }
    })
    .onComplete(function(){
      if(options.callback) options.callback();
    });

  return tw;

}
