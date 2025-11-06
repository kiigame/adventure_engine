class AudioFactory {
    constructor() {
    }

    create(filename) {
        return new Audio(filename);
    }
}

export default AudioFactory;
