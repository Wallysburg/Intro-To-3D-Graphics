/*
  function PV (isPoint) {
  function PV (x, y, z, isPoint)
  function PV (x, y, z, w)
*/
function PV (x, y, z, w) {
    var v = [0, 0, 0, 0];

    if (typeof x === "boolean") {
        // function PV (isPoint)
	if (x)
	    v[3] = 1;
    }
    else if (typeof x === "number" &&
             typeof y === "number" &&
             typeof z === "number") {
	v[0] = x;
	v[1] = y;
	v[2] = z;
	if (typeof w === "number")
            v[3] = w;
        else if (typeof w === "boolean") {
            if (w) 
	        v[3] = 1;
        }
        else
            throw "Illegal Argument";
    }
    else
        throw "Illegal Argument";
    
    v.__proto__ = PV.prototype;

    return v;  
}

PV.prototype = Object.create(Array.prototype);

PV.prototype.constructor = PV;

PV.prototype.toString = function () {
    return "[ " + this[0] + " " + this[1] + " " + this[2] + " " + this[3] + " ]";

}

PV.prototype.isVector = function () {
    return this[3] == 0;
}

PV.prototype.isPoint = function () {
    return this[3] != 0;
}

PV.prototype.flatten = function () {
    var floats = new Float32Array( 4 );
    for (var i = 0; i < 4; i++)
        floats[i] = this[i];
    return floats;
}

function Mat(c1, c2, c3, c4) {
    var cols = [ c1, c2, c3, c4 ];
    
    var mat = [new PV(1, 0, 0, 0),
               new PV(0, 1, 0, 0),
               new PV(0, 0, 1, 0),
               new PV(0, 0, 0, 1)];
    
    for (var j = 0; j < 4; j++) {
        if (cols[j] === undefined)
            break;
        if (!(cols[j] instanceof PV))
            throw "Illegal Argument";
        
        for (var i = 0; i < 4; i++)
            mat[i][j] = cols[j][i];
    }
    
    mat.__proto__ = Mat.prototype;

    return mat;
}

Mat.prototype = Object.create(Array.prototype);
Mat.prototype.constructor = Mat;

Mat.prototype.toString = function () {
    return this[0].toString() + "\n" + 
        this[1].toString() + "\n" + 
        this[2].toString() + "\n" + 
        this[3].toString() + "\n";
}

Mat.prototype.flatten = function () {
    var floats = new Float32Array( 16 );
    var n = 0;
    for (var j = 0; j < 4; j++)
        for (var i = 0; i < 4; i++)
            floats[n++] = this[i][j];
    return floats;
}

PV.prototype.plus = function (that) {
    if (that instanceof PV) {
        return new PV(this[0] + that[0],
                      this[1] + that[1],
                      this[2] + that[2],
                      this[3] + that[3]);
    }
    else {
        console.log("illegal argument");
        throw "Illegal Argument";
    }
}

// (2, -1, 3, 1) times -2 equals (-4, 2, -6, -2)
// (2, -1, 3, 1) times (3, 2, 5, 0) equals (6, -2, 15, 0)
PV.prototype.times = function (that) {
    if (typeof that === "number") {
        return new PV(this[0] * that,
                      this[1] * that,
                      this[2] * that,
                      this[3] * that);
    }
    if (that instanceof PV) {
        return new PV(this[0] * that[0],
                      this[1] * that[1],
                      this[2] * that[2],
                      this[3] * that[3]);
    }
    else {
        console.log("illegal argument");
        throw "Illegal Argument";
    }
}

// u.minus() = -u
// u.minus(v) = u - v
PV.prototype.minus = function (that) {
    if (that === undefined) {
        return new PV(-this[0],
		      -this[1],
		      -this[2],
		      -this[3]);
    }
    else if (that instanceof PV) {
        return new PV(this[0] - that[0],
		      this[1] - that[1],
		      this[2] - that[2],
		      this[3] - that[3]);
    }
    else {
        console.log("illegal argument");
        throw "Illegal Argument";
    }
}

// Do a 4-dimensional dot product:
// (1, 2, 3, 4) dot (-2, -3, 1, 1) = 1 * -2 + 2 * -3 + 3 * 1 + 4 * 1
PV.prototype.dot = function (that) {
    if (!(that instanceof PV))
        throw "Illegal Argument";
    
    // EXERCISE
    return ((this[0] * that[0]) + (this[1] * that[1]) + (this[2] * that[2]) + (this[3] * that[3]));

}

// Assume inputs are vectors.  Output is a vector.
PV.prototype.cross = function (that) {
    if (!(that instanceof PV))
        throw "Illegal Argument";

    // EXERCISE
    return new PV((this[1]*that[2] - this[2]*that[1]), 
                  (this[2]*that[0] - this[0]*that[2]), 
                  (this[0]*that[1] - this[1]*that[0]),
		  0);
}

PV.prototype.magnitude = function () {
    // EXERCISE
    // Use dot and Math.sqrt()
    return Math.sqrt(this.dot(this));
};

PV.prototype.distance = function (that) {
    if (!(that instanceof PV))
        throw "Illegal Argument";
    return ((this.minus(that)).magnitude());
    // EXERCISE
    // Use minus and magnitude.
};

// Return unit vector pointing same direction as this.
PV.prototype.unit = function () {
    return (this.times(1/this.magnitude()));
};

// Replace this with unit vector pointing same direction as this.
PV.prototype.unitize = function () {
     return this.unit();
    // return this;
};

// Divide all coordinates by this[3].  Changes this.
PV.prototype.homogenize = function () {
    this[0] = this[0]/this[3];
    this[1] = this[1]/this[3];
    this[2] = this[2]/this[3];
    this[3] = this[3]/this[3];
    return this; 
};


Mat.rotation = function (i, angle) {
    if (i === undefined || angle === undefined ||
        !(typeof i === "number") || !(typeof angle === "number"))
	throw "Illegal Argument";

    var mat = new Mat();
    var j, k;
        //Rotation about X
    if (i == 0) {
	j = 1;
	k = 2;
	//Rotation about Y
    } else if (i==1) {
	j = 2;
	k = 0;
	//rotation about Z
    } else if (i==2) {
	j = 0;
	k = 1;

    } else {throw "Illegal Argument";}
    // EXERCISE
    // Uses Math.sin() and Math.cos()
    // Set j=0 and k=1 and do the i=2 (z-axis) case.
    // Figure out what you need to set j and k equal to for the i=0 and i=1.
    mat[j][j] = Math.cos(angle);
    mat[j][k] = -Math.sin(angle);
    mat[k][j]=  Math.sin(angle);
    mat[k][k] = Math.cos(angle);
    return mat;
};

Mat.translation = function (v) {
    if (!(v instanceof PV))
	throw "Illegal Argument";

    var mat = new Mat();
    mat[0][3] = v[0];
    mat[1][3] = v[1];
    mat[2][3] = v[2];
  
    return mat;
};

Mat.scale = function (s) {
    var mat = new Mat();

    if (typeof s === "number") {
        mat[0][0] = s;
	mat[1][1] = s;
	mat[2][2] = s;
    }
    else if (s instanceof PV) {
        // EXERCISE
	mat[0][0] = s[0];
	mat[1][1] = s[1];
	mat[2][2] = s[2];
    }
    else
	throw "Illegal Argument";

    return mat;

};

Mat.prototype.transpose = function() {
    var mat = new Mat();

    for ( var i = 0; i < 4; i++)
	for ( var j = 0; j < 4; j++)
	    mat[i][j] = mat[j][i];

    return mat;
};

/*
  Matrix multiplication.
  If that is a PV, it is treated as a 4 by 1 column vector.
*/
Mat.prototype.times = function (that) {
    if (that instanceof PV) {
        var v = new PV(false);
	// v[0] = this[0][0]*that[0] + this[0][1] * that[1] +this[0][2] * that[2] + this[0][3] * that[3];
	for(var i = 0; i < 4; i++){
	    var sum = 0;
	    for (var j = 0; j < 4; j++) {
		sum += this[i][j] * that[j];
	    }
	    v[i] = sum;
	}
        return v;


    }   else if (that instanceof Mat) {
        var mat = new Mat();
        
        // EXERCISE

        for (var i=0; i<4; i++) {
	    //   mat[i] = [];
	     for (var j = 0; j < 4; j++) {
	          var sum = 0;
	         for (var k = 0; k < 4; k++) {
	              sum += this[i][k] * that[k][j];
	         }
	      mat[i][j] = sum;
	      }
        }
    }
        
        return mat;
}


