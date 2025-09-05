/*
 * jQuery Tooltip plugin
 * Version: 		4.0.0
 * Author:			Brian Heits
 * Created: 		04/06/2012
 * Updated:			09/10/2015
 * Dependencies:	bgiframe JQuery plugin if on IE 6
 * Notes:			To add a close hander to an element on the tooltip (if toggling), add the attribute [handletoggle="true"]
 *					This can only be called once per element assigned to unless a title attribute is added back onto an attribute before calling.
 *					THIS VERSION IS NO LONGER COMPATIBLE WITH IE6/IE7 but it should be fine for IE8 or better.
 */
 (function($) {
	$.extend({
		TTIP_CNT : 0,
		//timeout id for delayed showing and hiding (should not be used)
		tId : null,
		/* Defaults */
		TooltipObject : function () {
			this.index = 0;
			//title to be shown in an h3 tag on top of tooltip
			this.title = "";
			//text to be shown in the main body of the tooltip.
			//default is the title attribute of DOM element, but setting this value can override the title
			this.body = "";
			//text to be shown in the url footer of the tooltip
			//default is the href or src value, but setting this value can override the url.
			this.url = "";
			//Adds onclick event ONLY for element and tooltip to show and hide 
			//Notes: 	1.) turns off tracking if on
			//			2.) fade or delay still work
			this.toggle = false;
			//should the tooltip follow the mouse when hovering. Disregarded when toggle is used.
			this.track = true;
			//time in milliseconds to delay showing the hover.  Overridden by fade
			this.delay = 200;
			//time in milliseconds to fade in and fade out on hover
			this.fade = false;
			//opacity to fade in to
			this.tOpacity = 1;
			//will block tooltip creation if true and use the default which is the title
			this.blocked = false;
			//if tooltip is on element with src or href attribute, it will show the value stored to this.url
			this.showURL = false;
			//extra class to be added to tooltip pop-up for extra CSS customization
			this.extraClass = "";
			//callback function to be ran when tooltip is hovered, it will be passed TooltipObject as parameter, and make sure to call the finalize function after done 
			//Notes: This function will run ONLY after fading or delay is complete to allow for detection of toggle handler in callback.
			this.callback = null;//Ex. function(tObj){tObj.setBody("body text");tObj.finalize()};
			//number of times to call callback function. great for asynch loading. Null means call infinitely
			this.callbackCnt = 0;
			//top position of tooltip from mouse
			this.top = 15;
			//left position of tooltip from mouse
			this.left = 15;
			//ID of the tooltip, but NOTE that to keep unique, a number is added to the end that is unique
			this.id = "tooltip";
			//Internal: used to easily access the JQuery object that triggers the tooltip
			this.domObject = null;
			//Internal: used to easily access the JQuery object for the tooltip itself
			this.ttipObject = null;
			//function used to finalize tooltip after callback is complete.  Users MUST call once tooltip is done updated (Async or Synchronous)
			this.finalize = function() {
				var ttipObj = this;
				var tooltip = this.ttipObject;
				var $this = this.domObject;
				
				tooltip.initTooltipDOM(ttipObj);
				
				var handlers = $("[handletoggle='true']",tooltip).attr("tIdx",ttipObj.index).css({cursor:"pointer"})
				.click(function(){$this.trigger("ttipClose");});
				
				if (handlers.length > 0) {
					tooltip.unbind("click");
					$(document).unbind("click");
				}
				tooltip.checkBoundries(ttipObj.left, ttipObj.top);
			};
			
			this.setIndex = function( idx ) {
				this.index = idx;
				return this;
			};
			
			this.setURL = function( iStr ) {
				this.url = iStr;
				return this;
			};
			
			this.setBody = function( iStr ) {
				this.body = iStr;
				return this;
			};
			
			this.getBody = function() {
				return this.body;
			};
			
			this.setDomObject = function( domObject ) {
				this.domObject = domObject;
				return this;
			};
			
			this.setTtipObject = function( ttipObject ) {
				this.ttipObject = ttipObject;
				return this;
			};
			
			this.setBlocked = function( isBlocked ) {
				this.blocked = isBlocked;
				return this;
			};
			
			this.hasData = function() {
				return (this.title !== "" || this.body !== "" || (this.showURL && this.url !== ""));
			};
			//Event handlers for tooltips (note that "this" within function refers to the trigger element)
			this.hide = function(event) {
				var $this = $(this),
					tooltip = $this.getTooltipProperty("ttipObject"),
					ttipObj = $this.data("TTIP");
				/* clear timeout if possible */
				if ($.tId) {
					clearTimeout($.tId);
					$.tId = null;
				}
				function complete() {
					tooltip.hide();
				}
				if (ttipObj.fade && tooltip.is(':animated')) {
					tooltip.stop().fadeTo(ttipObj.fade, 0, complete);
				}
				else if (ttipObj.fade) {
					tooltip.fadeOut(ttipObj.fade, complete);
				} 
				else {
					complete();
				}
			};
			this.display = function(event) {
				var $this = $(this), 
					tooltip = $this.getTooltipProperty("ttipObject"),
					ttipObj = $this.data("TTIP"),
					userCallback = function() {
						var callCnt = $this.getTooltipProperty("callbackCnt"),
							callFunc = $this.getTooltipProperty("callback");
						/* calling callback function if needed */
						if (typeof ttipObj != "undefined" && (callCnt === null || callCnt > 0))
						{
							callFunc(ttipObj);
							$this.setTooltipProperty("callbackCnt",((callCnt !== null)?--callCnt:null));
						}
						else {
							ttipObj.finalize();
						}
					};
				
				if ($this.tooltipBlocked() || !ttipObj.hasData()) {
					userCallback(); //executing callback to allow default title attribute to work with this code
					$this.attr("title",$this.getTooltipBody());
					tooltip.hide();
					return ttipObj;
				}
				tooltip.attr("class",["ttip",ttipObj.extraClass].join(" ")).initTooltipDOM(ttipObj);
				
				if (!ttipObj.toggle)
					$(document).click($.HideTooltips);
				else
					$(document).unbind("click");
					
				tooltip.css({position:"absolute",top:"10px",left:"-2000px",zIndex:10000});
				/* clear timeout if possible */
				if ($.tId) {
					clearTimeout($.tId);
					$.tId = null;
				}
				function complete() {
					tooltip.show();
					if (ttipObj.tOpacity == 1) {
						try{tooltip.get(0).style.removeAttribute('filter');}catch(e){}
					}
					userCallback();
				}
				if (ttipObj.fade) {
					if (tooltip.is(":animated")) {
						tooltip.stop().fadeTo(ttipObj.fade, ttipObj.tOpacity, complete);
					}
					else
					{
						tooltip.fadeTo(ttipObj.fade, ttipObj.tOpacity, complete);
					}
				} 
				else {
					tooltip.css({"opacity":1});
					if( ttipObj.delay && !$.tId )
						$.tId = setTimeout(complete, ttipObj.delay);
					else if ( !ttipObj.delay )
						complete();
				}
				$this.trigger("ttipUpdate",event);
			};
			this.update = function(event, event2) {  //needs second event so that default trigger has something to return mouse location
				var $this = $(this),
					tooltip = $this.getTooltipProperty("ttipObject"),
					ttipObj = $this.data("TTIP");
				if ($this.is("option")) {
					return;
				}				
				tooltip.removeClass("viewport-right").removeClass("viewport-bottom");
				var offset = tooltip.offset(), 
					left = offset.left, 
					top = offset.top,
					triggerEvent = (event2)?event2:event;
				if (triggerEvent){
					/* position the helper 15 pixel to bottom right, starting from mouse position */
					left = triggerEvent.pageX + ttipObj.left;
					top = triggerEvent.pageY + ttipObj.top;
					var right='auto';
					if (this.positionLeft) {
						right = $(window).width() - left;
						left = 'auto';
					}
					tooltip.css({
						left: left,
						right: right,
						top: top
					});
				}
				tooltip.checkBoundries(ttipObj.left, ttipObj.top);
			};
			this.toggleFunc = function(event) {
				var $this = $(this),
					tooltip = $this.getTooltipProperty("ttipObject"),
					ttipObj = $this.data("TTIP");
				if (tooltip.is(":hidden"))
				{
					$this.trigger("ttipOpen");
				}
				else
				{
					$this.trigger("ttipClose");
				}
				$this.trigger("ttipUpdate",event);
			};
		},
		HideTooltips : function(event) {
			$("[ttipIdx]").trigger("ttipClose");
		}
	});
	
	$.fn.extend({
		tooltip : function ( settings )
		{
			function url(itrObj){
				var retStr = (itrObj.attr('href') || itrObj.attr('src'));
				if (retStr && retStr !== "")
					return retStr.replace("http://","").replace("https://","");
				else
					return retStr;
			}
			
			return $(this).each(function(){
				var dEle = this, itrObj = $(dEle), tSettings = $.extend({},new $.TooltipObject(),settings);
				if (!$.isFunction(tSettings.callback))
				{
					tSettings.callbackCnt = 0;
					tSettings.callback = null;
				}
				if (tSettings.tOpacity > 1) {
					tSettings.tOpacity = 1;
				}
				else if (tSettings.tOpacity < 0) {
					tSettings.tOpacity = 0;
				}
				
				//creating tooltip if the dom object does not exist
				var tObj = $(["#",tSettings.id].join(""));
				if (tObj.length===0)
				{
					tObj = $(['<div class="ttip" id="',tSettings.id,'"><h3></h3><div class="body"></div><div class="url"></div></div>'].join("")).insertBefore("body > *:first").hide();
					/* apply bgiframe if available */
					if ( $.fn.bgiframe )
						tObj.bgiframe();
				}
				
				var ttipIdx = ++$.TTIP_CNT, 
					titleStr = tSettings.body !== ""?tSettings.body:itrObj.attr("title"),
					urlStr = tSettings.url !== ""?tSettings.url:url(itrObj);
				if (itrObj.not("[ttipIdx]")) { //new value
					itrObj.data("TTIP",tSettings.setIndex(ttipIdx).setBody(titleStr).setURL(urlStr).setDomObject(itrObj).setTtipObject(tObj)).attr("ttipIdx",ttipIdx);
				}
				else { //existing value
					itrObj.data("TTIP",tSettings.setBody(titleStr).setURL(urlStr).setDomObject(itrObj).setTtipObject(tObj));
				}
				//resetting handlers
				itrObj
				.unbind("click").unbind("mouseover").unbind("mouseout").unbind("mousemove")
				.unbind("ttipOpen").unbind("ttipClose").unbind("ttipUpdate")
				.removeAttr("title").removeAttr("alt");
				
				var displayFunc = itrObj.getTooltipProperty("display"),
					hideFunc = itrObj.getTooltipProperty("hide"),
					updateFunc = itrObj.getTooltipProperty("update");
				
				itrObj.bind("ttipOpen",displayFunc).bind("ttipClose",hideFunc).bind("ttipUpdate",updateFunc);
				
				if (tSettings.toggle)
				{
					itrObj.click(itrObj.getTooltipProperty("toggleFunc"));
				}
				else
				{
					itrObj.mouseover(displayFunc).mouseout(hideFunc).click(hideFunc);
					if (tSettings.track)
					{
						itrObj.mousemove(updateFunc);
					}
				}
			});
		},
		/*************** TOOLTIP helper functions ****************/
		blockTooltip: function() {
			return $(this).setTooltipProperty("blocked",true);
		}, 
		unblockTooltip: function() {
			return $(this).setTooltipProperty("blocked",false);
		},
		setTooltipProperty : function( property, value ) {
			var $this = $(this),
				data = $this.data("TTIP");
			if (typeof data != "undefined") {
				data[property] = value;
			}
			return $this;
		},
		getTooltipProperty : function( property ) {
			var $this = $(this),
				data = $this.data("TTIP");
			if (typeof data != "undefined" && typeof property == "string") {
				return data[property];
			}
			return null;
		},
		setTooltipBody : function ( iStr ) {
			return $(this).setTooltipProperty("body",iStr);
		},
		getTooltipBody : function () {
			return $(this).getTooltipProperty("body");
		},
		setTooltipTitle : function ( iStr ) {
			return $(this).setTooltipProperty("title",iStr);
		},
		getTooltipTitle : function () {
			return $(this).getTooltipProperty("title");
		},
		tooltipBlocked : function () {
			return $(this).getTooltipProperty("blocked");
		},
		/*********************************************************/
		/*** FOLLOWING should be used for tooltip objects only ***/
		viewport: function() {
			var retArr = [];
			$(this).each(function(){
				var dEle = this, jEle = $(this);
				retArr.push({
					l: jEle.position().left,
					t: jEle.position().top,
					x: $(window).scrollLeft(),
					y: $(window).scrollTop(),
					cx: $(window).width(),
					cy: $(window).height(),
					width: dEle.offsetWidth,
					left: dEle.offsetLeft,
					height: dEle.offsetHeight,
					top: dEle.offsetTop
				});
			});
			return retArr;
		},
		checkBoundries: function(l, t) {
			return $(this).each(function(){
				var jEle = $(this), v = jEle.viewport()[0];
				// check horizontal position
				if (v.x + v.cx < v.left + v.width && v.width <= v.cx) {
					v.l -= v.width + (l*2);
					jEle.css({"left": v.l + 'px'}).addClass("viewport-right");
				}
				// check vertical position
				if (v.y + v.cy < v.top + v.height && v.height <= v.cy) {
					v.t -= v.height + (t*2);
					jEle.css({"top": v.t + 'px'}).addClass("viewport-bottom");
				}
			});
		},
		initTooltipDOM: function( ttipObj ) {
			var $this = $(this);
			$this.children("h3,.body,.url").hide().each(function(){
				var tChild = $(this), title = ttipObj.title, body = ttipObj.body, url = ttipObj.url, showURL = ttipObj.showURL;
				if (tChild.is("h3") && title !== "")
					tChild.show().html(title);
				if (tChild.is(".body") && body !== "")
					tChild.show().html(body);
				if (tChild.is(".url") && showURL && url !== "")
					tChild.show().html(url);
			});
			return $this;
		}
		/*********************************************************/
	});
})(jQuery);

/* Put name of component here */
MPage.namespace("jw2.hyperlinks");

jw2.hyperlinks = function(){};
jw2.hyperlinks.prototype = new MPage.Component();
jw2.hyperlinks.prototype.constructor = MPage.Component;
jw2.hyperlinks.prototype.base = MPage.Component.prototype;
jw2.hyperlinks.prototype.name = "jw2.hyperlinks";

jw2.hyperlinks.prototype.init = function(options) {
	//code to perform before immediately rendering (usually nothing needed)
};

jw2.hyperlinks.prototype.addEventHandlers = function() {
	var component = this;
	var compId = component.getComponentUid();
	var target = component.getTarget();
	
	$("#"+compId+" .classOfElementWithinComponent").click(function(){
		//some stuff to do when clicked
	});
};

jw2.hyperlinks.prototype.getSubHeader = function( str ) {
	//note that inline styles could be put in their own class and put as a second class for the div
	return ["<div class='sub-title-disp' style='margin:-6px -6px 6px -6px;border-left:none;border-right:none;'>",str,"</div>"].join("");
};

jw2.hyperlinks.prototype.render = function() {
	var component = this;
	var compId = component.getComponentUid();
	var target = component.getTarget();
	var targetHTML = [];
	//set and create subheader (uncomment and update if needed)
	//targetHTML.push(component.getSubHeader("Selected Visit"));
	
	//set the title text if needed (uncomment and update if needed)
	//component.setProperty("headerTitle", "New Title");
	
	//set the subtitle text next to header if needed (uncomment and update if needed)
	//component.setProperty("headerSubTitle","(10)");
	
	//set the component to collapsed (false)/expanded (true) if needed (uncomment and update if needed)
	//component.setProperty("headerShowHideState",true);	
	//do something here with the targetHTML (component.data has NOTHING on it)
	targetHTML.push("<a href='http://www.w3schools.com'>W3Schools</a><br/>",
					"<a href='http://www.jsonlint.com'>JSON Lint</a>");
	
	target.innerHTML = targetHTML.join(""); 

	//this may or may not be needed.
	//component.addEventHandlers();
}


/* Put name of component here */
MPage.namespace("jw2.documents");
jw2.documents = function(){};

jw2.documents.twoYears = {
	"lookback_ccl":"2 Y",
	"lookback_desc":"2 years"
};

jw2.documents.threeYears = {
	"lookback_ccl":"3 Y",
	"lookback_desc":"3 years"
};

jw2.documents.prototype = new MPage.Component();
jw2.documents.prototype.constructor = MPage.Component;
jw2.documents.prototype.base = MPage.Component.prototype;
jw2.documents.prototype.name = "jw2.documents";
jw2.documents.prototype.cclProgram = "jw2_mpage_documents_json";
jw2.documents.prototype.cclParams = [];
jw2.documents.prototype.cclDataType = "JSON"; //possible values=> JSON, TEXT, XML

jw2.documents.prototype.init = function(options) {
	//code to perform before immediately rendering (usually updating params is needed)
	var component = this;
    //your options are attached to the options of the object behind the scenes
    var comp_options = component.options;

	//clear cclParams in case of refresh
	component.cclParams = [];
	component.cclParams.push("MINE");
	//CAN USE ANY OR ALL OF THE FOLLOWING IN ORDER AS NEEDED:
	component.cclParams.push(component.getProperty("personId"));
	component.cclParams.push(component.getProperty("encounterId"));
    component.cclParams.push(comp_options.lookback_ccl);
	//component.cclParams.push(component.getProperty("userId"));
	//component.cclParams.push(component.getProperty("PPRCode"));
	//component.cclParams.push(component.getProperty("positionCd"));
};

jw2.documents.prototype.addEventHandlers = function() {
	var component = this;
	var compId = component.getComponentUid();
	var target = component.getTarget();
	
    $("#"+compId+" .hvrData").tooltip({"track":true,"delay":150});
	$("#"+compId+" .classOfElementWithinComponent").click(function(){
		//some stuff to do when clicked
	});
};

jw2.documents.prototype.getSubHeader = function( str ) {
	//note that inline styles could be put in their own class and put as a second class for the div
	return ["<div class='sub-title-disp' style='margin:-6px -6px 6px -6px;border-left:none;border-right:none;'>",str,"</div>"].join("");
};

jw2.documents.prototype.render = function() {
	var component = this;
	var compId = component.getComponentUid();
	var target = component.getTarget();
	var record = component.data.DOCUMENTS;
	var doc_length = record.DOCUMENT.length;
    var comp_options = component.options;
	var targetHTML = [];

	//set and create subheader (uncomment and update if needed)
	targetHTML.push(component.getSubHeader("Selected Visit last "+comp_options.lookback_desc));
	
	//set the title text if needed (uncomment and update if needed)
	//component.setProperty("headerTitle", "New Title");
	
	//set the subtitle text next to header if needed (uncomment and update if needed)
	component.setProperty("headerSubTitle","("+doc_length+")");
	
	//set the component to collapsed (false)/expanded (true) if needed (uncomment and update if needed)
	//component.setProperty("headerShowHideState",true);
	
	//do something here with the targetHTML (component.data will have data type defined by this.cclDataType)
	targetHTML.push("<div class='jw2-documents'><table>");
	for (var i=0;i<doc_length;i++) {
		var docObj = record.DOCUMENT[i];
		var paramStr = component.getProperty("personId")+"|"+component.getProperty("encntrId")+"|" + docObj.EVENT_ID + "|Documents|31|CLINNOTES|341|CLINNOTES|1"; 

		targetHTML.push(   
			"<tr>",
				"<td class='hvrData' title='Event Id: ", docObj.EVENT_ID,"'>", docObj.TITLE,"</td>",
				"<td class='doc-detail'><a href=\"javascript:MPAGES_EVENT('CLINICALNOTE', '",paramStr,"')\">", docObj.DATE,"</a></td>",
			"</tr>"
		);	
}  // end for

	// Close the table
	targetHTML.push("</table></div>");
	
	target.innerHTML = targetHTML.join("");
	
	//this may or may not be needed
	component.addEventHandlers();
};

