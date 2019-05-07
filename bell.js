function get() {
	// Month index is 0 - 11
	let date = new Date();
	let hours = date.getHours();
	let minutes = date.getMinutes();
	let seconds = date.getSeconds();
	let year = date.getFullYear();
	let month = date.getMonth();
	let d = date.getDate();
	
	return {dinstance: date, year: year, month: month, date: d, hours: hours, minutes: minutes, seconds: seconds};
}
module.exports.get = get;