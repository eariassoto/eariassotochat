//get elements from page
var txtArea = document.querySelector('#conversation') ,
	txtBox = document.querySelector('#inputText')
	conversationStr = '> Pika?\r';

//updates the conversation
function updateChat () {
	txtArea.innerHTML = conversationStr;
	txtArea.scrollTop = txtArea.scrollHeight;
	txtBox.setAttribute('contentEditable', true);
	txtBox.focus();
}

//randomly generates a word
function getWord(){
	var word = ['Pikachu ', 'Pika '],
		rand = Math.floor(Math.random()*10);
	if(rand < 4)
		return word[0];
	else
		return word[1];
}

//creates a new answer
function makeAnswer () {
	var dur = parseInt(Math.random() * 10),
		ans = '';
		for (var r = 0; r < dur; r += 1) {
			ans += getWord();
		}
		if (!dur) {
			ans += 'Pika??? ';
		} else if (Math.random() < 0.25) {
			ans += 'PIKACHU ';
		}
	conversationStr += '> ' + ans + '\r';
	setTimeout(updateChat, dur * 100); //simulates the typing effect
}

//"translates" the question from user
function processQuestion () {
	var ques = txtBox.innerHTML,
		quesLen = ques.split(' ').length,     
		transQues = "";
		for (var d = 0; d < quesLen; d+=1) {
			transQues += getWord();
		}
	txtBox.innerHTML = '';
	conversationStr += '* ' + transQues + '\r';
	updateChat();
	txtBox.setAttribute('contentEditable', false);
	makeAnswer();
}

//event handler
txtBox.addEventListener('keypress', function (KEY) {
	if (KEY.keyCode === 13) {
		KEY.preventDefault();
		if (txtBox.innerHTML.length) {
			processQuestion();
		}
	}
});

//runs the chat for first time
updateChat();
