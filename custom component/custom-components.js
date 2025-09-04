/* Put name of component here */
MPage.namespace("jw2.comp_name");

jw2.comp_name = function(){};
jw2.comp_name.prototype = new MPage.Component();
jw2.comp_name.prototype.constructor = MPage.Component;
jw2.comp_name.prototype.base = MPage.Component.prototype;
jw2.comp_name.prototype.name = "jw2.comp_name";

jw2.comp_name.prototype.init = function(options) {
	//code to perform before immediately rendering (usually nothing needed)
};

jw2.comp_name.prototype.addEventHandlers = function() {
	var component = this;
	var compId = component.getComponentUid();
	var target = component.getTarget();
	
	$("#"+compId+" .classOfElementWithinComponent").click(function(){
		//some stuff to do when clicked
	});
};

jw2.comp_name.prototype.getSubHeader = function( str ) {
	//note that inline styles could be put in their own class and put as a second class for the div
	return ["<div class='sub-title-disp' style='margin:-6px -6px 6px -6px;border-left:none;border-right:none;'>",str,"</div>"].join("");
};

jw2.comp_name.prototype.render = function() {
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
	
	target.innerHTML = targetHTML.join("");

	//this may or may not be needed.
	//component.addEventHandlers();
}
