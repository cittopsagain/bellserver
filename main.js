const readline = require('readline');
const {exec} = require('child_process');
const spawn = require("child_process").spawn;
const path = require('path');
const url = require('url');
const time = require('./bell');
const rl = readline.createInterface(process.stdin, process.stdout);
let tick = '';
let timer = true;
const errCommand = '(error) ERR unknown command';
const command = "++++++++++++++++++++++++++++++++++++++\r\n"+
	"+              Commands              +\r\n"+
	"++++++++++++++++++++++++++++++++++++++\r\n"+
	"+ start  Start the Bell Server       +\r\n"+
	"+ stop   Stop the Bell Server        +\r\n"+
	"+ status Checks Bell Server Status   +\r\n"+
	"+ quit   Exit the Bell Server        +\r\n"+
	"+ clear  Clears the Console              +\r\n"+
	"++++++++++++++++++++++++++++++++++++++\r\n\r\n";
const bellSched = [
	'7:52:0',
	'7:55:0',
	'8:0:0',
	'11:30:0',
	'12:0:0',
	'12:25:0',
	'12:30:0',
	'12:55:0',
	'13:0:0',
	'15:0:0',
	'16:30:0',
	'16:55:0',
	'17:0:0'
];

// Note: Tested on windows 7 operating system only
// Other option is to use audio library in npm
// I just decided not to use the audio library in npm
// https://www.npmjs.com/search?q=keywords:audio
// Date Format: yyyy-mm-dd
const input = '> ';
const clearConsole = "\033[2J\033[0f";

log('\r');
welcomeMessage();
let currentTime = time.get()['hours']+":"+time.get()['minutes']+":"+time.get()['seconds'];
printNextBell(nextBellIs(currentTime));
tickTock();

let wavPath = function() {
	let newDir = '';
	let oldDir = __dirname.split(path.sep);
	for (let i = 0; i < oldDir.length; i++) {
		newDir += oldDir[i]+"\\";
	}
	
	return newDir;
}();

function tickTock() {
	 tick = setTimeout(function () {
		let date = time.get();
		let hours = date['hours'];
		let minutes = date['minutes'];
		let seconds = date['seconds'];

		let ourTimeIs = hours+":"+minutes+":"+seconds;
		
		let isEqual = function() {
			let equal = false;
			
			for (let i = 0; i < bellSched.length; i++) {
				if (bellSched[i] == ourTimeIs) {
					equal = true;
					break;
				}
			}
			
			return equal;
		}();
		
		if (isEqual) {
			let nextBell = nextBellIs(ourTimeIs);
			
			let child = spawn("Powershell.exe", ['powershell -c (New-Object Media.SoundPlayer "'+wavPath+'\\wav\\'+hours+"_"+minutes+'.wav").PlaySync()']);
			log(clearConsole);
			welcomeMessage();
			printNextBell(nextBell);
			prompt();
			
			child.stdout.on("data", function(data) {
				// console.log("Powershell Data: " + data);
			});
			
			child.stderr.on("data", function(data) {
				// console.log("Errors: " + data);
			});
			
			child.on("exit", function() {
				// console.log("Powershell Script finished");
			});
			
			child.stdin.end();
		}
		
        tickTock();
    }, 1000);
}

function nextBellIs(currentTime) {
	let nextBell = 0;
	/* for (var i = 0; i < bellSched.length; i++) {
		if (bellSched[i] == currentTime) {
			nextBell = bellSched[i + 1];
			
			break;
		}
	} */
	for (let i = 0; i < bellSched.length; i++) {
		let date = time.get();
		
		let bSched = Date.parse(`${date['year']}-${date['month']}-${date['date']} ${bellSched[i]}`);
		let toCompare = Date.parse(`${date['year']}-${date['month']}-${date['date']} ${currentTime}`);
		let mill = bSched - toCompare;
		if (mill > 0) {
			nextBell = bellSched[i];
			break;
		}
	}
	
	return (nextBell == 0) ? bellSched[0] : nextBell;
}

// Theres a problem when stopping and starting
// When starting the bell after the stop command, the time is not sync by the system time, you will wait a minute inorder the time is in sync.
// Solution: Create a separate js file for the date time

rl.question(input, function(answer) {
	if (answer != 'start' && answer != 'stop' && answer != 'quit' && answer != 'help' && answer != 'status' && answer != 'clear') {
		log(`${errCommand} '${answer}'`);
		log('Use help to view the commands\r\n');
		prompt();
	}
	
	if (answer.toLowerCase().trim() === 'quit') {
		log("Quit...");
		// process.stdout.write('\033c');
		rl.close();
	}
	
	if (answer.toLowerCase().trim() === 'stop') {
		if (timer) {
			log("Status: Stopped...\r\n");
			clearTimeout(tick);
			timer = false;
		} else {
			log("Status: Already stopped...\r\n");
		}
		
		prompt();
	}
	
	if (answer.toLowerCase().trim() === 'start') {
		if (! timer) {
			log("Status: Running...\r\n");
			tickTock();
			timer = true;
			
			let currentTime = time.get()['hours']+":"+time.get()['minutes']+":"+time.get()['seconds'];
			let nextBell = nextBellIs(currentTime);
			log(clearConsole);
			welcomeMessage();
			printNextBell(nextBell);
		} else {
			log("Status: Already running...\r\n");
		}
		
		prompt();
	}
	
	if (answer.toLowerCase().trim() === 'help') {
		log(command);
		prompt();
	}
	
	if (answer.toLowerCase().trim() === 'status') {
		whatsTheStatus();
		prompt();
	}
	
	if (answer.toLowerCase().trim() === 'clear') {
		let currentTime = time.get()['hours']+":"+time.get()['minutes']+":"+time.get()['seconds'];
		let nextBell = nextBellIs(currentTime);
		log(clearConsole);
		welcomeMessage();
		printNextBell(nextBell);
		
		prompt();
	}
	
	rl.on('line', function(a) {
		if (a != 'start' && a != 'stop' && a != 'quit' && a != 'help' && a != 'status' && a != 'clear') {
			log(`${errCommand} '${a}'`);
			log('Use help to view the commands\r\n');
			prompt();
		}
		
		if (a.toLowerCase().trim() === 'quit') {
			log("Quit...");
			rl.close();
		}
		
		if (a.toLowerCase().trim() === 'stop') {
			if (timer) {
				log("Status: Stopped...\r\n");
				clearTimeout(tick);
				timer = false;
			} else {
				log("Status: Already stopped...\r\n");
			}
			
			prompt();
		}
		
		if (a.toLowerCase().trim() === 'start') {
			if (! timer) {
				log("Status: Running...\r\n");
				tickTock();
				timer = true;
				
				let currentTime = time.get()['hours']+":"+time.get()['minutes']+":"+time.get()['seconds'];
				let nextBell = nextBellIs(currentTime);
				log(clearConsole);
				welcomeMessage();
				printNextBell(nextBell);
			} else {
				log("Status: Already running...\r\n");
			}
			
			prompt();
		}
		
		if (a.toLowerCase().trim() === 'help') {
			log(command);
			prompt();
		}
		
		if (a.toLowerCase().trim() === 'status') {
			whatsTheStatus();
			prompt();
		}
		
		if (a.toLowerCase().trim() === 'clear') {
			let currentTime = time.get()['hours']+":"+time.get()['minutes']+":"+time.get()['seconds'];
			let nextBell = nextBellIs(currentTime);
			log(clearConsole);
			welcomeMessage();
			printNextBell(nextBell);
			
			prompt();
		}
	});
});

rl.on('close', function() {
	process.exit();
});

function welcomeMessage() {
	log('Welcome to Bell Server\r\n\r\nStarting....\r\n');
}

function printNextBell(time) {
	log(`Next bell is ${time}\r\n`);
}

function prompt() {
	rl.setPrompt(input);
	rl.prompt();
}

function whatsTheStatus() {
	log(`Bell Server is ${(! timer) ? 'not running\r\n' : 'running\r\n'}`);
}

function log(any) {
	console.log(any);
}