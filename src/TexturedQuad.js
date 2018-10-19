var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n'+
  'attribute vec2 a_TexCoord;\n'+
  'varying vec2 v_TexCoord;\n'+
  'void main(){\n'+
  ' gl_Position = a_Position;\n'+
  ' v_TexCoord = a_TexCoord;\n'+
  '}\n';

var FSHADER_SOURCE =
  'precision mediump float;\n'+
  'uniform sampler2D u_Sampler;\n'+
  'varying vec2 v_TexCoord;\n'+
  'void main(){\n'+
  ' gl_FragColor = texture2D(u_Sampler, v_TexCoord);\n'+
  '}\n';

function main(){
  var canvas = document.getElementById('webgl');

  var gl = getWebGLContext(canvas);
  if(!gl){
    console.log("failed to get the rendering context for webgl")
    return ;
  }

  if(!initShaders(gl,VSHADER_SOURCE,FSHADER_SOURCE)){
    console.log('failed to initialize shader');
    return;
  }

  var n = initVertexBuffers(gl);
  if(n<0){
    console.log('failed to set the vertex information');
    return ;
  }
  gl.clearColor(0.0,0.0,0.0,1.0);

  if(!initTexture(gl,n)){
    console.log("failed to initialize the texture.");
    return;
  }
}

function initVertexBuffers(gl){
  var verticesTexCoords = new Float32Array([
    -0.5,0.5,0.0,1.0,
    -0.5,-0.5,0.0,0.0,
    0.5,0.5,1.0,1.0,
    0.5,-0.5,1.0,0.0
  ]);
  var n = 4;

  var vertexTexCoordBuffer = gl.createBuffer();
  if(!vertexTexCoordBuffer){
    console.log("failed to create the buffer object");
    return -1;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER,vertexTexCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,verticesTexCoords,gl.STATIC_DRAW);

  var FSIZE = verticesTexCoords.BYTES_PER_ELEMENT;

  var a_Position = gl.getAttribLocation(gl.program,'a_Position');
  if(a_Position<0){
    console.log("failed to get the storage location of a_position");
    return -1;
  }
  gl.vertexAttribPointer(a_Position,2,gl.FLOAT,false,FSIZE*4,0);
  gl.enableVertexAttribArray(a_Position);

  var a_TexCoord = gl.getAttribLocation(gl.program,'a_TexCoord');
  if(a_TexCoord<0){
    console.log('failed to get the storage location of a_texcoord');
    return ;
  }

  gl.vertexAttribPointer(a_TexCoord,2,gl.FLOAT,false,FSIZE*4,FSIZE*2);
  gl.enableVertexAttribArray(a_TexCoord);

  return n;
}
function initTexture(gl,n){
  //버퍼랑 비슷하다
  var texture = gl.createTexture();
  if(!texture){
    console.log('failed to create the texture object');
    return false;
  }
  var u_Sampler = gl.getUniformLocation(gl.program,'u_Sampler');
  if(!u_Sampler){
    console.log("failed to get the storage location of u_sampler");
  }
  var image = new Image();
  if(!image){
    console.log("failed to create the image object");
    return false;
  }
  // 이미지 핸들러를 설정한다
  image.onload = function(){loadTexture(gl,n,texture,u_Sampler,image);}; //이미지가 다 로딩된 후 loadTexture실행
  image.src = "./body.jpg"; // 소스를 정해주면 load된다 (비동기적)

  return true;
}
function loadTexture(gl,n,texture,u_Sampler,image){
  //픽셀저장모드를 지정한다(이미지 coordinate와 webgl coordinate가 다르기때문에 필요하다)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,1);
  // 2단계로 bind한다
  // 바인드하고자 하는 target이 들어있는 texture unit을 active한다
  // 한번에 1개의 texture unit만 active될 수 있다.(active함수를 호출하지 않으면 default는 texture0)
  gl.activeTexture(gl.TEXTURE0);
  //현재 active한 texture unit과 texture obj를 bind한다
  gl.bindTexture(gl.TEXTURE_2D,texture);
  //매핑되는 픽셀수가 다를경우 어떻게 정보를 가져올지 정한다 -> TEXTURE_MIN_FILTER
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
  //image data를 cpu에서 gpu로 업로드
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,image);

  gl.uniform1i(u_Sampler,0);

  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.drawArrays(gl.TRIANGLE_STRIP,0,n);
}
