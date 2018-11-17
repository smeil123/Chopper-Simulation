// ColoredTriangle.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'varying vec4 v_Color;\n' +
  'uniform mat4 u_ModelMatrix;\n'+
  'void main() {\n' +
  '  gl_Position = u_ModelMatrix * a_Position;\n'+
  '  v_Color = a_Color;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';

var ANGLE_STEP = 45.0;
var bodyAngle = 0.0;
var current_ty = 0.0;
var change_angle = false;
var change_trans = false;

var modelMatrix = new Matrix4();
modelMatrix.setTranslate(0,0,0);
function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  //vertex shader에서 사용되는 attribute variable설정
  var u_ModelMatrix = gl.getUniformLocation(gl.program,'u_ModelMatrix');
  if(!u_ModelMatrix){
    console.log("failed to get the storage location of u_ModelMatrix");
    return;
  }

  // var modelMatrix = new Matrix4();
  var currentAngle = 0.0;

  canvas.onmousedown = function(ev){ click(ev, gl,n, currentAngle, modelMatrix,u_ModelMatrix); };
  window.onkeydown = handleKeyDown;

  // 주기적으로 호출하는 부분
  var tick = function(){
    currentAngle = animate(currentAngle); // angle값 계산
    handleKeys(); // 키입력값으로 angle,transpose값을 계산
    modelMatrix = draw(gl,n,currentAngle,modelMatrix,u_ModelMatrix);
    // 웹브라우저가 1초에 60번정도 호출해준다(단, 현재페이지가 보이지 않는경우에는 호출되지 않는다)
    requestAnimationFrame(tick,canvas); // tick을 주기적으로 호출
  };
  tick();
}
var presskey = {};
function handleKeyDown(ev) {
  console.log("keydown");
  // draw(gl,n,currentAngle,-0.01,modelMatrix,u_ModelMatrix);
  presskey[ev.keyCode] = true;
  console.log(ev.keyCode);
  console.log(String.fromCharCode(ev.keyCode));
  if (String.fromCharCode(ev.keyCode) == "F") {
    filter += 1;
    if (filter == 3) {
      filter = 0;
    }
  }
}
function handleKeys() {
  if (presskey[37]) {
    // Left cursor key
    // 시계방향으로 10도 회전
    console.log("bodyAngle= ",bodyAngle);
    change_angle = true;
    bodyAngle = 10.0;
    presskey[37] = false;
  }
  if (presskey[39]) {
    // Right cursor key
    // 반시계 방향으로 10도 회전
    console.log("bodyAngle= ",bodyAngle);
    change_angle = true;
    bodyAngle = -10.0;
    presskey[39] = false;
  }
  if (presskey[38]) {
    // Up cursor key
    // 0.05만큼 앞으로
    change_trans = true;
    current_ty = 0.05;
    presskey[38] = false;
  }
  if (presskey[40]) {
    // Down cursor key
    // 0.05만큼 뒤로
    change_trans = true;
    current_ty = -0.05;
    presskey[40] = false;  
  }
}

function initVertexBuffers(gl) {
  var verticesColors = new Float32Array([
    // Vertex coordinates and color
    0.0,  0.15,  1.0,  0.0,  0.0,
    -0.1, -0.1,  1.0,  0.0,  0.0,
    0.1, -0.1,  1.0,  0.0,  0.0,
    -0.02,  0.2,  0.0,  0.0,  1.0,
    -0.02, -0.2,  0.0,  0.0,  1.0,
    0.02, 0.2,  0.0,  0.0,  1.0,
    0.02,  -0.2,  0.0,  0.0,  1.0
  ]);
  var n = 7;

  // Create a buffer object
  console.log("initVertexBuffers")
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return false;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

  var FSIZE = verticesColors.BYTES_PER_ELEMENT;
  //Get the storage location of a_Position, assign and enable buffer
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 5, 0);
  gl.enableVertexAttribArray(a_Position);  // Enable the assignment of the buffer object

  // Get the storage location of a_Position, assign buffer and enable
  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if(a_Color < 0) {
    console.log('Failed to get the storage location of a_Color');
    return -1;
  }
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 5, FSIZE * 2);
  gl.enableVertexAttribArray(a_Color);  // Enable the assignment of the buffer object

  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  console.log("end initVertexBuffers")
  return n;
}
function draw(gl,n,currentAngle,modelMatrix,u_ModelMatrix){
  //z축을 기준으로 currentAngle만큼 회전

  //헬리콥터 몸체
  if(change_angle){
    modelMatrix.rotate(bodyAngle,0,0,1);
    change_angle = false;
  }else if(change_trans){
    modelMatrix.translate(0,current_ty,0);    
    change_trans = false;
   }
  gl.uniformMatrix4fv(u_ModelMatrix,false,modelMatrix.elements);

  //clearColor()로 설정한 값으로 초기화
  // 즉 검은색으로 다 지워버린다
  gl.clear(gl.COLOR_BUFFER_BIT);
  //삼각형을 그린다
  gl.drawArrays(gl.TRIANGLES,0,3);

  //프로펠러
  // modelMatrix.setTranslate(0,current_ty,0);
  var p_modelMatrix = new Matrix4();
  p_modelMatrix.set(modelMatrix);
  p_modelMatrix.rotate(currentAngle,0,0,1);
  //vertex shader의 uniform variable의 값을 설정해준다
  gl.uniformMatrix4fv(u_ModelMatrix,false,p_modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP,3,4);

  return modelMatrix;
}

var g_last = Date.now();

function animate(angle){
  var now = Date.now();
  var elapsed = now - g_last; //바로 직전에 그린때와 시간차이를 구해서 angle을 계산
  g_last = now;
  var newAngle = angle + (ANGLE_STEP * elapsed) / 100.0;
  return newAngle %= 360;
}
