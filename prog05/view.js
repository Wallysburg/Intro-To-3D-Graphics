var gl;
var program;
var cube;
var model2clip;

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


    // Make the center of the model the origin of the object.
    var modelT = new PV(-0.5, -0.5, -0.5, false);
    var model2object = Mat.translation(modelT);
    var object2model = Mat.translation(modelT.minus());
    
    // Give the object a small initial rotation in x and y.
    var object2rotated = Mat.rotation(1, 0.1).times(Mat.rotation(0, 0.1));
    var rotated2object = Mat.rotation(0, -0.1).times(Mat.rotation(1, -0.1));

    // Current translation of the object in the world.
    // var translation = new PV(0, 0, 0, false);
    // EXERCISE 1
    // Change z translation to -3.
    var translation = new PV(0, 0, -3, false);
    var rotated2world = Mat.translation(translation);
    var world2rotated = Mat.translation(translation.minus());

    var world2view = new Mat();
    var view2world = new Mat();

    // Clicking lookAt button sets world2view and view2world using
    // lookAt() function.
    document.getElementById("lookAt").onclick = function () {
        lookAt();
    };

    // Camera rotates to look at center of object, keeping its x-axis level.
    function lookAt () {
        // EXERCISE 4
        // eye position is (0,0,0) in view coordinates....
        // object center position is (0,0,0) in object coordinates....
        // Calculate view2world and world2view.
       	eye = view2world.times(new PV(true));
	object = rotated2world.times(new PV(true));

	console.log("eye is: " + eye);
	console.log("object is: " + object);
	var y = new PV(0,1,0,false);
	var vz = eye.minus(object).unit();
	console.log("vz :" + vz);

	var vx = y.cross(vz).unit();
	var vy = vz.cross(vx);

	var r = new Mat(vx, vy, vz);
	var rinv = r.transpose();
	console.log("r is : ", r);
	var eyeTrans = Mat.translation(eye);
	var minEyeTrans = Mat.translation(eye.minus());

	view2world = eyeTrans.times(r);
	world2view = rinv.times(minEyeTrans);
        console.log("view2world * world2view\n" +
                    view2world.times(world2view));
	updateM2C(); 
    }
        
    // Simple orthographic projection.
    var view2proj = Mat.scale(new PV(1, 1, -1, false));
    var proj2view = view2proj;
 
    // Display portion of view between z=-near and z=-far.
    var near = 2.0, far = 10.0;

    function setOrthographic () {
        // EXERCISE 1
        // Set view2proj and proj2view based on values of near and far
        // and the orthographic projection.
        // What value of z translates to 0?
        // How is z scaled so near to far goes to -1 to 1?
	view2proj = Mat.scale(new PV(1, 1, 2 / (near - far), true)).times
	                     (Mat.translation(new PV(0, 0, (near + far) /2, false)));
	proj2view = Mat.translation(new PV(0, 0, -(near+far)/2, false)).times
	                     (Mat.scale(new PV(1,1,(near-far)/2,true)));
        console.log("view2proj * proj2view\n" +
                    view2proj.times(proj2view));
        updateM2C();
    }

    function setPerspective () {
        // EXERCISE 6
        // Set view2proj and proj2view based on values of near and far
        // and the perspective projection.
        // Clicking My Button will switch between ortho and perspective.
	var x = -(far + near)/(far - near);
	var y = -2* far*near/(far-near);
	console.log(" x is :" +x);
	console.log("y is :" +y);
	view2proj = new Mat();
	view2proj[2][2] = x;
	view2proj[2][3] = y;
	view2proj[3][2] = -1;
	view2proj[3][3] = 0;
	proj2view = new Mat();
	proj2view[2][2] = 0;
	proj2view[2][3] = -1;
	proj2view[3][2] = 1/y;
	proj2view[3][3] = x/y;
        console.log("view2proj * proj2view\n" +
                    view2proj.times(proj2view));
        updateM2C();
    }
    var zoom = 1;
    var aspect = canvas.width / canvas.height;
    var proj2clip = Mat.scale(new PV(zoom / aspect, zoom, 1, true));
    var clip2proj = Mat.scale(new PV(aspect/zoom, 1/zoom, 1, true));

    // Zoom factor.
    // var aspectRatio = canvas.width/canvas.height;
    // var Scale = Mat.scale(new PV(zoom/aspectRatio, zoom, 1, true));
    //var InverseScale = Mat.scale(new PV(aspectRatio/ zoom, 1/zoom, 1, true));
    setOrthographic();
    updateM2C();
    function setZoom () {
        // EXERCISE 5
        // Set proj2clip and clip2proj based on zoom (and aspect ratio).
	proj2clip= Mat.scale(new PV(zoom/aspect, zoom, 1, true));
	clip2proj = Mat.scale(new PV(aspect/zoom, 1/zoom, 1, true));
        console.log("clip2proj * proj2clip\n" +
                    clip2proj.times(proj2clip));
        updateM2C();
    }

    var clip2canvas =
        Mat.scale(new PV(canvas.width / 2.0, -canvas.height / 2.0, 1, true))
        .times(Mat.translation(new PV(1, -1, 0, false)));
    var canvas2clip =
        Mat.translation(new PV(-1, 1, 0, false))
        .times(Mat.scale(new PV(2.0 / canvas.width, -2.0 / canvas.height, 1, true)));

    // EXERCISE 1
     setOrthographic();


    updateM2C();

    function updateM2C () {
        model2clip = proj2clip.times(view2proj).times(world2view).times(rotated2world).times(object2rotated).times(model2object);

        console.log("model2clip " + model2clip);
    }

    document.getElementById("slider").onchange = function(event) {
        console.log("slider " + event.target.value);
	zoom = event.target.value/100;
	console.log("zoom is : " + zoom);
	//      	proj2clip= Mat.scale(new PV(zoom/aspect, zoom, 1, true));
	// 	clip2proj = Mat.scale(new PV(aspect/zoom, 1/zoom, 1, true));
        // EXERCISE 5
        // Set zoom to go from 1 to 10 as slider goes through range.
        // Zoom slider should now work.
	//	clip2proj = Mat.scale(new PV(aspect/zoom, 1/zoom, 1, true));
			      // console.log("zoom " + zoom);
	//	updateM2C();
         setZoom();
    };

    var perspective = false;
    document.getElementById("MyButton").onclick = function () {
        console.log("You clicked My Button!");
        if (perspective)
            setPerspective();
        else
            setOrthographic();
        perspective = !perspective;
    };

    document.getElementById("ZPlus").onclick = function () {
        console.log("You clicked z + 0.1.");

        // EXERCISE 2
        // Change the following code to modify world2view and
        // view2world corresponding to moving the camera 0.1 in the
        // positive z direction.
	var trans1 = Mat.translation(new PV(0, 0, 0.1, false));
	var trans2 = Mat.translation(new PV(0, 0, -0.1, false));
        //translation[2] += 0.1;
	//rotated2world = Mat.translation(translation);
        //world2rotated = Mat.translation(translation.minus());
	world2view = trans2.times(world2view);
	view2world = view2world.times(trans1);
        console.log("world2view * view2world\n" +
                    world2view.times(view2world));
        updateM2C();
    };

    document.getElementById("ZMinus").onclick = function () {
        console.log("You clicked z - 0.1.");
        // EXERCISE 2
        // Change the following code to modify world2view and
        // view2world corresponding to moving the camera 0.1 in the
        // negative z direction.
        //translation[2] -= 0.1;
        //rotated2world = Mat.translation(translation);
        //world2rotated = Mat.translation(translation.minus());
	var trans1 = Mat.translation(new PV(0, 0, 0.1, false));
        var trans2 = Mat.translation(new PV(0, 0, -0.1, false));
	world2view = trans1.times(world2view);
        view2world = view2world.times(trans2);

        console.log("world2view * view2world\n" +
                    world2view.times(view2world));
        updateM2C();
    };

    var clientX, clientY;
    var downWorld;
    var mouseIsDown = false;

    canvas.addEventListener("mousedown", function (e) {
        clientX = e.clientX;
        clientY = e.clientY;
        var cursorX = e.clientX - canvas.offsetLeft;
        var cursorY = e.clientY - canvas.offsetTop;
        console.log("X: " + cursorX + " Y: " + cursorY);
        var clipX = cursorX * 2 / canvas.width - 1;
        var clipY = -(cursorY * 2 / canvas.height - 1);
        console.log("X: " + clipX + " Y: " + clipY);

        // EXERCISE 7
        // Transform center of object to canvas coordinates and
        // homogenenize (use .homogeneous()).

	var transCenter = clip2canvas.times(proj2clip.times(view2proj.times(world2view.times(translation.plus(new PV(true)))))).homogeneous();
        // CHANGE the following mouse click to use the z-coordinate of
        // center of object instead of zero.
        var mouseCanvas = new PV(cursorX, cursorY, transCenter[2], true);

        // Homogenize the following:
        var mouseWorld = view2world.times(proj2view.times(clip2proj.times(canvas2clip.times(mouseCanvas)))).homogeneous();

        downWorld = mouseWorld;
        mouseIsDown = true;
    });

    canvas.addEventListener("mouseup", function (e) {
        mouseIsDown = false;
        if (e.clientX == clientX && e.clientY == clientY) {
            var cursorX = e.clientX - canvas.offsetLeft;
            var cursorY = e.clientY - canvas.offsetTop;
            console.log("X: " + cursorX + " Y: " + cursorY);
            var clipX = cursorX * 2 / canvas.width - 1;
            var clipY = -(cursorY * 2 / canvas.height - 1);
            console.log("X: " + clipX + " Y: " + clipY);
        }
    });

    canvas.addEventListener("mousemove", function (e) {
        if (!mouseIsDown)
            return;
        var cursorX = e.clientX - canvas.offsetLeft;
        var cursorY = e.clientY - canvas.offsetTop;
        console.log("X: " + cursorX + " Y: " + cursorY);
        var clipX = cursorX * 2 / canvas.width - 1;
        var clipY = -(cursorY * 2 / canvas.height - 1);
        console.log("X: " + clipX + " Y: " + clipY);

        // EXERCISE 7
        // Same as in mousedown.
	var transCenter = clip2canvas.times(proj2clip.times(view2proj.times(world2view.
				  times(translation.plus(new PV(true)))))).homogeneous();

        var mouseCanvas = new PV(cursorX, cursorY, transCenter[2], true);
        var mouseWorld = view2world.times(proj2view.times(clip2proj.times(
                                  canvas2clip.times(mouseCanvas)))).homogeneous();

        translation = translation.plus(mouseWorld.minus(downWorld));
        downWorld = mouseWorld;

        rotated2world = Mat.translation(translation);
        world2rotated = Mat.translation(translation.minus());

        console.lot("rotated2world * world2rotated\n" +
                    rotated2world.times(world2rotated));
        updateM2C();
    });

    window.onkeydown = function( event ) {
        switch (event.keyCode) {
        case 37:
	var direction = event.keyCode - 37;
	var x = -0.1;
	var y = 0;
	console.log(direction);
            console.log('left');
            break;
        case 38:
	var direction =event.keyCode - 37;
	var x = 0;
	var y = 0.1;
        console.log(direction);
            console.log('up');
            break;
        case 39:
	var direction =event.keyCode - 37;
	var x = 0.1;
	var y = 0;
        console.log(direction);
            console.log('right');
            break;
        case 40:
	var direction =event.keyCode - 37;
	var x = 0;
	var y = -0.1;
        console.log(direction);
            console.log('down');
            break;
        };
	
	if(event.keyCode >= 37 && event.keyCode <= 40) {
	    //var direction = event.keyCode - 37;        
        // EXERCISE 3
        // Update world2view and view2world so that arrow keys move
        // the camera in the direction of the arrow by 0.1 units.
	var keyShiftMatrix = new PV(x, y, 0, false);
	world2view = Mat.translation(keyShiftMatrix.minus()).times(world2view);
	view2world = view2world.times(Mat.translation(keyShiftMatrix));
	updateM2C();
	} 
	// console.log(
        var key = String.fromCharCode(event.keyCode);
        var rotSign = event.shiftKey ? -1 : 1;
        console.log("You clicked " + key);
        switch( key ) {
        case 'X':
	    console.log("pressed x");
            object2rotated = Mat.rotation(0, 0.1 * rotSign).times(object2rotated);
            rotated2object = rotated2object.times(Mat.rotation(0, -0.1 * rotSign));
            break;
            
        case 'Y':
            object2rotated = Mat.rotation(1, 0.1 * rotSign).times(object2rotated);
            rotated2object = rotated2object.times(Mat.rotation(1, -0.1 * rotSign));
            break;
            
        case 'Z':
            object2rotated = Mat.rotation(2, 0.1 * rotSign).times(object2rotated);
            rotated2object = rotated2object.times(Mat.rotation(2, -0.1 * rotSign));
            break;
        }
        
        updateM2C();
    };

    window.onresize = function (event) {
        console.log("resize " + canvas.width + " " + canvas.height);
    }

    render();
};


function render() {
    gl.enable(gl.DEPTH_TEST)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var model2clipLoc = gl.getUniformLocation( program, "model2clip" );


    if (false) {
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    var colorLoc = gl.getUniformLocation( program, "color" );

    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId2 );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    var color2 = new PV(1.0, 1.0, 0.0, 1.0);
    gl.uniform4fv( colorLoc, color2.flatten());

    gl.drawArrays( gl.TRIANGLE_STRIP, 0, vertices2.length );
    }

    gl.uniformMatrix4fv(model2clipLoc, false, model2clip.flatten());

    cube.render(gl, program);

    requestAnimFrame( render )
}
