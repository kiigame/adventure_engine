export class JSONGetter {
    getJSON(fileName: string) {
        const request = new XMLHttpRequest();
        request.open("GET", fileName, false);
        request.send(null);
        if (request.status != 200) {
            throw new Error("Error fetching json data. File: " + fileName + " status: " + request.status + ": " + request.statusText);
        }
        const json = request.responseText;
        return json;
    }
}
