/**
 * Video Wall Player v2
 * Custom HTML5 Video Web Component
 *
 * GitHub:
 * https://github.com/attendance1978-wq/v1
 *
 * Usage:
 *
 * <video-wall-player
 *     src="video.mp4">
 * </video-wall-player>
 */

class VideoWallPlayer extends HTMLElement {

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

                min-height: 200px;

                font-family: Arial, sans-serif;

            }


            * {

                box-sizing: border-box;

            }


            .player {

                position: relative;

                width: 100%;

                height: 100%;

                min-height: 200px;

                overflow: hidden;

                background: white;

                border-radius: 5px;

                user-select: none;

            }


            video {

                display: block;

                width: 100%;

                height: calc(100% - 38px);

                background: white;

                object-fit: contain;

            }


            /* =========================
               VIDEO WALL BRAND
            ========================= */

            .brand-logo {

                position: absolute;

                top: 12px;

                left: 12px;

                z-index: 4;

                display: flex;

                align-items: center;

                gap: 6px;

                padding: 5px 8px;

                color: #333;

                background: rgba(255, 255, 255, 0.82);

                border-radius: 4px;

                font-size: 10px;

                font-weight: bold;

                pointer-events: none;

            }


            .brand-icon {

                display: flex;

                align-items: center;

                justify-content: center;

                width: 18px;

                height: 18px;

                border-radius: 50%;

                background: #111;

                color: white;

                font-size: 8px;

            }


            .brand-text {

                letter-spacing: 1px;

            }


            /* =========================
               PROGRESS BAR
            ========================= */

            .progress {

                position: absolute;

                top: 0;

                left: 0;

                z-index: 10;

                width: 100%;

                height: 5px;

                background: #c7aaaa;

                cursor: pointer;

            }


            .progress-value {

                width: 0%;

                height: 100%;

                background: red;

            }


            /* =========================
               CONTROLS
            ========================= */

            .controls {

                position: absolute;

                left: 0;

                bottom: 0;

                z-index: 10;

                width: 100%;

                height: 38px;

                background: #9d8c8c;

                display: flex;

                align-items: center;

                justify-content: center;

                transition: opacity 0.25s ease;

            }


            .player.hide-controls

            .controls {

                opacity: 0;

                pointer-events: none;

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

                padding: 0;

                border-radius: 50%;

                background: #eeeeee;

                color: #111;

                font-size: 15px;

            }


            .circle-button:hover {

                background: white;

            }


            .circle-button:active {

                transform: scale(0.9);

            }


            .side-controls {

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

                color: #000;

                font-size: 18px;

            }


            .icon-button:hover {

                transform: scale(1.1);

            }


            /* =========================
               GITHUB LOGO
            ========================= */

            .github-logo {

                width: 23px;

                height: 28px;

                display: flex;

                align-items: center;

                justify-content: center;

                color: #000;

                text-decoration: none;

                cursor: pointer;

            }


            .github-logo svg {

                width: 18px;

                height: 18px;

                fill: currentColor;

                transition:

                    transform 0.2s ease,

                    opacity 0.2s ease;

            }


            .github-logo:hover svg {

                transform: scale(1.2);

                opacity: 0.7;

            }


            /* =========================
               VOLUME
            ========================= */

            .volume {

                width: 60px;

                height: 3px;

                cursor: pointer;

                accent-color: black;

            }


            /* =========================
               SPEED MENU
            ========================= */

            .speed-menu {

                position: absolute;

                right: 8px;

                bottom: 45px;

                z-index: 30;

                display: none;

                padding: 5px;

                background: white;

                border: 1px solid #777;

            }


            .speed-menu.show {

                display: block;

            }


            .speed-menu button {

                display: block;

                width: 55px;

                padding: 5px;

                background: white;

                font-size: 11px;

            }


            .speed-menu button:hover {

                background: #ddd;

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

                background: white;

            }


            .fullscreen-overlay.show {

                display: flex;

            }


            .overlay-fullscreen {

                width: 27px;

                height: 27px;

                background: white;

                border: 1px solid black;

                font-size: 18px;

            }


            .fullscreen-label {

                margin-left: 95px;

                color: #111;

                font-size: 20px;

            }


            /* =========================
               CENTER PLAY BUTTON
            ========================= */

            .center-play {

                position: absolute;

                top: 50%;

                left: 50%;

                z-index: 5;

                width: 55px;

                height: 55px;

                border-radius: 50%;

                background: rgba(255, 255, 255, 0.85);

                font-size: 25px;

                transform: translate(-50%, -50%);

                opacity: 0;

                pointer-events: none;

                transition: opacity 0.2s;

            }


            .player.paused

            .center-play {

                opacity: 1;

                pointer-events: auto;

            }


        </style>


        <div class="player">


            <!-- PROGRESS BAR -->

            <div class="progress">

                <div class="progress-value"></div>

            </div>


            <!-- VIDEO -->

            <video></video>


            <!-- BRAND LOGO -->

            <div class="brand-logo">

                <span class="brand-icon">

                    ▶

                </span>


                <span class="brand-text">

                    VIDEO WALL

                </span>

            </div>


            <!-- CENTER PLAY -->

            <button class="center-play">

                ▶

            </button>


            <!-- FULLSCREEN OVERLAY -->

            <div class="fullscreen-overlay">


                <button class="overlay-fullscreen">

                    ⛶

                </button>


                <span class="fullscreen-label">

                    FULLSCREEN

                </span>


            </div>


            <!-- SPEED MENU -->

            <div class="speed-menu">


                <button data-speed="0.5">

                    0.5x

                </button>


                <button data-speed="1">

                    1x

                </button>


                <button data-speed="1.25">

                    1.25x

                </button>


                <button data-speed="1.5">

                    1.5x

                </button>


                <button data-speed="2">

                    2x

                </button>


            </div>


            <!-- CONTROLS -->

            <div class="controls">


                <div class="control-center">


                    <span class="time current-time">

                        0:00

                    </span>


                    <button

                        class="circle-button backward"

                        title="Back 10 seconds">

                        ◀

                    </button>


                    <button

                        class="circle-button play"

                        title="Play">

                        ▶

                    </button>


                    <button

                        class="circle-button forward"

                        title="Forward 10 seconds">

                        ▶

                    </button>


                    <span class="time duration">

                        0:00

                    </span>


                </div>


                <div class="side-controls">


                    <!-- VOLUME -->

                    <input

                        class="volume"

                        type="range"

                        min="0"

                        max="1"

                        step="0.01"

                        value="1">


                    <!-- MUTE -->

                    <button

                        class="icon-button mute"

                        title="Mute">

                        🔊

                    </button>


                    <!-- SPEED -->

                    <button

                        class="icon-button speed"

                        title="Playback speed">

                        ⚙

                    </button>


                    <!-- PICTURE IN PICTURE -->

                    <button

                        class="icon-button pip"

                        title="Picture in Picture">

                        ▣

                    </button>


                    <!-- GITHUB -->

                    <a

                        class="github-logo"

                        href="https://github.com/attendance1978-wq/v1"

                        target="_blank"

                        rel="noopener noreferrer"

                        title="View Video Wall on GitHub">


                        <svg

                            viewBox="0 0 24 24"

                            aria-hidden="true">


                            <path

                                d="M12 .5C5.65.5.5 5.65.5 12c0 5.08

                                3.29 9.39 7.86 10.91.57.1.78-.25.78-.55

                                0-.27-.01-1-.01-1.96-3.2.7-3.88-1.54

                                -3.88-1.54-.52-1.33-1.28-1.69-1.28-1.69

                                -1.05-.72.08-.71.08-.71 1.16.08 1.77

                                1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36

                                .96.1-.75.4-1.26.73-1.55-2.56-.29-5.26

                                -1.28-5.26-5.7 0-1.26.45-2.29 1.19-3.1

                                -.12-.29-.52-1.47.11-3.06 0 0 .97-.31

                                3.18 1.18a11.1 11.1 0 0 1 5.79 0c2.2-1.49

                                3.17-1.18 3.17-1.18.63 1.59.23 2.77.11

                                3.06.74.81 1.19 1.84 1.19 3.1 0 4.43

                                -2.7 5.41-5.27 5.69.41.36.78 1.08.78 2.18

                                0 1.57-.01 2.83-.01 3.21 0 .3.21.66.79.55

                                A11.51 11.51 0 0 0 23.5 12C23.5 5.65

                                18.35.5 12 .5Z">

                            </path>


                        </svg>


                    </a>


                    <!-- FULLSCREEN -->

                    <button

                        class="icon-button fullscreen"

                        title="Fullscreen">

                        ⛶

                    </button>


                </div>


            </div>


        </div>

        `;


        /*
        =========================
        ELEMENTS
        =========================
        */

        this.video =

            this.shadowRoot.querySelector(

                "video"

            );


        this.player =

            this.shadowRoot.querySelector(

                ".player"

            );


        this.playButton =

            this.shadowRoot.querySelector(

                ".play"

            );


        this.centerPlay =

            this.shadowRoot.querySelector(

                ".center-play"

            );


        this.progress =

            this.shadowRoot.querySelector(

                ".progress"

            );


        this.progressValue =

            this.shadowRoot.querySelector(

                ".progress-value"

            );


        this.currentTimeElement =

            this.shadowRoot.querySelector(

                ".current-time"

            );


        this.durationElement =

            this.shadowRoot.querySelector(

                ".duration"

            );


        this.video.src =

            this.getAttribute(

                "src"

            ) || "";


        this.video.controls = false;

        this.video.preload = "metadata";

        this.video.playsInline = true;


        this.setupAttributes();

        this.setupEvents();


        this.player.classList.add(

            "paused"

        );


    }


    /*
    =========================
    ATTRIBUTES
    =========================
    */

    setupAttributes() {


        if (

            this.hasAttribute(

                "loop"

            )

        ) {


            this.video.loop = true;


        }


        if (

            this.hasAttribute(

                "muted"

            )

        ) {


            this.video.muted = true;


        }


        if (

            this.hasAttribute(

                "autoplay"

            )

            &&

            this.getAttribute(

                "autoplay"

            ) !== "false"

        ) {


            this.video.autoplay = true;


        }


    }


    /*
    =========================
    EVENTS
    =========================
    */

    setupEvents() {


        const root =

            this.shadowRoot;


        const backward =

            root.querySelector(

                ".backward"

            );


        const forward =

            root.querySelector(

                ".forward"

            );


        const mute =

            root.querySelector(

                ".mute"

            );


        const volume =

            root.querySelector(

                ".volume"

            );


        const fullscreen =

            root.querySelector(

                ".fullscreen"

            );


        const overlayFullscreen =

            root.querySelector(

                ".overlay-fullscreen"

            );


        const pip =

            root.querySelector(

                ".pip"

            );


        const speed =

            root.querySelector(

                ".speed"

            );


        const speedMenu =

            root.querySelector(

                ".speed-menu"

            );


        /*
        =========================
        PLAY / PAUSE
        =========================
        */

        this.playButton.addEventListener(

            "click",

            () => {

                this.togglePlay();

            }

        );


        this.centerPlay.addEventListener(

            "click",

            () => {

                this.togglePlay();

            }

        );


        /*
        =========================
        VIDEO PLAY
        =========================
        */

        this.video.addEventListener(

            "play",

            () => {


                this.playButton.textContent =

                    "Ⅱ";


                this.playButton.title =

                    "Pause";


                this.centerPlay.textContent =

                    "Ⅱ";


                this.player.classList.remove(

                    "paused"

                );


                this.dispatchEvent(

                    new CustomEvent(

                        "video-play"

                    )

                );


            }

        );


        /*
        =========================
        VIDEO PAUSE
        =========================
        */

        this.video.addEventListener(

            "pause",

            () => {


                this.playButton.textContent =

                    "▶";


                this.playButton.title =

                    "Play";


                this.centerPlay.textContent =

                    "▶";


                this.player.classList.add(

                    "paused"

                );


                this.dispatchEvent(

                    new CustomEvent(

                        "video-pause"

                    )

                );


            }

        );


        /*
        =========================
        VIDEO ENDED
        =========================
        */

        this.video.addEventListener(

            "ended",

            () => {


                this.playButton.textContent =

                    "▶";


                this.playButton.title =

                    "Play";


                this.centerPlay.textContent =

                    "▶";


                this.player.classList.add(

                    "paused"

                );


            }

        );


        /*
        =========================
        BACKWARD 10 SECONDS
        =========================
        */

        backward.addEventListener(

            "click",

            () => {


                this.video.currentTime =

                    Math.max(

                        0,

                        this.video.currentTime - 10

                    );


            }

        );


        /*
        =========================
        FORWARD 10 SECONDS
        =========================
        */

        forward.addEventListener(

            "click",

            () => {


                this.video.currentTime += 10;


            }

        );


        /*
        =========================
        VOLUME
        =========================
        */

        volume.addEventListener(

            "input",

            () => {


                this.video.volume =

                    Number(

                        volume.value

                    );


                this.video.muted =

                    Number(

                        volume.value

                    ) === 0;


                this.updateMuteIcon(

                    mute

                );


            }

        );


        /*
        =========================
        MUTE
        =========================
        */

        mute.addEventListener(

            "click",

            () => {


                this.video.muted =

                    !this.video.muted;


                this.updateMuteIcon(

                    mute

                );


            }

        );


        /*
        =========================
        FULLSCREEN
        =========================
        */

        fullscreen.addEventListener(

            "click",

            () => {


                this.toggleFullscreen();


            }

        );


        overlayFullscreen.addEventListener(

            "click",

            () => {


                this.toggleFullscreen();


            }

        );


        /*
        =========================
        PICTURE IN PICTURE
        =========================
        */

        pip.addEventListener(

            "click",

            async () => {


                if (

                    !document.pictureInPictureElement

                ) {


                    try {


                        await this.video

                            .requestPictureInPicture();


                    }

                    catch (error) {


                        console.error(

                            "PiP error:",

                            error

                        );


                    }


                }

                else {


                    await document

                        .exitPictureInPicture();


                }


            }

        );


        /*
        =========================
        SPEED MENU
        =========================
        */

        speed.addEventListener(

            "click",

            () => {


                speedMenu.classList.toggle(

                    "show"

                );


            }

        );


        root.querySelectorAll(

            "[data-speed]"

        ).forEach(

            button => {


                button.addEventListener(

                    "click",

                    () => {


                        this.video.playbackRate =

                            Number(

                                button.dataset.speed

                            );


                        speedMenu.classList.remove(

                            "show"

                        );


                    }

                );


            }

        );


        /*
        =========================
        PROGRESS UPDATE
        =========================
        */

        this.video.addEventListener(

            "timeupdate",

            () => {


                if (

                    !this.video.duration

                ) {


                    return;


                }


                const percentage =

                    (

                        this.video.currentTime /

                        this.video.duration

                    ) * 100;


                this.progressValue.style.width =

                    `${percentage}%`;


                this.currentTimeElement.textContent =

                    this.formatTime(

                        this.video.currentTime

                    );


            }

        );


        /*
        =========================
        VIDEO METADATA
        =========================
        */

        this.video.addEventListener(

            "loadedmetadata",

            () => {


                this.durationElement.textContent =

                    this.formatTime(

                        this.video.duration

                    );


            }

        );


        /*
        =========================
        SEEK
        =========================
        */

        this.progress.addEventListener(

            "click",

            event => {


                if (

                    !this.video.duration

                ) {


                    return;


                }


                const rect =

                    this.progress

                        .getBoundingClientRect();


                const percentage =

                    (

                        event.clientX -

                        rect.left

                    ) / rect.width;


                this.video.currentTime =

                    percentage *

                    this.video.duration;


            }

        );


        /*
        =========================
        DOUBLE CLICK FULLSCREEN
        =========================
        */

        this.video.addEventListener(

            "dblclick",

            () => {


                this.toggleFullscreen();


            }

        );


        /*
        =========================
        KEYBOARD CONTROLS
        =========================
        */

        this.player.tabIndex = 0;


        this.player.addEventListener(

            "keydown",

            event => {


                switch (

                    event.key

                ) {


                    case " ":

                        event.preventDefault();

                        this.togglePlay();

                        break;


                    case "ArrowLeft":

                        this.video.currentTime -= 10;

                        break;


                    case "ArrowRight":

                        this.video.currentTime += 10;

                        break;


                    case "m":

                    case "M":

                        this.video.muted =

                            !this.video.muted;


                        this.updateMuteIcon(

                            mute

                        );


                        break;


                    case "f":

                    case "F":

                        this.toggleFullscreen();

                        break;


                }


            }

        );


        /*
        =========================
        AUTO HIDE CONTROLS
        =========================
        */

        let hideTimer;


        this.player.addEventListener(

            "mousemove",

            () => {


                this.player.classList.remove(

                    "hide-controls"

                );


                clearTimeout(

                    hideTimer

                );


                hideTimer = setTimeout(

                    () => {


                        if (

                            !this.video.paused

                        ) {


                            this.player.classList.add(

                                "hide-controls"

                            );


                        }


                    },

                    3000

                );


            }

        );


    }


    /*
    =========================
    PLAY / PAUSE
    =========================
    */

    async togglePlay() {


        if (

            this.video.paused ||

            this.video.ended

        ) {


            try {


                if (

                    this.video.ended

                ) {


                    this.video.currentTime = 0;


                }


                await this.video.play();


            }

            catch (error) {


                console.error(

                    "Unable to play video:",

                    error

                );


            }


        }

        else {


            this.video.pause();


        }


    }


    /*
    =========================
    MUTE ICON
    =========================
    */

    updateMuteIcon(

        button

    ) {


        button.textContent =

            this.video.muted ||

            this.video.volume === 0

                ? "🔇"

                : "🔊";


    }


    /*
    =========================
    FULLSCREEN
    =========================
    */

    toggleFullscreen() {


        if (

            !document.fullscreenElement

        ) {


            this.player.requestFullscreen();


        }

        else {


            document.exitFullscreen();


        }


    }


    /*
    =========================
    FORMAT TIME
    =========================
    */

    formatTime(

        seconds

    ) {


        if (

            isNaN(seconds)

        ) {


            return "0:00";


        }


        const minutes =

            Math.floor(

                seconds / 60

            );


        const remainingSeconds =

            Math.floor(

                seconds % 60

            );


        return `${minutes}:${String(

            remainingSeconds

        ).padStart(

            2,

            "0"

        )}`;


    }


}


customElements.define(

    "video-wall-player",

    VideoWallPlayer

);
