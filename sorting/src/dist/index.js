var AlgorithmElement = /** @class */ (function () {
    function AlgorithmElement(value, posIndex) {
        this.id = "id_" + Math.floor(Math.random() * 999999);
        this.name = "";
        this.value = value;
        this.width = 20;
        this.height = value;
        this.posIndex = posIndex;
        this.x = posIndex * this.width;
        this.y = 0;
    }
    Object.defineProperty(AlgorithmElement.prototype, "text", {
        get: function () {
            return {
                content: this.getValue().toString(),
                pos: {
                    x: 430 - this.getX(),
                    y: 550 - this.getHeight()
                }
            };
        },
        enumerable: false,
        configurable: true
    });
    AlgorithmElement.prototype.getId = function () {
        return this.id;
    };
    AlgorithmElement.prototype.getColor = function () {
        return ("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"));
    };
    AlgorithmElement.prototype.getHeight = function () {
        return this.height;
    };
    AlgorithmElement.prototype.setHeight = function (value) {
        this.height = value;
    };
    AlgorithmElement.prototype.getWidth = function () {
        return this.width;
    };
    AlgorithmElement.prototype.setWidth = function (value) {
        this.width = value;
    };
    AlgorithmElement.prototype.getValue = function () {
        return this.value;
    };
    AlgorithmElement.prototype.setValue = function (value) {
        this.value = value;
    };
    AlgorithmElement.prototype.getX = function () {
        return this.posIndex * this.width;
    };
    AlgorithmElement.prototype.getY = function () {
        return this.y;
    };
    AlgorithmElement.prototype.setPosIndex = function (v) {
        this.posIndex = v;
    };
    AlgorithmElement.prototype.getPosIndex = function () {
        return this.posIndex;
    };
    return AlgorithmElement;
}());
/* Quick Sorting */
var QuickSorting = /** @class */ (function () {
    function QuickSorting() {
        this.elements = [];
        this.svgEl = document.getElementById("algorithm_svg");
        this.partitions = [];
        this.running = false;
        this.tick = 0;
    }
    QuickSorting.prototype.log = function (message) {
        this.logMsg = message;
    };
    QuickSorting.prototype.init = function (arr) {
        for (var i = 0; i < arr.length; i++) {
            var algEl = new AlgorithmElement(arr[i], i);
            this.elements.push(algEl);
        }
        var indexes = [];
        this.elements.forEach(function (e, i) { return indexes.push(i); });
        this.partitions.push(new Partition(indexes));
        this.draw();
    };
    QuickSorting.prototype.start = function () {
        this.running = true;
        this.loop();
    };
    QuickSorting.prototype.loop = function () {
        var _this = this;
        setTimeout(function () {
            if (_this.isRunning()) {
                _this.tick += 1;
                _this.log("tick was : " + _this.tick);
                var nextPartition = _this.partitions.find(function (p) { return p.isSorted === false; });
                if (nextPartition) {
                    _this.sorting(nextPartition);
                }
            }
            _this.render();
            _this.loop();
        }, 1000 / config.fps);
    };
    QuickSorting.prototype.draw = function () {
        var html = "";
        for (var _i = 0, _a = this.elements; _i < _a.length; _i++) {
            var el = _a[_i];
            var rect = "<rect id=\"" + el.getId() + "\" style=\"fill:" + el.getColor() + "\" x='" + el.getX() + "' y='" + el.getY() + "' width='" + el.getWidth() + "' height='" + el.getHeight() + "' data-value='" + el.value + "' data-height='" + el.getHeight() + "' data-width='" + el.getWidth() + "' class=\"alg_vector\" />";
            var text = "  <text class='element__text' x=\"" + el.text.pos.x + "\" y=\"" + el.text.pos.y + "\" class=\"small\">" + el.text.content + "</text> ";
            html += text + rect;
        }
        $(this.svgEl).html(html);
    };
    QuickSorting.prototype.render = function () {
        for (var i = 0; i < this.elements.length; i++) {
            var el = this.elements[i];
            el.setPosIndex(i);
            var e = $("#" + el.getId());
            e.prev('.element__text').attr('x', el.text.pos.x);
            e.prev('.element__text').attr('y', el.text.pos.y);
            e.attr("x", el.getX());
            e.attr("y", el.getY());
            e.attr("width", el.getWidth());
            e.attr("height", el.getHeight());
        }
    };
    QuickSorting.prototype.sorting = function (partition) {
        // arrange partition
        var swapped = false;
        for (var i = 0; i < partition.elementsIndexes.length; i++) {
            if ((this.elements[partition.elementsIndexes[i]].getValue() >
                this.elements[partition.elementsIndexes[partition.pivotIndex]].getValue() &&
                partition.elementsIndexes[i] <
                    partition.elementsIndexes[partition.pivotIndex]) ||
                (this.elements[partition.elementsIndexes[i]].getValue() <=
                    this.elements[partition.elementsIndexes[partition.pivotIndex]].getValue() &&
                    partition.elementsIndexes[i] >
                        partition.elementsIndexes[partition.pivotIndex])) {
                swapped = true;
            }
            if (swapped) {
                var tempEl = this.elements[partition.elementsIndexes[partition.pivotIndex]];
                this.elements[partition.elementsIndexes[partition.pivotIndex]] = this.elements[partition.elementsIndexes[i]];
                this.elements[partition.elementsIndexes[i]] = tempEl;
                partition.pivotIndex = i;
                break;
            }
        }
        if (!swapped) {
            partition.isSorted = true;
            if (partition.elementsIndexes.length > 2) {
                var p1 = [];
                var p2 = [];
                for (var i = 0; i < partition.elementsIndexes.length; i++) {
                    if (i < partition.pivotIndex) {
                        p1.push(partition.elementsIndexes[i]);
                    }
                    else if (i > partition.pivotIndex) {
                        p2.push(partition.elementsIndexes[i]);
                    }
                }
                this.partitions.push(new Partition(p1));
                this.partitions.push(new Partition(p2));
            }
        }
    };
    QuickSorting.prototype.run = function () {
        this.running = true;
    };
    QuickSorting.prototype.stop = function () {
        this.running = false;
    };
    QuickSorting.prototype.reset = function () {
        this.running = false;
        this.elements = [];
        this.partitions = [];
    };
    /**
     * @returns {boolean}
     */
    QuickSorting.prototype.isRunning = function () {
        return this.running;
    };
    return QuickSorting;
}());
var Partition = /** @class */ (function () {
    function Partition(elementsIndexes) {
        this.elementsIndexes = elementsIndexes;
        this.isSorted = false;
        this.pivotIndex = Math.floor(this.elementsIndexes.length / 2);
    }
    return Partition;
}());
/* */
var MergeSorting = /** @class */ (function () {
    function MergeSorting() {
        this.sortingMatrix = [];
        this.sortingMatrixIndex = 0;
        this.elements = [];
        this.svgEl = document.getElementById("algorithm_svg");
        this.running = false;
        this.tick = 0;
    }
    MergeSorting.prototype.init = function (arr) {
        for (var i = 0; i < arr.length; i++) {
            var algEl = new AlgorithmElement(arr[i], i);
            this.elements.push(algEl);
        }
        this.sortingMatrix[0] = [];
        for (var _i = 0, _a = this.elements; _i < _a.length; _i++) {
            var el = _a[_i];
            this.sortingMatrix[0].push([el]);
        }
        this.draw();
    };
    MergeSorting.prototype.start = function () {
        this.running = true;
        this.loop();
    };
    MergeSorting.prototype.loop = function () {
        var _this = this;
        setTimeout(function () {
            if (_this.isRunning()) {
                _this.tick += 1;
                _this.sorting();
            }
            _this.render();
            _this.loop();
        }, 1000 / config.fps);
    };
    MergeSorting.prototype.draw = function () {
        var html = "";
        for (var _i = 0, _a = this.elements; _i < _a.length; _i++) {
            var el = _a[_i];
            var rect = "<rect id=\"" + el.getId() + "\" style=\"fill:" + el.getColor() + "\" x='" + el.getX() + "' y='" + el.getY() + "' width='" + el.getWidth() + "' height='" + el.getHeight() + "' data-value='" + el.value + "' data-height='" + el.getHeight() + "' data-width='" + el.getWidth() + "' class=\"alg_vector\" />";
            var text = "  <text class='element__text' x=\"" + el.text.pos.x + "\" y=\"" + el.text.pos.y + "\" class=\"small\">" + el.text.content + "</text> ";
            html += text + rect;
        }
        $(this.svgEl).html(html);
    };
    MergeSorting.prototype.render = function () {
        for (var i = 0; i < this.elements.length; i++) {
            var el = this.elements[i];
            el.setPosIndex(i);
            var e = $("#" + el.getId());
            e.prev('.element__text').attr('x', el.text.pos.x);
            e.prev('.element__text').attr('y', el.text.pos.y);
            e.attr("x", el.getX());
            e.attr("y", el.getY());
            e.attr("width", el.getWidth());
            e.attr("height", el.getHeight());
        }
    };
    MergeSorting.prototype.sorting = function () {
        var arr = this.sortingMatrix[this.sortingMatrixIndex];
        var nextArr = [];
        for (var pi = 0; pi < arr.length; pi = pi + 2) {
            var x = 0;
            var y = 0;
            var newPart = [];
            var arrFP = arr[pi];
            var arrSP = arr[pi + 1];
            if (arrSP) {
                for (var fpi = x; fpi < arrFP.length; fpi++) {
                    var arrFPE = arrFP[fpi];
                    for (var spi = y; spi < arrSP.length; spi++) {
                        var arrSPE = arrSP[spi];
                        if (arrSPE.value < arrFPE.value) {
                            y = y + 1;
                            newPart.push(arrSPE);
                            var spe = this.elements[arrSPE.getPosIndex()];
                            for (var elI = arrSPE.getPosIndex(); elI > arrFPE.getPosIndex(); elI--) {
                                this.elements[elI] = this.elements[elI - 1];
                                this.elements[elI].setPosIndex(elI - 1);
                            }
                            this.elements[arrFPE.getPosIndex()] = spe;
                            spe.setPosIndex(arrFPE.getPosIndex());
                        }
                        else if (arrSPE.value > arrFPE.value) {
                            x = x + 1;
                            newPart.push(arrFPE);
                            break;
                        }
                    }
                }
                if (x < arrFP.length) {
                    for (var h1 = x; h1 < arrFP.length; h1++) {
                        newPart.push(arrFP[h1]);
                    }
                }
                if (y < arrSP.length) {
                    for (var h1 = y; h1 < arrSP.length; h1++) {
                        newPart.push(arrSP[h1]);
                    }
                }
            }
            else {
                newPart = arrFP;
            }
            nextArr.push(newPart);
        }
        if (nextArr) {
            this.sortingMatrix.push(nextArr);
            if (nextArr[0].length == this.sortingMatrix[0].length) {
                this.stop();
                console.log(this.elements, this.sortingMatrix);
                return;
            }
            if (this.sortingMatrixIndex < this.sortingMatrix.length) {
                this.sortingMatrixIndex++;
            }
        }
    };
    MergeSorting.prototype.run = function () {
        this.running = true;
    };
    MergeSorting.prototype.stop = function () {
        this.running = false;
    };
    MergeSorting.prototype.reset = function () {
        this.running = false;
        this.sortingMatrix = [];
        this.elements = [];
        this.init([]);
        this.sortingMatrixIndex = 0;
        this.logMsg = '';
        this.tick = 0;
    };
    /**
     * @returns {boolean}
     */
    MergeSorting.prototype.isRunning = function () {
        return this.running;
    };
    return MergeSorting;
}());
/* Config */
var config = {
    fps: 100,
    algorithm: new MergeSorting()
};
/* Actions */
function handleStartButtonClicked(event) {
    var randomNumbers = [];
    for (var i = 20; i < 40; i++) {
        var randomNum = Math.ceil(Math.acos(Math.random()) * (i * 2));
        randomNumbers.push(randomNum);
    }
    config.algorithm.reset();
    config.algorithm.init(randomNumbers);
    config.algorithm.start();
}
function handlePauseButtonClicked(event) {
    config.algorithm.stop();
}
function handleContinueButtonClicked(event) {
    config.algorithm.run();
}
function handleResetButtonClicked(event) {
    config.algorithm.reset();
}
function handleSpeedChanged(event) {
    config.fps = parseInt($(event.target).val().toString());
}
function handleAlgorithmChanged(e) {
    switch (e.target.value) {
        case "marge_sort":
            config.algorithm = new MergeSorting();
            break;
        case "quick_sort":
            config.algorithm = new QuickSorting();
            break;
    }
}
$("#start_button").on("click", function (e) { return handleStartButtonClicked(e); });
$("#continue_button").on("click", function (e) { return handleContinueButtonClicked(e); });
$("#pause_button").on("click", function (e) { return handlePauseButtonClicked(e); });
$("#reset_button").on("click", function (e) { return handleResetButtonClicked(e); });
$("#fps_control").on("change", function (e) { return handleSpeedChanged(e); });
$("input[name=sort_type]").on("change", function (e) { return handleAlgorithmChanged(e); });
