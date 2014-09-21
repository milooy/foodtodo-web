//전체 모듈은 app에 담고 이름은 foodTodoWeb
var app = angular.module('foodTodoWeb', []);

//팩토리. 서비스의 종류. 어떤 객체 리턴 전에 몇가지 코드 실행가능한 공간 제공 
app.factory('indexedDBDataCon', function($window, $q){
  var indexedDB = $window.indexedDB;
  var db=null;
  var lastIndex=0;
  
  var curPoint=0;
  
  /////오픈///// 	
  var open = function(){
    var deferred = $q.defer();//$q 사용하기
    var version = 4;
    var request = indexedDB.open("todoData", version);//디비 만들or열기
  
    //db를 만들거나 업데이트하기 
    request.onupgradeneeded = function(e) {
      db = e.target.result;//디비에 리절트 넣어줌
  
      e.target.transaction.onerror = indexedDB.onerror;
  
      if(db.objectStoreNames.contains("todo1")) {
        db.deleteObjectStore("todo1");
      }
      if(db.objectStoreNames.contains("todo2")) {
    	  db.deleteObjectStore("todo2");
      }
      if(db.objectStoreNames.contains("info")) {
    	  db.deleteObjectStore("info");
      }
      
      //투두에 해당하는 object store생성.키패스:id
      var store = db.createObjectStore("todo1",
        {keyPath: "id"});
      
      var store2 = db.createObjectStore("todo2",
    		  {keyPath: "id"});
      
      var infoStore = db.createObjectStore("info",
    		  {keyPath: "nickname"});
      
      const infoData = [{nickname:"Jay", point:35}];
      infoStore.createIndex("point","point",{unique:false});
      infoStore.add(infoData[0]);
      console.log("open");
      
    };
  
    request.onsuccess = function(e) {
      db = e.target.result;//디비에 리절트 넣어줌
      deferred.resolve();//모든것이 정상동작하면 resolve호출
    };
  
    request.onerror = function(){
      deferred.reject();//정상동작 안하면 reject호출
    };
    
    return deferred.promise;
  };
  
  ////get Todos/////
  var getTodos = function(category){
    var deferred = $q.defer();
    var myStore = "todo"+category;
    
    if(db === null){
      deferred.reject();
    } else{
      //디비에 데이터 쓰기 
      //db에서 일어나는 모든 변경은 transaction안에서 일어남 
      var trans = db.transaction([myStore.toString()], "readwrite");//읽고쓰기 가능한 todo transaction생성
      var store = trans.objectStore(myStore.toString());//todo transaction안에 todo objectstore만들기
      var todos = [];//todo들 들어가있는 배열

      //스토어에 있는거 다 가져오기
      var keyRange = IDBKeyRange.lowerBound(0);
      var cursorRequest = store.openCursor(keyRange);
    
      cursorRequest.onsuccess = function(e) {
        var result = e.target.result;
        if(result === null || result === undefined)
        {
          deferred.resolve(todos);
        }
        else{
          todos.push(result.value); //todo 배열에 result.value를 넣어준다. 
          if(result.value.id > lastIndex){
            lastIndex=result.value.id;
          }
          result.continue();
        }
      };
    
      cursorRequest.onerror = function(e){
        console.log(e.value);
        deferred.reject("Get Todo 문제");
      };
    }
    
    return deferred.promise;
  };
  
  
  ////get Info/////
  var getInfo = function(){
	  var deferred = $q.defer();
	  
	  if(db === null){
		  deferred.reject();
	  } else{
		  var trans = db.transaction(["info"], "readwrite");
		  var store = trans.objectStore("info");
		  var request = store.get("Jay");
		 
		  request.onsuccess = function(e) {
			  var result = e.target.result;
			  curPoint = request.result.point;
			  deferred.resolve(curPoint);
		  };
		  
		  request.onerror = function(e){
			  console.log(e.value);
			  deferred.reject("Get Info 문제");
		  };
		  
		  
	  }
	  
	  return deferred.promise;
  };
  
  /////Todo지우기/////
  var deleteTodo = function(id, category){ //인자는 id 
    var deferred = $q.defer();
    var myStore = "todo"+category;
    
    if(db === null){
      deferred.reject();
    }
    else{
      var trans = db.transaction([myStore.toString()], "readwrite"); //디비에 뭔 짓 하기 전에 transaction시작해야함. todo오브젝트스토어로부터 만듦 
      var store = trans.objectStore(myStore.toString()); //todo옵젝스토어 빼옴 
      
      var request = store.delete(id); //todo 옵젝스토어에서 id값으로 지우는 리퀘스트 생성  
    
      request.onsuccess = function(e) {
        deferred.resolve(); //request가 성공하면 resolve()
      };
    
      request.onerror = function(e) {
        console.log(e.value);
        deferred.reject("todo delete 문제");
      };
    }
    
    return deferred.promise;
  };
  
  /////Info 추가//////
  var addInfo= function(){ //인자는 todoText 
	  var deferred = $q.defer();
	  
	  if(db === null){
		  deferred.reject();
	  } else{
		  //디비에 데이터 쓰기 
		  //db에서 일어나는 모든 변경은 transaction안에서 일어남 
		  var trans = db.transaction(["info"], "readwrite");//읽고쓰기 가능한 todo transaction생성
		  var store = trans.objectStore("info");//todo transaction안에 todo objectstore만들기
		  var infos = [];//todo들 들어가있는 배열
		  
		  
		  const infoData = [{nickname:"Jay", point:curPoint+1}];
		  var request = store.put(infoData[0]);
		 
		  //스토어에 있는거 다 가져오기
		  var keyRange = IDBKeyRange.lowerBound(0);
		  var cursorRequest = store.openCursor(keyRange);
		  
		  request.onsuccess = function(e) {
			  var result = e.target.result;
		  };
		  
		  request.onerror = function(e){
			  console.log(e.value);
			  deferred.reject("Get Todo 문제");
		  };
		  
	  }
	  
	  return deferred.promise;
  };
  
  /////Todo 추가//////
  var addTodo = function(todoText, category){ //인자는 todoText 
    var deferred = $q.defer();
    var myStore = "todo"+category;
    
    if(db === null){
      deferred.reject();
    }
    else{
      var trans = db.transaction([myStore.toString()], "readwrite");
      var store = trans.objectStore(myStore.toString());
      lastIndex++; //맨마지막에 하나 키워서 거기다가 집어넣음
      var request = store.put({
        "id": lastIndex,
        "text": todoText
      });
    
      request.onsuccess = function(e) {
        deferred.resolve();
      };
    
      request.onerror = function(e) {
        console.log(e.value);
        deferred.reject("Todo add문제");
      };
    }
    return deferred.promise;
  };
  
  return {
	  open: open,
	  getTodos: getTodos,
	  getInfo: getInfo,
	  addTodo: addTodo,
	  addInfo: addInfo,
	  deleteTodo: deleteTodo
  };
  
});


app.controller('TodoController', function($window, indexedDBDataCon){
  var todoCtr = this;
  this.todos=[];
  this.todos2=[];
  
  this.level = 3;
  this.point;
  this.levelPoint = 50;
  
  todoCtr.refreshList = function(){
    indexedDBDataCon.getTodos(1).then(function(data){
    	todoCtr.todos=data;
    }, function(err){
    	$window.alert(err);
    });
    indexedDBDataCon.getInfo().then(function(data){
      todoCtr.point= data;
    }, function(err){
    	$window.alert(err);
    });
  };
  
  todoCtr.addTodo = function(){
    indexedDBDataCon.addTodo(todoCtr.todoText, 1).then(function(){
      todoCtr.refreshList();
      todoCtr.todoText="";
    }, function(err){
      $window.alert(err);
    });
  };
  
  todoCtr.deleteTodo = function(id){
	indexedDBDataCon.addInfo().then(function(){
		todoCtr.refreshList();
	}, function(err){
		$window.alert(err);
	});
	
    indexedDBDataCon.deleteTodo(id, 1).then(function(){
      todoCtr.refreshList();
    }, function(err){
      $window.alert(err);
    });
  };

  //새로운거
  todoCtr.refreshList2 = function(){
	  indexedDBDataCon.getTodos(2).then(function(data){
		  todoCtr.todos2=data;
	  }, function(err){
		  $window.alert(err);
	  });
	  indexedDBDataCon.getInfo().then(function(data){
		  todoCtr.point= data;
	  }, function(err){
		  $window.alert(err);
	  });
  };
  
  todoCtr.addTodo2 = function(){
	  indexedDBDataCon.addTodo(todoCtr.todoText2, 2).then(function(){
		  todoCtr.refreshList2();
		  todoCtr.todoText2="";
	  }, function(err){
		  $window.alert(err);
	  });
  };
  
  todoCtr.deleteTodo2 = function(id){
	  indexedDBDataCon.addInfo().then(function(){
		  todoCtr.refreshList2();
	  }, function(err){
		  $window.alert(err);
	  });
	  
	  indexedDBDataCon.deleteTodo(id, 2).then(function(){
		  todoCtr.refreshList2();
	  }, function(err){
		  $window.alert(err);
	  });
  };
  function init(){
    indexedDBDataCon.open().then(function(){
      todoCtr.refreshList();
      todoCtr.refreshList2();
    });
  }
  
  init();
});


/////todomon움직임/////
///*
 var images = {};
 var totalResources = 3;
 var numResourcesLoaded = 0;
 var fps = 30;
 
 var context = document.getElementById('canvas').getContext("2d");
 var charX = 30;
 var charY = 20;
 

 
 loadImage("todomon-body");
 loadImage("todomon-leg");
 loadImage("doughnut");
 
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
	 context.drawImage(images["todomon-leg"], x, y+140);
	 context.drawImage(images["todomon-body"], x, y - breathAmt);
	 context.drawImage(images["doughnut"], x+20,y-70-curDoughnutHeight);
	 
	 drawEllipse(x+56, y+40 - breathAmt, 30, curEyeHeight); //왼쪽눈 
	 drawEllipse(x+77, y+40 - breathAmt, 30, curEyeHeight); //오른쪽눈 
	 drawMouth(context, x+20, y+50- breathAmt, curMouthHeight);
	 
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
 function eatTodo() {
//	 var deleteBtn = document.getElementsByClassName('todoDelete');
//	 var blinkMouthTimer = setInterval(blinkMouth, 1000);
	 
	 eatDoughnut();
	 setTimeout(goBlinkMouth, 500);
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
 
 app.controller('InfoController', function(){
	
 });