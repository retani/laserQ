parse = function (data) {
	var parts = data.split(", ")
	var incoming = {}
	incoming.raw = data
	incoming.isDataPoint = parts.length > 1
	if (incoming.isDataPoint) {
		incoming.state = parts[0]
		incoming.count = parts[1]
		incoming.deltatime = parts[2]
		incoming.abstime = parts[3]
	}
	else {
		incoming.message = data
	}
	return incoming
}

module.exports = { parse : parse };