class Countdown {

  constructor(container) {
    this.container = container;
    this.init();
  }


  init() {

    // settings
    this.ringCount = 7;
    this.interval_stepAnimation = .15 * 1000;
    this.interval_stepPause = .47 * 1000;
    this.interval_stepShowRings = .08 * 1000;
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
    this.createRings();
    this.render();
    this.begin();

  };


  begin() {

    this.stepCount = this.bin_to_dec("1".repeat(this.ringCount)); // calc the number of steps in the sequence for the given number of rings
    this.step = 1;
    this.circleState = 0;
    this.step_ringShow_count = 0;

    this.stepTimeout = setTimeout( () => { 
      this.step_showRings();
    }, this.interval_stepAnimation);

  }


  // make each ring visible progressively
  step_showRings(i) {
    
    if (this.step_ringShow_count == this.ringCount) { 
      
      this.stepTimeout = setTimeout( () => { 
        this.step_flipAllRings();
      }, (this.interval_stepShowRings + this.interval_stepAnimation) * 1.5);

      return;

    }

    // animation to show ring
    this.rings[this.step_ringShow_count].position.y = 0;

    this.step_ringShow_count += 1;

    this.stepTimeout = setTimeout( () => { 
      this.step_showRings();
    }, this.interval_stepShowRings);

  }


  // flip all rings at the same time
  step_flipAllRings(i) {

    for (let i=0 ; i<this.ringCount ; ++i ) {
      this.animate_flipRing(i);
    }

    this.stepTimeout = setTimeout( () => { 
      this.nextStep();
    }, this.interval_stepPause);
   
  }


  animate_flipRing(i) {

      const ring = this.rings[i];

      // animation to flip by 90 degrees 
      ring.animate_flip = this.animate(
        ring.rotation, 
        {x: ring.rotation.x + THREE.Math.degToRad(90)}, 
        {duration: this.interval_stepAnimation}
      );

      ring.animate_flip.start();

  }


  // loop through each ring and animate it if required
  nextStep() {
 
    const binaryString = (this.step).toString(2).split("").reverse().join(""); // convert to binary string and reverse

    for (let i=0; i < binaryString.length; i++) {
      
      if (this.rings[i].state != binaryString.charAt(i)) { // if the state of the ring is different, then we need to animate it to the correct state

        //console.log("switch: " + i + " > " + state);

        this.animate_flipRing(i);

        if (this.rings[i].state == "0") {
          this.rings[i].state = "1";
        } else {
          this.rings[i].state = "0";
        }

      }

      //console.log("ring: " + i + ", ring_state: " + this.rings[i].state);
     
    }

    // pause
    this.stepTimeout = setTimeout( () => { 
      this.step += 1;

      if (this.step <= this.stepCount) {
        this.nextStep();
      } else {
        this.endStep();
      }
    }, this.interval_stepPause);

  }


  endStep() {
    console.log("end");
  }


  initCamera() {

    this.camera = new THREE.PerspectiveCamera( 75, this.container.clientWidth / this.container.clientHeight, 0.1, 3000 );
    this.camera.position.set(this.ringRadius *-1, 1000, -130);
    this.camera.rotation.set(THREE.Math.degToRad(-98), THREE.Math.degToRad(-16), 0);
    this.camera.zoom = 2.5;
    this.camera.updateProjectionMatrix();

  }


  initRenderer(callback) {

    this.renderer = new THREE.WebGLRenderer({antialias: true});
    this.renderer.setSize( this.container.clientWidth, this.container.clientHeight );
    this.renderer.setClearColor( this.backgroundColor, 1 );
    this.renderer.domElement.id = "canvas3d";
    this.container.appendChild(this.renderer.domElement);

    // allow us to interact with the camera
    //this.renderer.domElement.addEventListener('mousedown', this.onMouseDown);
    //this.renderer.domElement.addEventListener('mousemove', this.onMouseMove);
    //this.renderer.domElement.addEventListener('mouseup', this.onMouseUp);

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
    // XYZ lines ----------------------------------------------------------------------------
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

    // create the ground
    const groundGeometry = new THREE.PlaneBufferGeometry(2000, this.ringRadius * 7, 8,8);
    const groundMaterial = new THREE.MeshBasicMaterial({
      color: this.groundColor, 
      side: THREE.DoubleSide, 
      transparent: true, 
      blending: THREE.SubtractiveBlending // nb: use subtractive blending and multiple layers to acheive a "depth" effect
    });
    
    for (let i=0; i<40; i++) {
      this.ground = new THREE.Mesh( groundGeometry, groundMaterial );
      this.ground.position.set(0, i * -1.2,0);
      this.ground.rotation.x = THREE.Math.degToRad(90);
      this.scene.add(this.ground );
    }

    let geometry;

    // create start circle
    geometry = new THREE.CylinderGeometry( circleRadius, circleRadius, 1, 100 );
    const circle = new THREE.Mesh(geometry, ringMaterial);
    circle.position.x = jumpDistance * -1;
    circle.position.y = 1;
    this.scene.add(circle);

    // create the first ring around the start circle
    geometry = new THREE.TorusGeometry( this.ringRadius, this.ringTubeRadius, 20, 100 );
    let ring = new THREE.Mesh(geometry, ringMaterial);
    ring.position.x = jumpDistance * -1;
    ring.rotation.x = THREE.Math.degToRad(90);
    this.scene.add(ring);

    // create the other rings
    for (let i=0 ; i<this.ringCount ; ++i ) {
      geometry = new THREE.TorusGeometry( this.ringRadius, this.ringTubeRadius, 20, 100 );
      
      ring = new THREE.Mesh(geometry, ringMaterial);
      ring.position.x = i * jumpDistance ;
      ring.position.y = 9000; // hide outside scene
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

    this.mouseX = e.clientX;
    this.mouseY = e.clientY;

    const deltaX = e.clientX - this.mouseX;
    const deltaY = e.clientY - this.mouseY;

    this.rotateScene(deltaX, deltaY);

  }


  onMouseDown(e) {
    e.preventDefault();
    this.mouseDown = true;
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
  }


  onMouseUp(e) {
    e.preventDefault();
    this.mouseDown = false;
  }


  rotateScene(deltaX, deltaY) {
    this.scene.rotation.y += deltaX / 100;
    this.scene.rotation.x += deltaY / 100;
  }


  animate(objToAnimate, target, options) {

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


  bin_to_dec(bstr) { 
    return parseInt((bstr + '').replace(/[^01]/gi, ''), 2);
  }

}
