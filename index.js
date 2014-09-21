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
    var version = 2;
    var request = indexedDB.open("todoData", version);//디비 만들or열기
    var yourNickname;
  
    //db를 만들거나 업데이트하기 
    request.onupgradeneeded = function(e) {
    	yourNickname = prompt("분양받을 투두몬의 이름을 입력해주세요!");
    	alert("안녕하세요 " + yourNickname+ "님, 푸드투두를 시작해봐요^^!");

    	db = e.target.result;//디비에 리절트 넣어줌
  
      e.target.transaction.onerror = indexedDB.onerror;
  
      if(db.objectStoreNames.contains("todo1")) {
        db.deleteObjectStore("todo1");
      }
      if(db.objectStoreNames.contains("todo2")) {
    	  db.deleteObjectStore("todo2");
      }
      if(db.objectStoreNames.contains("todo3")) {
    	  db.deleteObjectStore("todo3");
      }
      if(db.objectStoreNames.contains("todo4")) {
    	  db.deleteObjectStore("todo4");
      }
      if(db.objectStoreNames.contains("info")) {
    	  db.deleteObjectStore("info");
      }
      
      //투두에 해당하는 object store생성.키패스:id
      var store = db.createObjectStore("todo1", {keyPath: "id"});
      var store2 = db.createObjectStore("todo2",{keyPath: "id"});
      var store3 = db.createObjectStore("todo3", {keyPath: "id"});
      var store4 = db.createObjectStore("todo4", {keyPath: "id"});
      
      var infoStore = db.createObjectStore("info", {keyPath: "nickname"});
      
      const infoData = [{nickname:"Jay", point:0, yourNickname:yourNickname}];
      infoStore.createIndex("point","point",{unique:false});
      infoStore.createIndex("yourNickname","yourNickname",{unique:false});
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
		  
		  var infos = [];
		 
		  request.onsuccess = function(e) {
			  var result = e.target.result;
			  curPoint = request.result.point;
			  yourNickname = request.result.yourNickname;
			  infos[0] = curPoint;
			  infos[1] = yourNickname;
			  deferred.resolve(infos);
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
		  
		  
		  const infoData = [{nickname:"Jay", point:curPoint+1, yourNickname:yourNickname}];
		  var request = store.put(infoData[0]);
		 
		  //스토어에 있는거 다 가져오기
		  var keyRange = IDBKeyRange.lowerBound(0);
		  var cursorRequest = store.openCursor(keyRange);
		  
		  request.onsuccess = function(e) {
			  var result = e.target.result;
		  };
		  
		  request.onerror = function(e){
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
  this.todos3=[];
  this.todos4=[];

//  this.level;
  this.point;
  this.levelPoint = 50;
  this.nickname;
  

  
  todoCtr.refreshList = function(){
    indexedDBDataCon.getTodos(1).then(function(data){
    	todoCtr.todos=data;
    }, function(err){
    	$window.alert(err);
    });
    indexedDBDataCon.getInfo().then(function(data){
      todoCtr.point= data[0];
      todoCtr.nickname= data[1];
      if(data[0]<50){
    	  todoCtr.level = 1;
      }else if(data[0]>=50 && data[0]<100){
    	  todoCtr.level = 2;
      }else {
    	  todoCtr.level = 3;
      }
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

  //리스트2
  todoCtr.refreshList2 = function(){
	  indexedDBDataCon.getTodos(2).then(function(data){
		  todoCtr.todos2=data;
	  }, function(err){
		  $window.alert(err);
	  });
	  indexedDBDataCon.getInfo().then(function(data){
		  todoCtr.point= data[0];
		  todoCtr.nickname= data[1];
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
  //리스트3
  todoCtr.refreshList3 = function(){
	  indexedDBDataCon.getTodos(3).then(function(data){
		  todoCtr.todos3=data;
	  }, function(err){
		  $window.alert(err);
	  });
	  indexedDBDataCon.getInfo().then(function(data){
		  todoCtr.point= data[0];
		  todoCtr.nickname= data[1];
	  }, function(err){
		  $window.alert(err);
	  });
  };
  
  todoCtr.addTodo3 = function(){
	  indexedDBDataCon.addTodo(todoCtr.todoText3, 3).then(function(){
		  todoCtr.refreshList3();
		  todoCtr.todoText3="";
	  }, function(err){
		  $window.alert(err);
	  });
  };
  
  todoCtr.deleteTodo3 = function(id){
	  indexedDBDataCon.addInfo().then(function(){
		  todoCtr.refreshList3();
	  }, function(err){
		  $window.alert(err);
	  });
	  
	  indexedDBDataCon.deleteTodo(id, 3).then(function(){
		  todoCtr.refreshList3();
	  }, function(err){
		  $window.alert(err);
	  });
  };
  //리스트4
  todoCtr.refreshList4 = function(){
	  indexedDBDataCon.getTodos(4).then(function(data){
		  todoCtr.todos4=data;
	  }, function(err){
		  $window.alert(err);
	  });
	  indexedDBDataCon.getInfo().then(function(data){
		  todoCtr.point= data[0];
		  todoCtr.nickname= data[1];
	  }, function(err){
		  $window.alert(err);
	  });
  };
  
  todoCtr.addTodo4 = function(){
	  indexedDBDataCon.addTodo(todoCtr.todoText4, 4).then(function(){
		  todoCtr.refreshList4();
		  todoCtr.todoText4="";
	  }, function(err){
		  $window.alert(err);
	  });
  };
  
  todoCtr.deleteTodo4 = function(id){
	  indexedDBDataCon.addInfo().then(function(){
		  todoCtr.refreshList4();
	  }, function(err){
		  $window.alert(err);
	  });
	  
	  indexedDBDataCon.deleteTodo(id, 4).then(function(){
		  todoCtr.refreshList4();
	  }, function(err){
		  $window.alert(err);
	  });
  };

	function init(){
		indexedDBDataCon.open().then(function(){
			todoCtr.refreshList();
			todoCtr.refreshList2();
		    todoCtr.refreshList3();
		    todoCtr.refreshList4();
		});
	}

init();
});


