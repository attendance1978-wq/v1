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

                justify-content: center;

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

                background: #eeeeee;

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
               RIGHT CONTROLS
            ========================= */

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

                color: black;

                font-size: 19px;

            }


            .icon-button:hover {

                transform: scale(1.1);

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

                color: black;

            }


            .fullscreen-label {

                margin-left: 95px;

                font-size: 20px;

                color: #111;

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


                <span class="fullscreen-label">

                    FULLSCREEN

                </span>

            </div>


            <!-- CONTROLS -->

            <div class="controls">


                <div class="control-center">


                    <span class="time">

                        -10

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


                    <span class="time">

                        +10

                    </span>


                </div>


                <div class="side-controls">


                    <button

                        class="icon-button fullscreen"

                        title="Fullscreen">

                        ⛶

                    </button>


                    <button

                        class="icon-button mute"

                        title="Mute">

                        🔊

                    </button>


                </div>


            </div>


        </div>

        `;


        /*
        =========================
        GET VIDEO ELEMENT
        =========================
        */

        this.video =
            this.shadowRoot.querySelector(
                "video"
            );


        /*
        =========================
        SET VIDEO SOURCE
        =========================
        */

        this.video.src =
            this.getAttribute("src") || "";


        this.video.preload =
            "metadata";


        this.video.playsInline =
            true;


        this.video.controls =
            false;


        /*
        =========================
        INITIALIZE CONTROLS
        =========================
        */

        this.setupControls();

    }


    setupControls() {


        const root =
            this.shadowRoot;


        const playButton =
            root.querySelector(
                ".play"
            );


        const backwardButton =
            root.querySelector(
                ".backward"
            );


        const forwardButton =
            root.querySelector(
                ".forward"
            );


        const fullscreenButton =
            root.querySelector(
                ".fullscreen"
            );


        const overlayFullscreenButton =
            root.querySelector(
                ".overlay-fullscreen"
            );


        const muteButton =
            root.querySelector(
                ".mute"
            );


        const progress =
            root.querySelector(
                ".progress"
            );


        const progressValue =
            root.querySelector(
                ".progress-value"
            );


        /*
        =========================
        PLAY / PAUSE
        =========================
        */

        playButton.addEventListener(

            "click",

            async () => {


                if (
                    this.video.paused ||
                    this.video.ended
                ) {


                    try {


                        await this.video.play();


                    }

                    catch (error) {


                        console.error(

                            "Video play error:",

                            error

                        );


                    }


                }

                else {


                    this.video.pause();


                }


            }

        );


        /*
        =========================
        WHEN VIDEO PLAYS
        =========================
        */

        this.video.addEventListener(

            "play",

            () => {


                playButton.textContent =
                    "Ⅱ";


                playButton.title =
                    "Pause";


            }

        );


        /*
        =========================
        WHEN VIDEO PAUSES
        =========================
        */

        this.video.addEventListener(

            "pause",

            () => {


                playButton.textContent =
                    "▶";


                playButton.title =
                    "Play";


            }

        );


        /*
        =========================
        WHEN VIDEO ENDS
        =========================
        */

        this.video.addEventListener(

            "ended",

            () => {


                playButton.textContent =
                    "▶";


                playButton.title =
                    "Play";


            }

        );


        /*
        =========================
        BACKWARD 10 SECONDS
        =========================
        */

        backwardButton.addEventListener(

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

        forwardButton.addEventListener(

            "click",

            () => {


                this.video.currentTime += 10;


            }

        );


        /*
        =========================
        MUTE / UNMUTE
        =========================
        */

        muteButton.addEventListener(

            "click",

            () => {


                this.video.muted =
                    !this.video.muted;


                if (
                    this.video.muted
                ) {


                    muteButton.textContent =
                        "🔇";


                    muteButton.title =
                        "Unmute";


                }

                else {


                    muteButton.textContent =
                        "🔊";


                    muteButton.title =
                        "Mute";


                }


            }

        );


        /*
        =========================
        FULLSCREEN
        =========================
        */

        fullscreenButton.addEventListener(

            "click",

            () => {


                this.toggleFullscreen();


            }

        );


        overlayFullscreenButton.addEventListener(

            "click",

            () => {


                this.toggleFullscreen();


            }

        );


        /*
        =========================
        UPDATE PROGRESS
        =========================
        */

        this.video.addEventListener(

            "timeupdate",

            () => {


                if (

                    !this.video.duration ||

                    isNaN(
                        this.video.duration
                    )

                ) {


                    return;


                }


                const percentage =


                    (

                        this.video.currentTime /

                        this.video.duration

                    ) * 100;


                progressValue.style.width =

                    `${percentage}%`;


            }

        );


        /*
        =========================
        CLICK PROGRESS TO SEEK
        =========================
        */

        progress.addEventListener(

            "click",

            (event) => {


                if (

                    !this.video.duration

                ) {


                    return;


                }


                const rect =

                    progress.getBoundingClientRect();


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
        DOUBLE CLICK VIDEO
        =========================
        */

        this.video.addEventListener(

            "dblclick",

            () => {


                this.toggleFullscreen();


            }

        );


    }


    /*
    =========================
    FULLSCREEN FUNCTION
    =========================
    */

    toggleFullscreen() {


        const player =

            this.shadowRoot.querySelector(

                ".player"

            );


        if (

            !document.fullscreenElement

        ) {


            if (

                player.requestFullscreen

            ) {


                player.requestFullscreen();


            }


        }

        else {


            document.exitFullscreen();


        }


    }

}


customElements.define(

    "video-wall-player",

    VideoWallPlayer

);
