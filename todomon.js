/////todomon움직임/////
 var images = {};
 var totalResources = 5;
 var numResourcesLoaded = 0;
 var fps = 30;
 
 var context = document.getElementById('canvas').getContext("2d");
 var charX = 30;
 var charY = 20;
 

 
 loadImage("todomon-body");
 loadImage("todomon-leg");
 loadImage("doughnut");
 loadImage("happyEyes");
 loadImage("heart");
 
 function loadImage(name) {
	 images[name] = new Image();
	 images[name].onload = function() {
		 resourceLoaded();
	 }
	 images[name].src = "img/todomon/" + name + ".png";
 }
 

 
 function resourceLoaded() {
	 numResourcesLoaded += 1; //이미지가 로드될때마다 키우고  
	 if(numResourcesLoaded === totalResources) { //다 로드되면 다시그림
		 setInterval(redraw, 1000/fps);
	 }
 }

 function redraw() {
	 var x = charX;
	 var y = charY;
	 
	 canvas.width = canvas.width; //canvas초기화 
	 context.drawImage(images["heart"], x-35 - curHeartY, y+1 - breathAmt );
	 context.drawImage(images["todomon-leg"], x, y+140);
	 context.drawImage(images["todomon-body"], x, y - breathAmt);
	 
	 drawEllipse(x+56, y+40 - breathAmt, 30, curEyeHeight); //왼쪽눈 
	 drawEllipse(x+77, y+40 - breathAmt, 30, curEyeHeight); //오른쪽눈 
	 context.drawImage(images["happyEyes"], x-1, y+1 - breathAmt - maxHappyHeight);
	 drawMouth(context, x+20, y+50- breathAmt, curMouthHeight);
	 context.drawImage(images["doughnut"], x+20,y-70-curDoughnutHeight);
	 
 }
 
 function drawEllipse(centerX, centerY, width, height) {
		
	  context.beginPath();
	  
	  context.moveTo(centerX, centerY - height/2);
	  
	  context.bezierCurveTo(
	    centerX + width/2, centerY - height/2,
	    centerX + width/2, centerY + height/2,
	    centerX, centerY + height/2);

	  context.bezierCurveTo(
	    centerX - width/2, centerY + height/2,
	    centerX - width/2, centerY - height/2,
	    centerX, centerY - height/2);
	 
	  context.fillStyle = "white";
	  context.fill();
	  context.closePath();	
	  
	  context.beginPath();
	  context.moveTo(centerX - 4, centerY - height/4 );
	  context.bezierCurveTo(
	    centerX + width/4 - 4, centerY - height/4 ,
	    centerX + width/4 - 4, centerY + height/4 ,
	    centerX - 4, centerY + height/4 );
	  context.bezierCurveTo(
	    centerX - width/4 - 5, centerY + height/4 ,
	    centerX - width/4 - 5, centerY - height/4 ,
	    centerX - 5, centerY - height/4 );
	
	  context.fillStyle = "black";
	  context.fill();
	  context.closePath();	
	}
 var breathInc = 0.1;
 var breathDir = 1;
 var breathAmt = 0;
 var breathMax = 3;
 var breathInterval = setInterval(updateBreath, 200/fps);

 function updateBreath() {
	 if(breathDir === 1){ //들이마시기 
		 breathAmt -= breathInc;
		 if(breathAmt < -breathMax) { //max까지 숨 쉬면 방향 바꾼다. in/out. breathAmount조절 
			 breathDir = -1;
		 }
	 } else { //내쉬기 
		 breathAmt +=breathInc;
		 if(breathAmt > breathMax) {
			 breathDir =1;
		 }
	 }
 }

 var maxEyeHeight = 25;
 var curEyeHeight = maxEyeHeight;
 var blinkTimer = setInterval(blink, 4000);
 
 function blink() {
	 curEyeHeight -= 1;
	 if(curEyeHeight <=0) {
		 eyeOpenTime = 0;
		 curEyeHeight = maxEyeHeight;
	 } else {
		 setTimeout(blink, 10);
	 }
 }
 
 function drawMouth(ctx, xoff, yoff, curEyeHeight) {
	  ctx.beginPath();
	  ctx.moveTo(39 + xoff, 29 + yoff-curMouthHeight);
	  ctx.bezierCurveTo(26 + xoff+curMouthHeight, 27 + yoff-curMouthHeight, 21 + xoff, 10 + yoff, 16 + xoff, 19 + yoff);
	  ctx.bezierCurveTo(9 + xoff, 31 + yoff, 32 + xoff, 44 + yoff, 44 + xoff, 46 + yoff);
	  ctx.bezierCurveTo(58 + xoff, 48 + yoff, 65 + xoff, 48 + yoff, 78 + xoff, 40 + yoff);
	  ctx.bezierCurveTo(92 + xoff, 31 + yoff, 82 + xoff, 54 + yoff, 92 + xoff, 50 + yoff);
	  ctx.bezierCurveTo(100 + xoff, 47 + yoff, 100 + xoff, 13 + yoff, 93 + xoff, 14 + yoff);
	  ctx.bezierCurveTo(83 + xoff, 15 + yoff, 90 + xoff, 20 + yoff-curMouthHeight, 77 + xoff, 26 + yoff-curMouthHeight);
	  ctx.bezierCurveTo(64 + xoff, 32 + yoff-curMouthHeight, 52 + xoff, 32 + yoff-curMouthHeight, 39 + xoff, 29 + yoff-curMouthHeight);
	  ctx.fillStyle = "#ffeceb";
	  ctx.fill();
	  ctx.closePath();
	}

 var maxMouthHeight = 0;
 var curMouthHeight = maxMouthHeight;
 var maxDoughnutHeight = 0;
 var curDoughnutHeight = maxDoughnutHeight;
 var curHappyHeight;
 var maxHappyHeight = 80;
 function eatTodo(id) {
	 eatDoughnut();
	 setTimeout(setHappyHeight0, 200);
	 setTimeout(goBlinkMouth, 400);
	 setTimeout(setHappyHeight, 1000);
//	 setTimeout(letsHeart, 400);
	 
 }
 
 function blinkMouth() {
	 curMouthHeight -= 1;
	 if(curMouthHeight <=-15) {
		 curMouthHeight = maxMouthHeight;
	 } else {
		 setTimeout(blinkMouth, 10);
	 }
 }
 
 function goBlinkMouth() {
	 blinkMouth();
	 blinkMouth();
	 blinkMouth();
	 blinkMouth();
 }
 
 function eatDoughnut() {
	 curDoughnutHeight -=1;
	 if(curDoughnutHeight <=-120) {
		 curDoughnutHeight = maxDoughnutHeight;
	 } else {
		 setTimeout(eatDoughnut, 1);
	 }
 }
 
 function setHappyHeight0() {
	 maxHappyHeight = 0;
 }
 
 function setHappyHeight() {
	 maxHappyHeight = 80;
 }
 
 var maxHeartY = 0;
 var curHeartY = maxHeartY;
 
 function letsHeart(){
	 setHeart();
 }
 function setHeart(){
	 curHeartY -=1;
	 if(curHeartY <=-50) {
		 curHeartY = maxHeartY;
	 } else {
		 setTimeout(setHeart, 10);
	 }
 }
 