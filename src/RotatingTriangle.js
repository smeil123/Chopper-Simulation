var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n'+
  'uniform mat4 u_ModelMatrix;\n'+
  'void main() {\n'+
  ' gl_Position = u_ModelMatrix * a_Position;\n'+
  '}\n';

var FSHADER_SOURCE =
  'void main(){\n'+
  ' gl_FragColor = vec4(1.0,0.0,0.0,1.0);\n'+
  '}\n';

var ANGLE_STEP = 45.0;

function main(){
  var canvas = document.getElementById('webgl');

  var gl = getWebGLContext(canvas);
  if(!gl){
    console.log("failed to get the rendering context for webgl");
    return;
  }

  if(!initShaders(gl,VSHADER_SOURCE,FSHADER_SOURCE)){
    console.log("failed to initialize shaders");
    return;
  }

  var n =  initVertexBuffers(gl);
  if(n<0){
    console.log("failed to set the positions of the vertices");
    return;
  }

  //color buffer에 색을 넣는다, clear()메소드를 호출할 때 사용할 값을 지정
  //clearColor()로 color buffer에 색을 채워두고
  //clear()로 color buffer에 있는 색으로 설정한뒤 color buffer를 초기화``
  gl.clearColor(0.0,0.0,0.0,1.0);

  //vertex shader에서 사용되는 attribute variable설정
  var u_ModelMatrix = gl.getUniformLocation(gl.program,'u_ModelMatrix');
  if(!u_ModelMatrix){
    console.log("failed to get the storage location of u_ModelMatrix");
    return;
  }

  var currentAngle = 0.0;
  var modelMatrix = new Matrix4();

  // 주기적으로 호출하는 부분
  var tick = function(){
    currentAngle = animate(currentAngle); // angle값 계산
    draw(gl,n,currentAngle,modelMatrix,u_ModelMatrix);
    // 웹브라우저가 1초에 60번정도 호출해준다(단, 현재페이지가 보이지 않는경우에는 호출되지 않는다)
    requestAnimationFrame(tick,canvas); // tick을 주기적으로 호출
  };
  tick();
}

function initVertexBuffers(gl){
  var vertices = new Float32Array([
    0,0.5,-0.5,-0.5,0.5,-0.5
  ]);
  var n = 3;

  // 퍼버생성(webgl system에 저장된다)
  var vertexBuffer = gl.createBuffer();
  if(!vertexBuffer){
    console.log("failed to create the buffer object");
    return -1;
  }

  //타겟과 버퍼를 연결
  gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
  //버퍼에 데이터를 복사(CPU -> GPU) (static_draw는 자주사용되고 변경되지 않는다는 사용을 알려주는 것)
  gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);

  // vertex shader에서 vertext position에 대한 attribute variable이다.
  // 즉 a_Position은 attribute의 loaction(배열 index를 갖고있다)
  var a_Position = gl.getAttribLocation(gl.program,'a_Position');
  if(a_Position<0){
    console.log("failed to get the storage loation of a_position");
    return -1;
  }
  //  GPU에 복사한 데이터를 webgl이 사용하기 위해 필요한 정보를 넘겨준다
  // (index,size,type,normalized,stride,offset)
  // a_Position은 배열 index인데, 여기서 그 값들이 어떤 포맷으로 되어있는지 전달
  gl.vertexAttribPointer(a_Position,2,gl.FLOAT,false,0,0);
  //buffer obj를 사용하기 위해 enable(무조건 쓴다고 생각)
  gl.enableVertexAttribArray(a_Position);

  return n;
}

function draw(gl,n,currentAngle,modelMatrix,u_ModelMatrix){
  //z축을 기준으로 currentAngle만큼 회전
  modelMatrix.setRotate(currentAngle,0,0,1);

  //vertex shader의 uniform variable의 값을 설정해준다
  gl.uniformMatrix4fv(u_ModelMatrix,false,modelMatrix.elements);

  //clearColor()로 설정한 값으로 초기화
  // 즉 검은색으로 다 지워버린다
  gl.clear(gl.COLOR_BUFFER_BIT);

  //삼각형을 그린다
  gl.drawArrays(gl.TRIANGLES,0,n);
}
var g_last = Date.now();
function animate(angle){
  var now = Date.now();
  var elapsed = now - g_last; //바로 직전에 그린때와 시간차이를 구해서 angle을 계산
  g_last = now;
  var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
  return newAngle %= 360;
}
