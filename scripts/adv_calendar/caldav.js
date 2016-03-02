"use strict";

var https  = require('https'),
    xmldoc = require('xmldoc'),
    url    = require('url');



var req_payload = '<c:calendar-query xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">\n' + 
                  '    <d:prop>\n' + 
                  '        <d:getetag />\n' + 
                  '        <c:calendar-data />\n' + 
                  '    </d:prop>\n' + 
                  '    <c:filter>\n' + 
                  '        <c:comp-filter name="VCALENDAR" />\n' +
                  '    </c:filter>\n' + 
                  '</c:calendar-query>\n';


module.exports = function ( caldav_opts, cb ) {

    var parsed_url = url.parse ( caldav_opts.url );
    var auth_base64 = new Buffer ( caldav_opts.user + ":" + caldav_opts.pass ).toString ( 'base64' );

    var options = {
        rejectUnauthorized  : false,
        hostname            : parsed_url.host,
        path                : parsed_url.path,
        method              : 'REPORT',
        headers:            {
            "Content-Type"      : "application/xml; charset=utf-8",
            "Content-Length"    : req_payload.length,  
            "User-Agent"        : "CalDAVClient",
            "Connection"        : "close",
            "Depth"             : "1",
            "Prefer"            : "return-minimal",
            "Authorization"     : "Basic " + auth_base64,
            "X-Msg"             : "Have a nice day! :)"
        }
    };


    var req = https.request ( options, function( res ) {
        var res_body = "";
        
        res.on( 'data', function ( chunk ) {
            res_body += chunk;
        } );
        
        req.on ( 'close', function () {
            
            var cal_events_raw = [];
            
            var doc = new xmldoc.XmlDocument ( res_body );            
            
            if ( doc.childNamed ( 'd:error' ) ) {
                var err = new Error ( doc.childNamed ( 'd:error' ).childNamed( 's:message' ) );
                cb ( err );
                return;
            }
            
            doc.eachChild ( function ( child, index, array ) {
                var data = child.valueWithPath ( "d:propstat.d:prop.cal:calendar-data" );
                cal_events_raw.push ( data );
            } );
            
            cb ( null, cal_events_raw );
            
        });
        
        req.on ( 'error', function ( err ) {
            cb ( err );
        } );
    });
    
    req.end ( req_payload );
};


