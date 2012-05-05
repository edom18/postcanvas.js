(function (win, doc, $) {
    
    'use strict';
    
    var isTouch = ('ontouchstart' in window),
        Event = {
            CLICK: 'click',
            START: isTouch ? 'touchstart' : 'mousedown',
            MOVE : isTouch ? 'touchmove'  : 'mousemove',
            END  : isTouch ? 'touchend'   : 'mouseup'
        },
        drawing,

        ua = navigator.userAgent.toLowerCase(),
        isAndroid = /android/.test(ua),
        isIOS = /(iphone|ipad|ipod)/.test(ua),
        
        //set by init.
        cv, ctx,
        cWidth = 0,
        cHeight = 0,
        cvRect;

    /**
     * send a image from canvas.
     */
    function sendImage(e) {
        
        var uri = '',
            data = {};

        if (!isAndroid && cv.toDataURL) {
            uri = cv.toDataURL();
        }
        else {
            uri = (Canvas2Image.saveAsBMP(cv, true, cWidth, cHeight)).src;
        }

        data.imageData = uri;
            
        $.ajax({
            url: '/post',
            type: 'post',
            data: data
        }).done(function (res) {

            //output a message.
            console.log(res);

            //clear the image.
            ctx.fillRect(0, 0, cWidth, cHeight);
        });
    }
    
    /**
     * get event object by device.
     * @param {EventObject} e
     * @returns {Object} bipes event object.
     */
    function getPagePosition(e) {
        
        var evt = e.originalEvent || e;
        
        evt = (evt.touches) ? evt.touches[0] : evt;
        
        return {
            pageX: evt.pageX,
            pageY: evt.pageY
        };
    }
    
    /**
     * stop the native scroll for touch devices.
     * @param {EventObject} e
     */
    function stopScroll(e) {
        
        e.preventDefault();
    }
    
    /**
     * draw start event handler
     * @param {EventObject} e
     */
    function drawStart(e) {
        
        var pagePos = getPagePosition(e),
            startX = pagePos.pageX - cvRect.left,
            startY = pagePos.pageY - cvRect.top;
            
        drawing = true;
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        
        $(document).on(Event.START, stopScroll);
    }
    
    /**
     * drawing event handler
     * @param {EventObject} e
     */
    function drawImage(e) {
        
        var pagePos,
            currentX = 0,
            currentY = 0;
        
        if (!drawing) {
            return;
        }
        
        pagePos = getPagePosition(e);
        
        currentX = pagePos.pageX - cvRect.left;
        currentY = pagePos.pageY - cvRect.top;
        
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
    }
    
    /**
     * draw end event handler
     * @param {EventObject} e
     */
    function drawEnd(e) {
        
        drawing = false;
        
        ctx.closePath();
        $(document).off(Event.START, stopScroll);
    }
    
    function init() {
        
        cv = doc.getElementById('canvas');
        ctx = cv.getContext('2d');
        cWidth = cv.width;
        cHeight = cv.height;
        cvRect = cv.getBoundingClientRect();
        
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, cWidth, cHeight);
        
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        
        $(cv).on(Event.START, drawStart)
             .on(Event.MOVE, drawImage)
             .on(Event.END, drawEnd);
        
        $('#send').click(sendImage);
    }
    
    //////////////////////////////////////////////////////
    
    //Initialize to the page.
    $(init);
    
}(window, document, jQuery));
