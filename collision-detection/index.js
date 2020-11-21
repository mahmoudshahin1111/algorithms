



class Vector2d {
     constructor(x, y) {
          this.x = x;
          this.y = y;
     }
     rotate(angle, around) {
          const angleInRadian = (angle * Math.PI) / 180;
          const rX =
               (this.x - around.x) * Math.cos(angleInRadian) -
               (this.y - around.y) * Math.sin(angleInRadian);
          const rY =
               (this.x - around.x) * Math.sin(angleInRadian) +
               (this.y - around.y) * Math.cos(angleInRadian);
          this.x = rX + around.x;
          this.y = rY + around.y;
     }
}

class CollisionData {
     collisionPoint;
     collisionBlock;
     collisionDistance;
     constructor(collisionBlock, collisionPoint, distance) {
          this.collisionBlock = collisionBlock;
          this.collisionPoint = collisionPoint;
          this.collisionDistance = distance;
     }
}

class Line {
     constructor(sP, eP, rotationAngle = 0) {
          this.sP = sP;
          this.eP = eP;
          this.rotateLine(rotationAngle);
     }
     rotateLine(angle) {
          this.rotate(angle);
     }
     /**
      *
      * @param {String} angle
      * @param {Vector2d} aroundPoint
      */
     rotate(angle) {
          const angleInRadian = (angle * Math.PI) / 180;
          const rX =
               (this.eP.x - this.sP.x) * Math.cos(angleInRadian) -
               (this.eP.y - this.sP.y) * Math.sin(angleInRadian);
          const rY =
               (this.eP.x - this.sP.x) * Math.sin(angleInRadian) +
               (this.eP.y - this.sP.y) * Math.cos(angleInRadian);
          this.eP.x = rX + this.sP.x;
          this.eP.y = rY + this.sP.y;
     }
     magnitude() {
          return Math.sqrt(Math.pow(this.eP.x - this.sP.x, 2) + Math.pow(this.eP.y - this.sP.y, 2));
     }
     normalize() {
          const length = this.magnitude();
          return new Vector2d((this.eP.x - this.sP.x) / length, (this.eP.y - this.sP.y) / length);
     }
}

/**
 *  @property {Number} canvasWidth
 *  @property {Number} canvasHeight
 * @property {String} canvasId
 * @property {HTMLCanvasElement} canvas
 * @property {Array} lines
 */
class Engine {
     constructor(canvasId) {
          this.canvasWidth = 500;
          this.canvasHeight = 500;
          this.blockCounts = 10;
          this.circleLinePerAngle = 1;
          this.lineLength = 1000;
          this.canvasId = canvasId;
          this.canvas = null;
          this.ctx = null;
          this.run = false;
          this.fps = 100;
          this.blocks = [];
          this.lines = [];
          this.intersectionPoints = [];
          this.center = new Vector2d(250, 250);
          this.distance = new Vector2d(0, 0);
          this.speed = 2;
          this.sensor = this.speed;
          this.topRightNav = { line: new Line(this.center, new Vector2d(this.center.x + this.sensor, this.center.y - this.sensor)), distance: new Vector2d(0, 0) };
          this.topLeftNav = { line: new Line(this.center, new Vector2d(this.center.x - this.sensor, this.center.y - this.sensor)), distance: new Vector2d(0, 0) }
          this.topNav = { line: new Line(this.center, new Vector2d(this.center.x, this.center.y - this.sensor)), distance: new Vector2d(0, 0) };
          //
          this.topLeftNav.distance.x = this.topLeftNav.line.eP.x - this.center.x;
          this.topLeftNav.distance.y = this.topLeftNav.line.eP.y - this.center.y;
          this.topNav.distance.x = this.topNav.line.eP.x - this.center.x;
          this.topNav.distance.y = this.topNav.line.eP.y - this.center.y;
          this.topRightNav.distance.x = this.topRightNav.line.eP.x - this.center.x;
          this.topRightNav.distance.y = this.topRightNav.line.eP.y - this.center.y;
          //
          this.isTurning = false;
          this.collisionalPoints = [];
          this.continueCollisionPoints = true;
          this.directionTakenAfterCollisional = 0;
     }
     setlineLength(v) {
          this.lineLength = v;
     }
     start() {
          this.canvas = document.getElementById(this.canvasId);
          this.ctx = this.canvas.getContext('2d');
          this.canvas.setAttribute('width', this.canvasWidth);
          this.canvas.setAttribute('height', this.canvasHeight);
          this.run = true;



          this.canvas.addEventListener('mousemove', (evt) => {
               this.center.x = evt.clientX - this.canvas.getBoundingClientRect().left;
               this.center.y = evt.clientY - this.canvas.getBoundingClientRect().top;
          });
          this.blocks = [
               //
               new Line(new Vector2d(0, 0), new Vector2d(this.canvasWidth, 0)),
               new Line(
                    new Vector2d(this.canvasWidth, 0),
                    new Vector2d(this.canvasWidth, this.canvasHeight)
               ),
               new Line(
                    new Vector2d(this.canvasWidth, this.canvasHeight),
                    new Vector2d(0, this.canvasHeight)
               ),
               new Line(new Vector2d(0, this.canvasHeight), new Vector2d(0, 0)),
               new Line(new Vector2d(200, 100), new Vector2d(200, 400)),
               new Line(new Vector2d(200, 400), new Vector2d(400, 400)),
               new Line(new Vector2d(400, 400), new Vector2d(400, 100)),
               new Line(new Vector2d(400, 100), new Vector2d(200, 100)),
          ];
          let i = this.blockCounts;
          while (i--) {
               this.blocks.push(
                    new Line(
                         new Vector2d(this.getRandomX(), this.getRandomY()),
                         new Vector2d(this.getRandomX(), this.getRandomY())
                    )
               );
          }

          this.update();
     }
     render() {
          // this.navigate();
          //circle flash
          this.lines = [];
          this.intersectionPoints = [];
          this.drawFlashLines();


          this.drawCircle(this.center, 5);

          // render on screen
          let i = 0;
          while (i < this.blocks.length) {
               this.drawLine(this.blocks[i]);
               i++;
          }
          i = 0;
          while (i < this.lines.length) {
               this.drawLine(this.lines[i]);
               i++;
          }
          i = 0;
          while (i < this.intersectionPoints.length) {
               this.drawCircle(this.intersectionPoints[i], 2);
               i++;
          }

     }
     drawFlashLines() {
          let angle = 0;
          while (angle < 360) {
               let line_sP = new Vector2d(this.center.x, this.center.y);
               let line_eP = new Vector2d(this.center.x, this.center.y + this.lineLength);
               let line = new Line(line_sP, line_eP, angle);
               const distanceOfColisionBlock = this.getDistanceOfBlockColisionedWith(line);
               if (distanceOfColisionBlock) {
                    line.sP = new Vector2d(this.center.x, this.center.y);
                    line.eP = new Vector2d(this.center.x, this.center.y + distanceOfColisionBlock);
                    line.rotateLine(angle);
               }
               this.lines.push(line);
               angle += this.circleLinePerAngle;
          }
     }
     navigate() {

          this.topLeftNav.line.eP.x = this.topLeftNav.distance.x + this.center.x;
          this.topLeftNav.line.eP.y = this.topLeftNav.distance.y + this.center.y;
          this.topNav.line.eP.x = this.topNav.distance.x + this.center.x;
          this.topNav.line.eP.y = this.topNav.distance.y + this.center.y;
          this.topRightNav.line.eP.x = this.topRightNav.distance.x + this.center.x;
          this.topRightNav.line.eP.y = this.topRightNav.distance.y + this.center.y;
          //
          const collisionWithTopLeftNav = this.getCollisionData(this.topLeftNav.line);
          const collisionWithTopNav = this.getCollisionData(this.topNav.line);
          const collisionWithTopRightNav = this.getCollisionData(this.topRightNav.line);
          //

          // using collisionPoints instead because block can hinted twice
          if (collisionWithTopNav) {
               // if (this.directionTakenAfterCollisional === 0) {
               //      this.directionTakenAfterCollisional = this.ifBlockCollisionalGetDirectionToTake(collisionWithTopNav.collisionPoint);
               //      if (this.directionTakenAfterCollisional === 1) {
               //           this.turnRight();
               //      } else if (this.directionTakenAfterCollisional === -1) {
               //           this.turnLeft();
               //      } else {
               //           this.addNewCollisionalBlock(collisionWithTopNav.collisionPoint, 1);
               //      }
               // }
               const crossProduct = this.getCrossProduct(collisionWithTopNav.collisionBlock, this.topNav.line);
               if (crossProduct > 0.1) {
                    // console.log(crossProduct);
                    if (this.directionTakenAfterCollisional === 1) {
                         this.turnRight();
                    } else if (this.directionTakenAfterCollisional === -1) {
                         this.turnLeft();
                    }
               } else {
                    this.directionTakenAfterCollisional = 0;
               }

          }

          else {
               this.center.x += this.topNav.line.normalize().x * this.speed;
               this.center.y += this.topNav.line.normalize().y * this.speed;
          }



          this.drawLine(this.topLeftNav.line);
          this.drawLine(this.topNav.line);
          this.drawLine(this.topRightNav.line);

     }
     getCrossProduct(vector1, vector2) {
          const v1 = vector1.normalize();
          const v2 = vector2.normalize();
          const v1Magnitude = Math.sqrt(Math.pow(v1.x, 2) + Math.pow(v1.y, 2));
          const v2Magnitude = Math.sqrt(Math.pow(v2.x, 2) + Math.pow(v2.y, 2));
          const angle = this.getAngleBetween(v1, v2);
          const crossProduct = v1Magnitude * v2Magnitude * Math.sin(angle);
          return crossProduct;
     }
     getAngleBetween(vector1, vector2) {
          const v1Magnitude = Math.sqrt(Math.pow(vector1.x, 2) + Math.pow(vector1.y, 2));
          const v2Magnitude = Math.sqrt(Math.pow(vector2.x, 2) + Math.pow(vector2.y, 2));
          const v1X = vector1.x;
          const v1Y = vector1.y;
          const v2X = vector2.x;
          const v2Y = vector2.y;
          const dotProduct = (v1X * v2X) + (v1Y * v2Y);
          const cosAngle = dotProduct / (v1Magnitude * v2Magnitude);
          const angleInRadians = Math.acos(cosAngle);
          return angleInRadians;
     }
     fromRadiansToDegrees(radians) {
          return (radians * 180) / Math.PI;
     }
     turnRight() {
          this.topLeftNav.distance.rotate(5, new Vector2d(0, 0));
          this.topNav.distance.rotate(5, new Vector2d(0, 0));
          this.topRightNav.distance.rotate(5, new Vector2d(0, 0));
     }
     turnLeft() {
          this.topLeftNav.distance.rotate(-5, new Vector2d(0, 0));
          this.topNav.distance.rotate(-5, new Vector2d(0, 0));
          this.topRightNav.distance.rotate(-5, new Vector2d(0, 0));
     }
     startCoroutine(callBack) {

          const coroutine = setTimeout(() => {
               const result = callBack();
               if (!result) {
                    clearTimeout(coroutine);
               } else {
                    this.startCoroutine(callBack);
               }
          }, 1000 / this.fps);
     }
     /**
      * 
      * @param {Vector2d} point 
      * @param {number} directionTaken 1 => right or -1 => left
      */
     addNewCollisionalBlock(point, directionTaken) {
          this.collisionalPoints.push({ point, directionTaken });
     }
     ifBlockCollisionalGetDirectionToTake(point) {
          if (this.collisionalPoints.length > 0) {
               for (const _point of this.collisionalPoints) {
                    if (point.x == _point.point.x &&
                         point.y == _point.point.y) {
                         console.log("I Was Here Before");

                         if (_point.directionTaken === -1) {
                              _point.directionTaken = 1;
                              return _point.directionTaken;
                         } else if (_point.directionTaken === 1) {
                              _point.directionTaken = -1;
                              return _point.directionTaken;
                         }
                    }
               }
          }
          return 0;
     }

     /**
      * 
      * @param {Line} line 
      * @returns {Number} line length
      */
     getDistanceOfBlockColisionedWith(line) {
          let nearestIntersectPoint = null;
          let nearestDistance = null;
          for (const block of this.blocks) {
               let sP = block.sP;
               let eP = block.eP;
               const result = this.getIntersectPoint(sP, eP, line.sP, line.eP);
               if (result) {
                    const distance = this.getDistance(line.sP, result);
                    if (nearestDistance === null || nearestDistance > distance) {
                         nearestDistance = distance;
                         nearestIntersectPoint = result;
                    }
               }
          }

          if (nearestIntersectPoint) {
               this.intersectionPoints.push(nearestIntersectPoint);
               return nearestDistance;
          }
          return;
     }
     /**
      * 
      * @param {*} line 
      * @returns {CollisionData}
      */
     getCollisionData(line) {

          let collisionBlock = null;
          let collisionalPoint = null;
          let nearestDistance = null;
          for (const block of this.blocks) {
               const result = this.getIntersectPointWithTwoLines(block, line);
               if (result) {
                    const distance = this.getDistance(line.sP, result);
                    if (nearestDistance === null || nearestDistance > distance) {
                         nearestDistance = distance;
                         collisionBlock = block;
                         collisionalPoint = result;
                    }
               }
          }

          if (collisionBlock) {
               const collisionData = new CollisionData(collisionBlock, collisionalPoint, nearestDistance);
               return collisionData;
          }
          return;
     }
     getIntersectPointWithTwoLines(line1, line2) {
          let sP = line1.sP;
          let eP = line1.eP;
          return this.getIntersectPoint(sP, eP, line2.sP, line2.eP);
     }
     getRandomX() {
          return Math.floor(Math.random() * this.canvasWidth);
     }
     getRandomY() {
          return Math.floor(Math.random() * this.canvasHeight);
     }
     getDistance(sP, eP) {
          return Math.sqrt(Math.pow(eP.x - sP.x, 2) + Math.pow(eP.y - sP.y, 2));
     }
     update() {
          const routine = setTimeout(() => {
               this.ctx.beginPath();
               this.ctx.fillStyle = "black";
               this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
               this.ctx.strokeStyle = "rgba(255,150,255,1)";
               this.render();
               this.ctx.stroke();
               if (this.run) {
                    this.update();
               } else {
                    clearTimeout(routine);
               }
          }, 1000 / this.fps);
     }
     /**
      *
      * @param {Line} line
      */
     drawLine(line) {
          this.ctx.moveTo(line.sP.x, line.sP.y);
          this.ctx.lineTo(line.eP.x, line.eP.y);
     }
     /**
      *
      * @param {Vector2d} center
      * @param {Number} radius
      */
     drawCircle(center, radius) {
          this.ctx.moveTo(center.x, center.y);
          this.ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
     }
     /**
      *
      * @param {Vector2d} p1
      * @param {Vector2d} p2
      * @param {Vector2d} p3
      * @param {Vector2d} p4
      * @param {Vector2d} point  refrance to intercected point
      */
     getIntersectPoint(p1, p2, p3, p4) {
          const x1 = p1.x;
          const y1 = p1.y;
          const x2 = p2.x;
          const y2 = p2.y;
          const x3 = p3.x;
          const y3 = p3.y;
          const x4 = p4.x;
          const y4 = p4.y;
          const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
          if (denominator == 0) {
               return;
          }
          const u =
               -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) /
               ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
          const t =
               ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) /
               ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
          if (t > 1 || t < 0) {
               return;
          }
          if (u > 1 || u < 0) {
               return;
          }
          const iX = x3 + u * (x4 - x3);
          const iY = y3 + u * (y4 - y3);
          return new Vector2d(iX, iY);
     }
}


var engine = new Engine('canavas');
engine.start();

document.getElementById('flash_light').addEventListener('change', function (e) {
     engine.lineLength = (Number(e.target.value));
});
document.getElementById('flash_light_blocks').addEventListener('change',function (e) {
     engine.blockCounts = e.target.value;
     engine.start();
})
document.getElementById('flash_light_fps').addEventListener('change', function (e) {
     engine.fps = (Number(e.target.value));
})