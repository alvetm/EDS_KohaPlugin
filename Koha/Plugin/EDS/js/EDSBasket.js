/*
=============================================================================================
* WIDGET NAME: Koha EDS Integration Plugin
* DESCRIPTION: Integrates EDS with Koha
* KEYWORDS: Koha, ILS, Integration, API, EDS
* CUSTOMER PARAMETERS: None
* EBSCO PARAMETERS: None
* URL: N/A
* AUTHOR & EMAIL: Alvet Miranda - amiranda@ebsco.com
* DATE ADDED: 31/10/2013
* DATE MODIFIED: 03/11/2013
* LAST CHANGE DESCRIPTION: Added window.error.
=============================================================================================
*/
var callPrepareItems = false;
var EDSItems = 0;

$(window).error(function(e){ // If the table is empty; it throws an error and stops execution. This does a catch all and helps continue execution.
	callPrepareItems=true;
    PrepareItems();
});

if(!callPrepareItems){PrepareItems()};

function PrepareItems(){
	$(document).ready(function(){
		var recordList = document.URL;
		recordList = recordList.substring(recordList.indexOf('?')+10);
		var recordId=recordList.split("/");
		
		EDSItems = recordId.length-1;
		
		for(i=0;i<recordId.length-1;i++){
			recordId[i] = "Retrieve?an="+recordId[i].replace("|","|dbid=");
			if(recordId[i].indexOf('dbid=cat')==-1){ // ignore catalogue records
				$.getJSON('/plugin/Koha/Plugin/EDS/opac/eds-raw.pl'+'?'+'q='+recordId[i],function(data){GetEDSItems(data);});}
			else{EDSItems--;
				}
		}
		if(EDSItems>0){
			$('.print').attr('onclick','return false;');
			$('.print').attr('href','javascript:window.print();location.reload();');
			$('#itemst').append('<tr id="EDSBasketLoader"><td>&nbsp;</td><td nowrap="nowrap"><img src="/opac-tmpl/prog/images/loading.gif" width="15"> Loading Items. Please wait...</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>');
		}
	});
}

function GetEDSItems(data){
	try{
	$('#itemst').append('<tr><td><input type="checkbox" class="cb" value="'+data.Record.Header.An+'|'+data.Record.Header.DbId+'" name="'+data.Record.Header.An+'|'+data.Record.Header.DbId+'" id="'+data.Record.Header.An+'|'+data.Record.Header.DbId+'" onclick="selRecord(value,checked);"></td><td><a href="#" onclick="opener.document.location=\'/plugin/Koha/Plugin/EDS/opac/eds-detail.pl?q=Retrieve?an='+data.Record.Header.An+'|dbid='+data.Record.Header.DbId+'\'">'+$("<div/>").html(data.Record.Items[0].Data).text()+'</a></td><td>'+$("<div/>").html(data.Record.Items[1].Data).text()+'</td><td>'+data.Record.RecordInfo.BibRecord.BibRelationships.IsPartOfRelationships[0].BibEntity.Dates[0].Y+'</td><td>Discovery</td></tr>');
	EDSItems--;
	if(EDSItems<=1){$('#EDSBasketLoader').css('display','none');}
	}catch(e){
		EDSItems--;
		if(EDSItems<=1){$('#EDSBasketLoader').css('display','none');}
	}
}