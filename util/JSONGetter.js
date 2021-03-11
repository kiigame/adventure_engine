class JSONGetter {
    constructor () {

    }

    getJSON(json_file) {
        var request = new XMLHttpRequest();
        request.open("GET", json_file, false);
        request.send(null);
        console.log(request.responseText);
        var json = request.responseText;
        return json;
    }
}

export default JSONGetter;
