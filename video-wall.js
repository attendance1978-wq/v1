class videowallplayer extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({
            mode: "open"
        });

        this.shadowRoot.innerHTML = `
        <style>
            :host {
                display: block;
                width: 100%;
                height: 100%;
            }

            .player {
                position: relative;
                width: 100%;
                height: 100%;
                min-height: 200px;
                overflow: hidden;
                background: white;
                border-radius: 5px;
            }

            video {
                display: block;
                width: 100%;
                height: calc(100% - 38px);
                object-fit: contain;
                background: white;
            }

            /* =========================
               PROGRESS BAR
            ========================= */
            .progress {
                position: absolute;
                top: 0;
                left: 0;
                z-index: 5;
                width: 100%;
                height: 5px;
                background: #c6aaaa;
                cursor: pointer;
            }

            .progress-value {
                width: 0%;
                height: 100%;
                background: red;
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
                background: #9d8c8c;
                display: flex;
                align-items: center;
                justify-content: space-between; /* Changed from center */
                padding: 0 10px;
                box-sizing: border-box;
            }

            .control-center {
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .time {
                color: white;
                font-size: 10px; /* Increased from 7px */
                user-select: none;
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
            }

            .circle-button {
                width: 27px;
                height: 27px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.2);
                color: white;
                font-size: 15px;
                padding: 0;
                transition: all 0.2s;
            }

            .circle-button:hover {
                background: rgba(255, 255, 255, 0.4);
                transform: scale(1.05);
            }

            .circle-button:active {
                transform: scale(0.9);
            }

            /* =========================
               RIGHT CONTROLS
            ========================= */
            .side-controls {
                display: flex;
                align-items: center;
                gap: 3px;
            }

            .icon-button {
                width: 23px;
                height: 28px;
                padding: 0;
                background: transparent;
                color: white;
                font-size: 19px;
                transition: all 0.2s;
            }

            .icon-button:hover {
                transform: scale(1.1);
                opacity: 0.8;
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
                background: white;
                border: none;
                border-radius: 50%;
                font-size: 30px;
                color: black;
                cursor: pointer;
                transition: all 0.3s;
            }

            .overlay-fullscreen:hover {
                transform: scale(1.1);
                background: #f0f0f0;
            }

            .fullscreen-label {
                font-size: 20px;
                color: white;
                font-weight: 300;
                letter-spacing: 2px;
            }

            /* =========================
               HIDE CONTROLS ON IDLE
            ========================= */
            .controls.hidden {
                opacity: 0;
                transition: opacity 0.3s;
            }

            .controls {
                transition: opacity 0.3s;
            }

            .progress.hidden {
                opacity: 0;
                transition: opacity 0.3s;
            }

            .progress {
                transition: opacity 0.3s;
            }
        </style>

        <div class="player">
            <!-- PROGRESS -->
            <div class="progress">
                <div class="progress-value"></div>
            </div>

            <!-- VIDEO -->
            <video></video>

            <!-- FULLSCREEN OVERLAY -->
            <div class="fullscreen-overlay">
                <button class="overlay-fullscreen">
                    ⛶
                </button>
                <span class="fullscreen-label">FULLSCREEN</span>
            </div>

            <!-- CONTROLS -->
            <div class="controls">
                <div class="control-center">
                    <span class="time">-10</span>
                    <button class="circle-button backward" title="Back 10 seconds">◀</button>
                    <button class="circle-button play" title="Play">▶</button>
                    <button class="circle-button forward" title="Forward 10 seconds">▶</button>
                    <span class="time">+10</span>
                </div>

                <div class="side-controls">
                    <button class="icon-button fullscreen" title="Fullscreen">⛶</button>
                    <button class="icon-button mute" title="Mute">🔊</button>
                </div>
            </div>
        </div>
        `;

        // GET VIDEO ELEMENT
        this.video = this.shadowRoot.querySelector("video");
        
        // SET VIDEO SOURCE
        this.video.src = this.getAttribute("src") || "";
        this.video.preload = "metadata";
        this.video.playsInline = true;
        this.video.controls = false;

        // Initialize controls
        this.setupControls();
        
        // Auto-hide controls timer
        this.controlsTimer = null;
    }

    setupControls() {
        const root = this.shadowRoot;
        const playButton = root.querySelector(".play");
        const backwardButton = root.querySelector(".backward");
        const forwardButton = root.querySelector(".forward");
        const fullscreenButton = root.querySelector(".fullscreen");
        const overlayFullscreenButton = root.querySelector(".overlay-fullscreen");
        const muteButton = root.querySelector(".mute");
        const progress = root.querySelector(".progress");
        const progressValue = root.querySelector(".progress-value");
        const controls = root.querySelector(".controls");
        const player = root.querySelector(".player");
        const fullscreenOverlay = root.querySelector(".fullscreen-overlay");

        // =========================
        // PLAY / PAUSE
        // =========================
        playButton.addEventListener("click", async () => {
            if (this.video.paused || this.video.ended) {
                try {
                    await this.video.play();
                } catch (error) {
                    console.error("Video play error:", error);
                }
            } else {
                this.video.pause();
            }
            this.resetControlsTimer();
        });

        // =========================
        // WHEN VIDEO PLAYS
        // =========================
        this.video.addEventListener("play", () => {
            playButton.textContent = "❚❚";
            playButton.title = "Pause";
        });

        // =========================
        // WHEN VIDEO PAUSES
        // =========================
        this.video.addEventListener("pause", () => {
            playButton.textContent = "▶";
            playButton.title = "Play";
        });

        // =========================
        // WHEN VIDEO ENDS
        // =========================
        this.video.addEventListener("ended", () => {
            playButton.textContent = "▶";
            playButton.title = "Play";
        });

        // =========================
        // BACKWARD 10 SECONDS
        // =========================
        backwardButton.addEventListener("click", () => {
            this.video.currentTime = Math.max(0, this.video.currentTime - 10);
            this.resetControlsTimer();
        });

        // =========================
        // FORWARD 10 SECONDS
        // =========================
        forwardButton.addEventListener("click", () => {
            this.video.currentTime = Math.min(this.video.duration, this.video.currentTime + 10);
            this.resetControlsTimer();
        });

        // =========================
        // MUTE / UNMUTE
        // =========================
        muteButton.addEventListener("click", () => {
            this.video.muted = !this.video.muted;
            muteButton.textContent = this.video.muted ? "🔇" : "🔊";
            muteButton.title = this.video.muted ? "Unmute" : "Mute";
            this.resetControlsTimer();
        });

        // =========================
        // FULLSCREEN
        // =========================
        const toggleFullscreen = () => {
            if (!document.fullscreenElement) {
                if (player.requestFullscreen) {
                    player.requestFullscreen();
                }
            } else {
                document.exitFullscreen();
            }
        };

        fullscreenButton.addEventListener("click", toggleFullscreen);
        overlayFullscreenButton.addEventListener("click", toggleFullscreen);

        // =========================
        // UPDATE PROGRESS
        // =========================
        this.video.addEventListener("timeupdate", () => {
            if (!this.video.duration || isNaN(this.video.duration)) {
                return;
            }
            const percentage = (this.video.currentTime / this.video.duration) * 100;
            progressValue.style.width = `${percentage}%`;
        });

        // =========================
        // CLICK PROGRESS TO SEEK
        // =========================
        progress.addEventListener("click", (event) => {
            if (!this.video.duration) return;
            const rect = progress.getBoundingClientRect();
            const percentage = (event.clientX - rect.left) / rect.width;
            this.video.currentTime = percentage * this.video.duration;
            this.resetControlsTimer();
        });

        // =========================
        // DOUBLE CLICK VIDEO
        // =========================
        this.video.addEventListener("dblclick", () => {
            if (!document.fullscreenElement) {
                if (player.requestFullscreen) {
                    player.requestFullscreen();
                }
            } else {
                document.exitFullscreen();
            }
        });

        // =========================
        // MOUSE MOVE - SHOW CONTROLS
        // =========================
        player.addEventListener("mousemove", () => {
            this.showControls();
            this.resetControlsTimer();
        });

        player.addEventListener("mouseleave", () => {
            if (!this.video.paused) {
                this.hideControls();
            }
        });

        // =========================
        // FULLSCREEN CHANGE EVENTS
        // =========================
        document.addEventListener("fullscreenchange", () => {
            if (document.fullscreenElement) {
                fullscreenOverlay.classList.add("show");
            } else {
                fullscreenOverlay.classList.remove("show");
            }
        });

        // =========================
        // KEYBOARD SHORTCUTS
        // =========================
        document.addEventListener("keydown", (e) => {
            if (e.target === this.video) {
                if (e.code === "Space") {
                    e.preventDefault();
                    playButton.click();
                }
                if (e.code === "ArrowRight") {
                    e.preventDefault();
                    forwardButton.click();
                }
                if (e.code === "ArrowLeft") {
                    e.preventDefault();
                    backwardButton.click();
                }
                if (e.code === "KeyM") {
                    muteButton.click();
                }
                if (e.code === "KeyF") {
                    toggleFullscreen();
                }
            }
        });

        // Initial hide after 3 seconds if playing
        this.resetControlsTimer();
    }

    // =========================
    // AUTO-HIDE CONTROLS
    // =========================
    resetControlsTimer() {
        if (this.controlsTimer) {
            clearTimeout(this.controlsTimer);
        }
        this.showControls();
        if (!this.video.paused) {
            this.controlsTimer = setTimeout(() => {
                this.hideControls();
            }, 3000);
        }
    }

    showControls() {
        const controls = this.shadowRoot.querySelector(".controls");
        const progress = this.shadowRoot.querySelector(".progress");
        controls.classList.remove("hidden");
        progress.classList.remove("hidden");
    }

    hideControls() {
        const controls = this.shadowRoot.querySelector(".controls");
        const progress = this.shadowRoot.querySelector(".progress");
        controls.classList.add("hidden");
        progress.classList.add("hidden");
    }
}

customElements.define("video-wall-player", VideoWallPlayer);
