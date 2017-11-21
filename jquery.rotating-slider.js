(function($){
    $.fn.rotatingSlider = function(options){
        var rotatingSlider = {
            init: function(el){
                this.$slider = $(el);
                this.$slidesContainer = this.$slider.children('ul.slides');
                this.$slides = this.$slidesContainer.children('li');
                this.$clipPath;
                this.$directionControls;
                
                this.settings = $.extend({
                    autoRotate: true,
                    autoRotateInterval: 6000,
                    draggable: true,
                    directionControls: true,
                    directionLeftText: '&lsaquo;',
                    directionRightText: '&rsaquo;',
                    rotationSpeed: 750,
                    slideHeight : 360,
                    slideWidth : 480,
                }, options);
                
                this.slideAngle = 360 / this.$slides.length;
                this.currentRotationAngle = 0;
                this.autoRotateIntervalId = false;
                this.rotateTimoutId = false;
                this.currentlyRotating = false;
                this.readyToDrag = false;
                this.dragStartPoint;
                this.dragStartAngle;
                this.currentlyDragging = false;
                this.markupIsValid = false;
                
                this.validateMarkup();
                if(this.markupIsValid){
                    this.renderSlider();
                    this.bindEvents();
                    if(this.settings.autoRotate){
                        this.startAutoRotate();
                    }
                }
            },
            bindEvents: function(){
                if(this.settings.draggable){
                    this.$slidesContainer.on('mousedown touchstart', this.handleDragStart.bind(this));
                    this.$slidesContainer.on('mousemove touchmove', this.handleDragMove.bind(this));
                    this.$slidesContainer.on('mouseup mouseleave touchend', this.handleDragEnd.bind(this));
                }
                if(this.settings.directionControls){
                    this.$slider.find('ul.direction-controls .left-arrow button').click(this.handleLeftDirectionClick.bind(this));
                    this.$slider.find('ul.direction-controls .right-arrow button').click(this.handleRightDirectionClick.bind(this));
                }
            },
            handleDragStart: function(e){
                this.readyToDrag = true;
                this.dragStartPoint = (e.type === 'mousedown') ? e.pageX : e.originalEvent.touches[0].pageX;
            },
            handleDragMove: function(e){
                if(this.readyToDrag){
                    var pageX = (e.type === 'mousemove') ? e.pageX : e.originalEvent.touches[0].pageX;
                    if(
                        this.currentlyDragging === false && 
                        this.currentlyRotating === false  &&
                        (this.dragStartPoint - pageX > 10 || this.dragStartPoint - pageX < -10)
                    ){
                        this.stopAutoRotate();
                        if(this.settings.directionControls){
                            this.$directionControls.css('pointer-events', 'none');
                        }
                        window.getSelection().removeAllRanges();
                        this.currentlyDragging = true;
                        this.dragStartAngle = this.currentRotationAngle;
                    }
                    if(this.currentlyDragging){
                        this.currentRotationAngle = this.dragStartAngle - ((this.dragStartPoint - pageX) / this.settings.slideWidth * this.slideAngle);
                        this.$slidesContainer.css('transform', 'translateX(-50%) rotate('+this.currentRotationAngle+'deg)');
                    }
                }
            },
            handleDragEnd: function(e){
                this.readyToDrag = false;
                if(this.currentlyDragging){
                    this.currentlyDragging = false;
                    this.currentRotationAngle = Math.round(this.currentRotationAngle/this.slideAngle)*this.slideAngle;
                    this.rotate();
                    if(this.settings.directionControls){
                        this.$directionControls.css('pointer-events', '');
                    }
                }
            },
            handleLeftDirectionClick: function(e){
                e.preventDefault();
                this.stopAutoRotate();
                this.rotateClockwise();
            },
            handleRightDirectionClick: function(e){
                e.preventDefault();
                this.stopAutoRotate();
                this.rotateCounterClockwise();
            },
            renderSlider: function(){
                var halfAngleRadian = this.slideAngle / 2 * Math.PI/180;
                var innerRadius = 1 / Math.tan(halfAngleRadian) * this.settings.slideWidth / 2;
                var outerRadius = Math.sqrt(Math.pow(innerRadius + this.settings.slideHeight, 2) + (Math.pow((this.settings.slideWidth / 2), 2)));
                upperArcHeight = outerRadius - (innerRadius + this.settings.slideHeight);
                lowerArcHeight = innerRadius - (innerRadius * (Math.cos(halfAngleRadian)));
                var slideFullWidth = (Math.sin(halfAngleRadian) * outerRadius) * 2;
                var slideFullHeight = upperArcHeight + this.settings.slideHeight + lowerArcHeight
                var slideSidePadding = (slideFullWidth - this.settings.slideWidth) / 2;
                var fullArcHeight = outerRadius - (outerRadius * (Math.cos(halfAngleRadian)));
                var lowerArcOffset = (slideFullWidth - (Math.sin(halfAngleRadian) * innerRadius * 2)) / 2;

                /* Set height and width of slider element */
                this.$slider.css('height', this.settings.slideHeight+'px');
                this.$slider.css('width', this.settings.slideWidth+'px');

                /* Set height and width of slides container and offset width*/
                this.$slidesContainer.css('height', outerRadius*2+'px');
                this.$slidesContainer.css('width', outerRadius*2+'px');

                /* Offset width and arc height */
                this.$slidesContainer.css('transform', 'translateX(-50%)');
                this.$slidesContainer.css('top', '-'+ upperArcHeight +'px');

                /* Generate path for slide clipping */
                var pathCoords = 'M 0 '+fullArcHeight;
                pathCoords += ' A '+outerRadius+' '+outerRadius+' 0 0 1 '+slideFullWidth+' '+fullArcHeight;
                pathCoords += ' L '+(slideFullWidth-lowerArcOffset)+' '+slideFullHeight;
                pathCoords += ' A '+innerRadius+' '+innerRadius+' 0 0 0 '+lowerArcOffset+' '+slideFullHeight+' Z';
                this.$slider.append('<svg><defs><clipPath id="slideClipPath"><path /></clipPath></defs></svg>');
                this.$slider.find('#slideClipPath>path').attr('d', pathCoords);

                /* Apply styles to each slide */
                this.$slides.each(function(i, el){
                var $slide = $(el);
                    /* Set distance from point of rotation */
                    $slide.css('transform-origin', 'center '+(innerRadius + this.settings.slideHeight)+'px');

                    /* Set slide Height and Width */
                    $slide.css('height', this.settings.slideHeight+'px');
                    $slide.css('width', this.settings.slideWidth+'px');

                    /* Set calculated padding for width, upper arc height, and lower arc height */
                    $slide.css('padding', upperArcHeight +'px '+slideSidePadding+'px '+lowerArcHeight+'px '+slideSidePadding+'px ');

                    /* Offset container Arc Height */
                    $slide.css('top', upperArcHeight +'px');

                    /* Offset Width, then Rotate Slide, then offset individual Top Arcs  */
                    $slide.css('transform', 'translateX(-50%) rotate('+this.slideAngle * i+'deg) translateY(-'+ upperArcHeight +'px)');

                    /* Add clipping path  */
                    $slide.css('-webkit-clip-path', 'url(#slideClipPath)');
                    $slide.css('clip-path', 'url(#slideClipPath)');
                }.bind(this));
                
                /* Render Arrow Controls */
                if(this.settings.directionControls){
                    var directionArrowsHTML = '<ul class="direction-controls">';
                    directionArrowsHTML += '<li class="left-arrow"><button>'+this.settings.directionLeftText+'</button></li>';
                    directionArrowsHTML += '<li class="right-arrow"><button>'+this.settings.directionRightText+'</button></li>';
                    directionArrowsHTML += '</ul>';
                    this.$slider.append(directionArrowsHTML);
                    this.$directionControls = this.$slider.find('ul.direction-controls');
                }
                
            },
            rotateClockwise: function(){
                this.currentRotationAngle = this.currentRotationAngle + this.slideAngle;
                this.rotate();
            },
            rotateCounterClockwise: function(){
                this.currentRotationAngle = this.currentRotationAngle - this.slideAngle;
                this.rotate();
            },
            rotate: function(){
                this.currentlyRotating = true;
                if(this.rotateTimeoutId){
                    clearTimeout(this.rotateTimeoutId);
                    this.rotateTimeoutId = false;
                }
                
                this.$slidesContainer.css('transition', 'transform '+(this.settings.rotationSpeed/1000)+'s ease-in-out');
                this.$slidesContainer.css('transform', 'translateX(-50%) rotate('+this.currentRotationAngle+'deg)');
                
                this.rotateTimeoutId = setTimeout(function(){
                    this.currentlyRotating = false;
                    this.$slidesContainer.css('transition', 'none');

                    /* keep currentRotationAngle between -360 and 360 */
                    if(this.currentRotationAngle >= 360 || this.currentRotationAngle <= -360){
                        this.currentRotationAngle = this.currentRotationAngle >= 360 ? this.currentRotationAngle - 360 : this.currentRotationAngle + 360;
                        this.$slidesContainer.css('transform', 'translateX(-50%) rotate('+this.currentRotationAngle+'deg)');
                    }
                }.bind(this), this.settings.rotationSpeed);
            },
            startAutoRotate: function(){
                this.autoRotateIntervalId = setInterval(function(){
                    this.rotateCounterClockwise();
                }.bind(this), this.settings.autoRotateInterval);
            },
            stopAutoRotate: function(){
                if(this.autoRotateIntervalId){
                    clearInterval(this.autoRotateIntervalId);
                    this.autoRotateIntervalId = false;
                }
            },
            validateMarkup: function(){
                if(
                    this.$slider.hasClass('rotating-slider') &&
                    this.$slidesContainer.length === 1 &&
                    this.$slides.length >= 2
                ){
                    this.markupIsValid = true;
                }else{
                    this.$slider.css('display', 'none');
                    console.log('Markup for Rotating Slider is invalid.');
                }
            }
        }

        return this.each(function(){
            rotatingSlider.init(this);
        });
    };
}(jQuery));