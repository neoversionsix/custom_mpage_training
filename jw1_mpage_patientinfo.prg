drop program jw1_mpage_patientinfo:dba go
create program jw1_mpage_patientinfo:dba

prompt
	"Output to File/Printer/MINE" = "MINE"
	, "Person Id:" = 0.0
with outdev, personid

/*  Begin the xml string  */
declare sXML = vc with protect, noconstant("")

set sXML = "<?xml version='1.0' encoding='iso-8859-1' standalone='no' ?><RPT_DATA>"

/**************************************************
 *     Get the Patient Name, DOB and Gender       *
 **************************************************/
select into "nl:"
   dob = format(p.birth_dt_tm,"mm/dd/yyyy;;d"),
   gender = uar_get_code_display(p.sex_cd)
from
   person p
plan p
   where p.person_id = $personId

head report
   sXML = concat(sXML, "<patientInfo>")
   sXML = concat(sXML, "<patientInfo_label>Patient Name:</patientInfo_label>")
   sXML = concat(sXML, "<patientInfo_result>", trim(p.name_full_formatted,3), "</patientInfo_result>")
   sXML = concat(sXML, "<patientInfo_detail>This person's name is: ",p.name_full_formatted,"</patientInfo_detail>")
   sXML = concat(sXML, "</patientInfo>")

   sXML = concat(sXML, "<patientInfo>")
   sXML = concat(sXML, "<patientInfo_label>Birth Date:</patientInfo_label>")
   sXML = concat(sXML, "<patientInfo_result>", trim(dob,3), "</patientInfo_result>")
   sXML = concat(sXML, "<patientInfo_detail>This person's birthdate is: ",dob,"</patientInfo_detail>")
   sXML = concat(sXML, "</patientInfo>")

   sXML = concat(sXML, "<patientInfo>")
   sXML = concat(sXML, "<patientInfo_label>Gender:</patientInfo_label>")
   sXML = concat(sXML, "<patientInfo_result>", trim(gender,3), "</patientInfo_result>")
   sXML = concat(sXML, "<patientInfo_detail>This person's gender is: ",gender,"</patientInfo_detail>")
   sXML = concat(sXML, "</patientInfo>")
with nocounter

/*  End the xml string  */
set sXML = concat(sXML, "</RPT_DATA>")

call echo(sXML)

;Set public memory variable equal to our XML string
set _Memory_Reply_String = sXML

end
go
