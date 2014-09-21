///전체 모듈은 app에 담고 이름은 foodTodoWeb
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
      
      const infoData = [{nickname:"Jay", level:2, point:35}];
      store.createIndex("level","level",{unique:false});
      store.createIndex("point","point",{unique:false});
      store.add(infoData[0]);
      alert(infoData[0]);
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
      
      var request = store.get("Jay");
      request.onsuccess= function(event) {
//    	  alert("level: " + request.result.level);
      }
    
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
  
  /////Todo지우기/////
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
  
  /////Todo 추가//////
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




app.controller('TodoController2', function($window, indexedDBDataCon){
  var todoCtr = this;
  this.todos=[];
  
  this.level = 3;
  this.point = 22;
  this.levelPoint = 50;
  
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
	this.point++;
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