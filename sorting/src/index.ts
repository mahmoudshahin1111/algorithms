// TODO:: get array of elements
// TODO:: draw svg for every element with it's attributes (value,width,height,color)
// TODO:: render view
// TODO:: *dq sorting elements by changing it's attributes because it's linked to svg
// TODO:: refresh render
// TODO:: ;-) celebrate

interface SortingAlgorithm {
  running: boolean;
  init(arr: Array<number>): void;
  start(): void;
  loop(): void;
  draw(): void;
  render(): void;
  sorting(partition?: Partition): void;
  stop(): void;
  reset(): void;
  run(): void;
  isRunning(): void;
}
interface Config {
  fps: number;
  algorithm: SortingAlgorithm;
}

/* Quick Sorting */

class QuickSorting implements SortingAlgorithm {
  elements: AlgorithmElement[];
  svgEl: HTMLElement;
  partitions: Array<Partition>;
  running: boolean;
  tick: number;
  logMsg: string;
  constructor() {
    this.elements = [];
    this.svgEl = document.getElementById("algorithm_svg");
    this.partitions = [];
    this.running = false;
    this.tick = 0;
  }
  log(message: string): void {
    this.logMsg = message;
  }
  init(arr: Array<number>) {
    for (let i = 0; i < arr.length; i++) {
      const algEl = new AlgorithmElement(arr[i], i);
      this.elements.push(algEl);
    }
    const indexes = [];
    this.elements.forEach((e, i) => indexes.push(i));
    this.partitions.push(new Partition(indexes));
    this.draw();
  }
  start() {
    this.running = true;
    this.loop();
  }
  loop() {
    setTimeout(() => {
      if (this.isRunning()) {
        this.tick += 1;
        this.log("tick was : " + this.tick);
        const nextPartition = this.partitions.find((p) => p.isSorted === false);
        if (nextPartition) {
          this.sorting(nextPartition);
        }
      }
      this.render();
      this.loop();
    }, 1000 / config.fps);
  }
  draw() {
    let html = "";
    for (const el of this.elements) {
      const algElVector = `<rect id="${el.getId()}" style="fill:${el.getColor()}" x='${el.getX()}' y='${el.getY()}' width='${el.getWidth()}' height='${el.getHeight()}' data-value='${
        el.value
      }' data-height='${el.getHeight()}' data-width='${el.getWidth()}' class="alg_vector" />`;
      html += algElVector;
    }
    $(this.svgEl).html(html);
  }
  render() {
    for (let i = 0; i < this.elements.length; i++) {
      const el = this.elements[i];
      el.setPosIndex(i);
      const e = $("#" + el.getId());
      e.attr("x", el.getX());
      e.attr("y", el.getY());
      e.attr("width", el.getWidth());
      e.attr("height", el.getHeight());
    }
  }
  sorting(partition: Partition) {
    // arrange partition
    let swapped = false;
    for (let i = 0; i < partition.elementsIndexes.length; i++) {
      if (
        (this.elements[partition.elementsIndexes[i]].getValue() >
          this.elements[
            partition.elementsIndexes[partition.pivotIndex]
          ].getValue() &&
          partition.elementsIndexes[i] <
            partition.elementsIndexes[partition.pivotIndex]) ||
        (this.elements[partition.elementsIndexes[i]].getValue() <=
          this.elements[
            partition.elementsIndexes[partition.pivotIndex]
          ].getValue() &&
          partition.elementsIndexes[i] >
            partition.elementsIndexes[partition.pivotIndex])
      ) {
        swapped = true;
      }
      if (swapped) {
        const tempEl = this.elements[
          partition.elementsIndexes[partition.pivotIndex]
        ];
        this.elements[
          partition.elementsIndexes[partition.pivotIndex]
        ] = this.elements[partition.elementsIndexes[i]];
        this.elements[partition.elementsIndexes[i]] = tempEl;
        partition.pivotIndex = i;
        break;
      }
    }
    if (!swapped) {
      partition.isSorted = true;
      if (partition.elementsIndexes.length > 2) {
        const p1 = [];
        const p2 = [];
        for (let i = 0; i < partition.elementsIndexes.length; i++) {
          if (i < partition.pivotIndex) {
            p1.push(partition.elementsIndexes[i]);
          } else if (i > partition.pivotIndex) {
            p2.push(partition.elementsIndexes[i]);
          }
        }
        this.partitions.push(new Partition(p1));
        this.partitions.push(new Partition(p2));
      }
    }
  }
  run() {
    this.running = true;
  }
  stop() {
    this.running = false;
  }
  reset() {
    this.running = false;
    this.init([]);
  }
  /**
   * @returns {boolean}
   */
  isRunning() {
    return this.running;
  }
}

class AlgorithmElement {
  id: string;
  name: string;
  value: number;
  width: number;
  height: number;
  x: number;
  y: number;
  posIndex: number;
  constructor(value, posIndex) {
    this.id = "id_" + Math.floor(Math.random() * 999999);
    this.name = "";
    this.value = value;
    this.width = 10;
    this.height = (value + 2) * 2;
    this.posIndex = posIndex;
    this.x = posIndex * this.width;
    this.y = 0;
  }
  getId() {
    return this.id;
  }
  getColor() {
    return (
      "#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0")
    );
  }
  getHeight() {
    return this.height;
  }
  setHeight(value) {
    this.height = value;
  }
  getWidth() {
    return this.width;
  }
  setWidth(value) {
    this.width = value;
  }
  getValue() {
    return this.value;
  }
  setValue(value) {
    this.value = value;
  }
  getX() {
    return this.x;
  }
  getY() {
    return this.y;
  }
  setPosIndex(v) {
    this.posIndex = v;
    this.x = this.posIndex * this.width;
  }
  getPosIndex() {
    return this.posIndex;
  }
}

class Partition {
  elementsIndexes: number[];
  pivotIndex: number;
  isSorted: boolean;
  constructor(elementsIndexes: Array<number>) {
    this.elementsIndexes = elementsIndexes;
    this.isSorted = false;
    this.pivotIndex = Math.floor(this.elementsIndexes.length / 2);
  }
}

/* */

class MergeSorting implements SortingAlgorithm {
  elements: AlgorithmElement[];
  svgEl: HTMLElement;
  running: boolean;
  tick: number;
  logMsg: string;
  sortingMatrix: Array<Array<Array<AlgorithmElement>>> = [];
  constructor() {
    this.elements = [];
    this.svgEl = document.getElementById("algorithm_svg");
    this.running = false;
    this.tick = 0;
  }
  init(arr: Array<number>) {

    for (let i = 0; i < arr.length; i++) {
      const algEl = new AlgorithmElement(arr[i], i);
      this.elements.push(algEl);
    }
    this.sortingMatrix[0] = [];
    for (const el of this.elements) {
      this.sortingMatrix[0].push([el]);
    }

    this.draw();
  }
  start() {
    this.running = true;
    this.loop();
  }
  loop() {
    setTimeout(() => {
      if (this.isRunning()) {
        this.tick += 1;
        this.sorting();
      }
      this.render();
      this.loop();
    }, 1000 / config.fps);
  }
  draw() {
    let html = "";
    for (const el of this.elements) {
      const algElVector = `<rect id="${el.getId()}" style="fill:${el.getColor()}" x='${el.getX()}' y='${el.getY()}' width='${el.getWidth()}' height='${el.getHeight()}' data-value='${
        el.value
      }' data-height='${el.getHeight()}' data-width='${el.getWidth()}' class="alg_vector" />`;
      html += algElVector;
    }
    $(this.svgEl).html(html);
  }
  render() {
    for (let i = 0; i < this.elements.length; i++) {
      const el = this.elements[i];
      el.setPosIndex(i);
      const e = $("#" + el.getId());
      e.attr("x", el.getX());
      e.attr("y", el.getY());
      e.attr("width", el.getWidth());
      e.attr("height", el.getHeight());
    }
  }
  sorting() {
    console.log("sorting loping is working now");
    console.log(this.sortingMatrix);
    for (let i = 0; i < this.sortingMatrix.length; i++) {
      const arr = this.sortingMatrix[i];
      if (arr) {
        const nextArr = [];
        for (let pi = 0; pi < arr.length; pi = pi + 2) {
          let x = 0;
          let y = 0;
          let newPart = [];
          const arrFP = arr[pi];
          const arrSP = arr[pi + 1];
          if (arrSP) {
            for (let fpi = x; fpi < arrFP.length; fpi++) {
              const arrFPE = arrFP[fpi];
              for (let spi = y; spi < arrSP.length; spi++) {
                const arrSPE = arrSP[spi];
                if (arrFPE.value < arrSPE.value) {
                  x = x + 1;
                  newPart.push(arrFPE);
                  break;
                } else {
                  y = y + 1;
                  newPart.push(arrSPE);
                }
              }
            }
            if (x < arrFP.length) {
              for (let h1 = x; h1 < arrFP.length; h1++) {
                newPart.push(arrFP[h1]);
              }
            }
            if (y < arrSP.length) {
              for (let h1 = y; h1 < arrSP.length; h1++) {
                newPart.push(arrSP[h1]);
              }
            }
          } else {
            newPart = arrFP;
          }
          nextArr.push(newPart);
        }
        if (nextArr) {
          this.sortingMatrix.push(nextArr);
          if (nextArr[0].length == this.sortingMatrix[0].length) {
            this.stop();
            console.log(this.sortingMatrix);
            this.elements = this.sortingMatrix[this.sortingMatrix.length-1][0];
            break;
     
          }
        }
      }
    }
  }
  run() {
    this.running = true;
  }
  stop() {
    this.running = false;
  }
  reset() {
    this.running = false;
    this.sortingMatrix = [];
    this.elements = [];
    this.init([]);
  }
  /**
   * @returns {boolean}
   */
  isRunning() {
    return this.running;
  }
}

const config: Config = {
  fps: 10,
  algorithm: new MergeSorting(),
};

function handleStartButtonClicked(event: JQuery.ClickEvent): void {
  const randomNumbers = [];
  for (let i = 20; i < 100; i++) {
    const randomNum = Math.ceil(Math.acos(Math.random()) * (i * 2));
    randomNumbers.push(randomNum);
  }
  config.algorithm.init(randomNumbers);
  config.algorithm.start();
}
function handlePauseButtonClicked(event: JQuery.ClickEvent): void {
  config.algorithm.stop();
}
function handleContinueButtonClicked(event: JQuery.ClickEvent): void {
  config.algorithm.run();
}
function handleResetButtonClicked(event: JQuery.ClickEvent): void {
  config.algorithm.reset();
}
function handleSpeedChanged(event: JQuery.ChangeEvent): void {
  config.fps = parseInt($(event.target).val().toString());
}
function handleAlgorithmChanged(e: JQuery.ChangeEvent): void {
  switch (e.target.value) {
    case "marge_sort":
      config.algorithm = new MergeSorting();
      break;
    case "quick_sort":
      config.algorithm = new QuickSorting();
      break;
  }
}

$("#start_button").on("click", (e) => handleStartButtonClicked(e));
$("#continue_button").on("click", (e) => handleContinueButtonClicked(e));
$("#pause_button").on("click", (e) => handlePauseButtonClicked(e));
$("#reset_button").on("click", (e) => handleResetButtonClicked(e));
$("#fps_control").on("change", (e) => handleSpeedChanged(e));
$("input[name=sort_type]").on("change", (e) => handleAlgorithmChanged(e));
