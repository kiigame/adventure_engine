import { EventEmitter } from "@kiigame/kgae_ts";
import { AudioFactory } from "./AudioFactory";

export class Music {
    private musicJson: any;
    private audioFactory: AudioFactory;
    private current_audio: HTMLAudioElement | null;
    private current_audio_source: string | null;
    private current_audio_fade_out: boolean;

    constructor(musicJson: any, audioFactory: AudioFactory, uiEventEmitter: EventEmitter) {
        this.musicJson = musicJson;
        this.audioFactory = audioFactory;
        this.current_audio = null;
        this.current_audio_source = null;
        this.current_audio_fade_out = false;

        uiEventEmitter.on('play_sequence_started', (sequenceId: string) => {
            this.playMusicById(sequenceId);
        });
        // Assumes room music is in musicJson with the roomId
        uiEventEmitter.on('arrived_in_room', (roomId: string) => {
            this.playMusicById(roomId);
        });
    }

    /**
     * Get music by id from music.json data and play it. Backwards compatibility method.
     * @param {string} id Object id; looks for music for this room/sequence/other from music.json data
     */
    playMusicById(id: string) {
        if (id == undefined) {
            return;
        }

        var data = this.musicJson[id];
        this.playMusic(data);
    }

    /**
     * Play music based on data object with file name, fade and loop properties.
     *
     * Stops previous music if no music is found for this id. Note that moving to a room and
     * playing a sequence always call this; if you want the music to continue, it needs to be
     * the same as in previous room/sequence.
     */
    playMusic(data: { music: string, fade_in: boolean, fade_out: boolean, loop: boolean }) {
        // If no new music is to be played, stop the old music.
        if (!data || !data.music) {
            this.stopMusic(this.current_audio, this.current_audio_fade_out);
            return;
        }

        // If not already playing music or old/new songs are different
        if (!this.current_audio || this.current_audio_source != data.music) {
            this.stopMusic(this.current_audio, this.current_audio_fade_out);
            this.current_audio = this.audioFactory.create(data.music);

            // Fade music in if it's new and fade_in is set
            if (data.fade_in === true) {
                this.current_audio.volume = 0;
                const fade_interval = setInterval(() => {
                    if (!this.current_audio) {
                        return;
                    }
                    // Audio API will throw exception when volume is maxed
                    try {
                        this.current_audio.volume += 0.05;
                    } catch (e) {
                        this.current_audio.volume = 1;
                        clearInterval(fade_interval);
                    }

                    // Some additional safety
                    if (this.current_audio.volume >= 1) {
                        this.current_audio.volume = 1;
                        clearInterval(fade_interval);
                    }
                }, 200);
            } else {
                this.current_audio.volume = 1;
            }

            this.current_audio.play();
            this.current_audio_source = data.music;
        }

        // Loop and fade settings may change when playing the same music in different rooms
        this.current_audio.loop = data.loop === true ? true : false;
        this.current_audio_fade_out = data.fade_out === true ? true : false;
    }

    stopMusic(audio: HTMLAudioElement | null, fade_out: boolean) {
        if (!audio) {
            return;
        }

        // Fade music out if fade is set to true
        if (fade_out === true) {
            const fade_interval = setInterval((audio: HTMLAudioElement) => {
                // Audio API will throw exception when volume is maxed
                // or an crossfade interval may still be running
                try {
                    audio.volume -= 0.05;
                } catch (e) {
                    clearInterval(fade_interval);
                    audio.pause();
                }

                // Some additional safety
                if (audio.volume <= 0) {
                    clearInterval(fade_interval);
                    audio.pause();
                }
            }, 100, audio);
        } else {
            audio.pause();
        }

        audio = null;
    }
}
