class VideoWallPlayer extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = `
        <style>
            :host {
                display: block;
                width: 100%;
                height: 100%;
                min-height: 200px;
            }

            .player {
                position: relative;
                width: 100%;
                height: 100%;
                min-height: 200px;
                overflow: hidden;
                background: #000;
                border-radius: 5px;
            }

            video {
                display: block;
                width: 100%;
                height: 100%;
                object-fit: contain;
                background: #000;
            }

            /* =========================
               PROGRESS BAR
            ========================= */
            .progress {
                position: absolute;
                bottom: 38px;
                left: 0;
                z-index: 5;
                width: 100%;
                height: 5px;
                background: rgba(255, 255, 255, 0.3);
                cursor: pointer;
                transition: height 0.2s;
            }

            .progress:hover {
                height: 8px;
            }

            .progress-value {
                width: 0%;
                height: 100%;
                background: #ff0000;
                transition: width 0.1s;
            }

            /* =========================
               CONTROL BAR
            ========================= */
            .controls {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 38px;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 10px;
                box-sizing: border-box;
                opacity: 1;
                transition: opacity 0.3s;
            }

            .player:hover .controls {
                opacity: 1;
            }

            .controls.hidden {
                opacity: 0;
                pointer-events: none;
            }

            .control-center {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .time {
                color: white;
                font-size: 12px;
                font-family: Arial, sans-serif;
                user-select: none;
                min-width: 30px;
                text-align: center;
            }

            .time-display {
                color: white;
                font-size: 12px;
                font-family: Arial, sans-serif;
                user-select: none;
                min-width: 80px;
                text-align: center;
            }

            /* =========================
               ROUND BUTTONS
            ========================= */
            button {
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                background: transparent;
                color: white;
                font-size: 16px;
                padding: 0;
                transition: all 0.2s;
            }

            button:hover {
                transform: scale(1.1);
                color: #ff0000;
            }

            button:active {
                transform: scale(0.9);
            }

            .circle-button {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.1);
                font-size: 14px;
            }

            .circle-button:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            /* =========================
               RIGHT CONTROLS
            ========================= */
            .side-controls {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .icon-button {
                font-size: 20px;
                padding: 4px;
            }

            /* =========================
               VOLUME SLIDER
            ========================= */
            .volume-slider {
                width: 60px;
                height: 4px;
                -webkit-appearance: none;
                appearance: none;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 2px;
                outline: none;
                transition: all 0.2s;
            }

            .volume-slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: #ff0000;
                cursor: pointer;
            }

            .volume-slider::-moz-range-thumb {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: #ff0000;
                cursor: pointer;
                border: none;
            }

            .volume-slider:hover {
                height: 6px;
            }

            /* =========================
               FULLSCREEN OVERLAY
            ========================= */
            .fullscreen-overlay {
                position: absolute;
                inset: 0;
                z-index: 20;
                display: none;
                align-items: center;
                justify-content: center;
                background: rgba(0, 0, 0, 0.8);
                flex-direction: column;
                gap: 20px;
            }

            .fullscreen-overlay.show {
                display: flex;
            }

            .overlay-fullscreen {
                width: 60px;
                height: 60px;
                background: rgba(255, 255, 255, 0.1);
                border: 2px solid white;
                border-radius: 50%;
                font-size: 30px;
                color: white;
                transition: all 0.3s;
            }

            .overlay-fullscreen:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: scale(1.1);
            }

            .fullscreen-label {
                font-size: 16px;
                color: white;
                font-family: Arial, sans-serif;
                letter-spacing: 2px;
            }

            /* Loading state */
            .loading {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: white;
                font-family: Arial, sans-serif;
                font-size: 14px;
                z-index: 1;
            }

            .loading.hidden {
                display: none;
            }
        </style>

        <div class="player">
            <!-- LOADING -->
            <div class="loading">Loading...</div>

            <!-- PROGRESS -->
            <div class="progress">
                <div class="progress-value"></div>
            </div>

            <!-- VIDEO -->
            <video></video>

            <!-- FULLSCREEN OVERLAY -->
            <div class="fullscreen-overlay">
                <button class="overlay-fullscreen" aria-label="Fullscreen">
                    ⛶
                </button>
                <span class="fullscreen-label">FULLSCREEN</span>
            </div>

            <!-- CONTROLS -->
            <div class="controls">
                <div class="control-center">
                    <span class="time time-current">0:00</span>
                    
                    <button class="circle-button backward" title="Back 10 seconds">
                        ◀◀
                    </button>

                    <button class="circle-button play" title="Play">
                        ▶
                    </button>

                    <button class="circle-button forward" title="Forward 10 seconds">
                        ▶▶
                    </button>

                    <span class="time time-duration">0:00</span>
                </div>

                <div class="side-controls">
                    <input type="range" class="volume-slider" min="0" max="1" step="0.1" value="1">
                    
                    <button class="icon-button mute" title="Mute">
                        🔊
                    </button>

                    <button class="icon-button fullscreen" title="Fullscreen">
                        ⛶
                    </button>
                </div>
            </div>
        </div>
        `;

        // Get elements
        this.video = this.shadowRoot.querySelector("video");
        this.controls = this.shadowRoot.querySelector(".controls");
        this.progress = this.shadowRoot.querySelector(".progress");
        this.progressValue = this.shadowRoot.querySelector(".progress-value");
        this.playButton = this.shadowRoot.querySelector(".play");
        this.backwardButton = this.shadowRoot.querySelector(".backward");
        this.forwardButton = this.shadowRoot.querySelector(".forward");
        this.fullscreenButton = this.shadowRoot.querySelector(".fullscreen");
        this.overlayFullscreenButton = this.shadowRoot.querySelector(".overlay-fullscreen");
        this.muteButton = this.shadowRoot.querySelector(".mute");
        this.volumeSlider = this.shadowRoot.querySelector(".volume-slider");
        this.timeCurrent = this.shadowRoot.querySelector(".time-current");
        this.timeDuration = this.shadowRoot.querySelector(".time-duration");
        this.fullscreenOverlay = this.shadowRoot.querySelector(".fullscreen-overlay");
        this.loading = this.shadowRoot.querySelector(".loading");

        // Set video source
        const src = this.getAttribute("src");
        if (src) {
            this.video.src = src;
        }

        this.video.preload = "metadata";
        this.video.playsInline = true;
        this.video.controls = false;

        // Initialize
        this.setupControls();
        this.setupKeyboardShortcuts();
        this.autoHideControls();
    }

    setupControls() {
        // Play/Pause
        this.playButton.addEventListener("click", async () => {
            if (this.video.paused || this.video.ended) {
                try {
                    await this.video.play();
                } catch (error) {
                    console.error("Video play error:", error);
                }
            } else {
                this.video.pause();
            }
        });

        // Video events
        this.video.addEventListener("play", () => {
            this.playButton.textContent = "⏸";
            this.playButton.title = "Pause";
        });

        this.video.addEventListener("pause", () => {
            this.playButton.textContent = "▶";
            this.playButton.title = "Play";
        });

        this.video.addEventListener("ended", () => {
            this.playButton.textContent = "▶";
            this.playButton.title = "Play";
        });

        this.video.addEventListener("loadedmetadata", () => {
            this.updateTimeDisplay();
            this.loading.classList.add("hidden");
        });

        this.video.addEventListener("waiting", () => {
            this.loading.classList.remove("hidden");
        });

        this.video.addEventListener("canplay", () => {
            this.loading.classList.add("hidden");
        });

        // Backward/Forward
        this.backwardButton.addEventListener("click", () => {
            this.video.currentTime = Math.max(0, this.video.currentTime - 10);
        });

        this.forwardButton.addEventListener("click", () => {
            this.video.currentTime = Math.min(this.video.duration, this.video.currentTime + 10);
        });

        // Mute/Unmute
        this.muteButton.addEventListener("click", () => {
            this.video.muted = !this.video.muted;
            this.updateMuteButton();
        });

        // Volume slider
        this.volumeSlider.addEventListener("input", () => {
            this.video.volume = parseFloat(this.volumeSlider.value);
            if (this.video.volume > 0) {
                this.video.muted = false;
                this.updateMuteButton();
            }
        });

        this.video.addEventListener("volumechange", () => {
            this.volumeSlider.value = this.video.muted ? 0 : this.video.volume;
            this.updateMuteButton();
        });

        // Fullscreen
        this.fullscreenButton.addEventListener("click", () => {
            this.toggleFullscreen();
        });

        this.overlayFullscreenButton.addEventListener("click", () => {
            this.toggleFullscreen();
        });

        // Progress update
        this.video.addEventListener("timeupdate", () => {
            if (!this.video.duration || isNaN(this.video.duration)) return;
            
            const percentage = (this.video.currentTime / this.video.duration) * 100;
            this.progressValue.style.width = `${percentage}%`;
            this.updateTimeDisplay();
        });

        // Click progress to seek
        this.progress.addEventListener("click", (event) => {
            if (!this.video.duration) return;
            
            const rect = this.progress.getBoundingClientRect();
            const percentage = (event.clientX - rect.left) / rect.width;
            this.video.currentTime = percentage * this.video.duration;
        });

        // Double click video
        this.video.addEventListener("dblclick", () => {
            this.toggleFullscreen();
        });

        // Click video to play/pause
        this.video.addEventListener("click", () => {
            this.playButton.click();
        });

        // Show/hide overlay
        this.video.addEventListener("enterpictureinpicture", () => {
            this.fullscreenOverlay.classList.remove("show");
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener("keydown", (e) => {
            // Only if this component is visible
            if (!this.isConnected) return;
            
            // Check if we're in this component
            const activeElement = document.activeElement;
            if (activeElement && this.contains(activeElement)) return;

            switch(e.key.toLowerCase()) {
                case " ":
                    e.preventDefault();
                    this.playButton.click();
                    break;
                case "f":
                    this.toggleFullscreen();
                    break;
                case "m":
                    this.muteButton.click();
                    break;
                case "arrowright":
                    e.preventDefault();
                    this.forwardButton.click();
                    break;
                case "arrowleft":
                    e.preventDefault();
                    this.backwardButton.click();
                    break;
            }
        });
    }

    autoHideControls() {
        let timeout;
        const controls = this.controls;
        
        this.video.addEventListener("mouseenter", () => {
            controls.classList.remove("hidden");
            clearTimeout(timeout);
        });

        this.video.addEventListener("mouseleave", () => {
            if (!this.video.paused) {
                timeout = setTimeout(() => {
                    controls.classList.add("hidden");
                }, 3000);
            }
        });

        this.video.addEventListener("play", () => {
            timeout = setTimeout(() => {
                controls.classList.add("hidden");
            }, 3000);
        });

        this.video.addEventListener("pause", () => {
            controls.classList.remove("hidden");
            clearTimeout(timeout);
        });

        // Show controls on mouse move
        this.shadowRoot.querySelector(".player").addEventListener("mousemove", () => {
            controls.classList.remove("hidden");
            clearTimeout(timeout);
            
            if (!this.video.paused) {
                timeout = setTimeout(() => {
                    controls.classList.add("hidden");
                }, 3000);
            }
        });
    }

    updateTimeDisplay() {
        if (!this.video.duration) {
            this.timeDuration.textContent = "0:00";
            this.timeCurrent.textContent = "0:00";
            return;
        }

        const formatTime = (seconds) => {
            if (isNaN(seconds)) return "0:00";
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        };

        this.timeCurrent.textContent = formatTime(this.video.currentTime);
        this.timeDuration.textContent = formatTime(this.video.duration);
    }

    updateMuteButton() {
        if (this.video.muted || this.video.volume === 0) {
            this.muteButton.textContent = "🔇";
            this.muteButton.title = "Unmute";
            this.volumeSlider.value = 0;
        } else {
            this.muteButton.textContent = "🔊";
            this.muteButton.title = "Mute";
            this.volumeSlider.value = this.video.volume;
        }
    }

    toggleFullscreen() {
        const player = this.shadowRoot.querySelector(".player");
        
        if (!document.fullscreenElement) {
            if (player.requestFullscreen) {
                player.requestFullscreen().catch(err => {
                    console.error("Fullscreen error:", err);
                });
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }

    // Attribute changed
    static get observedAttributes() {
        return ["src"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "src" && newValue !== oldValue) {
            this.video.src = newValue;
            this.video.load();
            this.loading.classList.remove("hidden");
        }
    }

    // Clean up
    disconnectedCallback() {
        this.video.pause();
        this.video.src = "";
        this.video.load();
    }
}

customElements.define("video-wall-player", VideoWallPlayer);
