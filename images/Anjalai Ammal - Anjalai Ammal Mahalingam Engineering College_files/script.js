/**
 * @version		$Id$
 * @author		NooTheme
 * @package		Joomla.Site
 * @subpackage	mod_noo_contentslider
 * @copyright	Copyright (C) 2013 NooTheme. All rights reserved.
 * @license		License GNU General Public License version 2 or later; see LICENSE.txt, see LICENSE.php
 */

!function ($) {
	"use strict";
	  
	$(function () {

		$.support.transition = (function () {

			var transitionEnd = (function () {

				var el = document.createElement('bootstrap')
				, transEndEventNames = {
					'WebkitTransition' : 'webkitTransitionEnd'
					,  
					'MozTransition'    : 'transitionend'
					,  
					'OTransition'      : 'oTransitionEnd otransitionend'
					,  
					'transition'       : 'transitionend'
				}
				, name

				for (name in transEndEventNames){
					if (el.style[name] !== undefined) {
						return transEndEventNames[name]
					}
				}

			}())

			return transitionEnd && {
				end: transitionEnd
			}

		})()

	})
	  
	var NooCS = function (element,options) {
		this.element = $(element)
		this.options = options
		this.initialize()
	}
	NooCS.prototype = {
		initialize: function () {
			var defaulttype = 'next',
			effects= [
			'updown-right',
			'updown-left',
		  		        
			'down-right',
			'down-left',
			'up-right',
			'up-left',
		  				
			'down-right',
			'down-left',
			'up-right',
			'up-left',
		  			
			'left-right',
			'left-left',

			'right-right',
			'right-left',

			'zoomin-right',
			'zoomin-left',

			'zoomrotate-right',
			'zoomrotate-left',
		  				
			'scale-right',
			'scale-left',
						
			'fade'
			]
			this.sliceTime = 150
			this.running = false
			this.effects = effects
			this.type = defaulttype
			this.mainInner = $('.cs-group-inner',this.element)
			this.indicators = $('.cs-indicators',this.element)
			this.group = $('.noo-cs-group',this.element)
		  	
			//fix this.options.pageTotal
			this.options.pageTotal = this.group.size();
		  	
			this.mainInner.attr('data-page',this.options.pageTotal)
		  	
			if(this.options.animation == 'slidevrt'){
				this.mainInner.addClass('vrt')
				this.options.mode = 'vertical';
			} else if (this.options.animation == 'slidehrz'){
				this.options.mode = 'horizontal'
				this.mainInner.addClass('hrz');
			}

			if (this.options.animation == 'slicevrt'){
				this.effects = this.effects.slice(2, 10);
			} else if(this.options.animation == 'slicehrz'){
				this.effects = this.effects.slice(10, 14);
			} else if (this.options.animation == 'slicezoom'){
				this.effects = this.effects.slice(14,20);
			}
		  	
			this.options.animation = this.options.animation.substr(0, 5);
		  	
			if(this.indicators.children().length)
				$(this.indicators.children()[0]).addClass('active')
		  	
			if(this.options.useAjax)
				this.callAjax()
			if(this.group.length)
				$(this.group[0]).addClass('active')
		  		
			if(this.options.control){
				var btnNext = $('.next',this.element)
				var btnPrev = $('.prev',this.element)
				btnNext.bind('click',this.next.bind(this))
				btnPrev.bind('click',this.prev.bind(this))
			}
		  	
			if(this.options.pager){
				var pagerBtn = $('.cs-indicators',this.element),
				that = this
				pagerBtn.children('li').bind('click',function(){
					that.pause().go($(this).attr('data-cs-to'))
				})
			}

			if(this.options.auto)
				this.start()
		   
		},
		callAjax:function(){
			console.log("call");
		},
		start:function(){
			if (this.interval) clearTimeout(this.interval)
			this.interval = setTimeout($.proxy(this.play, this), this.options.interval)
			return this
		},
		replay:function(){
			this.running = false;
			 
			if(this.options.useAjax && this.options.auto && this.group.length < this.options.pageTotal)
				this.callAjax()
					 
			if(this.getActiveIndex()+1 == this.options.pageTotal && !this.options.repeat)
				this.paused = true
	
			if(!this.paused 
				&& this.options.interval 
				&& this.options.auto 
					)
				this.start()
		},
		next:function(){
			if(this.running && this.options.animation !='fade' && this.options.animation !='slide' ) {
				return;
			}
			this.type = 'next'
			return this.play()
		},
		prev:function(){
			if(this.running && this.options.animation !='fade' && this.options.animation !='slide' ) {
				return;
			}
			this.type = 'prev'

			return this.play()
		},
		go:function(to){
			var active = $('.noo-cs-group.active',this.element)
			, children = this.group
			, activeIndex = children.index(active)
	         
			if (to > (children.length - 1) 
				|| to < 0 
				|| this.running 
				|| activeIndex == to
					) return
	        	 
			this.paused = false
			if(this.options.animation && $.support.transition)
				return this[this.options.animation](to > activeIndex ? 'next' : 'prev', $(children[to]))
			else
				this.fade(to > activeIndex ? 'next' : 'prev', $(children[to]))
		},
		getActiveIndex:function(){
			this.active = $('.noo-cs-group.active',this.element)
			return this.group.index(this.active)  
		},
		pagerListener:function(next){
			if(this.indicators.length){
				this.indicators.find('.active').removeClass('active')
				var activeIndicators = $(this.indicators.children()[next])
				activeIndicators && activeIndicators.addClass('active')
			}
		},
		pause:function(){
			this.paused = true
			clearInterval(this.interval)
			this.interval = null
			return this
		},
		play:function(){
			if(this.options.animation && $.support.transition)
				this[this.options.animation](this.type);
			else
				this.fade(this.type)
		},
		slide:function(type,to){
			var active =$('.noo-cs-group.active',this.element),
			next = to || active[type](),
			back  = type == 'next' ? 'first' : 'last',
			options = this.options,
			typeclass = options.mode =='vertical' ? type+'vrt':type,
			direction = type == 'next' ? (options.mode =='vertical' ? 'up':'left') : (options.mode =='vertical' ? 'down':'right'),
			slicestart = $.proxy(this.replay,this),
			that = this
			
			this.running = true
			
			next = $(next).length ? next : $('.noo-cs-group',this.element)[back]()
					
			if(next.hasClass('active'))
				return
			
			next.addClass(typeclass)
			next[0].offsetWidth 
			active.addClass(direction)
			next.addClass(direction)       
			this.element.one($.support.transition.end, function () {
				next.removeClass([typeclass, direction].join(' ')).addClass('active')
				active.removeClass(['active', direction].join(' '))
				that.pagerListener(that.getActiveIndex())
				setTimeout(slicestart,options.duration)
			});
		},
		fade:function(type,to){
			var active =$('.noo-cs-group.active',this.element),
			next = to || active[type](),
			back  = type == 'next' ? 'first' : 'last',
			direction = type == 'next' ? 'left' : 'right',
			slicefinish = this.slicefinish,
			slicestart = $.proxy(this.replay,this),
			options = this.options
		
			this.running = true
			
			
			next = $(next).length ? next : $('.noo-cs-group',this.element)[back]()
					
			if(next.hasClass('active'))
				return
					
			active.stop().css({
				position: 'relative', 
				zIndex: 2, 
				display: 'block'
			}).removeClass('active').css({
				position: 'absolute', 
				zIndex: 1, 
				display: 'block'
			}).fadeTo(options.duration, 0,slicefinish);
			next.stop().css({
				position: 'relative', 
				zIndex:2, 
				display: 'block',
				'opacity':0
			}).addClass('active').fadeTo(options.duration + 200, 1,slicestart);
			this.pagerListener(this.getActiveIndex())
		},
		slice:function(type,to){
			var isInterval = this.interval
			var active =$('.noo-cs-group.active',this.element),
			next = to || active[type](),
			back  = type == 'next' ? 'first' : 'last'
			
			this.running = true
	  		
			//isInterval && this.pause()
	  		
			next = $(next).length ? next : $('.noo-cs-group',this.element)[back]()
	  		
			if($(next).hasClass('active'))
				return
	  		
			$(active).removeClass('active')
			$(next).addClass('active')
	  		
			//Run effects
			var effect = this.effects[Math.floor(Math.random() * (this.effects.length))];
	  	
			if(effect == undefined){
				effect = 'fade'
			}
	  		
			var effects = effect.split('-')
			
			this.animslice(effects,active,next)
			this.pagerListener(this.getActiveIndex())
	  		
			//isInterval && this.replay()
	  		
			return this
		},
		slicefinish:function(){
			$(this).closest('.noo-cs-group').css('display', 'none');
		},
		animslice:function(effect,oldGroup,newGroup){
	  		  
			if(effect[1] == 'left'){
				var backSlice = newGroup.children();
				newGroup.empty().append(backSlice.get().reverse());
			}
	  		
			var timeBuff = 1000,
			oldSlices = oldGroup.children(),
			newSlides = newGroup.children(),
			oldLast = oldSlices.length - 1,
			Last = newSlides.length - 1,
			classOff = '',
			slicefinish = this.slicefinish,
			slicestart = $.proxy(this.replay,this),
			options = this.options,
			mainInner = this.mainInner,
			sliceTime = this.sliceTime
	  		    
			newGroup.css({
				position: 'relative', 
				zIndex: 2, 
				display: 'block'
			})
			oldGroup.css({
				position: 'absolute', 
				zIndex: 1, 
				display: 'block'
			})
			  
			if(effect[0] == 'updown'){
				$(oldSlices).each(function(i,el){
					setTimeout(function(){
						$(el).removeClass('no-anim').addClass((i & 1) == 0 ? 'top':'bottom')
						if(i == oldLast)
							setTimeout($.proxy(slicefinish,el),options.duration)
					},timeBuff)
					timeBuff += sliceTime
				})
				
				$(newSlides).each(function(i,el){
					setTimeout(function(){
						$(el).addClass('no-anim').addClass((i & 1) == 0 ? 'top':'bottom').attr('class','noo-cs-item')
						if(i == Last)
							setTimeout(slicestart,options.duration)
					},timeBuff)
					timeBuff += sliceTime
				})
				return this
			}
			
			if(effect[0] == 'down'){
				$(newSlides).addClass('no-anim top');
				classOff = 'bottom';
			}
			else if(effect[0] == 'up'){
				$(newSlides).addClass('no-anim bottom');
				classOff = 'top';
			}
			else if(effect[0] == 'left'){
				$(newSlides).addClass('no-anim left');
				classOff = 'right';
			}
			else if(effect[0] == 'right'){
				$(newSlides).addClass('no-anim right');
				classOff = 'left';
			}
			else if(effect[0] == 'scale'){
				$(newSlides).addClass('no-anim scale');
				classOff = 'scale';
			}
			else if(effect[0] == 'fade'){
				$(newSlides).addClass('no-anim fade');
				classOff = 'fade';
			}
			else if(effect[0] == 'zoomin'){
				$(newSlides).addClass('no-anim zoomrotate');
				classOff = 'zoomin';
			}
			
			else if(effect[0] == 'zoomrotate'){
				$(newSlides).addClass('no-anim zoomin');
				classOff = 'zoomrotate';
			}  
			
			$(oldSlices).each(function(i,el){
				setTimeout(function(){
					$(el).removeClass('no-anim').addClass(classOff)
					if(i == oldLast)
						setTimeout($.proxy(slicefinish,el),options.duration)
				},timeBuff)
				timeBuff += sliceTime
			})
			
			$(newSlides).each(function(i,el){
				setTimeout(function(){
					$(el).addClass('no-anim').addClass(classOff).attr('class','noo-cs-item')
					
					if(i == Last){
						setTimeout(slicestart,options.duration)
					}
						
				},timeBuff)
				timeBuff += sliceTime
			})
		}
	}
	$.fn.noocs = function(option){
		return this.each(function () {
			var $this = $(this)
			, data = $this.data('noocs')
			, options = $.extend({}, $.fn.noocs.defaults, typeof option == 'object' && option)
			if (!data) 
				$this.data('noocs', (data = new NooCS(this, options)))
		})
	}
	$.fn.noocs.defaults = {
		useAjax :false,
		ajaxUrl :'',
		animation: 'fade', 							
		mode: 'horizontal', 					//depend on [animation=slide] - [horizontal, vertical] - slide direction of main item for move animation
		duration: 1000,								//duration - time for animation
		//private:
		control:true,
		pageTotal:3,
		pager:true,
		repeat: true,								//animation repeat or not
		auto: true,								//auto play
		interval: 5000							//interval - time for between animation									//rtl - for future
	}
}(window.jQuery)