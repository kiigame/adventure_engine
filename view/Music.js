/**
 */
class Music {
    constructor(jsonGetter) {
        this.jsonGetter = jsonGetter;
        this.music_json = JSON.parse(this.jsonGetter.getJSON('../data/music.json'));
        this.current_music = null;
        this.current_music_source = null;
    }

    /**
     * Play music.
     * Stops previous music if no music is found for this id. Note that moving to a room and
     * playing a sequence always call this; if you want the music to continue, it needs to be
     * the same as in previous room/sequence.
     * @param string id Object id; looks for music for this room/sequence/other from music.json data
     */
    playMusic(id) {
        if (id == undefined) {
            return;
        }

        var data = this.music_json[id];

        // If no new music is to be played, stop the old music.
        if (!data || !data.music) {
            this.stopMusic(this.current_music);
            return;
        }

        // If not already playing music or old/new songs are different
        if (!this.current_music || this.current_music_source != data.music) {
            this.stopMusic(this.current_music);
            this.current_music = new Audio(data.music);

            // Fade music volume if set so
            if (data.music_fade === true) {
                this.current_music.fade = true;
                this.current_music.volume = 0;
                var fade_interval = setInterval(() => {
                    // Audio API will throw exception when volume is maxed
                    try {
                        this.current_music.volume += 0.05
                    } catch (e) {
                        this.current_music.volume = 1;
                        clearInterval(fade_interval);
                    }
                }, 200)
           } else {
                this.current_music.fade = false;
                this.current_music.volume = 1;
            }

            this.current_music.loop = data.music_loop === false ? false : true;
            this.current_music.play();
            this.current_music_source = data.music;
        }
    }

    /**
     * @param Audio music
     */
    stopMusic(music) {
        if (music == null) {
            return;
        }

        // Fade music out if fade is set to true
        if (music.fade === true) {
            var fade_interval = setInterval((music) => {
                // Audio API will throw exception when volume is maxed
                // or an crossfade interval may still be running
                try {
                    music.volume -= 0.05;
                } catch (e) {
                    clearInterval(fade_interval);
                    music.pause();
                }
            }, 100, music)
        } else {
            music.pause();
        }

        music = null;
    }

    /**
     * @returns Audio|null
     */
    getCurrentMusic() {
        return this.current_music;
    }
}

export default Music;
