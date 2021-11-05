const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const heading = $('header h2');
const cdthumnail = $('.cd-thumb');
const audio = $('#audio');
const cd = $('.cd')
const playBtn = $('.btn-toggle-play');
const pauseBtn = $('.player')
const progress = $('#progress');
const nextBtn = $('.btn-next');
const PrevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playlist = $('.playlist');

const PLAYER_STORAGE_KEY = 'F8_PLAYER'


const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: "Unity",
            singer: "Alan Waker",
            path: "/asssets/music/Unity - Alan Walker.mp3",
            image: "/asssets/img/Unity.jpg",
        },
        {
            name: "Lost Control",
            singer: "Alan Walker",
            path: "/asssets/music/LostControl.mp3",
            image: "/asssets/img/Lost_Control.jpg",
        },
        {
            name: "On My Way",
            singer: "Alan Waker",
            path: "/asssets/music/OnMyWay-AlanWalkerSabrinaCarpenterFarruko-5919403.mp3",
            image: "/asssets/img/onMyWay.jpg",
        },
        {
            name: "Sing Me To Sleep",
            singer: "Alan Waker",
            path: "/asssets/music/SingMetoSleep-AlanWalker-5815065.mp3",
            image: "/asssets/img/singMeToSleep.jpg",
        },
        {
            name: "Diamond Heart",
            singer: "Alan Waker",
            path: "/asssets/music/DiamondHeart-AlanWalkerSophiaSomajo-5815095.mp3",
            image: "/asssets/img/Diamond_Heart.jpg",
        },
        {
            name: "Alone",
            singer: "Alan Waker",
            path: "/asssets/music/Alone - Alan Walker.mp3",
            image: "/asssets/img/Alone.jpg",
        },
        {
            name: "All Fall Down",
            singer: "Alan Waker",
            path: "/asssets/music/AllFallsDown-AlanWalkerNoahCyrusDigitalFarmAnimalsJuliander-5817723.mp3",
            image: "/asssets/img/All_Fall_Down.jpg",
        },
    ],
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    render: function(songs) {
        var htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${(index === this.currentIndex) ? 'active' : '' }" data-index=${index}>
                <div
                    class="thumb"
                    style="
                    background-image: url('${song.image}');
                    "
                ></div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>`
        })
        playlist.innerHTML = htmls.join('');
    },

    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex];
            }
        })
    },
    handleEvents: function() {
        const _this = this;
        // xu ly phong to / thu nho CD
        const cdWidth = cd.offsetWidth;
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;
            
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        }

        //xu ly khi click play
        playBtn.onclick = function() {
            if(_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        }
        // xu ly khi song duoc play
        audio.onplay = function() {
            _this.isPlaying = true;
            pauseBtn.classList.add("playing")
            cdThumnailAnimate.play();
        }
        // xu ly khi song bi pause 
        audio.onpause = function() {
            _this.isPlaying = false;
            pauseBtn.classList.remove("playing");
            cdThumnailAnimate.pause();
        } 
        // xu ly khi tien do bai hat thay doi
        audio.ontimeupdate = function() {
            if(audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = progressPercent;
            }
        }
        // xu ly khi tua song 
        progress.onchange = function(e) {
            const seekTime = audio.duration / 100 * e.target.value
            audio.currentTime = seekTime;
        }
        // xu ly CD quay / dung
        const cdThumnailAnimate = cdthumnail.animate([
            {transform: 'rotate(360deg)'}
        ], {
            duration: 10000,
            iterations: Infinity
        })
        cdThumnailAnimate.pause();
        // xu ly next song
        nextBtn.onclick = function() {
            if(_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.nextSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }
        // xu ly preview song
        PrevBtn.onclick = function() {
            if(_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.PrevSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }
        // xu ly tat / bat random 
        randomBtn.onclick = function() {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            randomBtn.classList.toggle('active', _this.isRandom);
        }
        // xu ly song ended
        audio.onended = function() {
            if(_this.isRepeat) {
                audio.play();
            } else {
                nextBtn.click();
            }
        }
        // xu ly lap lai song
        repeatBtn.onclick = function() {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);
            repeatBtn.classList.toggle('active', _this.isRepeat);
        }
        // xu ly khi nhap vao playlist
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)')
            if(songNode || e.target.closest('.option')) {
                // xu ly khi nhap vao song
                if(songNode && !e.target.closest('.option')) {
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong();
                    _this.render();
                    audio.play();
                }
                // xu ly khi nhap option
                if(e.target.closest('.option')) {
                    console.log('chua co gi trong option')
                } 
            }
        }
    },

    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name;
        cdthumnail.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path
    },

    loadConfig: function() {
        app.isRandom = this.config.isRandom
        app.isRepeat = this.config.isRepeat
    },

    nextSong: function() {
        this.currentIndex++
        if(this.currentIndex >= this.songs.length) {
            app.currentIndex = 0;
        }
        this.loadCurrentSong();
    },

    PrevSong: function() {
        this.currentIndex--
        if(this.currentIndex < 0) {
            app.currentIndex = this.songs.length;
        }
        this.loadCurrentSong();
    },

    playRandomSong: function() {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndex);
        app.currentIndex = newIndex
        this.loadCurrentSong();
    },

    scrollToActiveSong() {
        setTimeout(function() {
            if(app.currentIndex === 0) {
                $('.song.active').scrollIntoView({
                    behavior: 'smooth',
                    block: 'end'
                })
            } else {
                $('.song.active').scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                })
            }

        }, 300)
    },

    start: function() {
        this.loadConfig();
        // Dinh nghia cac thuoc tinh cho Object
        this.defineProperties();
        
        // lang nghe/ xu ly cac su kien
        this.handleEvents();

        this.loadCurrentSong();
        
        //render playList
        this.render();
        randomBtn.classList.toggle('active', this.isRandom);
        repeatBtn.classList.toggle('active', this.isRepeat);
    },

};


app.start();
