'use strict';

$(document).ready(function() {
  var canvas  = document.getElementById("MyCanvas");
  var context = canvas.getContext("2d");
  var drawing = new Canvas(context);

  $("#MyCanvas").mousedown(function(e) {
    drawing.undo.length = 0;
    drawing.isDrawing = true;

    let x = e.pageX - this.offsetLeft;
    let y = e.pageY - this.offsetTop;

    if(drawing.nextObject === "rect") {
      let rec = new Rectangle(x, y, drawing.nextColor, drawing.lineWidth);
      drawing.nextClass = rec;
    }
    else if(drawing.nextObject === "circle") {
      let circle = new Circle(x, y, drawing.nextColor, drawing.lineWidth);
      drawing.nextClass = circle;
    }
    else if(drawing.nextObject === "pen") {
      let pen = new Pen(x, y, drawing.nextColor, drawing.lineWidth);
      drawing.nextClass = pen;
    }
    else if(drawing.nextObject === "eraser") {
      let eraser = new Pen(x, y, "#FFFFFF", 35);
      drawing.nextClass = eraser;
    }
    else if(drawing.nextObject === "line") {
      let line = new Line(x, y, drawing.nextColor, drawing.lineWidth);
      drawing.nextClass = line;
    }
    else if(drawing.nextObject === "text") {
      if(drawing.nextClass.inputBox) {
        drawing.nextClass.inputBox.remove();
      }
      let box           = createTextBox(e.pageX, e.pageY);
      let font          = $(".fontButton").val();
      let text          = new Text(x, y+20, drawing.nextColor, drawing.lineWidth, font, box);
      drawing.nextClass = text;
    }
  });

  $("#MyCanvas").mousemove(function(e) {
    let x = e.pageX - this.offsetLeft;
    let y = e.pageY - this.offsetTop;

    if(drawing.isDrawing === true) {
      if(drawing.nextObject === "rect") {
          drawing.nextClass.setXY((x - drawing.nextClass.x), (y - drawing.nextClass.y));
      }
      else if(drawing.nextObject === "circle") {
          let x1 = (x - drawing.nextClass.x);
          let y1 = (y - drawing.nextClass.y);
          drawing.nextClass.setRadius((x1 + y1) / 2);
      }
      else if(drawing.nextObject === "pen" || drawing.nextObject === "line") {
          drawing.nextClass.setXY(x, y);
      }
      else if(drawing.nextObject === 'eraser') {
        drawing.nextClass.setXY(x, y);
        drawing.nextClass.draw(context);
      }
      if(drawing.nextObject !== "text" && drawing.nextObject !== 'eraser') {
        clearCanvas();
        drawing.nextClass.draw(context);
        drawing.drawAll(context);
      }
    }
  });

  $("#MyCanvas").mouseup(function(e) {
    let x = e.pageX - this.offsetLeft;
    let y = e.pageY - this.offsetTop;

    if(drawing.nextObject === "rect") {
      drawing.nextClass.setXY((x - drawing.nextClass.x), (y - drawing.nextClass.y));
    }
    else if(drawing.nextObject === "circle") {
      let x1 = x - drawing.nextClass.x;
      let y1 = y - drawing.nextClass.y;
      drawing.nextClass.setRadius((x1+y1) / 2);
    }
    else if(drawing.nextObject === "pen" || drawing.nextObject === "eraser" || drawing.nextObject === "line") {
      drawing.nextClass.setXY(x, y);
    }

    clearCanvas();
    drawing.shapes.push(drawing.nextClass);
    drawing.isDrawing = false;
    drawing.drawAll(context);
  });

  $(document).keypress(function(e){
		if(drawing.nextObject === "text"){
			if(e.which === 13 && drawing.nextClass.inputBox) {
        drawing.nextClass.setText(drawing.nextClass.inputBox.val());
   			drawing.shapes.push(drawing.nextClass);
   			clearCanvas();
   			drawing.isDrawing = false;
        drawing.nextClass.inputBox.remove();
        drawing.drawAll(context);
   		}
		 }
	});



  $(".toolButton").click(function(e) {
    drawing.nextObject = $(this).attr("data-tooltype");
    if(drawing.nextObject === "text") {
      $(".fontButton").show();
    }
    else {
      $(".fontButton").hide();
      if(drawing.nextClass instanceof Text) {
        drawing.nextClass.inputBox.remove();
      }
    }
  });

  $(".clear").click(function(e) {
    if(confirm("Do you want to clear the canvas?")) {
      clearCanvas();
      drawing.shapes.length = 0;
      drawing.undo.length   = 0;
      drawing.nextObject    = "pen";
    }
  });

  $("#MyCanvas").mousedown(function(e) {
    if(drawing.isOff === true) {
      drawing.isDrawing = true;
      drawing.isOff     = false;
    }
  });

  $(".UndoRedo").click(function(e) {
		if($(this).attr("data-tooltype") === "undo") {
			if(drawing.shapes.length > 0) {
        drawing.undo.push(drawing.shapes.pop());
      }
    }
    else {
      if(drawing.undo.length > 0) {
			drawing.shapes.push(drawing.undo.pop());
			}
		}
    clearCanvas();
    drawing.drawAll(context);
	});

  $(".lineWidth").on("change", function(e) { drawing.lineWidth = $(".lineWidth").val(); });
  $('#MyCanvas').mouseleave(function(e) { drawing.isOff = true; drawing.isDrawing = false; });
  $(".colorButton").click(function(e) { drawing.nextColor = $(".colorButton").val(); });
  $(".loadButton").click(function(e) { $(".loadform").show(); $(".okButton1").show(); });
  $(".saveButton").click(function(e) { $(".saveform").show(); $(".okButton").show();} );
  $(".fontButton").hide();
  $(".saveform").hide();
  $(".okButton").hide();
  $(".loadform").hide();
  $(".okButton1").hide();

  $(".okButton").click(function(e) {
    save($('#user').val(), $('#title').val());
    $(".saveform").hide();
    $(".okButton").hide();
  });

  $(".okButton1").click(function(e) {
    loadList($('#user1').val());
    $(".loadform").hide();
    $(".okButton1").hide();
  });

  function clearCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  function createTextBox(x, y) {
    let box = $("<input />");
    box.css("position", "absolute");
    box.css("left", x);
    box.css("top", y);
    $(".textarea").append(box);
    box.focus();
    return box;
  }

  function save(user, title) {
    var stringifiedArray = JSON.stringify(drawing.shapes);
    var param = {
      "user"     : user,
      "name"     : title,
      "content"  : stringifiedArray,
      "template" : true
    };

    $.ajax({
      type        : "POST",
      contentType : "application/json; charset=utf-8",
      url         : "http://whiteboard.apphb.com/Home/Save",
      data        : param,
      dataType    : "jsonp",
      crossDomain : true,
      success     : function(data) {
        console.log(data);
      },
      error       : function(xhr, err) {
        console.log(err);
      }
    });
  }

  function loadList(user) {
    var param = {
      "user"     : user,
      "template" : true
    };

    $.ajax({
      type        : "GET",
      contentType : "application/json; charset=utf-8",
      url         : "http://whiteboard.apphb.com/Home/GetList",
      data        : param,
      dataType    : "jsonp",
      crossDomain : true,
      success     : function(data) {
        $("#whiteBoardList").html();
        $("#whiteBoardList li").remove();
        var html1 = '';
        for(var i = 0; i < data.length; ++i) {
            html1 += '<li><a href=# class="loadDrawing" id="'+ data[i].ID + '">' + data[i].WhiteboardTitle + '</a></li>';
        }
        $("#whiteBoardList").append(html1);

        $(".loadDrawing").click(function (e) {
          console.log("loading = " + $(this).attr('id'));
          load($(this).attr('id'));
        });
      },
      error: function (xhr, err) {
        console.log(err);
      }
    });
  };

  function load(id) {
    clearCanvas();
    drawing.shapes.length = 0;
    var param = {
      "id": id
    };

  $.ajax({
    type        : "GET",
    contentType : "application/json; charset=utf-8",
    url         : "http://whiteboard.apphb.com/Home/GetWhiteboard",
    data        : param,
    dataType    : "jsonp",
    crossDomain : true,
    success     : function(data) {
      var shapes = JSON.parse(data.WhiteboardContents);

      for(var i = 0; i < shapes.length; i++) {
        var obj = {};
        console.log(shapes[i]);
        if(shapes[i].name === "Rectangle") {
          obj = new Rectangle(shapes[i].x, shapes[i].y, shapes[i].color, shapes[i].width);
          obj.setXY(shapes[i].x2, shapes[i].y2);
        }
        else if(shapes[i].name === "Circle") {
          obj = new Circle(shapes[i].x, shapes[i].y, shapes[i].color, shapes[i].width);
          obj.setXY(shapes[i].x2, shapes[i].y2);
          obj.setRadius(shapes[i].radius);
        }
        else if(shapes[i].name === "Line") {
          obj = new Line(shapes[i].x, shapes[i].y, shapes[i].color, shapes[i].width);
          obj.setXY(shapes[i].x2, shapes[i].y2);
        }
        else if(shapes[i].name === "Text") {
          obj = new Text(shapes[i].x, shapes[i].y, shapes[i].color, shapes[i].width, shapes[i].font, shapes[i].box);
          obj.setText(shapes[i].text);
        }
        else if(shapes[i].name === "Pen") {
          obj= new Pen(shapes[i].x, shapes[i].y, shapes[i].color, shapes[i].width);
          obj.setXarr(shapes[i].xArr);
          obj.setYarr(shapes[i].yArr);
        }
        drawing.shapes.push(obj);
      }
      drawing.drawAll(context);
    },
    error: function (xhr, err) {
      console.log(err);
    }
  });
  };
});
