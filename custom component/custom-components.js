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
				"<td title='Event Id: ", docObj.EVENT_ID,"'>", docObj.TITLE,"</td>",
				"<td class='doc-detail'><a href=\"javascript:MPAGES_EVENT('CLINICALNOTE', '",paramStr,"')\">", docObj.DATE,"</a></td>",
			"</tr>"
		);	
}  // end for

	// Close the table
	targetHTML.push("</table></div>");
	
	target.innerHTML = targetHTML.join("");
	
	//this may or may not be needed
	//component.addEventHandlers();
};

