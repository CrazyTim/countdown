class Countdown {

  constructor(container) {
    this.container = container;
  }

  init () {

    var p = this;

    // settings
    p.ringCount = 7;
    p.interval_stepAnimation = .15 * 1000
    p.interval_stepPause = .47 * 1000
    p.interval_stepShowRings = .08 * 1000 
    p.ringColor = 0xfad9b4;
    p.backgroundColor = 0x000000;
    p.groundColor = 0x191E32;
    p.ringTubeRadius = 2.8;
    p.ringRadius = 50;
    p.distanceBetweenRings = 18;

    p.scene = new THREE.Scene();
    p.initRenderer();
    p.initCamera();
    p.initLights();
    p.createRings();
    p.render();
    p.begin();

  };


  begin () {

    var p = this;

    p.stepCount = p.bin_to_dec("1".repeat(p.ringCount)) // calc the number of steps in the sequence for the given number of rings
    p.step = 1;
    p.circleState = 0;
    p.step_ringShow_count = 0;

    p.stepTimeout = setTimeout( function() { 
      p.step_showRings();
    }, p.interval_stepAnimation);

  }


  // make each ring visible progressively
  step_showRings (i) {
    
    var p = this;

    if (p.step_ringShow_count == p.ringCount) { 
      
      p.stepTimeout = setTimeout( function() { 
        p.step_flipAllRings();
      }, (p.interval_stepShowRings + p.interval_stepAnimation) * 1.5);

      return;

    }

    //console.log(p.step_ringShow_count);

    // animation to show ring
    p.rings[p.step_ringShow_count].position.y = 0;

    p.step_ringShow_count += 1;

    p.stepTimeout = setTimeout( function() { 
      p.step_showRings();
    }, p.interval_stepShowRings);

  }


  // flip all rings at the same time
  step_flipAllRings (i) {
    
    var p = this;

    for (var i = 0 ; i<p.ringCount ; ++i ) {
      p.animate_flipRing(i);
    }

    p.stepTimeout = setTimeout( function() { 
      p.nextStep();
    }, p.interval_stepPause);
   
  }


  animate_flipRing (i) {

      var p = this;

      var ring = p.rings[i];

      // animation to flip by 90 degrees 
      ring.animate_flip = p.animate(ring.rotation, {x: ring.rotation.x + THREE.Math.degToRad(90)}, {
        duration: p.interval_stepAnimation
      });

      ring.animate_flip.start();

  }


  // loop through each ring and animate it if required
  nextStep () {
 
    var p = this;
    var binaryString = (p.step).toString(2).split("").reverse().join(""); // convert to binary string and reverse

    for (var i=0; i < binaryString.length; i++) {
      
      var ii = i;
      var state = binaryString.charAt(i);
      
      
      if (p.rings[i].state != state) { // if the state of the ring is different, then we need to animate it to the correct state

        //console.log("switch: " + i + " > " + state);

        p.animate_flipRing(i);

        if (p.rings[i].state == "0") {
          p.rings[i].state = "1";

        } else {
          p.rings[i].state = "0";
        }
      }

      //console.log("ring: " + i + ", ring_state: " + p.rings[i].state);
     
    }

    // pause

    p.stepTimeout = setTimeout( function() { 
      p.step += 1;

      if (p.step <= p.stepCount) {
        p.nextStep();
      } else {
        p.endStep();
      }
    }, p.interval_stepPause);

  }


  endStep () {
    console.log("end");
  }


  initCamera () {

    var p = this;

    p.camera = new THREE.PerspectiveCamera( 75, p.container.clientWidth / p.container.clientHeight, 0.1, 3000 );
    p.camera.position.set(p.ringRadius *-1, 1000, -130);
    p.camera.rotation.set(THREE.Math.degToRad(-98), THREE.Math.degToRad(-16), 0);
    p.camera.zoom = 2.5;
    p.camera.updateProjectionMatrix();

  }


  initRenderer (callback) {

    var p = this;

    p.renderer = new THREE.WebGLRenderer({antialias: true});
    p.renderer.setSize( p.container.clientWidth, p.container.clientHeight );
    p.renderer.setClearColor( p.backgroundColor, 1 );
    p.renderer.domElement.id = "canvas3d";
    p.container.appendChild(p.renderer.domElement);

    // allow us to interact with the camera
    //p.renderer.domElement.addEventListener('mousedown', p.onMouseDown);
    //p.renderer.domElement.addEventListener('mousemove', p.onMouseMove);
    //p.renderer.domElement.addEventListener('mouseup', p.onMouseUp);

  }


  initLights () {

    var p = this;

    var lineM = new THREE.LineBasicMaterial({color: 0xffffff});
    var sphereG = new THREE.SphereGeometry( 3, 10, 10 );
    var sphereM = new THREE.MeshBasicMaterial( {color: 0xffff00} );

    var light = new THREE.DirectionalLight( 0xffffff, 1 );
    light.position.set( 0, 30, 55 );
    p.scene.add( light );

    /*var sphere = new THREE.Mesh( sphereG, sphereM );
    sphere.position.set( 0, 30, 55 );
    p.scene.add( sphere );

    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3( 0, 0, 0 ),new THREE.Vector3( 0, 30, 55 ));
    var line = new THREE.Line( geometry, lineM );
    p.scene.add( line );*/


    var light = new THREE.DirectionalLight( 0xffffff, 1 );
    light.position.set( 55, 30, 0 );
    p.scene.add( light );

    /*var sphere = new THREE.Mesh( sphereG, sphereM );
    sphere.position.set( 55, 30, 0 );
    p.scene.add( sphere );

    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3( 0, 0, 0 ),new THREE.Vector3( 55, 30, 0 ));
    var line = new THREE.Line( geometry, lineM );
    p.scene.add( line );*/

    var light = new THREE.DirectionalLight( 0xffffff, 1 );
    light.position.set( 0, 30, -55 );
    p.scene.add( light );

    /*var sphere = new THREE.Mesh( sphereG, sphereM );
    sphere.position.set( 0, 30, -55 );
    p.scene.add( sphere );

    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3( 0, 0, 0 ),new THREE.Vector3( 0, 30, -55 ));
    var line = new THREE.Line( geometry, lineM );
    p.scene.add( line );*/

    var light = new THREE.DirectionalLight( 0xffffff, 1 );
    light.position.set( -55, 30, 0 );
    p.scene.add( light );

    /*var sphere = new THREE.Mesh( sphereG, sphereM );
    sphere.position.set( -55, 30, 0 );
    p.scene.add( sphere );

    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3( 0, 0, 0 ),new THREE.Vector3( -55, 30, 0 ));
    var line = new THREE.Line( geometry, lineM );
    p.scene.add( line );*/


    // XYZ lines ----------------------------------------------------------------------------
    /*
    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3( 0, 0, 0 ),new THREE.Vector3( 0, 500, 0 ));
    var line = new THREE.Line( geometry, lineM );
    p.scene.add( line );

    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3( 0, 0, 0 ),new THREE.Vector3( 500, 0, 0 ));
    var line = new THREE.Line( geometry, lineM );
    p.scene.add( line );

    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3( 0, 0, 0 ),new THREE.Vector3( 0, 0, 500 ));
    var line = new THREE.Line( geometry, lineM );
    p.scene.add( line );
    */

  }


  createRings () {

    var p = this;

    p.rings = [];

    p.ringGroup = new THREE.Group();
    p.scene.add(p.ringGroup);

    var jumpDistance = ((p.ringRadius + (p.ringTubeRadius * 2)) * 2) + p.distanceBetweenRings;

    p.circleRadius = p.ringRadius - (p.ringTubeRadius * 2.5)

    // define materials
    p.material2 = new THREE.MeshStandardMaterial({
      color: p.ringColor, 
      shading:THREE.FlatShading, 
      roughness: .8, 
      metalness: .8,
      side: THREE.DoubleSide
    });

    p.material = new THREE.MeshPhongMaterial({
      color: p.ringColor
      //, emissive: 0xe8cb95
    });

    // define the ground
    var geometry = new THREE.PlaneBufferGeometry(2000, p.ringRadius * 7, 8,8);
    var material = new THREE.MeshBasicMaterial({
      color: p.groundColor, 
      side: THREE.DoubleSide, 
      transparent: true, 
      blending: THREE.SubtractiveBlending // nb: use subtractive blending and multiple layers to acheive a "depth" effect
    });
    
    for (var i = 0; i<40; i++) {

      p.ground = new THREE.Mesh( geometry, material );
      p.ground.position.set(0, i * -1.2,0);
      p.ground.rotation.x = THREE.Math.degToRad(90);
      p.scene.add(p.ground );

    }

    // define circle
    p.geometry = new THREE.CylinderGeometry( p.circleRadius, p.circleRadius, 1, 100 );
    p.circle = new THREE.Mesh(p.geometry, p.material);
    p.circle.position.x = jumpDistance * -1;
    p.circle.position.y = 1;
    p.scene.add(p.circle);

    // define the ring around the circle
    p.geometry = new THREE.TorusGeometry( p.ringRadius, p.ringTubeRadius, 20, 100 );
    p.ring = new THREE.Mesh(p.geometry, p.material);
    p.ring.position.x = jumpDistance * -1;
    p.ring.rotation.x = THREE.Math.degToRad(90);
    p.scene.add(p.ring);

    // define rings that will be animated
    for (var i = 0 ; i<p.ringCount ; ++i ) {

      p.geometry = new THREE.TorusGeometry( p.ringRadius, p.ringTubeRadius, 20, 100 );
      p.ring = new THREE.Mesh(p.geometry, p.material);
      p.ring.position.x = i * jumpDistance ;
      p.ring.position.y = 9000; // hide outside scene
      p.ring.rotation.x = THREE.Math.degToRad(90);
      p.ringGroup.add(p.ring);
      p.rings.push(p.ring);

      p.ring.state = "0";

    }

  }


  render () {
    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
    TWEEN.update();
  }


  onMouseMove (e) {

    var p = this;

    if (!p.mouseDown) {
      return;
    }

    e.preventDefault();

    var deltaX = e.clientX - p.mouseX;
    var deltaY = e.clientY - p.mouseY;
    p.mouseX = e.clientX;
    p.mouseY = e.clientY;

    p.rotateScene(deltaX, deltaY);
  }


  onMouseDown (e) {
    e.preventDefault();
    this.mouseDown = true;
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
  }


  onMouseUp (e) {
    e.preventDefault();
    this.mouseDown = false;
  }


  rotateScene (deltaX, deltaY) {
    this.scene.rotation.y += deltaX / 100;
    this.scene.rotation.x += deltaY / 100;
  }


  animate (objToAnimate, target, options) {

    options = options || {};

    var to = target || {};
    var easing = options.easing || TWEEN.Easing.Quadratic.In;
    var duration = options.duration || 2000;

    var tw = new TWEEN.Tween(objToAnimate)
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


  bin_to_dec (bstr) { 
    return parseInt((bstr + '').replace(/[^01]/gi, ''), 2);
  }

}
