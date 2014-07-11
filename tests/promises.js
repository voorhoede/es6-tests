/**
 * checks if Promise is available on the global object
 * @returns {boolean}
 */
function hasPromises(){
	return 'Promise' in window && typeof window.Promise === 'function';
}

function testResolve(){
	var promise = new Promise(function(resolve, reject){
		window.setTimeout(function(){
			reject('great success!');
		},100);
	});
	return promise.then(function (result) {
	   window.alert(result);
	},function(badResult){
		console.error('no so good!');
	});
}
function hasResolve(){
	var promise = new Promise(function(resolve, reject){
		return typeof resolve === 'function';
	});
}
function hasReject(){

}


