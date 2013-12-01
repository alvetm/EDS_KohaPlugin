<ul id="action">
[% FOREACH CUSTOMLINK IN DETAILED_RECORD.FullText %]
	[% IF CUSTOMLINK.value.0.Type %]			  
		<li>
		[% IF CUSTOMLINK.value.0.Url %]
			<a target="_blank" class="customLink" href="[% CUSTOMLINK.value.0.Url %]">
		[% ELSE %]
			<a class="customLink" href="javascript:alert('Login to gain access to this result.');return false;">
		[% END %]
		[% IF CUSTOMLINK.value.0.Type == 'pdflink' %]
			PDF Full Text
		[% ELSE %]
			[% CUSTOMLINK.value.0.Type %]
		[% END %]
		</a></li>
	[% END %]
[% END %]
[% FOREACH CUSTOMLINK IN DETAILED_RECORD.FullText.CustomLinks %]
	[% IF CUSTOMLINK.Text %]		  
		<li><a target="_blank" class="customLink" title="[% CUSTOMLINK.MouseOverText %]" href="[% CUSTOMLINK.Url %]">[% CUSTOMLINK.Text %]</a></li>
	[% END %]
[% END %]
[% FOREACH CUSTOMLINK IN DETAILED_RECORD.CustomLinks %]
	[% IF CUSTOMLINK.Text %]		  
		<li><a target="_blank" class="customLink" title="[% CUSTOMLINK.MouseOverText %]" href="[% CUSTOMLINK.Url %]">[% CUSTOMLINK.Text %]</a></li>
	[% END %]
[% END %]
[% IF DETAILED_RECORD.PLink %]		  
	<li><a target="_blank" class="customLink" title="View in EDS" href="[% DETAILED_RECORD.PLink %]">View in EDS</a></li>
[% END %]

</ul>