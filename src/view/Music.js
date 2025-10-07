/**
 */
class Music {
    constructor(musicJson, audioFactory, uiEventEmitter) {
        this.musicJson = musicJson;
        this.audioFactory = audioFactory;
        this.current_audio = null;
        this.current_audio_source = null;

        uiEventEmitter.on('play_music', (musicParams) => {
            this.playMusic(musicParams);
        });
        uiEventEmitter.on('play_music_by_id', (musicId) => {
            this.playMusicById(musicId);
        });
    }

    /**
     * Get music by id from music.json data and play it. Backwards compatibility method.
     * @param string id Object id; looks for music for this room/sequence/other from music.json data
     */
    playMusicById(id) {
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
     * @param data Object { music: string, fade_in: boolean, facde_out: boolean; loop: boolean }
     */
    playMusic(data) {
        // If no new music is to be played, stop the old music.
        if (!data || !data.music) {
            this.stopMusic(this.current_audio);
            return;
        }

        // If not already playing music or old/new songs are different
        if (!this.current_audio || this.current_audio_source != data.music) {
            this.stopMusic(this.current_audio);
            this.current_audio = this.audioFactory.create(data.music);

            // Fade music in if it's new and fade_in is set
            if (data.fade_in === true) {
                this.current_audio.volume = 0;
                const fade_interval = setInterval(() => {
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
        this.current_audio.fade_in = data.fade_in === true ? true : false;
        this.current_audio.fade_out = data.fade_out === true ? true : false;
    }

    /**
     * @param Audio music
     * @param boolean fade_out
     */
    stopMusic(audio) {
        if (audio == null) {
            return;
        }

        // Fade music out if fade is set to true
        if (audio.fade_out === true) {
            const fade_interval = setInterval((audio) => {
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

export default Music;
