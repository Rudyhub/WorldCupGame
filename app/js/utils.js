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
    loadImage: function(arr,fn){
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
    noOpacity: function(data){
        for (var i=0, pixLen = data.length;i<pixLen;i+=4){
            if(data[i+3] !== 0){
                return true;
            }
        }
        return false;
    },
    css: function(el,o){
        if(typeof o !== 'object') return;
        for(var k in o){
            if(k === 'transform' || k === 'animation'){
                var str = k.slice(0,1).toUpperCase() + k.slice(1);
                el.style['webkit'+str] = o[k];
                el.style['moz'+str] = o[k];
            }else{
                el.style[k] = o[k];
            }
        }
    },
    popup: function(o){
        var div = document.createElement('div'),
            cell = document.createElement('div');

        this.css(div, {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: '#fff',
            color: '#333',
            display: 'table',
            zIndex: 100
        });
        this.css(cell, {
            display: 'table-cell',
            verticalAlign: 'middle',
            textAlign: 'center'
        });

        this.css(div, o);

        div.appendChild(cell);
        div.onclick = function (ev) {
            if(ev.target === div || ev.target === cell){
                document.body.removeChild(div);
            }
        };
        return {
            show: function (html) {
                if(document.body.contains(div)) return;
                document.body.appendChild(div);
                cell.innerHTML = '';
                if(typeof html === 'string'){
                    cell.innerHTML = html || '';
                }else if(html.nodeType === 1){
                    cell.appendChild(html);
                }
            },
            hide: function(){
                document.body.removeChild(div);
            }
        }
    },
    loading: function(complete){
        var popup = this.popup(),
            div = document.createElement('div');
        this.css(div,{
            textAlign: 'left',
            padding: '.5em',
            display: 'inline-block'
        });
        div.innerHTML = 'loading...0%';
        popup.show(div);
        this.loadImage(['again.png','ball.png', 'bg201.jpg','bg301.jpg',
            'p101.jpg', 'p102.jpg','p103.png','p104.png','p301.png','p302.png','p303.png',
            'goalie01.png', 'goalie02.png','goalie03.png',
            'pointer.png', 'share.png','steer.png'], function (cur, total) {
            if(cur === total){
                popup.hide();
                if(complete) complete();
            }else{
                div.innerHTML = 'loading...'+Math.round(cur/total * 100) + '%';
            }
        });
    },
    ready(fn){
        var _this = this;
        this.addEvent(document, 'DOMContentLoaded', function handler() {
            _this.removeEvent(document, 'DOMContentLoaded', handler);
            _this.loading(fn);
        });
    }
};

