// courtesy of Quirksmode http://www.quirksmode.org/
/* var showResultDetails = true; */

window.onload = function () {
	main();	 
}

function main() {
	for (var i=0;i<COREtests.length;i+=1) {
		var test = COREtests[i].output;
		runOneTest(COREtests[i]);
	}
	results.createReports();
}
	

function runOneTest(obj) {
	var result = 'worked',
		returnValue = 'not received';
	try {
		returnValue = obj.test();
	} catch (e) {
		obj.error = e.message;
		result = 'error';
	}
	if (returnValue !== 'not received') {
		obj.returnValue = returnValue;
	}
	if (obj.question && result !== 'error') {
		userQuestions.addQuestion(obj);
	} else if (!obj.error) {
		if (obj.checkReturnValue) {
			if (!returnValue) {
				result = 'wrong';
			}
		} else if (obj.expectedValue !== undefined) {
			if (returnValue === 'not received' || returnValue === undefined) {
				result = 'error';
			} else if (returnValue !== obj.expectedValue) {
				result = 'wrong';
			}
		}
	}
	obj.result = result;
}

var results = {
	totalTestResults: {},
	conditionalTestResults: {},
	moreInfoButton: function (root,obj) {
		var button = document.createElement('button');
		button.innerHTML = 'More info';
		button.className = 'info';
		button.show = false;
		button.onclick = function() {
			if (!this.show) {
				if (!root.info) {
					root.info = results.createInfo(obj);
					root.appendChild(root.info);
				}
				root.info.style.display = 'block';
				this.innerHTML = 'Hide info';
			} else {
				root.info.style.display = 'none';			
				this.innerHTML = 'More info';
			}
			this.show = !this.show;
		}
		return button;
	},
	createReports: function () {
		for (var i=0,test;test=COREtests[i];i+=1) {
			this.createTestReport(COREtests[i]);
			if (test.optional) {
				continue; //do not count optional tests for final result
			}
			var name = test.output;
			if (!this.totalTestResults[name]) {
				this.totalTestResults[name] = [];
				this.conditionalTestResults[name] = [];
			}
			if (test.result && test.shouldNotWork) {
				this.conditionalTestResults[name].push(COREtests[i].result);			
			} else {
				this.totalTestResults[name].push(COREtests[i].result);
			}
		}
		this.showFinalResults();
	},
	createTestReport: function (obj) {
		var testReport = document.createElement('p');
		testReport.appendChild(this.moreInfoButton(testReport,obj));
		var testText = obj.outputText + ' ';
		switch (obj.result) {
			case 'worked':
				testText += 'supported';
				break;
			case 'wrong':
				testText += 'returned a wrong value';
				break;
			case 'error':
				testText += 'gave an error';
				break;
		}
		if (obj.shouldNotWork) {
			if (obj.result === 'worked') {
				obj.result = 'error';
			} else {
				obj.result = 'worked';
			}
			testText += ' (should not work)';
		}
		switch (obj.result) {
			case 'worked':
				testReport.className = 'supported';			
				break;
			case 'wrong':
				testReport.className = 'problem';			
				break;
			case 'error':
				testReport.className = 'notsupported';			
				break;
		}
		testReport.appendChild(document.createTextNode(testText));
		$(obj.output).appendChild(testReport);
	},
	createInfo: function (obj) {
		var info = document.createElement('div');
		info.className = 'info';
		var infoStrings = [];
		if (obj.description) {
			infoStrings.push(obj.description);
		}
		if (obj.shouldNotWork) {
			infoStrings.push('REVERSE: This test should not work; if it works, it\'s a bug.');
		}
		if (obj.optional) {
			infoStrings.push('OPTIONAL: This test doesn\'t count toward the final result.');
		}
		if (obj.expectedValue !== undefined) {
			var valueString = 'The test function is expected to return ' + obj.expectedValue + '. ' ;
			if (obj.returnValue === obj.expectedValue) {
				valueString += 'It did so.';
			} else {
				valueString += '<br>Instead, it returned ' + obj.returnValue + '.';
			}
			infoStrings.push(valueString);
		}
		if (obj.checkReturnValue) {
			infoStrings.push('The test succeeds if the function returns a truey value.');
		}
		if (obj.error) {
			infoStrings.push('ERROR: ' + obj.error);		
		}
		if (obj.question && obj.answer !== undefined) {
			infoStrings.push('You were asked: ' + obj.question.questionText);
			infoStrings.push('You replied: ' + obj.answer);
		}
		while (infoStrings.length) {
			var p = document.createElement('p');
			p.innerHTML = infoStrings.shift();
			info.appendChild(p);
		}
		var div = document.createElement('div');
		div.className = 'function';
		div.appendChild(document.createTextNode(obj.test));
		info.appendChild(div);
		return info;
	},
	showFinalResults: function () {
		var resultsAlphabetically = [];
		for (var i in this.totalTestResults) {
			resultsAlphabetically.push(i);
		}
		resultsAlphabetically.sort();
		for (var i=0;i<resultsAlphabetically.length;i+=1) {
			var result = this.totalTestResults[resultsAlphabetically[i]];
			var conditionalResult = this.conditionalTestResults[resultsAlphabetically[i]];
			var found = {
				worked: 0,
				wrong: 0,
				error: 0
			};
			for (var j=0;j<result.length;j+=1) {
				var value = result[j];
				found[value] +=1;
			}
			
			// tests that are supposed to fail only count if at least one normal test succeeds
			
			if (found.worked) {
				for (var j=0;j<conditionalResult.length;j+=1) {
					var value = conditionalResult[j];
					found[value] +=1;
				}
			}
			var finalReport = this.createOutputTable();
			finalReport[0].innerHTML = resultsAlphabetically[i];
			var finalText = '',finalResult = '',total=0;
			var ctr = 0;
			for (var j in found) {
				if (window.showResultDetails) {
					ctr += 1;
					if (!found[j]) {
						finalText = '-';
					} else {
						finalText = found[j];
					}
					finalReport[ctr].innerHTML = finalText;
				}
				total += found[j];
			}
			ctr += 1;
			var half = Math.floor(total/2);
			if (found.worked === total) {
				finalResult = 'yes';
			} else if (found.error === total) {
				finalResult = 'no';
			} else if (found.wrong === total) {
				finalResult = 'incorrect';
			} else if (found.worked > half) {
				finalResult = 'incomplete';
			} else if (found.error > half) {
				finalResult = 'minimal';
			} else {
				finalResult = 'incomplete';			
			}
			finalReport[ctr].innerHTML = finalResult;
			finalReport[ctr].className += finalResult;
		} 
	},
	createOutputTable: function (tag) {
		if (!this.table) {
			var table = document.createElement('table');
			table.className = 'results';
			this.table = document.createElement('tbody');
			table.appendChild(this.table);
			var head = this.createOutputTable('th');
			head[0].innerHTML = 'Method or property';
			head[head.length-1].innerHTML = 'Final result';
			if (window.showResultDetails) {
				head[1].innerHTML = 'worked';
				head[2].innerHTML = 'wrong value';
				head[3].innerHTML = 'error';
			}
			
			$('finalResults').appendChild(table);
		}
		var number = (window.showResultDetails) ? 5 : 2;
		var tr = document.createElement('tr');
		for (var i=0;i<number;i+=1) {
			var td = document.createElement(tag || 'td');
			if (i !== 0) {
				td.className = 'comp ';
			}
			tr.appendChild(td);
		}
		this.table.appendChild(tr);
		return tr.childNodes;
	}
}

function $(id) {
	return document.getElementById(id);
}