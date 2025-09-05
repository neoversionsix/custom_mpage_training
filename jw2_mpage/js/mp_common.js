var MP_COMMON = function()
{
	return {
		APPLINK : function ( type, tabName ) { //tabName can be a URL if type is 100
			if (type === 0 && tabName != "") {
				var promptStr = ["/PERSONID=$pat_personid$ /ENCNTRID=$vis_encntrid$ /FIRSTTAB=^",tabName,"^"].join("");
				APPLINK(0,"$APP_AppName$",promptStr);
			}
			else if (type === 100 && tabName != "") {
				APPLINK(100,tabName,"");
			}
		},
		ERROR_CNT : 0,
		RunError : function (component, error) 
		{
			var errStr = ["<div class='error'>",error.description,"</div>"].join("");
			$(component.getOption("componentTarget")).html(errStr);
			MP_COMMON.ERROR_CNT++;
		},
		RunErrorComponent : function( component, error )
		{
			try{
				var errStr = ["<div class='error'>",error.description,"</div>"].join("");
				component.setProperty("headerSubTitle","");
				component.getTarget().innerHTML = errStr;
				MP_COMMON.ERROR_CNT++;
			}
			catch(e) {
				MP_COMMON.RunError(component, error);
			}
		},
		InitializeMPage : function ()
		{
			//initialize only those components with a namespace attribute.
			$("[namespace]").each(function(){
				var comp_target = $(this), namespace = comp_target.attr("namespace"), options = comp_target.attr("options"), compId = ["component_",(MPage._Components.length+1)].join(""), 
					COMPONENT = null, component = null;
				comp_target.attr("id",compId).removeAttr("namespace");
				//try-catch to make sure the component namespace exists as an object
				try {
					COMPONENT = eval(namespace);
					if (typeof COMPONENT != "undefined" && COMPONENT !== null) {
						component = new COMPONENT();
						component.setOption("errMsg",false);
					}
					else {
						component = new MPage.Component();
						component.setOption("errMsg",["Component ",namespace," does not exist!"].join(""));
					}
				}
				catch(err) {
					component = new MPage.Component();
					component.setOption("errMsg",["Component ",namespace," does not exist!"].join(""));
				}
				
				//try-catch to prevent issues if this component object is not built according to standard
				try {
					//configuring component with properties and options used by standards
					component.setProperty("personId",MPAGE_REC.PERSON_ID);
					component.setProperty("encounterId",MPAGE_REC.ENCNTR_ID);
					component.setProperty("userId",MPAGE_REC.USER_ID);
					component.setTarget(["#",compId," > .sec-content"].join(""));
					component.setOption("componentTarget",["#",compId].join(""));
					component.setOption("id",compId);
					component.setOption("parentComp",new function(){
						this.label = "";
						this.subLabel = "";
						this.componentId = ["#",compId].join("")
						this.componentContent = ".sec-content"
						this.componentHeader = ".comp-header-name";
						this.componentSubHeader = ".sec-total";
						this.componentColExp = ".sec-hd-tgl";
						//adding collapse and expand event to the toggler
						$(this.componentColExp,$(this.componentId)).click(function(){
							var component_section = $(this).parent().parent();
							//only perform on if the parent found is of class "section"
							if (component_section.hasClass("section")) {
								MP_COMMON.toggle(component_section);
							}
						});
						this.updateLabel = function(val) {
							this.label = val;
							$(this.componentHeader,$(this.componentId)).html(val);
						};
						this.updateSubLabel = function(val) {
							this.subLabel = val;
							$(this.componentSubHeader,$(this.componentId)).html(val);
						};
						this.setExpandCollapseState = function(val) {
							var compContent = $(this.componentContent,$(this.componentId));
							if (val) {
								if (compContent.is(":hidden")) {
									$(this.componentColExp,$(this.componentId)).trigger("click");
								}
							}
							else {
								if (compContent.is(":visible")) {
									$(this.componentColExp,$(this.componentId)).trigger("click");
								}
							}
						};
					});
				}
				catch(err) {
					component = new MPage.Component();
					component.setOption("errMsg",err.description);
				}
				
				// adding component to global reference
				MPage.addCustomComp(component);
				
				//kick off component generation.  If errors, then output error message.
				try{
					var comp_options = comp_target.attr("options")!=""?eval(comp_target.attr("options")):null;
					component.generate(null,null,comp_options);
				} catch(e) {
					MP_COMMON.RunErrorComponent(component, e);
				}
			});
		},
		toggle : function (comp_target)
		{
			return (comp_target.hasClass("closed"))?comp_target.removeClass("closed"):comp_target.addClass("closed");
		},
		expandAll : function ()
		{
			$(".with-header").removeClass("closed");
		},
		collapseAll : function ()
		{
			$(".with-header").removeClass("closed").addClass("closed");
		}
		
	};
}();