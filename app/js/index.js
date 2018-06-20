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
    },
    imgLoaded(arr,fn){
        for(var i=0, len=arr.length, count=0; i<len; i++){
            (function(i){
                var img = new Image();
                img.onload = function(){
                    count++;
                    if(fn) fn(count, len);
                    img = img.onload = null;
                };
                img.src = 'img/'+arr[i];
            })(i);
        }
    }
};


function main(){
    var imgs = ['again.png','ball.png', 'bg201.jpg','bg301.jpg', 'p101.jpg', 'p102.jpg',
        'p103.png','p104.png','p301.png','p302.png','p303.png', 'player02.png', 'player02.png',
        'player03.png', 'pointer.png', 'share.png'],
        dialog = document.getElementById('dialog'),
        dialogIn = dialog.querySelector('.dialog-inner'),
        scene = [document.getElementById('scene1'), document.getElementById('scene2'), document.getElementById('scene3')];


    utils.addClass(dialog, 'loading');
    utils.imgLoaded(imgs, function(cur, total){
        if(cur === total){
            utils.removeClass(dialog, 'loading');
            ready();
        }else{
            dialogIn.innerHTML = Math.round(cur/total * 100) + '%';
        }
    });


    function turnScene(index){
        for(var i=0; i<3; i++){
            if(i === index){
                scene[i].style.display = 'block';
                utils.addClass(scene[i], 'on');
            }else{
                scene[i].style.display = 'none';
                utils.removeClass(scene[i], 'on');
            }
        }
    }

    function ready(){
        turnScene(0);
        var btn101 = document.getElementById('btn101');
        btn101.onclick = function(){
            turnScene(1);
        };

        var ball201 = document.getElementById('ball201'),
            player201 = document.getElementById('player201'),
            player202 = document.getElementById('player202'),
            player203 = document.getElementById('player203'),
            player203Cls = player203.className,
            deg = 0,
            stat = 0,//守门员扑员状态，0:中间直站，1:左倾，2:右倾
            clock201 = document.getElementById('clock201'),
            score201 = document.getElementById('score201'),
            clock = null,
            timeLimit = 10000,
            countTime = timeLimit;

        var speedY = [], speedX = [];

        function startFn() {
            utils.removeEvent(ball201, 'touchstart', startFn);
            speedY.splice(0, speedY.length);
            speedX.splice(0, speedX.length);

            utils.addClass(player202, 'on');
            utils.removeClass(player201, 'on');

            utils.addEvent(document, 'touchmove', moveFn);
            utils.addEvent(document, 'touchend', endFn);
        }
        function moveFn(e){
            speedX.push(e.targetTouches[0].clientX);
            speedY.push(e.targetTouches[0].clientY);
        }
        function endFn(){
            utils.removeEvent(document, 'touchmove', moveFn);
            utils.removeEvent(document, 'touchend', endFn);

            if(speedX.length > 5) speedX.splice(0, speedX.length-5);
            if(speedY.length > 5) speedY.splice(0, speedY.length-5);

            var xSum = 0,
                ySum = 0,
                xLen = speedX.length,
                yLen = speedY.length,
                x,
                y;
            for(var i=1; i<xLen; i++){
                xSum += speedX[i] - speedX[i-1];
            }
            for(var j=1; j<yLen; j++){
                ySum += speedY[j] - speedY[j-1];
            }
            x = xSum/xLen;
            y = ySum/yLen;
            if(isNaN(x)) x = 0;
            if(isNaN(y)) y = 0;

            utils.addClass(player203, 'on');
            utils.removeClass(player201, 'on');
            utils.removeClass(player202, 'on');

            var rand1 = Math.random(), rand2 = Math.random();
            if(rand2 < .25){
                deg = 80;
            }else if(rand2 >= .25 && rand2 < .5){
                deg = 60;
            }else if(rand2 >= .5 && rand2 < .75){
                deg = 30;
            }else{
                deg = 0;
            }
            if(rand1 > .66){
                utils.addClass(player203, 'jump-left-'+deg);
                stat = deg === 0 ? 0 : 1;
            }else if(rand1 < .33){
                utils.addClass(player203, 'jump-right-'+deg);
                stat = deg === 0 ? 0 : 2;
            }else{
                stat = 0;
            }

            motion(x, y);

            if(countTime === timeLimit) clock = setInterval(clockFn, 1000);
        }

        function motion(x, y){
            var top = ball201.offsetTop,
                left = ball201.offsetLeft,
                width = ball201.offsetWidth,
                yLimit = top;

            utils.addClass(ball201, 'rotating');

            var timer = setInterval(function(){
                if(top <= 0 || y > -1){
                    clearInterval(timer);
                    utils.removeClass(ball201, 'rotating');
                    var bw = ball201.offsetWidth,
                        vW = ball201.parentNode.offsetWidth,
                        vH = ball201.parentNode.offsetHeight;
                    //先判断球在球门区域
                    if(top < vH * 0.46 - bw && top > vH * .18 && left > vW * .125 && left < vW * .875 - bw){
                        //先判断球与守门员位置关系，利用矩形与圆的位置关系，进行碰撞算法
                        var pt = player203.offsetTop,
                            pl = player203.offsetLeft,
                            pw = player203.offsetWidth,
                            ph = player203.offsetHeight,
                            bt = ball201.offsetTop,
                            bl = ball201.offsetLeft,
                            bh = ball201.offsetHeight,
                            br = bw/2;

                        if(stat === 0){
                            if(bl < pl - bw || bl > pl + pw || bt < pt - bh || bt > pt + ph){
                                console.log('进球')
                            }else{
                                console.log('防下');
                            }
                        }else{
                            //计算矩形四个顶点
                            var point1, point2, point3, point4;
                            if(stat === 1){
                                point4 = [pl, pt + ph];
                                point1 = [point4[0] - Math.cos(Math.PI*(90-deg)/180) * ph, point4[1] - Math.sin(Math.PI*(90-deg)/180) * ph];
                                point3 = [Math.cos(Math.PI*deg/180) * pw + point4[0], point4[1] - Math.sin(Math.PI*deg/180) * pw];
                                point2 = [point3[0] - Math.sin(Math.PI*deg/180) * ph, point3[1] - Math.cos(Math.PI*deg/180) * ph];
                            }else if(stat === 2){
                                point3 = [pl+pw, pt+ph];
                                point4 = [point3[0] - Math.cos(Math.PI*deg/180)*pw, point3[1] - Math.sin(Math.PI*deg/180)*pw];
                                point2 = [Math.cos(Math.PI*(90-deg)/180)*ph + point3[0], point3[1] - Math.sin(Math.PI*(90-deg)/180)*ph];
                                point1 = [point4[0] + Math.sin(Math.PI*deg/180) * ph, point4[1] - Math.cos(Math.PI*deg/180) * ph];
                            }
                            // console.log(point1, point2, point3, point4);

                        }
                    }
                    timer = setTimeout( function(){
                        clearTimeout(timer);
                        playerReady();
                    }, 500);
                }
                x *= .9;
                y *= .9;

                top += y;
                left += x;

                ball201.style.left = left + 'px';
                ball201.style.top = top + 'px';
                ball201.style.width = width * (top/yLimit) + 'px';
            }, 16);
        }

        function clockFn(){
            countTime -= 1000;
            console.log(countTime)
            if(countTime <= 0){
                clearInterval(clock);
                //game over
                turnScene(2);
                countTime = 0;
            }else{
                clock201.innerText = countTime/1000;
            }
        }

        function playerReady(){
            utils.addEvent(ball201, 'touchstart', startFn);
            utils.addClass(player201, 'on');
            utils.removeClass(player202, 'on');
            player203.className = player203Cls;
            player202.removeAttribute('style');
            player203.removeAttribute('style');
            ball201.removeAttribute('style');
        }

        playerReady();

        // 计算两点之间的距离
        function pointsDis(p1, p2){
            return Math.sqrt((p2[0] - p1[0]) * (p2[0] - p1[0]) + (p2[1] - p1[1]) * (p2[1] - p1[1]));
        }
    }

}
main();

