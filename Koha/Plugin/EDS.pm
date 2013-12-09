package Koha::Plugin::EDS;

#/*
#=============================================================================================
#* WIDGET NAME: Koha EDS Integration Plugin
#* DESCRIPTION: Integrates EDS with Koha
#* KEYWORDS: Koha, ILS, Integration, API, EDS
#* CUSTOMER PARAMETERS: None
#* EBSCO PARAMETERS: None
#* URL: N/A
#* AUTHOR & EMAIL: Alvet Miranda - amiranda@ebsco.com
#* DATE ADDED: 31/10/2013
#* DATE MODIFIED: 04/Dec/2013
#* LAST CHANGE DESCRIPTION: Plugin is configurable through syspref now.
#=============================================================================================
#*/

use Modern::Perl;
use base qw(Koha::Plugins::Base);
use C4::Context;
use C4::Branch;
use C4::Members;
use C4::Auth;
use Cwd            qw( abs_path );
use File::Basename qw( dirname );

my $PluginDir = C4::Context->config("pluginsdir");
$PluginDir = $PluginDir.'/Koha/Plugin/EDS';

## Here we set our plugin version
our $VERSION = 1.002;

## Here is our metadata, some keys are required, some are optional
our $metadata = {
    name   => 'Koha EDS API Integration',
    author => 'Alvet Miranda - amiranda@ebsco.com',
    description =>
'This plugin integrates EBSCO Discovery Service(EDS) in Koha.<p>Go to Configure(right) to configure the API Plugin first then Run tool (left) for setup instructions.</p><p>For assistance; email EBSCO support at <a href="mailto:support@ebscohost.com">support@ebscohost.com</a> or call the toll free international hotline at +800-3272-6000</p>',
    date_authored   => '2013-10-27',
    date_updated    => '2013-12-04',
    minimum_version => '3.1202000',
    maximum_version => undef,
    version         => $VERSION,
};

## This is the minimum code required for a plugin's 'new' method
## More can be added, but none should be removed
sub new {
    my ( $class, $args ) = @_;

    ## We need to add our metadata here so our base class can access it
    $args->{'metadata'} = $metadata;

    ## Here, we call the 'new' method for our base class
    ## This runs some additional magic and checking
    ## and returns our actual $self
    my $self = $class->SUPER::new($args);

    return $self;
}

sub tool {
    my ( $self, $args ) = @_;

    my $cgi = $self->{'cgi'};

    unless ( $cgi->param('submitted') ) {
        $self->SetupTool();
    }


}

## Logic for configure method
sub configure {
    my ( $self, $args ) = @_;
    my $cgi = $self->{'cgi'};

    unless ( $cgi->param('save') ) {
        my $template = $self->get_template({ file => 'admin/configure.tt' });

        ## Grab the values we already have for our settings, if any exist
        $template->param(
			edsusername 		=> $self->retrieve_data('edsusername'),
			edspassword 		=> $self->retrieve_data('edspassword'),
			edsprofileid 		=> $self->retrieve_data('edsprofileid'),
			edscustomerid 		=> $self->retrieve_data('edscustomerid'),
			cataloguedbid 		=> $self->retrieve_data('cataloguedbid'),
			catalogueanprefix 	=> $self->retrieve_data('catalogueanprefix'),
			defaultsearch 		=> $self->retrieve_data('defaultsearch'),
			cookieexpiry 		=> $self->retrieve_data('cookieexpiry'),
			edsinfo				=> $self->retrieve_data('edsinfo'),
			lastedsinfoupdate	=> $self->retrieve_data('lastedsinfoupdate'),
			authtoken			=> $self->retrieve_data('authtoken'),
			OPACBaseURL			=> C4::Context->preference('OPACBaseURL'),		
			edsswitchtext	=> $self->retrieve_data('edsswitchtext'),
			kohaswitchtext	=> $self->retrieve_data('kohaswitchtext'),
			edsselecttext	=> $self->retrieve_data('edsselecttext'),
			edsselectinfo	=> $self->retrieve_data('edsselectinfo'),
			kohaselectinfo	=> $self->retrieve_data('kohaselectinfo'),
			instancepath	=> $self->retrieve_data('instancepath'),
			themelangforplugin	=> $self->retrieve_data('themelangforplugin'),
			
			
        );

        print $cgi->header();
        print $template->output();
    }
    else {
		if($cgi->param('edsinfo') eq 'Update Required'){
			$self->store_data(
				{
					edsusername 		=> $cgi->param('edsusername'),
					edspassword 		=> $cgi->param('edspassword'),
					edsprofileid 		=> $cgi->param('edsprofileid'),
					edscustomerid 		=> $cgi->param('edscustomerid'),
					cataloguedbid 		=> $cgi->param('cataloguedbid'),
					catalogueanprefix 	=> $cgi->param('catalogueanprefix'),
					defaultsearch 		=> $cgi->param('defaultsearch'),
					cookieexpiry 		=> $cgi->param('cookieexpiry'),
					authtoken 			=> $cgi->param('authtoken'),
					lastedsinfoupdate	=> $cgi->param('lastedsinfoupdate'),
					last_configured_by => C4::Context->userenv->{'number'},					
					edsswitchtext	=> $cgi->param('edsswitchtext'),
					kohaswitchtext	=> $cgi->param('kohaswitchtext'),
					edsselecttext	=> $cgi->param('edsselecttext'),
					edsselectinfo	=> $cgi->param('edsselectinfo'),
					kohaselectinfo	=> $cgi->param('kohaselectinfo'),
					edsinfo 		=> $cgi->param('edsinfo'),
					instancepath	=> $cgi->param('instancepath'),
					themelangforplugin	=> $cgi->param('themelangforplugin'),
					
					
					
				}
			);
		}else{ # TODO: remove duplicate params
			$self->store_data(
				{
					edsusername 		=> $cgi->param('edsusername'),
					edspassword 		=> $cgi->param('edspassword'),
					edsprofileid 		=> $cgi->param('edsprofileid'),
					edscustomerid 		=> $cgi->param('edscustomerid'),
					cataloguedbid 		=> $cgi->param('cataloguedbid'),
					catalogueanprefix 	=> $cgi->param('catalogueanprefix'),
					defaultsearch 		=> $cgi->param('defaultsearch'),
					cookieexpiry 		=> $cgi->param('cookieexpiry'),
					last_configured_by => C4::Context->userenv->{'number'},
					edsswitchtext	=> $cgi->param('edsswitchtext'),
					kohaswitchtext	=> $cgi->param('kohaswitchtext'),
					edsselecttext	=> $cgi->param('edsselecttext'),
					edsselectinfo	=> $cgi->param('edsselectinfo'),
					kohaselectinfo	=> $cgi->param('kohaselectinfo'),
					instancepath	=> $cgi->param('instancepath'),
					themelangforplugin	=> $cgi->param('themelangforplugin'),
				}
			);
		}
        $self->go_home();
    }
}


sub install() {
    my ( $self, $args ) = @_;
##Leaving this code incase this plugin needs its own table in the future
#    my $table = $self->get_qualified_table_name('config');

#    return C4::Context->dbh->do( "
#		CREATE TABLE $table (
#		`edsid` INT NOT NULL AUTO_INCREMENT,
#		`edskey` VARCHAR(100) NOT NULL,
#		`edsvalue` TEXT NOT NULL, 
#		PRIMARY KEY (`edsid`)) ENGINE = INNODB;
#    " ); 
	return C4::Context->dbh->do("INSERT INTO `systempreferences` (`variable`, `value`, `explanation`, `type`) VALUES ('EDSEnabled', '1', 'If ON, enables searching with EDS - Plugin required.For assistance; email EBSCO support at support\@ebscohost.com', 'YesNo') ON DUPLICATE KEY UPDATE `variable`='EDSEnabled', `value`=1, `explanation`='If ON, enables searching with EDS - Plugin required.For assistance; email EBSCO support at support\@ebscohost.com', `type`='YesNo'");
}


sub uninstall() {
    my ( $self, $args ) = @_;
##Leaving this code incase this plugin needs its own table in the future
#    my $table = $self->get_qualified_table_name('config');

#    return C4::Context->dbh->do("DROP TABLE $table");
	return C4::Context->dbh->do("INSERT INTO `systempreferences` (`variable`, `value`, `explanation`, `type`) VALUES ('EDSEnabled', '0', 'If ON, enables searching with EDS - Plugin required.For assistance; email EBSCO support at support\@ebscohost.com', 'YesNo') ON DUPLICATE KEY UPDATE `variable`='EDSEnabled', `value`=1, `explanation`='If ON, enables searching with EDS - Plugin required.For assistance; email EBSCO support at support\@ebscohost.com', `type`='YesNo'");
}

sub SetupTool {
    my ( $self, $args ) = @_;
    my $cgi = $self->{'cgi'};
	
	require $PluginDir.'/admin/setuptool.pl';

    my $template = $self->get_template({ file => 'admin/setuptool.tt' });
	        $template->param(
			edsusername 		=> $self->retrieve_data('edsusername'),
			edspassword 		=> $self->retrieve_data('edspassword'),
			currentversion		=> $VERSION,
			
			
        );

    print $cgi->header();
    print $template->output();
}
1;