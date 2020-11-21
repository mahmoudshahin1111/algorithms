

new Control();

function Control() {
    $('#run').on('click', e => this.onStartClicked(e));
    $('#restart').on('click', e => this.onRestartClicked(e));
    $('input[name=pattern]').on('change', e => this.onPatternChanged(e))

    this.onStartClicked = (e) => {
        this.pattern.run();
    }
    this.onRestartClicked = (e) => {
        this.pattern.restart();
    }
    this.onCellClicked = (e) => {
        this.pattern.cellClicked(e);
    }
    this.onContainerClicked = (e) => {

    }
    this.onPatternChanged = (e) => {
        if (e.target.value == 'astar') {
            this.pattern = new AStar();
            this.registerEvents();
        }
        else {
            this.pattern = new Dijkstra();
            this.registerEvents();
        }
    }
    this.registerEvents = () => {
        $('#container rect').on('click', e => this.onCellClicked(e));
    }

    this.pattern = new AStar();
    this.registerEvents();
    return this;
}


/* Patterns */



/* -------------------------------------------- */

//                  AStar

/* -------------------------------------------- */



function AStar() {
    this.additionalWeight = 6;
    this.config = {
        fps: 60,
        containerId: 'container',
        rows: 19,
        cols: 28,
        cellSize: 35,

        exploredClass: 'container-cell explored',
        startClass: 'container-cell start',
        targetClass: 'container-cell target',
        blockClass: 'container-cell block',
        pathClass: 'container-cell path',
    };



    this.onSetup = (engine) => {



    };

    this.onUpdate = (engine) => {
        this.currentCell = this.getNearestCellDistanceToTargetOfOpenSet();
        this.search(engine, this.currentCell);
        this.closedSet.push(this.currentCell);
        this.renderGrid();
    };

    this.search = (engine, cell) => {
        this.closedSet.push(cell);
        // is target
        if (cell.type === 'target') {
            console.log("Target founded");
            this.setPath();
            this.renderGrid();
            engine.terminate();
            return
        }
        // explore
        this.openSet = this.openSet.filter(c => c !== cell);
        for (let i = 0; i < cell.neighbors.length; i++) {
            this.AppendOrUpdateCellDistanceInOpenSet(cell.neighbors[i], cell);
        }
        cell.setAsExplored();
        // no path founded
        if (!this.openSet.length) {
            console.log("now path founded");
            engine.terminate();
            return;

        }

    }



    this.onTerminate = (engine) => {
        console.info("We Terminated");

    };



    this.drawGrid = () => {
        let gridHtml = '';
        for (let row = 0; row < this.grid.length; row++) {
            for (let col = 0; col < this.grid[row].length; col++) {
                const cell = this.grid[row][col];
                let rectHtml = `<rect cell-x="${cell.x}" cell-y="${cell.y}" width="${this.config.cellSize}" height="${this.config.cellSize}" x=${col * this.config.cellSize} y=${row * this.config.cellSize} `;
                switch (cell.type) {
                    case 'open':
                        rectHtml += `class="${cell.explored ? this.config.exploredClass : 'container-cell'}" />`;
                        break;
                    case 'block':
                        rectHtml += `class="${this.config.blockClass}" />`;
                        break;
                    case 'path':
                        rectHtml += `class="${this.config.pathClass}" />`;
                        break;
                    case 'start':
                        rectHtml += `class="${this.config.startClass}" />`;
                        break;
                    case 'target':
                        rectHtml += `class="${this.config.targetClass}" />`;
                        break;
                }
                gridHtml += rectHtml + "/>"

            }
        }
        this.container.html(gridHtml);
    }
    this.setPath = () => {
        let visitedCells = this.closedSet;
        let lastIndex = visitedCells.length - 1;
        let nextCell = this.targetCell;
        while (nextCell) {
            /* Loop back ion visited nodes and search to shortest path to start point  */
            for (let vci = lastIndex; vci >= 0; vci--) {
                let founded = false;
                for (const nc of nextCell.neighbors) {
                    if (nc.explored && nc === visitedCells[vci]) {
                        lastIndex = vci;
                        founded = true;
                    }
                }
                if (founded) break;
            }
            if (visitedCells[lastIndex].type === 'start') {
                nextCell = null;
            } else {
                nextCell = visitedCells[lastIndex];
                nextCell.type = 'path';
            }
        }

    };


    this.renderGrid = () => {
        const cellsSvg = this.container.children();
        for (const cellSvg of cellsSvg) {
            const el = $(cellSvg);
            const x = Number(el.attr('cell-x'));
            const y = Number(el.attr('cell-y'));
            const cell = this.grid[y][x];
            if (!cell) debugger
            switch (cell.type) {
                case 'open':
                    el.attr('class', cell.explored ? this.config.exploredClass : 'container-cell');
                    break;
                case 'block':
                    el.attr('class', this.config.blockClass);
                    break;
                case 'path':
                    el.attr('class', this.config.pathClass);
                    break;
                case 'start':
                    el.attr('class', this.config.startClass);
                    break;
                case 'target':
                    el.attr('class', this.config.targetClass);
                    break;
            }


        }
    }
    /**
     * 
     * @param {Cell} c1 
     * @param {Cell} c2 
     */
    this.distance = (c1, c2) => {
        const x = c2.x - c1.x;
        const y = c2.y - c1.y;
        const distance = Math.floor(Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)) * 100);
        return distance;
    }
    this.getNearestCellDistanceToTargetOfOpenSet = () => {
        /**
         * @type {Cell[]}
         */
        const arr = this.openSet;
        /**
         * @type {Cell} 
         */
        let nearestCell = arr[arr.length - 1];
        for (let i = 0; i < arr.length; i++) {
            const cell = arr[i];
            if (nearestCell === null && !cell.explored) {
                nearestCell = cell;
            } else if (nearestCell != null && nearestCell.weight() > cell.weight()) {
                nearestCell = cell;
            }
        }
        return nearestCell;
    }
    /**
     * @param {Cell} cell cell will update it's distance
     * @param {Cell} comeOfCell parent cell
     * @param {boolean} disableUpdate if disabled will update cell in open set if exists
     * @description Update Cell Distance If Comes From Parent Cell
     * @return {boolean}
     */
    this.AppendOrUpdateCellDistanceInOpenSet = (cell, comeOfCell, disableUpdate = true) => {

        /* Append */
        if (disableUpdate) {
            if (!cell.explored && cell.type != 'block') {
                cell.distanceOfSource = comeOfCell.distanceOfSource + this.additionalWeight;
                cell.distanceToTarget = this.distance(cell, this.targetCell);
                this.openSet.push(cell);
                return false;
            }
            return true;
        }

        /* Update Cell */

        /**
         * @type {Cell[]} 
         */
        const cells = this.openSet;
        let isExists = false;

        for (let cI = 0; cI < cells.length; cI++) {
            const c = cells[cI];
            if (c === cell) {
                isExists = true;
                break;
            }
        }
        if (!isExists) {
            cell.distanceOfSource = comeOfCell.distanceOfSource + this.additionalWeight;
            cell.distanceToTarget = this.distance(cell, this.targetCell);
            this.openSet.push(cell);
        } else {
            const newWeight = comeOfCell.distanceOfSource + this.distance(cell, this.targetCell) + this.additionalWeight;
            if (newWeight < cell.weight()) {
                cell.distanceOfSource = comeOfCell.distanceOfSource + this.additionalWeight;
                cell.distanceToTarget = this.distance(cell, this.targetCell);

            }
        }


        return true;
    }

    this.restart = () => {


        this.container = $('#container');
        this.container.css('width', this.config.cols * this.config.cellSize);
        this.container.css('height', this.config.cols * this.config.cellSize);

        this.grid = [];
        this.path = [];
        this.closedSet = [];
        this.openSet = [];
        for (let row = 0; row < this.config.rows; row++) {
            this.grid[row] = [];
            for (let col = 0; col < this.config.cols; col++) {
                const cell = new Cell(col, row, 'open');
                this.grid[row][col] = cell;
            }
        }
        // set random cells
        this.startCell = this.grid[5][6];
        this.targetCell = this.grid[15][15];
        this.startCell.type = 'start';
        this.targetCell.type = 'target';
        this.currentCell = null;


        this.openSet.push(this.startCell);
        // connect cells
        for (let row = 0; row < this.config.rows; row++) {
            for (let col = 0; col < this.config.cols; col++) {
                const cell = this.grid[row][col];
                if (col < this.config.cols - 1 && this.grid[row][col + 1].type !== 'block') {
                    cell.addNeighbor(this.grid[row][col + 1]);
                } if (row < this.config.rows - 1 && this.grid[row + 1][col].type !== 'block') {
                    cell.addNeighbor(this.grid[row + 1][col]);
                } if (col > 0 && this.grid[row][col - 1].type !== 'block') {
                    cell.addNeighbor(this.grid[row][col - 1]);
                } if (row > 0 && this.grid[row - 1][col].type !== 'block') {
                    cell.addNeighbor(this.grid[row - 1][col]);
                }
            }
        }
        if (this.renderEngine) {
            this.renderEngine.terminate();
        }
        this.renderGrid();
    }
    this.run = () => {
        this.renderEngine.start();
    }

    /* Build Blocks */

    this.cellClicked = (e) => {
        const col = $(e.currentTarget).attr('cell-x');
        const row = $(e.currentTarget).attr('cell-y');
        const cell = this.grid[row][col];
        cell.type = 'block';
        this.renderGrid();
    }

    this.restart();
    this.renderEngine = RenderEngine(this.onSetup, this.onUpdate, this.onTerminate, this.config);
    this.drawGrid();




    /* */
    return this;
}



/* -------------------------------------------- */

//                  Dijkstra

/* -------------------------------------------- */

function Dijkstra() {
    this.additionalWeight = 6;
    this.config = {
        fps: 60,
        containerId: 'container',
        rows: 19,
        cols: 28,
        cellSize: 35,

        exploredClass: 'container-cell explored',
        startClass: 'container-cell start',
        targetClass: 'container-cell target',
        blockClass: 'container-cell block',
        pathClass: 'container-cell path',
    };



    this.onSetup = (engine) => {



    };

    this.onUpdate = (engine) => {
        this.currentCell = this.openSet.shift();
        this.search(engine, this.currentCell);
        this.renderGrid();
    };

    this.search = (engine, cell) => {
        this.closedSet.push(this.currentCell);
        // is target
        if (cell.type === 'target') {
            console.log("Target founded");
            this.setPath();
            this.renderGrid();
            engine.terminate();
            return
        }
        // explore
        this.openSet = this.openSet.filter(c => c !== cell);
        for (let i = 0; i < cell.neighbors.length; i++) {
            let _cell = cell.neighbors[i];
            if (!_cell.explored && _cell.type != 'block') {
                this.openSet.push(_cell);
            }
        }
        cell.setAsExplored();
        // no path founded
        if (!this.openSet.length) {
            console.log("now path founded");
            engine.terminate();
            return;

        }      

    }



    this.onTerminate = (engine) => {
        console.info("We Terminated");

    };



    this.drawGrid = () => {
        let gridHtml = '';
        for (let row = 0; row < this.grid.length; row++) {
            for (let col = 0; col < this.grid[row].length; col++) {
                const cell = this.grid[row][col];
                let rectHtml = `<rect cell-x="${cell.x}" cell-y="${cell.y}" width="${this.config.cellSize}" height="${this.config.cellSize}" x=${col * this.config.cellSize} y=${row * this.config.cellSize} `;
                switch (cell.type) {
                    case 'open':
                        rectHtml += `class="${cell.explored ? this.config.exploredClass : 'container-cell'}" />`;
                        break;
                    case 'block':
                        rectHtml += `class="${this.config.blockClass}" />`;
                        break;
                    case 'path':
                        rectHtml += `class="${this.config.pathClass}" />`;
                        break;
                    case 'start':
                        rectHtml += `class="${this.config.startClass}" />`;
                        break;
                    case 'target':
                        rectHtml += `class="${this.config.targetClass}" />`;
                        break;
                }
                gridHtml += rectHtml + "/>"

            }
        }
        this.container.html(gridHtml);
    }
    this.setPath = () => {
        let visitedCells = this.closedSet;
        let lastIndex = visitedCells.length - 1;
        let nextCell = this.targetCell;
        while (nextCell) {
            /* Loop back ion visited nodes and search to shortest path to start point  */
            for (let vci = lastIndex; vci >= 0; vci--) {
                let founded = false;
                for (const nc of nextCell.neighbors) {
                    if (nc.explored && nc === visitedCells[vci]) {
                        lastIndex = vci;
                        founded = true;
                    }
                }
                if (founded) break;
            }
            if (visitedCells[lastIndex].type === 'start') {
                nextCell = null;
            } else {
                nextCell = visitedCells[lastIndex];
                nextCell.type = 'path';
            }
        }

    };


    this.renderGrid = () => {
        const cellsSvg = this.container.children();
        for (const cellSvg of cellsSvg) {
            const el = $(cellSvg);
            const x = Number(el.attr('cell-x'));
            const y = Number(el.attr('cell-y'));
            const cell = this.grid[y][x];
            if (!cell) debugger
            switch (cell.type) {
                case 'open':
                    el.attr('class', cell.explored ? this.config.exploredClass : 'container-cell');
                    break;
                case 'block':
                    el.attr('class', this.config.blockClass);
                    break;
                case 'path':
                    el.attr('class', this.config.pathClass);
                    break;
                case 'start':
                    el.attr('class', this.config.startClass);
                    break;
                case 'target':
                    el.attr('class', this.config.targetClass);
                    break;
            }


        }
    }




    this.restart = () => {


        this.container = $('#container');
        this.container.css('width', this.config.cols * this.config.cellSize);
        this.container.css('height', this.config.cols * this.config.cellSize);

        this.grid = [];
        this.path = [];
        this.closedSet = [];
        this.openSet = [];
        for (let row = 0; row < this.config.rows; row++) {
            this.grid[row] = [];
            for (let col = 0; col < this.config.cols; col++) {
                const cell = new Cell(col, row, 'open');
                this.grid[row][col] = cell;
            }
        }
        // set random cells
        this.startCell = this.grid[5][6];
        this.targetCell = this.grid[15][15];
        this.startCell.type = 'start';
        this.targetCell.type = 'target';
        this.openSet.push(this.startCell);
        this.currentCell = this.openSet[0];



        // connect cells
        for (let row = 0; row < this.config.rows; row++) {
            for (let col = 0; col < this.config.cols; col++) {
                const cell = this.grid[row][col];
                if (col < this.config.cols - 1 && this.grid[row][col + 1].type !== 'block') {
                    cell.addNeighbor(this.grid[row][col + 1]);
                } if (row < this.config.rows - 1 && this.grid[row + 1][col].type !== 'block') {
                    cell.addNeighbor(this.grid[row + 1][col]);
                } if (col > 0 && this.grid[row][col - 1].type !== 'block') {
                    cell.addNeighbor(this.grid[row][col - 1]);
                } if (row > 0 && this.grid[row - 1][col].type !== 'block') {
                    cell.addNeighbor(this.grid[row - 1][col]);
                }
            }
        }
        if (this.renderEngine) {
            this.renderEngine.terminate();
        }
        this.renderGrid();
    }
    this.run = () => {
        this.renderEngine.start();
    }

    /* Build Blocks */

    this.cellClicked = (e) => {
        const col = $(e.currentTarget).attr('cell-x');
        const row = $(e.currentTarget).attr('cell-y');
        const cell = this.grid[row][col];
        cell.type = 'block';
        this.renderGrid();
    }

    this.restart();
    this.renderEngine = RenderEngine(this.onSetup, this.onUpdate, this.onTerminate, this.config);
    this.drawGrid();




    /* */
    return this;
}


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


/**
 * 
 * @param {*} x 
 * @param {*} y 
 */
function Cell(x, y, type = 'open') {
    this.neighbors = [];
    this.explored = false;
    this.type = type;
    this.x = x;
    this.y = y;
    this.distanceOfSource = 0;
    this.distanceToTarget = 0;
    this.setAsExplored = function () {
        this.explored = true;
    }
    this.addNeighbor = function (cell) {
        this.neighbors.push(cell);
    }
    /**
     * @description Get Total Distance Distance Of Source  + Distance To Target [HCost]
     * @return {Number}
     */
    this.weight = function () {
        return this.distanceOfSource + this.distanceToTarget;
    }
    return this;
}

