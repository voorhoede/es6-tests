// 1. Notify when any property is added
// 2. Remove when observer (unobserve)
// 3. Notify when a value of a data property is updated
// 4. Notify when any property is deleted
// 5. Notify when a property is configured (aspects of a property descriptor are modified, e.g. by Object.freeze)

var obj = {};
var obj2 = {};

var supports, unobserve;

try {
	Object.observe(obj, observer);

	supports = 'Yes';

} catch (error) {
	console.log(error);

	supports = 'No';
}

try {
	Object.unobserve(obj, observer);

	unobserve = 'Yes';

} catch (error) {
	console.log(error);

	unobserve = 'No';
}

try {
	Object.observe(obj2, function(changes) {
		document.getElementById('observe-add').innerText = 'Yes';
	});
	obj2.foo = 'bar';

} catch (error) {
	console.log(error);

	document.getElementById('observe-add').innerText = 'No';
}

try {
	Object.observe(obj2, function(changes) {
		document.getElementById('observe-delete').innerText = 'Yes';
	});
	obj2.foo = 'bar';
	delete obj2.foo;

} catch (error) {
	console.log(error);

	document.getElementById('observe-delete').innerText = 'No';
}

function observer(changes) {
	console.log('changes', changes);
}

document.getElementById('observe-support').innerText = supports;
document.getElementById('observe-unobserve').innerText = unobserve;