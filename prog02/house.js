
var gl;
var vertices;
var vertices2;
var program;
var bufferId;
var bufferId2;
var translation;
var translation2;
var downX;
var downY;
var mouseIsDown;

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );

    translation = vec4(0,0,0,0);
    translation2= vec4(0.0,0.0,0,0);

    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    
    // Four Vertices
    
    vertices = [
        vec2( -0.5, -0.5 ),
        vec2(  0.5, -0.5 ),
        vec2( -0.5,  0.5 ),
        vec2(  0.5,  0.5)
    ];

    // A 3D triangle

    vertices2 = [
        vec3( -0.75, -0.75,  0.5 ),
        vec3(  0.75, -0.75,  0.5 ),
        vec3(  0.0,   0.25, -0.5)
    ];

    // An array for colors 
    colors2 = [
        vec3(1.0, 0.0, 0.0),
	vec3(0.0, 1.0, 0.0),
	vec3(0.0, 0.0, 1.0)
    ];


    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    
    //  Load shaders and initialize attribute buffers
    
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Load the data into the GPU
    
    bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    bufferId2 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId2 );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices2), gl.STATIC_DRAW );

    bufferId2c = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId2c);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors2), gl.STATIC_DRAW);

    //Button Test
    document.getElementById("MyButton").onclick = function () {
        console.log("You clicked My Button!");
    };

    //Buttons to add/sub from z coordinates
    document.getElementById("zAdd").onclick = function() {

	translation2[2]= translation2[2]+0.1;
	console.log("Z coordinate +0.1");
    };

    document.getElementById("zSub").onclick = function() {

	translation[2] = translation2[2]-0.1;
	console.log("Z coordinate -0.1");
	
    };

    //Functions to allow triangle to be dragged 
    canvas.addEventListener("mousedown", doMouseDown);
    function doMouseDown(e) {
	var cursorX = e.clientX - canvas.offsetLeft;                                                              
        var cursorY = e.clientY - canvas.offsetTop;
	var clipX = cursorX * 2 / canvas.width - 1;
        var clipY = -(cursorY * 2 / canvas.height - 1);    
        downX = clipX;   
        downY = clipY;    
        mouseIsDown = true;
	};  
  
    canvas.addEventListener("mouseup", doMouseUp);
    function doMouseUp(e) {
	mouseIsDown = false;
	}; 

    canvas.addEventListener("mousemove", doMouseMove);
    function doMouseMove(e) {
	var cursorX = e.clientX - canvas.offsetLeft;
	var cursorY = e.clientY - canvas.offsetTop;
	var clipX = cursorX * 2 / canvas.width - 1;
	var clipY = -(cursorY * 2 / canvas.height - 1);
	if (mouseIsDown == true) {
	    translation2[0] = translation2[0] + (clipX - downX);
	    translation2[1] = translation2[1] + (clipY - downY);
	    downX = clipX;
	    downY = clipY;	   
	}


	console.log("Translation2 = " + translation2);

    };

    //Click to add vertices to house
    canvas.addEventListener("click", function (e) {
        var cursorX = e.clientX - canvas.offsetLeft;
        var cursorY = e.clientY - canvas.offsetTop;
        console.log("X: " + cursorX + " Y: " + cursorY);
        var clipX = cursorX * 2 / canvas.width - 1;
        var clipY = -(cursorY * 2 / canvas.height - 1);
        console.log("X: " + clipX + " Y: " + clipY);
	vertices.push(vec2(clipX, clipY));
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
	gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );
    });

	render();
};


function render() {
    gl.enable(gl.DEPTH_TEST)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
 //Render Square
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.vertexAttribPointer(vColor, 2, gl.FLOAT,false, 0,0);
    gl.enableVertexAttribArray(vColor);

    var colorLoc = gl.getUniformLocation(program, "color");
    var color = vec4(0.0, 1.0, 0.0, 1.0);
    gl.uniform4fv(colorLoc, flatten(color));

    var useColor = gl.getUniformLocation(program, "useColor");
    gl.uniform1i(useColor,1);
    
    var translationLoc = (gl.getUniformLocation(program, "translation"));
    gl.uniform4fv(translationLoc, flatten(translation));
   
   
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, vertices.length );

 //Render Triangle
  
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId2 );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
   
    var vColor = gl.getAttribLocation(program, "vColor"); 
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId2c);
    gl.vertexAttribPointer(vColor, 3, gl.FLOAT,false, 0,0); 
    gl.enableVertexAttribArray(vColor); 

    var colorLoc = gl.getUniformLocation(program, "color");
    var color = vec4(1.0,0.0,0.0,1.0);  
    gl.uniform4fv(colorLoc, flatten(color));
   
    var useColor = gl.getUniformLocation(program, "useColor");
    gl.uniform1i(useColor,0);
  

    var translationLoc = (gl.getUniformLocation(program, "translation"));
    gl.uniform4fv(translationLoc, flatten(translation2));


    gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertices2.length);
   
   
    requestAnimFrame( render )
}
