// Wrapper for `setTimeout` that can be awaited.
// Resolve after a certain duration (in milliseconds).
export function delay(duration) {
  return new Promise(resolve => setTimeout(resolve, duration));
}

// Convert a binary number (string) to an int.
export function binToDec(bstr) {
  return parseInt((bstr + '').replace(/[^01]/gi, ''), 2);
}

export function animate(objToAnimate, target, options) {

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
