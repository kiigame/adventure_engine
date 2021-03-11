/**
 */
class Music {
    constructor(musicJson, audioFactory) {
        this.musicJson = musicJson;
        this.audioFactory = audioFactory;
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

        var data = this.musicJson[id];

        // If no new music is to be played, stop the old music.
        if (!data || !data.music) {
            this.stopMusic(this.current_music);
            return;
        }

        // If not already playing music or old/new songs are different
        if (!this.current_music || this.current_music_source != data.music) {
            this.stopMusic(this.current_music);
            this.current_music = this.audioFactory.create(data.music);

            // Fade music in if it's new and fade is set
            if (data.fade === true) {
                this.current_music.volume = 0;
                var fade_interval = setInterval(() => {
                    // Audio API will throw exception when volume is maxed
                    try {
                        this.current_music.volume += 0.05
                    } catch (e) {
                        this.current_music.volume = 1;
                        clearInterval(fade_interval);
                    }

                    // Some additional safety
                    if (this.current_music.volume >= 1) {
                        this.current_music.volume = 1;
                        clearInterval(fade_interval);
                    }
                }, 200);
           } else {
                this.current_music.volume = 1;
            }

            this.current_music.play();
            this.current_music_source = data.music;
        }

        // Loop and fade settings may change when playing the same music in different rooms
        this.current_music.loop = data.loop === true ? true : false;
        this.current_music.fade = data.fade === true ? true : false;
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

                // Some additional safety
                if (this.current_music.volume <= 0) {
                    clearInterval(fade_interval);
                    music.pause();
                }
            }, 100, music);
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
