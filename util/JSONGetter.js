class JSONGetter {
    constructor () {

    }

    getJSON(json_file) {
        var request = new XMLHttpRequest();
        request.open("GET", json_file, false);
        request.send(null);
        if (request.status != 200) {
            throw("File: " + json_file + " status: " + request.status + ": " + request.statusText);
        }
        var json = request.responseText;
        return json;
    }
}

export default JSONGetter;
