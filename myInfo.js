var db;
var request = indexedDB.open("todoData", 2);//디비 만들or열기

const infoData = [{nickname:"Jay", level:2, point:35}];

request.onerror = function(event){
	alert("error!!");
}

request.onupgradeneeded = function(event) {
	alert("haha");
	db = event.target.result;
	var objectStore = db.createObjectstore("info", {keyPath:"nickname"});
	objectStore.createIndex("level", "level", {unique: false});
	objectStore.createIndex("point", "point", {unique: false});
	objectStore.add(infoData[1]);
	

}

var transaction = db.transaction(["info"]);
var objectStore = transaction.objectStore("info");
var request = objectStore.get("Jay");

request.onsuccess = function(event) {
	alert("level: " + request.result.level);
};