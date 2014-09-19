//전체 모듈은 app에 담고 이름은 myIndexDB
var app = angular.module('foodTodoWeb', []);

//팩토리. 서비스의 종류. 어떤 객체 리턴 전에 몇가지 코드 실행가능한 공간 제공 
app.factory('indexedDBDataCon', function($window, $q){
  var indexedDB = $window.indexedDB;
  var db=null;
  var lastIndex=0;
  
  /////오픈///// 	
  var open = function(){
    var deferred = $q.defer();//$q 사용하기
    var version = 1;
    var request = indexedDB.open("todoData", version);//디비 만들or열기
  
    //db를 만들거나 업데이트하기 
    request.onupgradeneeded = function(e) {
      db = e.target.result;//디비에 리절트 넣어줌
  
      e.target.transaction.onerror = indexedDB.onerror;
  
      if(db.objectStoreNames.contains("todo")) {
        db.deleteObjectStore("todo");
      }
      
      //투두에 해당하는 object store생성.키패스:id
      var store = db.createObjectStore("todo",
        {keyPath: "id"});
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
  var getTodos = function(){
    var deferred = $q.defer();
    
    if(db === null){
      deferred.reject("IndexDB is not opened yet!");
    } else{
      //디비에 데이터 쓰기 
      var trans = db.transaction(["todo"], "readwrite");//읽고쓰기 가능한 todo transaction생성
      var store = trans.objectStore("todo");//todo transaction안에 todo objectstore만들기
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
          todos.push(result.value);
          if(result.value.id > lastIndex){
            lastIndex=result.value.id;
          }
          result.continue();
        }
      };
    
      cursorRequest.onerror = function(e){
        console.log(e.value);
        deferred.reject("Something went wrong!!!");
      };
    }
    
    return deferred.promise;
  };
  
  var deleteTodo = function(id){
    var deferred = $q.defer();
    
    if(db === null){
      deferred.reject("IndexDB is not opened yet!");
    }
    else{
      var trans = db.transaction(["todo"], "readwrite");
      var store = trans.objectStore("todo");
    
      var request = store.delete(id);
    
      request.onsuccess = function(e) {
        deferred.resolve();
      };
    
      request.onerror = function(e) {
        console.log(e.value);
        deferred.reject("Todo item couldn't be deleted");
      };
    }
    
    return deferred.promise;
  };
  
  var addTodo = function(todoText){
    var deferred = $q.defer();
    
    if(db === null){
      deferred.reject("IndexDB is not opened yet!");
    }
    else{
      var trans = db.transaction(["todo"], "readwrite");
      var store = trans.objectStore("todo");
      lastIndex++;
      var request = store.put({
        "id": lastIndex,
        "text": todoText
      });
    
      request.onsuccess = function(e) {
        deferred.resolve();
      };
    
      request.onerror = function(e) {
        console.log(e.value);
        deferred.reject("Todo item couldn't be added!");
      };
    }
    return deferred.promise;
  };
  
  return {
    open: open,
    getTodos: getTodos,
    addTodo: addTodo,
    deleteTodo: deleteTodo
  };
  
});

app.controller('TodoController', function($window, indexedDBDataCon){
  var todoCtr = this;
  this.todos=[];
  
  todoCtr.refreshList = function(){
    indexedDBDataCon.getTodos().then(function(data){
      todoCtr.todos=data;
    }, function(err){
      $window.alert(err);
    });
  };
  
  todoCtr.addTodo = function(){
    indexedDBDataCon.addTodo(todoCtr.todoText).then(function(){
      todoCtr.refreshList();
      todoCtr.todoText="";
    }, function(err){
      $window.alert(err);
    });
  };
  
  todoCtr.deleteTodo = function(id){
    indexedDBDataCon.deleteTodo(id).then(function(){
      todoCtr.refreshList();
    }, function(err){
      $window.alert(err);
    });
  };
  
  function init(){
    indexedDBDataCon.open().then(function(){
      todoCtr.refreshList();
    });
  }
  
  init();
});


/////todomon움직임/////
///*
 var images = {};
 var totalResources = 2;
 var numResourcesLoaded = 0;
 var fps = 30;
 
 var context = document.getElementById('canvas').getContext("2d");
 var charX = 30;
 var charY = 20;
 

 
 loadImage("todomon-body");
 loadImage("todomon-leg");
 
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
	 
	 drawEllipse(x+56, y+40 - breathAmt, 30, curEyeHeight); //왼쪽눈 
	 drawEllipse(x+77, y+40 - breathAmt, 30, curEyeHeight); //오른쪽눈 
	 
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
/*
 var maxEyeHeight = 25;
 var curEyeHeight = maxEyeHeight;
 var eyeOpenTime = 0; //눈뜨고 있은 시간 
 var timeBtwBlinks = 4000; //윙크 간격 
 var blinkUpdateTime = 200; //윙크상태 업데이트된 지난 초 
 var blinkTimer = setInterval(updateBlink, blinkUpdateTime);
 
 function updateBlink() {
	 eyeOpenTime += blinkUpdateTime;
	 if(eyeOpenTime >=timeBtwBlinks) {
		 blink();
	 }
 }
 
 
 function blink() {
	 curEyeHeight -= 1;
	 if(curEyeHeight <=0) {
		 eyeOpenTime = 0;
		 curEyeHeight = maxEyeHeight;
	 } else {
		 setTimeout(blink, 10);
	 }
 }
 */
 var maxEyeHeight = 25;
 var curEyeHeight = maxEyeHeight;
 var eyeOpenTime = 0; //눈뜨고 있은 시간 
 var timeBtwBlinks = 4000; //윙크 간격 
 var blinkUpdateTime = 200; //윙크상태 업데이트된 지난 초 
 var blinkTimer = setInterval(blink, 4000);
 
// function updateBlink() {
//	 eyeOpenTime += blinkUpdateTime;
//	 if(eyeOpenTime >=timeBtwBlinks) {
//		 blink();
//	 }
// }
 
 
 function blink() {
	 curEyeHeight -= 1;
	 if(curEyeHeight <=0) {
		 eyeOpenTime = 0;
		 curEyeHeight = maxEyeHeight;
	 } else {
		 setTimeout(blink, 10);
	 }
 }
