var gl;
var program;
var cube;
var model2clip;
var translation = new PV(0,0,0,0);
window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    

    cube = new Cube(gl);

    // EXERCISE:  create all the matrices here.
    var model2object = new Mat();
    // model2object = model2object.times(Mat.translation(new PV(-1,-1,-1,0)));
    //model2object.times(new PV(2,3,1,1)); 
    // console.log("model2object is : \n" +model2object);
    model2object = Mat.translation(new PV(-1,-1,-1,0));
    var object2rotated = new Mat();
    var rotated2world = new Mat();
    rotated2world = Mat.translation(translation);
    console.log("rotated2world is : \n" + rotated2world);
    var world2view = new Mat();
    var view2proj = new Mat();
    //view2proj = Mat.scale(new PV(0,0,-.1,0));
    var proj2clip = new Mat();
    proj2clip = Mat.scale(canvas.height/canvas.width);
    var clip2canvas = new Mat();

    //    model2object = Mat.translation(new PV(0,0,0,0));

    model2clip = proj2clip.times(view2proj).times(world2view).times(rotated2world)
    .times(object2rotated).times(model2object);
    console.log("model2clip is : \n" +model2clip);


    document.getElementById("MyButton").onclick = function () {
        console.log("You clicked My Button!");
    };

    document.getElementById("ZPlus").onclick = function () {
        console.log("You clicked z + 0.1.");
	translation[2] = .1;
	console.log("translation at 2 : " + translation[2]);
	console.log("rotated2world at 22 is : " + rotated2world[2][2]);
	for (var i = 0; i < 3; i++) {
	    rotated2world[i][2] = rotated2world[i][2] + translation[2];

	}
	model2clip = proj2clip.times(view2proj).times(world2view).times(rotated2world)
	.times(object2rotated).times(model2object); 
    };

    document.getElementById("ZMinus").onclick = function () {
        console.log("You clicked z - 0.1.");
	console.log("You clicked z + 0.1.");
        translation[2] = -.1;
        console.log("translation at 2 : " + translation[2]);
        console.log("rotated2world at 22 is : "+ rotated2world[2][2]);
        for (var i = 0; i < 3; i++) {
            rotated2world[i][2] = rotated2world[i][2] + translation[2];

        }
        model2clip = proj2clip.times(view2proj).times(world2view).times(rotated2world)
        .times(object2rotated).times(model2object);
    };

    var clientX, clientY;
    var downWorld;
    var mouseIsDown = false;

    canvas.addEventListener("mousedown", function (e) {
        mouseIsDown = true;
        clientX = e.clientX;
        clientY = e.clientY;
        var cursorX = e.clientX - canvas.offsetLeft;
        var cursorY = e.clientY - canvas.offsetTop;
        console.log("X: " + cursorX + " Y: " + cursorY);
        var mouseCanvas = new PV(cursorX, cursorY, 0, true);
        // EXERCISE
	var mouseWorld = view2proj.times(mouseCanvas);
	downWorld = mouseWorld;
    });

    canvas.addEventListener("mouseup", function (e) {
        mouseIsDown = false;
    });

    canvas.addEventListener("mousemove", function (e) {
        if (!mouseIsDown)
            return;
        var cursorX = e.clientX - canvas.offsetLeft;
        var cursorY = e.clientY - canvas.offsetTop;
        console.log("X: " + cursorX + " Y: " + cursorY);
       	translation = translation.times(downWorld);
        // EXERCISE
    });

    window.onkeydown = function( event ) {
        var key = String.fromCharCode(event.keyCode);
        console.log("You typed " + key);
        if (event.shiftKey) {
            console.log("Shift is on.");
	    if(key == "X") {
		console.log("You did X");
		object2rotated = object2rotated.times(Mat.rotation(0, -0.1));
		model2clip = proj2clip.times(view2proj).times(world2view).times(rotated2world)
		    .times(object2rotated).times(model2object);
	    }
	    if(key == "Y") {
		console.log("You did Y");
		object2rotated = object2rotated.times(Mat.rotation(1, -0.1));
		model2clip = proj2clip.times(view2proj).times(world2view).times(rotated2world)
		    .times(object2rotated).times(model2object);
	    }
	    if(key == "Z") {
		console.log("You did Z");
		object2rotated = object2rotated.times(Mat.rotation(2, -0.1));
		model2clip = proj2clip.times(view2proj).times(world2view).times(rotated2world)
		    .times(object2rotated).times(model2object);
	    }

	}
	if(key == "X" && !event.shiftKey) {
	    console.log("You did X");
	    object2rotated = object2rotated.times(Mat.rotation(0, 0.1));
	    model2clip = proj2clip.times(view2proj).times(world2view).times(rotated2world)
		.times(object2rotated).times(model2object);
	}
        if(key == "Y" && !event.shiftKey) {
	   console.log("You did Y");
	   object2rotated = object2rotated.times(Mat.rotation(1, 0.1));
	   model2clip = proj2clip.times(view2proj).times(world2view).times(rotated2world)
	        .times(object2rotated).times(model2object);
	}
	if(key == "Z" && !event.shiftKey) {
	   console.log("You did Z");
	   object2rotated = object2rotated.times(Mat.rotation(2, 0.1));
	   model2clip = proj2clip.times(view2proj).times(world2view).times(rotated2world)
	     	.times(object2rotated).times(model2object); 
	}
        // EXERCISE
    };

    window.onresize = function (event) {
        console.log("resize " + canvas.width + " " + canvas.height);
    }

    render();
};


function render() {
    gl.enable(gl.DEPTH_TEST)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    var model2clipLoc = gl.getUniformLocation(program, "model2clip");
    gl.uniformMatrix4fv(model2clipLoc, false, model2clip.flatten());
    cube.render(gl, program);

    requestAnimFrame( render )
}
