export class AudioFactory {
    create(filename: string): HTMLAudioElement {
        return new Audio(filename);
    }
}
