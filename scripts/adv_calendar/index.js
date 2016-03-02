"use strict";

var path        = require ( 'path' );

var str_sim     = require ( 'string-similarity' );

var caldav      = require ( './caldav' );
var ical        = require ( './ical' );
var date_helper = require ( './date_helper' );



var user    = 'user',
    pass    = 'pass',
    url     = 'http://localhost';


var caldav_options = {
    user    : ( process.env.CALDAV_USER || user ).toLowerCase (),
    pass    :   process.env.CALDAV_PASS || pass,
    url     :   process.env.CALDAV_URL  || url
};


var event_list_cache = null,
    last_event_request_time = 0;


module.exports = function( cmd, cb ) {
    var now = new Date (),
        refresh_cache = false;
    
    if ( event_list_cache && ((now.getTime () - last_event_request_time) < 5 * 60 * 1000) ) {
        
        var filtered_events = filter_events_by_command ( event_list_cache, cmd );
        var result_str = stringify_events ( filtered_events , cmd );
            
        cb ( result_str );
        
        return;
    }
    
    
    caldav ( caldav_options, function ( err, ical_events_raw ) {

        ical( ical_events_raw, function( err, ical_events ) {
            
            var event_list = ical_events.map ( function ( event ) {
            
                var event = event['VCALENDAR']['VEVENT'];
                
                var startdate = event['DTSTART;VALUE=DATE-TIME'] || event['DTSTART;VALUE=DATE'] || event['DTSTART'];
                var enddate   = event['DTEND;VALUE=DATE-TIME'] || event['DTEND;VALUE=DATE'] || event['DTEND'];
                
                startdate = date_helper.parse_date_time ( startdate );
                enddate   = date_helper.parse_date_time ( enddate );
                
                return {
                    summary:    event['SUMMARY'],
                    startdate:  startdate,
                    enddate:    enddate
                };
            });
            
            event_list_cache = event_list;
            
            var filtered_events = filter_events_by_command ( event_list, cmd );
            var result_str = stringify_events ( filtered_events , cmd );
            
            last_event_request_time = now.getTime ();
            
            cb ( result_str );
        } );
    } );
}



function calc_date (cmd, resetTime, given_date ) {
    
    if ( !given_date )
        given_date = new Date ();
    
    var matches = cmd.match ( /([\+\-]{0,1}\d+)(\w)/i );
    
    if ( matches && matches.length > 2 ) {
        var val  = parseInt ( matches[1] );
        var type = matches[2].toLowerCase ();
        
        var millisecs = 0;
        
        switch ( type ) {
            case 'd':
                millisecs = 24 * 60 * 60 * 1000;
                break;
            case 'w':
                millisecs = 7 * 24 * 60 * 60 * 1000;
                break;
            case 'm':
                millisecs = 30 * 24 * 60 * 60 * 1000;
                break;
        }
        
        given_date = new Date ( given_date.getTime () + ( millisecs * val ) );
    }
    
    return (resetTime) ? new Date(given_date.getFullYear(), given_date.getMonth(), given_date.getDate(), 0, 0, 0): given_date;
}



function events_between ( event_list, startdate, enddate ) {
    return event_list.filter ( function ( event ) {
        var event_startdate = event.startdate;
    
        return      event_startdate.getTime() > startdate.getTime()
                &&  event_startdate.getTime() < enddate.getTime();
    } );
}


function events_now ( event_list ) {
    var now = new Date();
    
    return event_list.filter ( function ( event ) {
        var event_startdate = event.startdate,
            event_enddate   = event.enddate;
        
        return      event_startdate.getTime() < now.getTime()
                &&  event_enddate.getTime() > now.getTime();
    } );
}


function events_by_keyword ( event_list, keyword ) {
    return event_list.filter ( function ( event ) {
        return str_sim.compareTwoStrings( keyword, event.summary ) > 0.1;
    } );
}


function filter_events_by_command ( event_list, cmd_str ) {
    var now = new Date ( ),
        matches = null,
        filtered_by_keyword = false,
        filtered_by_time   = false;
    
    // remove older events
    event_list = event_list.filter ( function ( event ) {
        return event.enddate.getTime() > now.getTime();
    } );
    
    
    // tomorrow
    matches = cmd_str.match ( /morgen/i );
    if ( matches ) {
        var tomorrow_startdate = calc_date ( "+1d", true, new Date () ),
            tomorrow_enddate   = calc_date ( "+1d", true, tomorrow_startdate );
        
        event_list = events_between ( event_list, tomorrow_startdate, tomorrow_enddate );
        
        // blocking all other matching operations
        filtered_by_time = true;
    }
    
    
    // current events
    matches = cmd_str.match ( /aktuell|gerade|jetzt/i );
    if ( !filtered_by_time && matches ) {
        event_list = events_now ( event_list );
        
        // blocking all other matching operations
        filtered_by_time = true;
    }
    
    
    // this week
    matches = cmd_str.match ( /(diese|momentane|aktuelle)\s+woche/i );
    if ( !filtered_by_time && matches ) {
        var now = new Date ();
        var weekday = now.getDay ();
        
        if ( weekday > 0 ) { // not sunday
            var date_diff_str = "-" + ( weekday - 1 ) + "d";
            var day_weekbegin = calc_date ( date_diff_str, true );
            var day_weekend   = calc_date ( "+7d", day_weekbegin );
            
            event_list = events_between ( event_list, day_weekbegin, day_weekend );
            
            // blocking all other matching operations
            filtered_by_time = true;
        }
    }
    
    
    
    // this month
    matches = cmd_str.match ( /(diesen|momentanen|aktuellen)\s+monat/i );
    if ( !filtered_by_time && matches ) {
        var now = new Date();
        var weekday = now.getDay ();
        
        var day_monthbegin = new Date ();
        day_monthbegin.setDate ( 1 );
        day_monthbegin = calc_date ( "", true, day_monthbegin );
        
        var day_monthend = calc_date ( "+1m", false, day_monthbegin );
        
        
        event_list = events_between ( event_list, day_monthbegin, day_monthend );
            
        // blocking all other matching operations
        filtered_by_time = true;
    }
    
    // events between now and a given timespan
    matches = cmd_str.match ( /in\s+den\s+nächsten\s+(.*?)\s+(\w*)/i );
    if ( !filtered_by_time && matches && matches.length > 2 ) {
        
        var zahlen = "ein zwei drei vier fünf sechs sieben acht neun zehn".split ( " " );
        
        var timespan_val = matches[1].toLowerCase (),
            type         = matches[2].toLowerCase ();

        var parsed_val = parseInt ( timespan_val );
        if ( isNaN (parsed_val) ) {
            var val = zahlen.indexOf ( timespan_val );
            
            // Unknown value
            if ( val < 0 )
                return [];
            
            parsed_val = val + 1;
        }
        
        switch ( type ) {
            case 'wochen':
                type = 'w';
                break;
            case 'monaten':
                type = 'm';
                break;
            default:
                // Unknwon type
                return [];
        }
        
        var date_diff_str = "+" + parsed_val + "" + type;
        
        var day_begin = new Date (),
            day_end   = calc_date ( date_diff_str , false, day_begin);
        
        event_list = events_between ( event_list, day_begin, day_end );
        
        // blocking all other matching operations
        filtered_by_time = true;
    }
    
    
    // from date to date
    matches = cmd_str.match ( /(vom\s+){0,1}(\d{1,2}\.\d{1,2}\.\d{2,4})\s+bis\s+(zum\s+){0,1}(\d{1,2}\.\d{1,2}\.\d{2,4})/i );
    if ( !filtered_by_time && matches && matches.length > 4) {
        
        function parse_date ( date_str ) {
            var date = null;
        
            var matches = date_str.match ( /(\d{1,2})\.(\d{1,2})\.(\d{2,4})/ );
            
            if ( matches && matches.length > 3 ) {
            
                if ( matches[3].length === 2 )
                    matches[3] = "20" + matches[3];
            
                var day   = parseInt ( matches[1] ),
                    month = parseInt ( matches[2] ) - 1,
                    year  = parseInt ( matches[3]);
                
                
                date = new Date (year, month, day, 0, 0, 0);
            }
            
            return date;
        }
        
        var date_begin_str = matches[2],
            date_end_str   = matches[4];
        
        var day_begin = parse_date ( date_begin_str ),
            day_end   = parse_date ( date_end_str );
        
        // correction ending day
        day_end = calc_date ( "+1d", false, day_end );
        
        // not a valid date
        if ( !day_begin || !day_end )
            return [];
        
        event_list = events_between ( event_list, day_begin, day_end );
            
        // blocking all other matching operations
        filtered_by_time = true;
    }
    
    
    // by keyword
    matches = cmd_str.match ( /betreffend\s+(\w*)/i );
    if ( matches && matches.length > 1 ) {
        var keyword = matches[1];
        event_list = events_by_keyword ( event_list, keyword);
        
        filtered_by_keyword = true;
    }
    
    // retunring an empty event list if no filter was used -> unrecognized command
    if ( cmd_str.length > 0 && !filtered_by_time && !filtered_by_keyword ) {
        return [];
    }
    
    
    return event_list;
}

function stringify_events ( event_list, cmd_str ) {

    if ( event_list.length === 0 ) {
        return "\nKeine Events" + ( (cmd_str) ? " für \"" + cmd_str + "\" ": "" ) + " gefunden!\n";
    }

    var now = new Date(),
        str_arr = [];
    
    str_arr.push ( "" );
    str_arr.push ( "Heute ist der "  + date_helper.format ( now, "D. b y" ) + "!" );
    str_arr.push ( "" );
    str_arr.push ( "Gefundene Events" + ( (cmd_str) ? " für \"" + cmd_str + "\"": "" ) + ":" );
    str_arr.push ( "" );


    event_list.forEach ( function ( event ) {
        var startdate = event.startdate;
        var enddate   = event.enddate;

        var str = "";

        if(     startdate.getDate () !== enddate.getDate ()  
            ||  startdate.getMonth( ) !== enddate.getMonth ()
            ||  startdate.getFullYear () !== enddate.getFullYear () ) {

            var startdate_str = date_helper.format ( startdate, "D." );
            
            if ( startdate.getMonth () !== enddate.getMonth () )
                startdate_str += date_helper.format ( startdate, " b" );
            
            if ( startdate.getFullYear () !== enddate.getFullYear () )
                startdate_str += date_helper.format ( startdate, " y" );

            
            var enddate_str = date_helper.format ( enddate,   "D. b y" );

            str = "*" + event.summary + "*  " + startdate_str + " - " + enddate_str;
        }
        else {
            var day_str       = date_helper.format ( startdate, "D. b y" ),
                starttime_str = date_helper.format ( startdate, "H" ),
                endtime_str   = date_helper.format ( enddate, "H" );
            
            if(startdate.getMinutes() !== 0 || enddate.getMinutes() !== 0) {
                starttime_str += date_helper.format ( startdate, ":U" );
                endtime_str   += date_helper.format ( enddate, ":U" );
            }
            
            str = "*" + event.summary + "*  " + day_str + " von " + starttime_str + "-" + endtime_str + " Uhr";
        }

        str_arr.push ( str );
    } );
    
    str_arr.push ( "" );

    return str_arr.join ( "\n" );
}

