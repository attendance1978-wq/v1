class VideoWallPlayer extends HTMLElement {

    static get observedAttributes() {
        return ["src", "content", "tag"];
    }

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
                height: 100%;
                object-fit: contain;
                background: white;
            }

            /* =========================
               TOP TEXT / ICON WITH PULSING DOT
            ========================= */

            .top-txt {
                position: absolute;
                top: 10px;
                left: 10px;
                z-index: 15;
                display: flex;
                align-items: center;
                gap: 8px;
                background: rgba(0, 0, 0, 0.6);
                padding: 6px 12px;
                border-radius: 20px;
                color: white;
                font-size: 14px;
                font-weight: 500;
                pointer-events: none;
                user-select: none;
                backdrop-filter: blur(4px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                opacity: 1;
                transition: opacity 0.4s ease;
            }

            .player.idle .top-txt {
                opacity: 0;
            }

            .top-txt .icon {
                font-size: 16px;
                line-height: 1;
            }

            .top-txt .text {
                font-size: 13px;
                letter-spacing: 0.3px;
            }

            /* Pulsing live dot */
            .live-dot {
                display: inline-block;
                width: 8px;
                height: 8px;
                background: #ff0000;
                border-radius: 50%;
                animation: pulse 1.5s ease-in-out infinite;
                margin-right: 2px;
            }

            @keyframes pulse {
                0% {
                    opacity: 1;
                    transform: scale(1);
                }
                50% {
                    opacity: 0.3;
                    transform: scale(0.7);
                }
                100% {
                    opacity: 1;
                    transform: scale(1);
                }
            }

            /* Optional: glow effect for the dot */
            .live-dot::after {
                content: '';
                position: absolute;
                top: -2px;
                left: -2px;
                right: -2px;
                bottom: -2px;
                background: #ff0000;
                border-radius: 50%;
                opacity: 0.3;
                animation: glow 1.5s ease-in-out infinite;
            }

            .live-dot-wrapper {
                position: relative;
                display: inline-flex;
                align-items: center;
            }

            @keyframes glow {
                0% {
                    transform: scale(1);
                    opacity: 0.3;
                }
                50% {
                    transform: scale(1.8);
                    opacity: 0;
                }
                100% {
                    transform: scale(1);
                    opacity: 0.3;
                }
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
                background: rgba(255, 255, 255, 0.25);
                cursor: pointer;
                opacity: 1;
                transition: opacity 0.4s ease;
            }

            .player.idle .progress {
                opacity: 0;
                pointer-events: none;
            }

            .progress-value {
                width: 0%;
                height: 100%;
                background: red;
            }

            /* =========================
               CONTROL BAR
               (now transparent, floats over the video with a
               gradient so buttons stay legible on bright footage)
            ========================= */

            .controls {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 38px;
                z-index: 10;
                background: linear-gradient(to top, rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0));
                display: flex;
                align-items: center;
                justify-content: center;
                pointer-events: none;
                opacity: 1;
                transition: opacity 0.4s ease;
                cursor: default;
            }

            .controls > * {
                pointer-events: auto;
            }

            .player.idle .controls {
                opacity: 0;
                pointer-events: none;
            }

            .player.idle .controls > * {
                pointer-events: none;
            }

            .player.idle {
                cursor: none;
            }

            .control-center {
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .time {
                color: white;
                font-size: 7px;
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
            }

            .circle-button {
                width: 27px;
                height: 27px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.85);
                color: #111;
                font-size: 15px;
                padding: 0;
            }

            .circle-button:hover {
                background: white;
            }

            .circle-button:active {
                transform: scale(0.9);
            }

            /* =========================
               LEFT CONTROLS
            ========================= */

            .left-controls {
                position: absolute;
                left: 8px;
                display: flex;
                align-items: center;
                gap: 3px;
            }

            .left-controls a {
                color: white;
                text-decoration: none;
                font-size: 12px;
                font-weight: 500;
                pointer-events: auto;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
            }

            .left-controls a:hover {
                text-decoration: underline;
            }

            /* =========================
               RIGHT CONTROLS
            ========================= */

            .right-controls {
                position: absolute;
                right: 8px;
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
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
            }

            .icon-button:hover {
                transform: scale(1.1);
            }

            /* Volume Slider Styling */
            #volumeSlider {
                width: 60px;
                height: 4px;
                -webkit-appearance: none;
                -moz-appearance: none;
                appearance: none;
                background: rgba(255, 255, 255, 0.4);
                border-radius: 2px;
                outline: none;
                cursor: pointer;
                position: relative;
                z-index: 1;
            }

            #volumeSlider::-webkit-slider-runnable-track {
                width: 100%;
                height: 4px;
                background: rgba(255, 255, 255, 0.4);
                border-radius: 2px;
            }

            #volumeSlider::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: white;
                cursor: pointer;
                margin-top: -4px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.3);
            }

            #volumeSlider::-moz-range-track {
                width: 100%;
                height: 4px;
                background: rgba(255, 255, 255, 0.4);
                border-radius: 2px;
            }

            #volumeSlider::-moz-range-thumb {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: white;
                cursor: pointer;
                border: none;
                box-shadow: 0 1px 3px rgba(0,0,0,0.3);
            }

            /* Image styling */
            .side-image {
                height: 30px;
                width: auto;
                border-radius: 3px;
                object-fit: cover;
            }

            /* =========================
               AUDIO MODE (content="mp3")
               Video element still plays the audio track, but the
               visual frame is replaced with a simple centered icon
               since there's nothing to see.
            ========================= */

            .audio-cover {
                position: absolute;
                inset: 0;
                display: none;
                align-items: center;
                justify-content: center;
                background: #1c1c1c;
                z-index: 1;
                pointer-events: none;
            }

            .player.audio-mode .audio-cover {
                display: flex;
            }

            .player.audio-mode video {
                /* Keep the element functional (it still decodes/plays the
                   audio) but visually hidden behind the cover above. */
                opacity: 0;
            }

            .audio-cover .note {
                font-size: 48px;
                color: rgba(255, 255, 255, 0.6);
            }

            /* =========================
               TAG TEXT (tag="...")
               Plain text label, no pill/background — sits above both
               the video frame and the audio-cover so it shows in
               either mode.
            ========================= */

            .tag-text {
                position: absolute;
                top: 10px;
                right: 10px;
                z-index: 20;
                color: white;
                font-size: 13px;
                font-weight: 500;
                letter-spacing: 0.3px;
                text-shadow: 0 1px 3px rgba(0, 0, 0, 0.85);
                pointer-events: none;
                user-select: none;
                opacity: 1;
                transition: opacity 0.4s ease;
            }

            .player.idle .tag-text {
                opacity: 0;
            }

        </style>

        <div class="player">

            <!-- TOP TEXT / ICON WITH LIVE PULSING DOT -->
            <div class="top-txt">
                <span class="live-dot-wrapper">
                    <span class="live-dot"></span>
                </span>
                <span class="text">Live</span>
            </div>

            <!-- PROGRESS -->
            <div class="progress">
                <div class="progress-value"></div>
            </div>

            <!-- AUDIO-ONLY COVER (shown when content="mp3") -->
            <div class="audio-cover">
                <span class="note">♪</span>
            </div>

            <!-- TAG TEXT (from the "tag" attribute) — sits above video/audio-cover -->
            <div class="tag-text"></div>

            <!-- VIDEO -->
            <video></video>

            <!-- CONTROLS -->
            <div class="controls">

                <!-- LEFT CONTROLS -->
                <div class="left-controls">
                    <a href="https://youtube.com" target="_blank">youtube</a>
                </div>

                <!-- CENTER CONTROLS -->
                <div class="control-center">

                    <span class="time">-10</span>

                    <button class="circle-button backward" title="Back 10 seconds">
                        ◀
                    </button>

                    <button class="circle-button play" title="Play">
                        ▶
                    </button>

                    <button class="circle-button forward" title="Forward 10 seconds">
                        ▶
                    </button>

                    <span class="time">+10</span>

                </div>

                <!-- RIGHT CONTROLS -->
                <div class="right-controls">

                    <button class="icon-button fullscreen" title="Fullscreen">
                        ⛶
                    </button>

                    <input type="range" id="volumeSlider" min="0" max="1" step="0.01" value="50">

                </div>

            </div>

        </div>
        `;

        // GET VIDEO ELEMENT
        this.video = this.shadowRoot.querySelector("video");
        this.playerEl = this.shadowRoot.querySelector(".player");
        this.tagTextEl = this.shadowRoot.querySelector(".tag-text");

        // SET VIDEO SOURCE (fallback for initial parse)
        this.video.src = this.getAttribute("src") || "";

        this.video.preload = "metadata";
        this.video.playsInline = true;
        this.video.controls = false;

        // APPLY content ("mp4"/"mp3") AND tag ATTRIBUTES ON FIRST PARSE
        this.updateContentType(this.getAttribute("content"));
        this.updateTag(this.getAttribute("tag"));

        // WAKE LOCK (keeps the screen on while fullscreen/playing)
        this.wakeLock = null;

        // IDLE / AUTO-HIDE STATE
        this.idleTimer = null;
        this.idleDelayMs = 2500;

        // INITIALIZE CONTROLS
        this.setupControls();

        // SURFACE LOAD FAILURES
        this.setupErrorReporting();

        // AUTO-HIDE CONTROLS WHILE PLAYING / IDLE
        this.setupAutoHide();
    }

    /*
    =========================
    KEEP SRC REACTIVE
    =========================
    */
    attributeChangedCallback(name, oldValue, newValue) {
        if (newValue === oldValue) {
            return;
        }
        if (name === "src" && this.video) {
            this.video.src = newValue || "";
        }
        if (name === "content") {
            this.updateContentType(newValue);
        }
        if (name === "tag") {
            this.updateTag(newValue);
        }
    }

    /*
    =========================
    CONTENT TYPE ("mp4" video / "mp3" audio-only)
    =========================
    */
    updateContentType(content) {
        if (!this.playerEl) {
            return;
        }
        const isAudio = (content || "").toLowerCase() === "mp3";
        this.playerEl.classList.toggle("audio-mode", isAudio);
    }

    /*
    =========================
    TAG TEXT
    Displays the "tag" attribute's value as plain text in the
    top-right corner — works the same whether content is video
    (mp4) or audio-only (mp3), since it sits above both.
    =========================
    */
    updateTag(tag) {
        if (!this.tagTextEl) {
            return;
        }
        this.tagTextEl.textContent = (tag || "").trim();
    }

    connectedCallback() {
        const src = this.getAttribute("src") || "";
        if (this.video && this.video.src !== src) {
            this.video.src = src;
        }
        this.updateContentType(this.getAttribute("content"));
        this.updateTag(this.getAttribute("tag"));
    }

    setupControls() {

        const root = this.shadowRoot;

        const playButton = root.querySelector(".play");
        const backwardButton = root.querySelector(".backward");
        const forwardButton = root.querySelector(".forward");
        const fullscreenButton = root.querySelector(".fullscreen");
        const speakerslider = root.querySelector("#volumeSlider");
        const progress = root.querySelector(".progress");
        const progressValue = root.querySelector(".progress-value");

        /*
        =========================
        PLAY / PAUSE
        =========================
        */
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
        });

        this.video.addEventListener("play", () => {
            playButton.textContent = "Ⅱ";
            playButton.title = "Pause";
        });

        this.video.addEventListener("pause", () => {
            playButton.textContent = "▶";
            playButton.title = "Play";
        });

        this.video.addEventListener("ended", () => {
            playButton.textContent = "▶";
            playButton.title = "Play";
        });

        /*
        =========================
        BACKWARD / FORWARD 10s
        =========================
        */
        backwardButton.addEventListener("click", () => {
            this.video.currentTime = Math.max(0, this.video.currentTime - 10);
        });

        forwardButton.addEventListener("click", () => {
            if (!isNaN(this.video.duration)) {
                this.video.currentTime = Math.min(
                    this.video.duration,
                    this.video.currentTime + 10
                );
            } else {
                this.video.currentTime += 10;
            }
        });

        /*
        =========================
        VOLUME CONTROL - FIXED
        =========================
        */
        // Set initial slider position from the video's actual volume
        speakerslider.value = this.video.muted ? 0 : this.video.volume;

        speakerslider.addEventListener("input", (event) => {
            const value = parseFloat(event.target.value);
            if (Number.isNaN(value)) {
                return;
            }
            this.video.volume = value;
            // Explicitly unmute the moment the user moves the slider above 0.
            // A video left "muted" (e.g. for autoplay) ignores volume changes
            // until muted is set back to false — this is the #1 cause of
            // "slider moves but sound doesn't change".
            this.video.muted = value === 0;
        });

        // Keep slider synced if volume changes from elsewhere (e.g. keyboard, API)
        this.video.addEventListener("volumechange", () => {
            const current = this.video.muted ? 0 : this.video.volume;
            if (parseFloat(speakerslider.value) !== current) {
                speakerslider.value = current;
            }
        });

        // Diagnostic: if the source has no audio track at all, no amount of
        // volume/mute logic will ever produce sound. Warn once metadata loads.
        this.video.addEventListener("loadedmetadata", () => {
            const hasAudio =
                (this.video.audioTracks && this.video.audioTracks.length > 0) ||
                this.video.mozHasAudio ||
                (typeof this.video.webkitAudioDecodedByteCount === "number" &&
                    this.video.webkitAudioDecodedByteCount > 0);

            // webkitAudioDecodedByteCount is only populated after some playback,
            // so this check is best-effort and only warns, never blocks anything.
            if (this.video.audioTracks && this.video.audioTracks.length === 0) {
                console.warn(
                    `video-wall-player: "${this.getAttribute("src")}" appears to have no audio track — the volume slider has nothing to control.`
                );
            }
        }, { once: true });

        /*
        =========================
        FULLSCREEN
        =========================
        */
        fullscreenButton.addEventListener("click", () => {
            this.toggleFullscreen();
        });

        document.addEventListener("fullscreenchange", () => {
            const player = this.shadowRoot.querySelector(".player");
            const isFs = document.fullscreenElement === player;
            fullscreenButton.textContent = isFs ? "⛶" : "⛶";
            fullscreenButton.title = isFs ? "Exit fullscreen" : "Fullscreen";

            if (isFs) {
                this.requestWakeLock();
                this.lockOrientation();
            } else {
                this.releaseWakeLock();
                this.unlockOrientation();
            }
        });

        // Re-acquire the wake lock if it gets released when the tab loses
        // visibility and then regains it while still fullscreen (common on
        // mobile when switching apps briefly).
        document.addEventListener("visibilitychange", () => {
            const player = this.shadowRoot.querySelector(".player");
            if (
                document.visibilityState === "visible" &&
                document.fullscreenElement === player &&
                !this.wakeLock
            ) {
                this.requestWakeLock();
            }
        });

        /*
        =========================
        UPDATE PROGRESS
        =========================
        */
        this.video.addEventListener("timeupdate", () => {
            if (!this.video.duration || isNaN(this.video.duration)) {
                return;
            }
            const percentage = (this.video.currentTime / this.video.duration) * 100;
            progressValue.style.width = `${percentage}%`;
        });

        /*
        =========================
        CLICK PROGRESS TO SEEK
        =========================
        */
        progress.addEventListener("click", (event) => {
            if (!this.video.duration) {
                return;
            }
            const rect = progress.getBoundingClientRect();
            const percentage = (event.clientX - rect.left) / rect.width;
            this.video.currentTime = percentage * this.video.duration;
        });

        /*
        =========================
        DOUBLE CLICK VIDEO
        =========================
        */
        this.video.addEventListener("dblclick", () => {
            this.toggleFullscreen();
        });
    }

    /*
    =========================
    AUTO-HIDE CONTROLS
    Controls (and the "Live" badge / progress bar) fade out a couple
    seconds after playback starts, and reappear on any pointer
    movement/tap or as soon as the video is paused.
    =========================
    */
    setupAutoHide() {

        const player = this.shadowRoot.querySelector(".player");

        const showControls = () => {
            player.classList.remove("idle");
            clearTimeout(this.idleTimer);
            // Only start the countdown back to "idle" while actually playing —
            // a paused video keeps its controls visible.
            if (!this.video.paused && !this.video.ended) {
                this.idleTimer = setTimeout(() => {
                    player.classList.add("idle");
                }, this.idleDelayMs);
            }
        };

        // Any interaction resets the idle countdown.
        ["pointermove", "pointerdown", "touchstart", "keydown"].forEach((evt) => {
            player.addEventListener(evt, showControls, { passive: true });
        });

        this.video.addEventListener("play", showControls);

        this.video.addEventListener("pause", () => {
            clearTimeout(this.idleTimer);
            player.classList.remove("idle");
        });

        this.video.addEventListener("ended", () => {
            clearTimeout(this.idleTimer);
            player.classList.remove("idle");
        });

        // Start visible.
        showControls();
    }

    /*
    =========================
    ERROR REPORTING - Console only
    =========================
    */
    setupErrorReporting() {

        const MEDIA_ERROR_MESSAGES = {
            1: "Loading was aborted.",
            2: "Network error while loading the video.",
            3: "Video could not be decoded (corrupt or unsupported codec).",
            4: "Video source not found or format not supported (check the file path/name, including capitalization)."
        };

        this.video.addEventListener("error", () => {

            const mediaError = this.video.error;
            const code = mediaError ? mediaError.code : null;
            const message = MEDIA_ERROR_MESSAGES[code] || "Unknown video error.";

            console.error(
                `video-wall-player: failed to load "${this.getAttribute("src")}" — ${message}`,
                mediaError
            );
        });
    }

    /*
    =========================
    FULLSCREEN FUNCTION
    =========================
    */
    toggleFullscreen() {
        const player = this.shadowRoot.querySelector(".player");

        if (!document.fullscreenElement) {
            if (player.requestFullscreen) {
                player.requestFullscreen().catch((error) => {
                    console.error("Fullscreen request failed:", error);
                });
            }
        } else {
            document.exitFullscreen();
        }
    }

    /*
    =========================
    SCREEN WAKE LOCK
    Keeps the device display from auto-dimming/locking while the
    player is in fullscreen — separate from the "idle" CSS state
    above, which only fades the on-screen controls.
    =========================
    */
    async requestWakeLock() {
        if (!("wakeLock" in navigator)) {
            return;
        }
        try {
            this.wakeLock = await navigator.wakeLock.request("screen");
            this.wakeLock.addEventListener("release", () => {
                this.wakeLock = null;
            });
        } catch (error) {
            // Commonly rejected if the tab isn't visible/focused — not fatal.
            console.warn("video-wall-player: wake lock request failed:", error);
        }
    }

    async releaseWakeLock() {
        if (this.wakeLock) {
            try {
                await this.wakeLock.release();
            } catch (error) {
                // Ignore — already released or unsupported.
            }
            this.wakeLock = null;
        }
    }

    /*
    =========================
    ORIENTATION LOCK
    Best-effort landscape lock on mobile when entering fullscreen.
    Silently no-ops on platforms/browsers that don't support it
    (e.g. iOS Safari, desktop).
    =========================
    */
    async lockOrientation() {
        if (screen.orientation && typeof screen.orientation.lock === "function") {
            try {
                await screen.orientation.lock("landscape");
            } catch (error) {
                console.warn("video-wall-player: orientation lock failed:", error);
            }
        }
    }

    unlockOrientation() {
        if (screen.orientation && typeof screen.orientation.unlock === "function") {
            try {
                screen.orientation.unlock();
            } catch (error) {
                // Ignore — nothing to unlock.
            }
        }
    }
}

// Guard against "NotSupportedError: this name has already been used
// with this registry" if the script is ever loaded/injected more
// than once on the same page (easy to hit with dynamically built
// video walls).
if (!customElements.get("video-wall-player")) {
    customElements.define("video-wall-player", VideoWallPlayer);
}