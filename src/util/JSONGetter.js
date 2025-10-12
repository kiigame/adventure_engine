class JSONGetter {
    constructor () {

    }

    getJSON(json_file) {
        const request = new XMLHttpRequest();
        request.open("GET", json_file, false);
        request.send(null);
        if (request.status != 200) {
            throw new Error("Error fetching json data. File: " + json_file + " status: " + request.status + ": " + request.statusText);
        }
        const json = request.responseText;
        return json;
    }
}

export default JSONGetter;
