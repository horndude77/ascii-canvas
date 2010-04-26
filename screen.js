function Color(r, g, b, a) {
  this.r = r;
  this.g = g;
  this.b = b;
  this.a = a;
}

Color.prototype = {
  inverse : function() {
    return new Color(255-this.r, 255-this.g, 255-this.b, this.a);
  },
  toString : function() {
    return "[" + this.r + "," + this.g + "," + this.b + "," + this.a + "]";
  }
}

Color.RED = new Color(255, 0, 0, 255);
Color.GREEN = new Color(0, 255, 0, 255);
Color.BLUE = new Color(0, 0, 255, 255);
Color.CYAN = Color.RED.inverse();
Color.MAGENTA = Color.GREEN.inverse();
Color.YELLOW = Color.BLUE.inverse();
Color.BLACK = new Color(0, 0, 0, 255);
Color.WHITE = new Color(255, 255, 255, 255);
Color.CLEAR = new Color(255, 255, 255, 0);
Color.random = function() {
  var r = Math.floor(Math.random()*256);
  var g = Math.floor(Math.random()*256);
  var b = Math.floor(Math.random()*256);
  return new Color(r, g, b, 255);
}

function CharSet(context) {
  this.context = context;
  this.chars = new Array();

  var url = './MDA8x14.png'
  //var url = './EGA8x14.png'
  //var url = './Terminus.png'
  //var url = './CGA8x8thin.png'
  //var url = './Haowan_Curses_1440x450.png'
  //var url = './Herrbdog_144.png'
  //var url = './Aesomatica_16x16.png'
  img = this.getImageData(this.retrieveImage(url));
  this.width = Math.floor(img.width/16);
  this.height = Math.floor(img.height/16);
  for(var i=0; i<256; i++) {
    sx = (i%16) * this.width;
    sy = Math.floor(i/16) * this.height;
    this.chars[i] = new Array(this.width * this.height);
    for(var x=0; x<this.width; x++) {
      for(var y=0; y<this.height; y++) {
        var imgIndex = ( (sx + x) + (sy + y) * img.width) * 4;
        r = img.data[imgIndex + 0]
        g = img.data[imgIndex + 1]
        b = img.data[imgIndex + 2]
        a = img.data[imgIndex + 3]
        var val;
        if( r == g && g == b ) {
          val = r;
        } else if(r == 255 && g == 0 && b == 255) {
          val = -1;
        } else {
          val = new Color(r, g, b, a);
        }
        this.chars[i][x + y*this.width] = val;
      }
    }
  }
}

CharSet.prototype = {
  drawChar : function(num, fg, bg) {
    var key = num + ", " + fg + ", " + bg;
    var imgData = this.context.createImageData(this.width, this.height);
    var charData = this.chars[num];
    for(var x=0; x<this.width; x++) {
      for(var y=0; y<this.height; y++) {
        var imgIndex = (x + y * this.width) * 4;
        var charDataIndex = (x + y * this.width);
        var data = charData[charDataIndex];
        if(typeof data == 'object') // Color is the only possible object here
        {
          imgData.data[imgIndex + 0] = data.r;
          imgData.data[imgIndex + 1] = data.g;
          imgData.data[imgIndex + 2] = data.b;
          imgData.data[imgIndex + 3] = data.a;
        } else if(data > 0) {
          imgData.data[imgIndex + 0] = (fg.r * data) / 255;
          imgData.data[imgIndex + 1] = (fg.g * data) / 255;
          imgData.data[imgIndex + 2] = (fg.b * data) / 255;
          imgData.data[imgIndex + 3] = (fg.a * data) / 255;
        } else {
          imgData.data[imgIndex + 0] = bg.r;
          imgData.data[imgIndex + 1] = bg.g;
          imgData.data[imgIndex + 2] = bg.b;
          imgData.data[imgIndex + 3] = bg.a;
        }
      }
    }
    return imgData;
  },
  retrieveImage : function(url) {
    var newImg = new Image();
    newImg.src = url;
    //document.body.appendChild(newImg);
    return newImg;
  },
  getImageData : function(img) {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    return ctx.getImageData(0, 0, img.width, img.height);
  }
}

function Screen(id, width, height) {
  this.canvas = document.getElementById(id);
  this.context = this.canvas.getContext('2d');
  this.charSet = new CharSet(this.context);
  this.width = width;
  this.height = height;

  this.canvas.width = this.width * this.charSet.width;
  this.canvas.height = this.height * this.charSet.height;
}

Screen.prototype = {
  drawChar : function(charNum, fg, bg, x, y) {
    if(fg == undefined || bg == undefined || charNum == undefined ||
       x == undefined || y == undefined ||
       x < 0 || x >= this.width || y < 0 || y >= this.height) {
      alert("drawChar(" + charNum + ", " + fg + ", " + bg + ", " + x + ", " + y + ")");
    }
    img = this.charSet.drawChar(charNum, fg, bg);
    this.context.putImageData(img, x*this.charSet.width, y*this.charSet.height);
  },

  clearChar : function(x, y) {
    this.context.fillStyle = "rgb(0,0,0)";
    this.context.fillRect(x*this.charSet.width, y*this.charSet.height, this.charSet.width, this.charSet.height);
  },

  clear : function() {
    this.context.fillStyle = "rgb(0,0,0)";
    this.context.fillRect(0, 0, this.width*this.charSet.width, this.height*this.charSet.height);
  }
}
