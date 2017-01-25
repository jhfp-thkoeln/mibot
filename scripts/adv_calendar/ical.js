"use strict";

var date_helper = require ( './date_helper' );


function resolve_ical_obj_depth (ical_obj, depth_logger) {

    for(var i in depth_logger) {
        var depth_name = depth_logger[i];

        if( !ical_obj[depth_name])
            ical_obj[depth_name] = {};

        ical_obj = ical_obj[depth_name];
    }

    return ical_obj;
};


module.exports = function( _ical_events_raw, _cb ) {

    return function ( ical_events_raw, cb ) {
        var ical_events         = [],
            depth_logger        = [],
            ical_obj_curr_depth = null;


        for ( var i in ical_events_raw ) {

            var data = ical_events_raw[i];

            var ical_arr = data.split ( '\n' ),
                ical_obj = {};

            for ( var j in ical_arr ) {
                var ical_kv = ical_arr[j].split ( ':' );
                var key = ical_kv[0],
                    val = ical_kv[1];

                switch ( key ) {
                    case 'BEGIN':
                        depth_logger.push ( val );
                        ical_obj_curr_depth = resolve_ical_obj_depth ( ical_obj, depth_logger );
                        break;
                    case 'END':
                        depth_logger.splice ( depth_logger.length - 1 );
                        ical_obj_curr_depth = resolve_ical_obj_depth ( ical_obj, depth_logger );
                        break;
                    default:
                        key = key.replace ( /;TZID=.*/i, '' );

                        ical_obj_curr_depth[key] = val;
                        break;
                }
            }

            ical_events.push ( ical_obj );
        }

        ical_events.sort ( function( a, b) {
            var event_a     = a['VCALENDAR']['VEVENT'];
            var event_b     = b['VCALENDAR']['VEVENT'];
            var startdate_a = event_a['DTSTART;VALUE=DATE-TIME'] || event_a['DTSTART;VALUE=DATE'] || event_a['DTSTART'];
            var startdate_b = event_b['DTSTART;VALUE=DATE-TIME'] || event_b['DTSTART;VALUE=DATE'] || event_b['DTSTART'];

            startdate_a = date_helper.parse_date_time ( startdate_a );
            startdate_b = date_helper.parse_date_time( startdate_b );

            if( startdate_a.getTime () < startdate_b.getTime () )
                return -1;
            else if ( startdate_a.getTime () > startdate_b.getTime () )
                return 1;

            return 0;
        } );

        cb ( null, ical_events );

    }( _ical_events_raw, _cb );
};

