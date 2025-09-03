function verify(){
    // 0 Object is not initialized
    // 1 Loading object is loading data
    // 2 Loaded object has loaded data
    // 3 Data from object can be worked with
    // 4 Object completely initialized
    if (xmlDoc.readyState != 4){
        return (false);
    }
}
 
function loadXMLString(txt) {
	try //Internet Explorer
	{
		//this creates the nex XML object
		xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
		xmlDoc.async="false";
		xmlDoc.onreadystatechange=verify;
		xmlDoc.loadXML(txt);
		return(xmlDoc);
	}
	catch(e)
	{
		try //Firefox, Mozilla, Opera, etc.
		{
			parser=new DOMParser();
			xmlDoc=parser.parseFromString(txt,"text/xml");
			return(xmlDoc);
		}
		catch(e) {alert(e.message);}
	}
	alert('returning null...');
	return(null);
}

function getEvents(){
	// Call functions to format html and populate sections
	patientInfoTable();
	allergyInfoTable();
}

function patientInfoTable(){
	// Initialize the request object
	var patInfo = new XMLCclRequest();

	// Get the response
	patInfo.onreadystatechange = function () {
		if (patInfo.readyState == 4 && patInfo.status == 200) {
			var xmlDoc = loadXMLString(patInfo.responseText);

			// Get all of the parent patientInfo nodes from the xml
			var pi_var = xmlDoc.getElementsByTagName("patientInfo");

			// Start building the patient information table
			var tableBody = ["<table>"];

			// Loop through the parent nodes to get the child nodes 
			for (var i=0, pLen=pi_var.length; i<pLen; i++){
				var pi_var2 = pi_var[i].childNodes;
				if (pi_var2[0].text != "Person_ID:")
				{tableBody.push(
					"<tr>",
						"<td class='col1-first'>",pi_var2[0].text,"</td>",
						"<td class='col2' title=\"",pi_var2[2].text,"\">",pi_var2[1].text,"</td>",
					"</tr>");}
			}

			// Close the table
			tableBody.push("</table>");

			// Insert the table into the patient information section
			document.getElementById('patientInfoTable').innerHTML  = tableBody.join("");
		
			var link = tabLink("Custom Patient Information","Patient Information","$APP_APPNAME$");

			// Insert the link into the patient information section header
			document.getElementById('patHeader').innerHTML  = link;
			//Initialize the col2 elements as hovers
			$.reInitPopUps('patientInfoTable');
		};   //if
	} //function


	//  Call the ccl progam and send the parameter string
	patInfo.open('GET', "JW1_MPAGE_PATIENTINFO");
	//patInfo.send("MINE, $PAT_Personid$");
	patInfo.send("MINE, 15779987.00 "); 

	return;
}

function allergyInfoTable(){

	var mod_i = 0;
   	var OddRow = "";

	// Initialize the request object
	var algyInfo = new XMLCclRequest();

	// Get the response
	algyInfo.onreadystatechange = function () {
		if (algyInfo.readyState == 4 && algyInfo.status == 200) {
			var xmlDoc = loadXMLString(algyInfo.responseText);

			// Get all of the parent allergy nodes from the xml
			var all_var = xmlDoc.getElementsByTagName("allergy");

			// Start building the allergy table
			var tableBody = ["<table>"];
			// Loop through the parent nodes to get the child nodes 
			for (var i=0, aLen=all_var.length;i<aLen;i++){
				   mod_i = i%2;
					OddRow = "";
					if (mod_i)
				  	OddRow = " class='odd_row'";
				var all_var2 = all_var[i].childNodes;

				tableBody.push(
					"<tr",OddRow,">",
						"<td class='col1'>",all_var2[0].text,"</td>",
						"<td class='col2'>",all_var2[1].text,"</td>",
					"</tr>");
			}	

			// Close the table
			tableBody.push("</table>");

			// Insert the table into the allergy section
			document.getElementById('allergyTable').innerHTML  = tableBody.join("");

			var link = tabLink("Allergies/Sensitivities","Allergies/Sensitivities+","$APP_APPNAME$");

			// Insert the link into the allergy section header
			document.getElementById('patall').innerHTML  = link;

		};   //if
	} //function


	//  Call the ccl program and send the parameter string
	algyInfo.open('GET', "JW1_MPAGE_ALLERGIES");
	//algyInfo.send("MINE, $PAT_Personid$");
	algyInfo.send("MINE, 15779987.00 "); 

	return;
}

function tabLink (desc,firstTab,appl) {
	var nMode = 0;
	var vcAppName = appl;
	var vcDescription = desc;
	var vcParams = "/PERSONID=$PAT_PERSONID$ /ENCNTRID=$VIS_ENCNTRID$ /FIRSTTAB="+firstTab;
	return ["<a title='Click to go to ",firstTab," Tab' href='javascript:APPLINK(",nMode,",\"",vcAppName,"\",\"",vcParams,"\");'>",vcDescription,"</a>"].join("");
}
