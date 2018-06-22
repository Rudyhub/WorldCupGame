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
    },
    noOpacity(data){
        for (var i=0, pixLen = data.length;i<pixLen;i+=4){
            if(data[i+3] !== 0){
                return true;
            }
        }
        return false;
    }
};


function main(){
    var imgs = ['again.png','ball.png', 'bg201.jpg','bg301.jpg', 'p101.jpg', 'p102.jpg',
        'p103.png','p104.png','p301.png','p302.png','p303.png', 'player02.png', 'player02.png',
        'player03.png', 'pointer.png', 'share.png'],
        dialog = document.getElementById('dialog'),
        dialogIn = dialog.querySelector('.dialog-inner'),
        scene = [document.getElementById('scene1'), document.getElementById('scene2'), document.getElementById('scene3')];

    dialog.onclick = function (e) {
        if(e.target === dialog || e.target === dialogIn)
            utils.removeClass(dialog, 'show');
    };
    if(!utils.isTouch()){
        dialogIn.innerHTML = '<span>設備不支持，無法進行遊戲！</span>';
        utils.addClass(dialog, 'show');
        return;
    }

    utils.addClass(dialog, 'show');

    utils.imgLoaded(imgs, function(cur, total){
        if(cur === total){
            utils.removeClass(dialog, 'show');
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

        var btn101 = document.getElementById('btn101'),
            ball201 = document.getElementById('ball201'),
            player201 = document.getElementById('player201'),
            player202 = document.getElementById('player202'),
            player203 = document.getElementById('player203'),
            clock201 = document.getElementById('clock201'),
            score201 = document.getElementById('score201'),
            goal201 = document.getElementById('goal201'),
            pointer201 = document.getElementById('pointer201'),
            cv = document.getElementById('cv'),
            statTxt302 = document.getElementById('statTxt302'),
            player203Cls = player203.className,
            kickAudio = new Audio(),
            deg = 0,
            stat = 0,//守门员扑员状态，0:中间直站，1:左倾，2:右倾
            clock = null,
            timeLimit = 10000,
            countTime = timeLimit,
            pscore = 0,
            uscore = 0,
            speedY = [],
            speedX = [],
            pw202 = player202.offsetWidth,
            pw203 = player203.offsetWidth;


        btn101.onclick = function(){
            kickAudio.src = 'audio/kick.mp3';
            turnScene(1);
            readyStart();
        };

        function readyStart(){
            pscore = 0;
            uscore = 0;
            score201.innerText = '0:0';
            clock201.innerText = timeLimit/1000;
            countTime = timeLimit;
            utils.removeClass(pointer201, 'hide');
            reStat();
        }

        function reStat(){
            utils.addEvent(ball201, 'touchstart', startFn);
            utils.addClass(player201, 'on');
            utils.removeClass(player202, 'on');
            player203.className = player203Cls;
            player202.removeAttribute('style');
            player203.removeAttribute('style');
            ball201.removeAttribute('style');
        }

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
            player202.style.left = e.targetTouches[0].clientX - pw202/2 + 'px';
            player203.style.left = e.targetTouches[0].clientX -pw203/2 + 'px';
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
                deg = 0;
            }

            motion(x, y);

            if(!kickAudio.paused){
                kickAudio.pause();
                kickAudio.currentTime = 0;
            }
            kickAudio.play();

            if(countTime === timeLimit) {
                clock = setInterval(clockFn, 1000);
                utils.addClass(pointer201, 'hide');
            }
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
                        vH = ball201.parentNode.offsetHeight,
                        gl = goal201.offsetLeft,
                        gt = goal201.offsetTop,
                        gw = goal201.offsetWidth,
                        gh = goal201.offsetHeight;
                    //先判断球在球门区域
                    if(left>gl && left<gl+gw-bw && top>gt && top<gt+gh-bw){
                        var ctx = cv.getContext('2d'),
                            binfo = ball201.getBoundingClientRect(),
                            pl = player203.offsetLeft,
                            pt = player203.offsetTop,
                            pw = player203.offsetWidth,
                            ph = player203.offsetHeight,
                            bimg = new Image(),
                            pimg = new Image(),
                            ox = pl+pw/2,
                            oy = pt+ph,
                            dir = stat === 1 ? -1 : 1,
                            pixs;

                        cv.width = vW;
                        cv.height = vH;

                        bimg.src = ball201.src;
                        pimg.src = player203.src;

                        ctx.drawImage(bimg,binfo.left,binfo.top,bw,ball201.offsetHeight);
                        ctx.translate(ox, oy);
                        ctx.rotate(dir*Math.PI*deg/180);
                        ctx.translate(-ox,-oy);
                        ctx.globalCompositeOperation="source-in";
                        ctx.drawImage(pimg, pl, pt, pw,ph);

                        pixs = ctx.getImageData(gl, gt, gw, gh);
                        if(utils.noOpacity(pixs.data)){
                            pscore++;
                        }else{
                            uscore++;
                        }
                    }else{
                        pscore++;
                    }
                    score201.innerText = uscore + ':' + pscore;

                    timer = setTimeout( function(){
                        clearTimeout(timer);
                        reStat();
                    }, 200);
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
            if(countTime <= 0){
                clearInterval(clock);
                turnScene(2);
                gameOver();
                countTime = 0;
            }else{
                clock201.innerText = countTime/1000;
            }
        }

        var score301 = document.getElementById('score301'),
            rank301 = document.getElementById('rank301'),
            again301 = document.getElementById('again301'),
            share301 = document.getElementById('share301');
        function gameOver(){
            score301.innerText = uscore;
            rank301.innerText = pscore;
            if(uscore <= 0){
                statTxt302.src = 'img/p303.png';
            }else{
                statTxt302.src = 'img/p302.png';
            }
        }

        again301.onclick = function () {
            readyStart();
            turnScene(1);
        };

        share301.onclick = function(){
            if(/MicroMessenger/i.test(window.navigator.userAgent)){
                dialogIn.innerHTML = '<span>請點擊微信右上角菜單選擇分享。</span>';
            }else{
                dialogIn.innerHTML = '<span>請點擊瀏覽分享菜單進行分享。</span>';
            }
            utils.addClass(dialog, 'show');
        }
    }

}
main();

