"use strict";


module.exports.format = function ( date, format_str ) {
    function left_padding ( num ) {
        return "" + ( ( num < 10 ) ? "0" + num: num );
    }
    
    var month_abbrev = "Jan Feb Mär Apr Mai Jun Jul Aug Sept Okt Nov Dez".split(" ");
    
    return format_str
                .replace ( 'y', date.getFullYear () )
    
                .replace ( 'm', date.getMonth () + 1 )
                .replace ( 'M', left_padding(date.getMonth () + 1 ) )
                
                .replace ( 'd', date.getDate () )
                .replace ( 'D', left_padding ( date.getDate () ) )
                 
                .replace ( 'h', date.getHours () )
                .replace ( 'H', left_padding ( date.getHours () ) )
                 
                .replace ( 'u', date.getMinutes () )
                .replace ( 'U', left_padding( date.getMinutes () ) )
                 
                .replace ( 's', date.getSeconds () )
                .replace ( 'S', left_padding ( date.getSeconds () ) )
                
                .replace ( 'b', month_abbrev[ date.getMonth () ] );
};


module.exports.parse_date_time = function ( date_time_str ) {
    var date_obj = null;
    
    var date_time_regex = /(\d{4})(\d{2})(\d{2})(T(\d{2})(\d{2})(\d{2})Z{0,1}){0,1}/;
    
    var regex_matches = date_time_str.match ( date_time_regex );
    
    if ( regex_matches ) {
        var year    = parseInt ( regex_matches[1] ),
            month   = parseInt ( regex_matches[2] ) - 1,
            day     = parseInt ( regex_matches[3] );
        
        if ( regex_matches[4] ) {
            var hour   = parseInt ( regex_matches[5] ),
                minute = parseInt ( regex_matches[6] ),
                second = parseInt ( regex_matches[7] );
                
            date_obj = new Date ( year, month, day, hour, minute, second, 0 );
            date_obj.withTime = true;
        }
        else {
            date_obj = new Date( year, month, day, 2, 1, 1, 1 );
            date_obj.withTime = false;
        }
    }
    
    return date_obj;
};


