function simulation() {
  var elements = new Array();
  for (var i = 0; i < 16; i++) {
    elements.push({
      mass: 1,
      xPosition: Math.random() - 0.5,
      yPosition: Math.random() - 0.5,
      xVelocity: 0,
      yVelocity: 0,
      xAcceleration: 0,
      yAcceleration: 0,
    })
  }

  // inplace update
  function update(everything) {
    everything.forEach((outerValue, outerIndex) => {
      outerValue.xAcceleration = 0;
      outerValue.yAcceleration = 0;

      everything.forEach((innerValue, innerIndex) => {
        if (outerIndex != innerIndex) {
          var xDistance = outerValue.xPosition - innerValue.xPosition;
          var yDistance = outerValue.yPosition - innerValue.yPosition;
          var distance = xDistance * xDistance + yDistance * yDistance;
          var a = -0.0000001 * innerValue.mass / distance;
          outerValue.xAcceleration += (xDistance / Math.sqrt(distance)) * a;
          outerValue.yAcceleration += (yDistance / Math.sqrt(distance)) * a;
        }
      })
    })

    everything.forEach((outerValue, outerIndex) => {
      outerValue.xVelocity += outerValue.xAcceleration;
      outerValue.yVelocity += outerValue.yAcceleration;
      outerValue.xPosition += outerValue.xVelocity;
      outerValue.yPosition += outerValue.yVelocity;

    })
  }

  var myCanvas = document.getElementById("myCanvas")
  var context = myCanvas.getContext("webgl")

  var vertexShader = context.createShader(context.VERTEX_SHADER)
  context.shaderSource(vertexShader,
    `
      attribute vec4 a_position;
      void main() {
        gl_Position = a_position;
        gl_PointSize = 10.0;
      }
    `
  )
  context.compileShader(vertexShader)

  var fragmentShader = context.createShader(context.FRAGMENT_SHADER)
  context.shaderSource(fragmentShader,
    `
      precision mediump float;
      void main() {
        gl_FragColor = vec4(1, 0, 0.5, 1);
      }
    `
  )
  context.compileShader(fragmentShader)

  var program = context.createProgram();
  context.attachShader(program, vertexShader);
  context.attachShader(program, fragmentShader);
  context.linkProgram(program);

  window.requestAnimationFrame(handler);

  function handler() {
    update(elements);
    var position = new Array();

    elements.forEach((current) => {
      position.push(current.xPosition);
      position.push(current.yPosition);
    })
    animation(position);

    window.requestAnimationFrame(handler);
  }

  function animation(positions) {
    var positionAttributeLocation = context.getAttribLocation(program, "a_position");
    var positionBuffer = context.createBuffer();
    context.bindBuffer(context.ARRAY_BUFFER, positionBuffer);
    context.bufferData(context.ARRAY_BUFFER, new Float32Array(positions), context.STATIC_DRAW);

    context.viewport(0, 0, context.canvas.width, context.canvas.height);
    context.clearColor(0, 0, 0, 0);
    context.clear(context.COLOR_BUFFER_BIT);

    var size = 2;
    var type = context.FLOAT;
    var normalize = false;
    var stride = 0;
    var offset = 0;
    context.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
    context.enableVertexAttribArray(positionAttributeLocation);

    context.useProgram(program);

    var offset = 0;
    var count = 16;
    context.drawArrays(context.POINTS, offset, count);
  }
}
