/*
* moaModal
* MIT Licensed
* @author Mamod Mehyar
* http://sweefty.com/moaModal
* http://sweefty.com
* version : 2.0.0
*/

(function($){
    "use strict";

    var _modalOverlay, 
        _modalWrapper, 
        _modalDiv;
    
    //global options
    var modal_options =  {
        speed : 500,
        easing : 'linear',
        position : '0 auto',
        animation: 'none',
        on : 'click',
        escapeClose : true,
        overlayColor : '#000000',
        overlayOpacity : 0.7,
        overlayClose : true
    };
    
    //initiate on document ready
    $(function() {
        //initiate overlay
        //and modal containers
        //overlay div
        _modalOverlay = $('<div></div>').css({
            width : '100%',
            height: $(document).height(),
            position : 'fixed',
            backgroundColor : '#000',
            overflow : 'hidden',
            opacity : 0.7,
            top : 0,
            left: 0,
            display : 'none',
            zIndex : '999996'
        }).appendTo('body');
        
        //modal wrapper
        _modalWrapper = $('<div></div>').css({
            width : '100%',
            height: $(document).height(),
            position : 'absolute',
            display: 'none',
            overflow : 'hidden',
            top : 0,
            left: 0,
            zIndex : '999998'
        }).appendTo('body');
        
        //modal container
        _modalDiv = $('<div></div>').css({
            position : 'relative',
            width : '100%',
            zIndex : '999997',
            top : 0,
            left : 0,
            visibility : 'hidden'
        }).appendTo(_modalWrapper);
    });

    var _modal = function (ele, obj) {
        obj = $.extend({}, modal_options, obj);
        var target = $(obj.modal);
        if (!target.length){
            return;
        }
        
        obj.position = obj.position.replace( /(\d+)(\s|$)/g, "$1px" + "$2");
        
        var clone   = _modalDiv;
        
        var css = {
            position: 'relative',
            overflow : 'hidden',
            display : 'block',
            zIndex : '999999',
            margin : obj.position
        };
        
        //fake screen resolution
        var cc = target.clone(), 
            origWidth, 
            origHeight;
        
        cc.appendTo('body').css({
            maxWidth : window.screen.width,
            maxHeight : window.screen.height
        });
        
        origWidth = cc.outerWidth();
        origHeight = cc.outerHeight();
        
        if (origHeight === 0){
            origHeight = '1%';
        }
        
        cc.remove();
        
        var from    = {}, 
            fromArr = obj.animation.split(' ');
        
        for (var x = 0; x < fromArr.length; x++){
            from[fromArr[x]] = true;
        }
        
        if (obj.overlayClose !== false){
            _modalWrapper.click(function(e){
                if (this === e.target || e.target === clone[0]){
                    target.trigger('close.modal');
                }
            });
        }
        
        if (obj.escapeClose) {
            $(document).on('keydown.modal', function(event) {
                if (event.which === 27) target.trigger('close');
            });
        }
        
        if (obj.close){
            $(obj.close).click(function(){
                target.trigger('close.modal');
                return false;
            });
        }
        
        ele.on(obj.on, function(){
            
            _modalOverlay.css({
                backgroundColor : obj.overlayColor,
                opacity : obj.overlayOpacity,
                height  : $(document).height()
            });
            
            var currentX,currentY;
            if (obj.on !== 'click'){
                $(document).one('mouseup',function(e){
                    currentX = e.pageX;
                    currentY = e.pageY;
                });
            }
            
            var marTop;
            if (obj.position === 'center'){
                marTop = ($(window).height()/2 - origHeight/2);
                css.margin = marTop + "px auto";
            } else if (obj.position === 'bottom'){
                marTop = ($(window).height() - origHeight);
                css.margin = marTop + "px auto";
            }
            
            //clear previous clone content
            clone.children(':first').hide().appendTo('body');
            target.appendTo(clone);
            
            _modalWrapper.css({
                height : $(document).height(),
                width : '100%',
                display : 'block'
            });
            
            var left = 0,
            top = $(window).scrollTop();
            target.css(css);
            
            if (from.top === true){
                top = -((origHeight + parseInt(target.css('marginTop'))) - $(window).scrollTop());
            } else if (from.bottom === true){
                top = $(window).height() + $(window).scrollTop();
            }
            
            var marginleft;
            if (from.left === true){
                marginleft = parseInt(target.css('marginLeft'));
                if (isNaN(marginleft)){
                    marginleft = (clone.width()/2 - target.width()/2);
                }
                left = -(target.width() + marginleft);
            } else if (from.right === true){
                marginleft = parseInt(target.css('marginLeft'));
                if (isNaN(marginleft)){
                    marginleft = (clone.width()/2 - target.width()/2);
                }
                left = (clone.width() - marginleft);
            }
            
            target.on('close.modal', function(){
                clone.stop().animate({top : top, left : left, opacity : 0},{
                    duration : obj.speed,
                    easing: 'linear',
                    complete : function(){
                        _modalWrapper.css({
                            top : 0,
                            position : 'absolute'
                        });
                    }
                });
                
                _modalOverlay.fadeOut(obj.speed + 100, function(){
                    clone.css({
                        visibility : 'hidden',
                        top:0,
                        left:0
                    });
                    _modalWrapper.hide();
                });
                
                target.off('close.modal');
            });
            
            _modalOverlay.stop().fadeIn(obj.speed, function(){});
            
            clone.css({
                top : top,
                left: left,
                opacity: 0,
                visibility : 'visible'
            }).stop().animate({
                opacity : 1,
                top : $(window).scrollTop(),
                left: 0
            },{
                easing : obj.easing,
                duration : obj.speed,
                complete: function(){
                    _modalWrapper.css({
                        top : -$(window).scrollTop(),
                        position : 'fixed'
                    });
                    if (obj.complete && typeof obj.complete === 'function'){
                        obj.complete();
                    }
                }
            });
            return false;
        });
    };
    
    $.fn.modal = function(action, customOptions) {
        if (!customOptions && typeof action === 'object'){
            customOptions = action;
            action = undefined;
        }
        
        var options = $.extend({},modal_options, customOptions);
        
        options.modal = options.target;
        if (action === 'view'){
            options.modal = this;
            options.on = 'view.modal';
        } else if (action === 'close'){
            this.trigger('close.modal');
            return false;
        }
        
        return this.each(function() {
            var $this = $(this);
            if ($this[0] === $(document)[0]){
                modal_options = options;
            } else {
                _modal($this,options);
                $this.trigger('view.modal');
            }
        });
    };
}(jQuery));
