/**
 * execute after specific of time 
 * @param {Number} ms
 * @returns {Promise} 
 */
function throttle(ms, callback) {
     let flagOpened = true;
     return function (e) {
          if (flagOpened) {
               let ticks = 0;
               flagOpened = false;
               let interval = setInterval(() => {
                    if (ticks >= ms) {
                         callback(e);
                         flagOpened = true;
                         clearInterval(interval);
                    }
                    ticks++;
               }, 1)
          }
     }
}


function debounce(ms, callback) {
     let flagOpened = true;
     let theresNextEvent = false;
     return function (e) {
          if (flagOpened) {
               callback(e);
               flagOpened = false;
               let ticks = 0;
               let interval = setInterval(() => {
                    if (ticks >= ms) {
                         flagOpened = true;
                         if (theresNextEvent) {
                              callback(e);
                              theresNextEvent = false;
                         }
                         clearInterval(interval);
                    }
                    ticks++;
               });
          } else {
               theresNextEvent = true;
          }
     }


}

/**
 * 
 * @param {HTMLElement} el 
 * @returns {boolean}
 */
function isElementInViewport(el) {
     let elInViewport = false;
     let top = el.offsetTop;
     let left = el.offsetLeft;
     let viewHeight = window.pageYOffset + window.innerHeight;
     let viewWidth = window.pageXOffset + window.innerWidth;
     if (top > window.pageYOffset && top < viewHeight &&
          left > window.pageXOffset && left < viewWidth

     ) {
          elInViewport = true;
     }
     return elInViewport;
}




function onScrollLoadContent(e) {
     let result = isElementInViewport(document.querySelector('#loading'));
     if (result) {
          loadMoreContent();
     }
}

function loadMoreContent() {
     let container = document.querySelector('#container');
     let content = container.innerHTML;
     container.innerHTML += content;
}

document.addEventListener('scroll', throttle(500, this.onScrollLoadContent));