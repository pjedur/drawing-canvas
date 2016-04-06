'use strict';

class Canvas {
  constructor() {
    this.shapes     = [];
    this.undo       = [];
    this.nextObject = "pen";
    this.nextColor  = "#000000";
    this.isOff      = false;
    this.isDrawing  = false;
    this.lineWidth  = 1;
    this.nextClass  = "";
  }

  drawAll(context) {
    for(var i = 0; i < this.shapes.length; ++i) {
      this.shapes[i].draw(context);
    }
  }
}

class Shape {
  constructor(x, y, color, width) {
    this.x     = x;
    this.y     = y;
    this.color = color;
    this.width = width;
  }

  draw() {}
}

class Rectangle extends Shape {
  constructor(x, y, color, width) {
    super(x, y, color, width);
    this.x2   = 0;
    this.y2   = 0;
    this.name = "Rectangle";
  }

  setXY(x, y){
    this.x2 = x;
    this.y2 = y;
  }

  draw(context) {
    context.strokeStyle = this.color;
    context.lineWidth   = this.width;
    context.strokeRect(this.x, this.y, this.x2, this.y2);
  }
}

class Circle extends Shape {
  constructor(x, y, color, width) {
    super(x, y, color, width);
    this.radius = 0;
    this.name   = "Circle";
  }

  setXY(x, y) {
    this.x = x;
    this.y = y;
  }

  setRadius(radius) {
    this.radius = Math.abs(radius);
  }

  draw(context){
    context.strokeStyle = this.color;
    context.lineWidth   = this.width;
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0,2 * Math.PI, false);
    context.stroke();
  }
}

class Pen extends Shape {
  constructor(x, y, color, width) {
    super(x, y, color, width);
    this.xArr = [];
    this.yArr = [];
    this.name = "Pen";
  }

  setXY(x, y) {
    this.xArr.push(x);
    this.yArr.push(y);
  }

  setXarr(arr) {
    this.xArr = arr;
  }
  setYarr(arr) {
    this.yArr = arr;
  }

  draw(context) {
    context.strokeStyle = this.color;
    context.lineWidth = this.width;
    for(var i = 0; i < this.xArr.length; ++i) {
      context.beginPath();
      context.moveTo(this.xArr[i], this.yArr[i]);
      context.lineTo(this.xArr[i+1], this.yArr[i+1]);
      context.closePath();
      context.stroke();
    }
  }
}

class Line extends Shape {
  constructor(x, y, color, width) {
    super(x, y, color, width);
    this.x2   = 0;
    this.y2   = 0;
    this.name = "Line";
  }

  setXY(x, y) {
    this.x2 = x;
    this.y2 = y;
  }

  draw(context) {
    context.strokeStyle = this.color;
    context.lineWidth   = this.width;
    context.beginPath();
    context.moveTo(this.x, this.y);
    context.lineTo(this.x2, this.y2);
    context.closePath();
    context.stroke();
  }
}

class Text extends Shape {
  constructor(x, y, color, width, font, box) {
    super(x, y, color, width);
    this.text     = "";
    this.font     = font;
    this.inputBox = box;
    this.name     = "Text";
  }

  setText(text) {
    this.text = text;
  }

  draw(context) {
    context.lineWidth = this.width;
    context.fillStyle = this.color;
    context.font      = this.font;
    context.fillText(this.text, this.x, this.y);
  }
}
