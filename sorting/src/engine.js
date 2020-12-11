
/* Render Engine */

/**
 * 
 * @param {Function} onSetup 
 * @param {Function} onUpdate 
 * @param {Function} onTerminate 
 * @param {any} config 
 * @returns {RenderEngine}
 */
function RenderEngine(onSetup, onUpdate, onTerminate, config = {}) {
    this.config = config;
    this.run = false;
    this.startedAt = Date.now();
    this.terminatedAt = Date.now();
    this.tick = 0;
    //
    this.setup = function () {
        this.startedAt = Date.now();
        onSetup(this);
    };
    this.update = function () {
        this.tick++;
        onUpdate(this);
    }
    this.terminate = function () {
        this.terminatedAt = Date.now();
        this.run = false;
        onTerminate(this);
        console.log((this.terminatedAt - this.startedAt) / (60) + "secs");
    };
    //
    this.start = function () {
        this.run = true;
        const loop = setInterval(function () {
            if (!this.run) {
                this.terminate(this);
                clearInterval(loop);
                return;
            }
            this.update(this);
        }, 1000 / this.config.fps);

    };
    this.setup(this);
    return this;
}