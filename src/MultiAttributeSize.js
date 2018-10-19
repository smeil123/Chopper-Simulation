var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n'+
  'attribute float a_PointSize;\n'+
  'void main() {\n'+
  ' gl_Position = a_Position;\n'+
  ' gl_PointSize = a_PointSize;\n'+
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

  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.drawArrays(gl.POINTS,0,n);
}

function initVertexBuffers(gl){
  var vertices = new Float32Array([
    0.0,0.5,10.0,
    -0.5,-0.5,20.0,
    0.5,-0.5,30.0
  ]);
  var n = 3;
  var FSIZE = vertices.BYTES_PER_ELEMENT;
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

  //(index,size,type,normalized,stride,offset)
  gl.vertexAttribPointer(a_Position,2,gl.FLOAT,false,FSIZE*3,0);
  //buffer obj를 사용하기 위해 enable(무조건 쓴다고 생각)
  gl.enableVertexAttribArray(a_Position);

  var a_PointSize = gl.getAttribLocation(gl.program,'a_PointSize');
  if(a_PointSize<0){
    console.log("failed to get the storage loation of a_position");
    return -1;
  }

  gl.vertexAttribPointer(a_PointSize,1,gl.FLOAT,false,FSIZE*3,FSIZE*2);
  gl.enableVertexAttribArray(a_PointSize);

  return n;
}
