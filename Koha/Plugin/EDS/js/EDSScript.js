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
* DATE MODIFIED: 03/Dec/2013
* LAST CHANGE DESCRIPTION: Fixed: pdf not opening automatically when accessed from result page.
*							removed multi-select display for known items at switch.
=============================================================================================
*/

//return; // uncomment this to disable EDS
var knownItem='';
var activeState=0;
var edsOptions="";
var kohaOptions="";
var edsSelectedKnownItem="";
var defaultSearch="";
var cookieExpiry="30";
var browseNextPage="";
var catalogueId="";
//-configurable in plugin config
var edsSwitchText = "Switch to Discovery";
var kohaSwitchText = "Switch to Catalogue";
var edsSelectText = 'Discovery';
var edsSelectInfo = '<h3>Search EDS</h3>Select a known item and enter a search term';
var kohaSelectInfo = '<h3>Search Koha</h3>Select a known item and enter a search term';


$(window).error(function(e){e.preventDefault();}); // keep executing if there is an error.


$("#masthead_search").attr("disabled","disabled");
$("#transl1").attr("disabled","disabled");
jQuery.getScript('/plugin/Koha/Plugin/EDS/js/jquery.cookie.min.js', function(data, textStatus, jqxhr){
	$(document).ready(function(){
		$.getJSON('/plugin/Koha/Plugin/EDS/opac/eds-raw.pl'+'?'+'q=config',function(data){ConfigData(data);});
		$("#masthead_search").attr("disabled","disabled");
		if(typeof $('.back_results a').attr('href')!='undefined'){EDSSetDetailPageNavigator();}
	});
});
function ConfigData(data){
	edsSwitchText = data.edsswitchtext;
	kohaSwitchText = data.kohaswitchtext;
	edsSelectText = data.edsselecttext;
	edsSelectInfo = data.edsselectinfo;
	kohaSelectInfo = data.kohaselectinfo;
	catalogueId = data.cataloguedbid;
	if(data.defaultsearch!="off"){
		if(!$.cookie('defaultSearch')){defaultSearch=data.defaultsearch;$.cookie('defaultSearch',defaultSearch);
		}else{defaultSearch=$.cookie('defaultSearch');}
		GoDiscovery();
	}else{
		$("#masthead_search").removeAttr("disabled");
		$("#transl1").removeAttr("disabled");
	}
}

function GoDiscovery(){		
	$(document).ready(function(){
		try{edsSelectedKnownItem=edsKnownItem}catch(e){edsSelectedKnownItem='';}
		$.getJSON('/plugin/Koha/Plugin/EDS/opac/eds-raw.pl'+'?'+'q=knownitems',function(data){SetEDSOptions(data);});
		var optionSelect=1;
		$('#masthead_search option').each(function(){
			var optionText = $(this).text();
			var optionSelected="";
			if($(this).val()!=""){optionText="--- "+optionText;}
			if($(this).attr('selected') && optionSelect==1){optionSelected=' selected="selected" ';optionSelect=0}
			kohaOptions+='<option '+optionSelected+' value="'+$(this).val()+'">'+optionText+'</option>';
			$(this).remove();
		});
		$('#masthead_search').append(kohaOptions);
		$('#masthead_search').prepend("<option value='eds'>"+edsSwitchText+"</option>");
		$("#masthead_search").change(function() {
			knownItem=$(this).val();
			if(($(this).val()=='eds') && (defaultSearch!='eds')){SetEDS(1);// Search EDS
			}else if(($(this).val()=='') && (defaultSearch!='koha')){SetKoha(1);}// Search Koha
		})
	});
	$("#masthead_search").removeAttr("disabled");
	$("#transl1").removeAttr("disabled");
}

function SetEDSOptions(data){
	edsOptions+='<option value="">'+kohaSwitchText+'</option><option selected="selected" value="eds">'+edsSelectText+'</option>';
	for(var i=0; i<data.length; i++){
		var selectedItem ="";
		if(edsSelectedKnownItem==data[i].FieldCode){selectedItem='selected="selected"'}
		edsOptions+='<option '+selectedItem+' value="'+data[i].FieldCode+'">--- '+data[i].FieldCode+': '+data[i].Label+'</option>';
	}
	
	if(defaultSearch=="eds"){SetEDS(0);
	}else if(defaultSearch=="koha"){SetKoha(0);}
}

function SetEDS(showInfo){
			$('#searchform').submit(function(){return false;});
			$('#searchsubmit').click(SearchEDS);
			$('#masthead_search option').each(function(){$(this).remove();});
			if(showInfo){ShowInfo(edsSelectInfo);}
			$('#masthead_search').append(edsOptions);
			$.removeCookie('defaultSearch', { path: '/' });
			$.cookie('defaultSearch','eds');
			defaultSearch="eds";
			$('#transl1').val($.cookie('QueryTerm'));
			$('#transl1').removeClass('placeholder');
}

function SetKoha(showInfo){
			$('#searchform').unbind('submit');
			$('#searchsubmit').unbind('click');
			$('#masthead_search option').each(function(){$(this).remove();});
			if(showInfo){ShowInfo(kohaSelectInfo);}
			$('#masthead_search').append(kohaOptions);
			$('#masthead_search').prepend("<option value='eds'>"+edsSwitchText+"</option>");
			$.removeCookie('defaultSearch', { path: '/' });
			$.cookie('defaultSearch','koha')
			defaultSearch="koha";
}

function ShowInfo(msg){
	//$('#masthead_search').css('z-index',1000);
	//$('#masthead_search').attr('size',8);
	var topPos = $('#masthead_search').offset().top;
	var leftPos = $('#masthead_search').offset().left;
	//var selectWidth = $('#masthead_search').width()+18;
	var cartMsg = $("#cartDetails").html();
	//$('#masthead_search').css('position','absolute');
	//$('#masthead_search').css('left',topPos+'px');
	//$('#masthead_search').css('left',leftPos+'px');
	if(activeState==0){
		activeState=1;
		//$('label[for="masthead_search"]').width($('label[for="masthead_search"]').width()+selectWidth);
	}
	/*setTimeout(function(){
		$('#masthead_search').attr('size',0);
		$('#masthead_search').css('left','');
		$('#masthead_search').css('top','');
		$('#masthead_search').css('position','');
		//$('label[for="masthead_search"]').width($('label[for="masthead_search"]').width()-selectWidth);
		activeState=0;
		},3000);*/
	$("#cartDetails").html(msg);
	showCart();
	$("#cartDetails").css('left',leftPos+'px');
	$("#cartDetails").css('top',(topPos-90)+'px');
	setTimeout(function(){
		hideCart();
		$("#cartDetails").html(cartMsg);
		},2000);
}

function SearchEDS(){
  var searchTerm = $('#transl1').val();
  if(knownItem=='eds'){knownItem='';}
  window.location='/plugin/Koha/Plugin/EDS/opac/eds-search.pl?q=Search?query-1=AND,'+knownItem+':{'+searchTerm+'}&default=1';
}

function EDSGetRecord(recordURL,callingObjParent){
	$.getJSON('/plugin/Koha/Plugin/EDS/opac/eds-raw.pl'+'?'+'q=Search?'+recordURL,function(data){EDSGoToRecord(data);});
	$('.'+callingObjParent).html('<center><span><img src="/opac-tmpl/prog/images/loading.gif" width="14"></span></center>');
}

function EDSGoToRecord(data){
	 var gotoURL= '/plugin/Koha/Plugin/EDS/opac/eds-detail.pl?q=Retrieve?an='+data.SearchResult.Data.Records[0].Header.An+'|dbid='+data.SearchResult.Data.Records[0].Header.DbId+'&resultid='+data.SearchResult.Data.Records[0].ResultId;
	 if(data.SearchResult.Data.Records[0].Header.DbId.indexOf(catalogueId)>-1){
		 gotoURL= '/cgi-bin/koha/opac-detail.pl?resultid='+data.SearchResult.Data.Records[0].ResultId+'&biblionumber='+data.SearchResult.Data.Records[0].Header.An.replace('niwa.','');
	 }
	 window.location = gotoURL;
}


function EDSBrowseResults(fetchURL){
	
	var currentBrowsePage = fetchURL;
	regex = /pagenumber\=\d/;
	currentBrowsePage = currentBrowsePage.match(regex)[0];
	currentBrowsePage = currentBrowsePage.replace('pagenumber=','');
	browseNextPage=eval(currentBrowsePage)+1;
	browseNextPage = fetchURL.replace(/pagenumber\=\d/,'pagenumber='+browseNextPage);
	$("li[title='More Results']").html('<center><span><img src="/opac-tmpl/prog/images/loading.gif" width="14"></span></center>');
	
	$.getJSON('/plugin/Koha/Plugin/EDS/opac/eds-raw.pl'+'?'+'q=Search?'+fetchURL,function(data){EDSAppendToBrowse(data);});
}

function EDSAppendToBrowse(data){
	var totalHits = data.SearchResult.Statistics.TotalHits;
	var maxResultId = "";
	var searchResults = '';
	for(var i=0; i<data.SearchResult.Data.Records.length; i++){
		try{
		searchResults += '<li title="Go to detail" class="highlight" ><a href="?q=Retrieve?an='+data.SearchResult.Data.Records[i].Header.An.replace('\w+\.','')+'|dbid='+data.SearchResult.Data.Records[i].Header.DbId+'&resultid='+data.SearchResult.Data.Records[i].ResultId+'"><span class="">'+data.SearchResult.Data.Records[i].ResultId+'. </span>'+$('<div/>').html(data.SearchResult.Data.Records[i].Items[0].Data).text()+'</a></li>';
		maxResultId = data.SearchResult.Data.Records[i].ResultId;
		}catch(e){
				searchResults += '<li title="Go to detail" class="highlight" >'+data.SearchResult.Data.Records[i].ResultId+'. <span class="">Login to gain access to this result.</span></li>';
				$('.FullTextLoader').css('display','none');
		}
	}
	if(maxResultId<totalHits){
		searchResults += '<li title="More Results" class="highlight" ><a href="javascript:EDSBrowseResults(\''+browseNextPage+'\');"><center>View More Results</center></a></li>';
	}
	$("li[title='More Results']").remove('li');
	$(".pagination_list").css('max-height',$( window ).height()-($('.nav_results').offset().top+100));
	$(".pagination_list").css('overflow','auto');
	$("#browseLoader").css('display','none');
	$("#ul_pagination_list").append(searchResults);
	$("#ul_pagination_list").css('padding-top','0px');
}

function EDSSetDetailPageNavigator(){
	if($('.back_results a').attr('href').indexOf('q=Search?')>-1){
		$("#a_listResults").unbind('click');
		$("#ul_pagination_list").append('<div align="center" id="browseLoader"><img title="Loading. Please wait..." src="/opac-tmpl/prog/images/loading.gif" width="14" ></div>');
		$("#a_listResults").click(function(e) {
			var navigation = $(".pagination");
			if (navigation.css("display") == 'none') {
				navigation.show();
			} else {
				navigation.hide();
			}
		});
		$("#close_pagination").click(function(e) {
			var navigation = $(".pagination");
			navigation.hide();
		});
		EDSBrowseResults($.cookie('ReturnToResults'));
		if($('.back_results a').attr('href').indexOf('opac-search.pl?q=Search?')>-1){
			$('.back_results a').attr('href',$('.back_results a').attr('href').replace('opac-search.pl?q=Search?','/plugin/Koha/Plugin/EDS/opac/eds-search.pl?q=Search?'));
		}
		var resultId = QueryString('resultid');
		var previousResult = parseInt(resultId)-1;
		var nextResult = parseInt(resultId)+1;
		var simpleQuery = $.cookie('EDSSimpleQuery');
		if(previousResult>0){
			$('.left_results').html('<a href="javascript:EDSGetRecord(\''+simpleQuery+'|resultsperpage=1|pagenumber='+previousResult+'\',\'left_results\')" title="See previous">&laquo; Previous</a>');
		}
		if(nextResult<250 && nextResult<$.cookie('ResultTotal')){
			$('.right_results').html('<a href="javascript:EDSGetRecord(\''+simpleQuery+'|resultsperpage=1|pagenumber='+nextResult+'\',\'right_results\')" title="See next">Next &raquo;</a>');
		}
	}
	if(QueryString('fulltext')==1){
		$('.customLink').each(function(){
			if($(this).text().trim()=="PDF Full Text"){
				$('.FullTextLoader').css('display','block');
				window.location.href=$(this).attr('href');
				return false;
			}
			});
	}
}


function QueryString(key) {
   var re=new RegExp('(?:\\?|&)'+key+'=(.*?)(?=&|$)','gi');
   var r=[], m;
   while ((m=re.exec(document.location.search)) != null) r.push(m[1]);
   return r;
}