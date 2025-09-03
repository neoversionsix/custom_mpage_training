drop program jw1_mpage_documents:dba go
create program jw1_mpage_documents:dba

prompt
	"Output to File/Printer/MINE" = "MINE"
	, "Person Id:" = 0.0
	, "Encounter Id:" = 0.0

with outdev, personid, encntrid

declare inErrorCd = f8 with public, noconstant(uar_get_code_by("MEANING",8,"INERROR"))
declare DOCCd  = f8 with public,constant(uar_get_code_by("MEANING", 53, "DOC"))

/*  Begin the xml string  */
declare sXML = vc with protect, noconstant("")

set sXML = "<?xml version='1.0' encoding='iso-8859-1' standalone='no' ?><RPT_DATA>"


/******************************************************
 *     Get the Document Title, Date and Event_Id      *
 ******************************************************/
select into "nl:"
   evtDate = format(ce.event_end_dt_tm,"mm/dd/yyyy hh:mm;;dq"),
   evtTitle = ce.event_tag,
   evtId = cnvtstring(ceb.event_id)
from
   clinical_event ce,
   ce_blob ceb

plan ce
  where ce.person_id = $PersonId
  	 and ce.event_end_dt_tm >= cnvtlookbehind("6 M",cnvtdatetime(curdate,curtime3))
     and ce.valid_until_dt_tm > cnvtdatetime(curdate,curtime3)
     and ce.encntr_id = $encntrid
     and ce.result_status_cd != inErrorCd
     and ce.event_class_cd = DOCCd
join ceb
   where ceb.event_id = ce.event_id
      and ceb.valid_until_dt_tm > cnvtdatetime(curdate,curtime3)

order by ce.event_end_dt_tm desc

head ceb.event_id
   sXML = concat(sXML, "<documents>")
   sXML = concat(sXML, "<document_date>",evtDate,"</document_date>")
   sXML = concat(sXML, "<document_title>",evtTitle,"</document_title>")
   sXML = concat(sXML, "<document_event_id>",evtId,"</document_event_id>")
   sXML = concat(sXML, "</documents>")
with nocounter

/*  End the xml string  */
set sXML = concat(sXML, "</RPT_DATA>")
call echo(sXML)

;Set public memory variable equal to our XML string
set _Memory_Reply_String = sXML

end
go