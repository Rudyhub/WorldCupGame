var utils = {
    indexOf: function(arr, item){
        if(arr.indexOf){
            return arr.indexOf(item);
        }else{
            for(var i=0, l=arr.length; i<l; i++)
                if(arr[i] === item) return i;
            return -1;
        }
    },
    isTouch: function(){
        return 'ontouchstart' in document;
    },
    addClass: function(el, cls){
        if(el.classList){
            el.classList.add(cls);
        }else{
            var utils = this,
                list = el.className.split(/\s+/);
            if(utils.indexOf(list, cls) === -1){
                list.push(cls);
            }
            el.className = list.join(' ');
        }
    },
    removeClass: function(el, cls){
        if(el.classList){
            el.classList.remove(cls);
        }else{
            var utils = this,
                list = el.className.split(/\s+/),
                index;
            if((index = utils.indexOf(list, cls)) !== -1){
                list.splice(index, 1);
            }
            el.className = list.join(' ');
        }
    },
    hasClass: function(el, cls){
        if(el.classList){
            return el.classList.contains(cls);
        }else{
            var utils = this,
                list = el.className.split(/\s+/);
            return utils.indexOf(list, cls) !== -1;
        }
    },
    addEvent: function(el, evt, fn, capture){
        if(window.addEventListener){
            el.addEventListener(evt, fn, capture);
        }else if(window.attachEvent){
            el.attachEvent('on'+evt, fn);
        }
    },
    removeEvent: function(el, evt, fn){
        if(window.removeEventListener){
            el.removeEventListener(evt, fn);
        }else{
            el.detachEvent('on'+evt, fn);
        }
    }
};

var ball201 = document.getElementById('ball201'),
    ballshadow = document.getElementById('ball201-shadow');

var speedArr = [0,0], speedIndex = 0;
utils.addEvent(ball201, 'touchstart', startFn);
function startFn() {
    utils.addEvent(document, 'touchmove', moveFn);
    utils.addEvent(document, 'touchend', endFn);
}
function moveFn(e){
    speedArr[speedIndex] = e.targetTouches[0].clientY;
    speedIndex = speedIndex === 0 ? 1 : 0;
}
function endFn(){
    console.log(Math.abs(speedArr[0] - speedArr[1]));
    ballMotion(Math.abs(speedArr[0] - speedArr[1]))
    utils.removeEvent(document, 'touchmove', moveFn);
    utils.removeEvent(document, 'touchend', endFn);
}

function ballMotion(dis){
    if(dis < 8) dis = 8;
    if(dis > 85) dis = 85;

    var startPos = 10,
        speed = .4,
        shadowSpeed = .1,
        shadowDis = dis >= 54 ? 44 : dis,
        t = 16,
        duration = shadowDis / shadowSpeed,
        timeTotal = 0,
        shadowWidthStep = 10 / (duration/t),
        shadowExtStep = 5 / (duration/t),
        shadowWidth = 20,
        shadowExt = 8,
        width = 13.8,
        widthStep = ((dis-10)*5/44) / (duration / t),
        a = (speed - dis / duration)*2 / duration, //加速度
        timer;

    utils.addClass(ball201, 'rotating');

    timer = setInterval(function () {
        timeTotal += t;
        width -= widthStep;
        shadowWidth -= shadowWidthStep;
        shadowExt -= shadowExtStep;

        ball201.style.bottom = (startPos + (speed * timeTotal - .5 * a * timeTotal*timeTotal)) + '%';
        ball201.style.width = width + '%';

        ballshadow.style.bottom = (startPos + timeTotal * shadowSpeed)+'%';
        ballshadow.style.width = width*.8 + '%';
        ballshadow.style.webkitBoxShadow = ballshadow.style.boxShadow = '#185022 0 0 '+shadowWidth+'px '+shadowExt+'px';

        if(timeTotal >= duration){
            clearInterval(timer);
            utils.removeClass(ball201, 'rotating');
        }
    }, t);
}