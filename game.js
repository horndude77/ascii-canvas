var gameObjProto = {
  setCharNum : function(charNum) {
    this.charNum = charNum;
    this.board.game.redraw(this.x, this.y);
  },
  setFg : function(color) {
    this.fg = color;
  },
  setBg : function(color) {
    this.bg = color;
  },
  moveTo : function(x, y) {
    this.x = x;
    this.y = y;
  },
  moveDelta : function(dx, dy) {
    var newx = this.x+dx;
    var newy = this.y+dy;
    if(newx < 0 || newx >= this.board.width ||
       newy < 0 || newy >= this.board.height)
    {
      this.thud();
      return false;
    }
    var obj = this.board.getObj(newx, newy, 0);
    if(obj)
    {
      obj.touch(this, dx, dy)
      obj = this.board.getObj(newx, newy, 0);
      if(obj)
      {
        this.thud();
        return;
      }
    }
    var oldx = this.x;
    var oldy = this.y;
    this.x = newx;
    this.y = newy;
    this.board.game.redraw(oldx, oldy);
    this.board.game.redraw(newx, newy);
  },
  north : function() {
    this.moveDelta(0, -1);
  },
  south : function() {
    this.moveDelta(0, 1);
  },
  west : function() {
    this.moveDelta(-1, 0);
  },
  east : function() {
    this.moveDelta(1, 0);
  },
  moveUp : function() {
    this.setZ(this.z + 1);
  },
  moveDown : function() {
    this.setZ(this.z - 1);
  },
  setZ : function(z) {
    this.z = z;
    this.game.redraw(this.x, this.y);
  },
  thud : function() {
    //default do nothing
  },
  touch : function() {
    //default do nothing
  },
  start : function() {
    if(!this.period) {
      this.period = 1000;
    }
    var that = this;
    this.interval = setInterval(function() {
      that.tick();
    }, this.period);
  },
  stop : function() {
    if(this.interval) { clearInterval(this.interval); this.interval = null; }
  },
  tick : function() {
    //default stop
    this.stop();
  }
}

function Wall() {
  this.x = 20;
  this.y = 20;
  this.z = 0;
  this.charNum = 0;
  this.fg = Color.WHITE;
  this.bg = Color.WHITE;
}

Wall.prototype = gameObjProto

function SliderEW() {
  this.x = 25;
  this.y = 20;
  this.z = 0;
  this.charNum = 29;
  this.fg = Color.WHITE;
  this.bg = Color.BLACK;
  this.touch = function(obj, dx, dy) {
    if(dx == 0) {
      return;
    }
    this.moveDelta(dx, dy);
  };
}

SliderEW.prototype = gameObjProto

function SliderNS() {
  this.x = 25;
  this.y = 15;
  this.z = 0;
  this.charNum = 18;
  this.fg = Color.WHITE;
  this.bg = Color.BLACK;
  this.touch = function(obj, dx, dy) {
    if(dy == 0) {
      return;
    }
    this.moveDelta(dx, dy);
  };
}

SliderNS.prototype = gameObjProto

function CharChanger()
{
  this.x = 30;
  this.y = 15;
  this.z = 0;
  this.charNum = 0;
  this.fg = Color.GREEN;
  this.bg = Color.BLACK;

  this.touch = function(obj, dx, dy) {
    this.moveDelta(dx, dy);
  };

  this.period = 100;
  this.tick = function() {
    newCharNum = (this.charNum + 1) % 256;
    this.setCharNum(newCharNum);
  };
}

CharChanger.prototype = gameObjProto

function MoverEW()
{
  this.x = 30;
  this.y = 5;
  this.z = 0;
  this.charNum = 5;
  this.fg = Color.WHITE;
  this.bg = Color.BLACK;

  this.period = 50;
  this.direction = 1;
  this.tick = function() {
    this.moveDelta(this.direction, 0);
    this.fg = Color.random();
    this.bg = this.fg.inverse();
  };
  this.thud = function() {
    this.direction = -this.direction;
  };
}

MoverEW.prototype = gameObjProto

function Player() {
  this.x = 10;
  this.y = 10;
  this.z = 0;
  this.charNum = 2;
  this.fg = Color.WHITE;
  this.bg = Color.CLEAR;
  this.thud = function() {
    this.board.game.message("THUD!!!");
  };
}

Player.prototype = gameObjProto

function Board()
{
  this.objs = new Array();
}

Board.prototype = {
  addObj : function(obj) {
    this.objs.push(obj);
    obj.board = this;
    this.resort();
  },
  getObj : function(x, y, z) {
    for(i in this.objs)
    {
      var obj = this.objs[i];
      if(obj.x == x && obj.y == y && obj.z == z)
      {
        return obj;
      }
    }
  },
  resort : function() {
    this.objs = this.objs.sort(function(a,b) {
      return (a.z - b.z);
    });
  }
}

function Game(screen, board)
{
  this.screen = screen;
  this.board = board;
  this.board.width = screen.width;
  this.board.height = screen.height;
  this.board.game = this;
  this.player = new Player();
  this.board.addObj(this.player);
  this.redrawFull();
}

Game.prototype = {
  redrawFull : function() {
    this.screen.clear();
    for(i in this.board.objs)
    {
      var obj = this.board.objs[i];
      this.screen.drawChar(obj.charNum, obj.fg, obj.bg, obj.x, obj.y);
    }
  },
  redraw : function(x, y) {
    this.screen.clearChar(x, y);
    for(i in this.board.objs)
    {
      var obj = this.board.objs[i];
      if(obj.x == x && obj.y == y)
      {
        this.screen.drawChar(obj.charNum, obj.fg, obj.bg, obj.x, obj.y);
      }
    }
  },
  timeout : null,
  interval : null,
  messageDelay : 1000,
  messageFadeSteps : 20,
  messageFadeTime : 1000,
  message : function(text) {
    if(this.interval) { clearInterval(this.interval); }
    if(this.timeout) { clearTimeout(this.timeout); }

    var messages = document.getElementById('messages');
    messages.firstChild ? messages.firstChild.data = text : messages.appendChild(document.createTextNode(text));
    messages.style.opacity = 1.0;

    var that = this;
    //Show message for a period of time.
    that.timeout = setTimeout(function() {
      //Fade out over a period of time.
      that.interval = setInterval(function() {
        var opacity = messages.style.opacity;
        var newOpacity = opacity - 1.0/that.messageFadeSteps;
        if(newOpacity > 0.0) {
          messages.style.opacity = newOpacity;
        } else {
          messages.style.opacity = 0.0;
          clearInterval(that.interval);
        }
      }, that.messageFadeTime/that.messageFadeSteps);
    }, that.messageDelay);
  }
}
