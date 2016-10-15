jQuery.extend({
    //return true if arrays are the same
    compareArrays: function (arrayA, arrayB) {
        if (arrayA.length != arrayB.length) {
            return false;
        }
        // sort modifies original array
        // (which are passed by reference to our method!)
        // so clone the arrays before sorting
        var a = jQuery.extend(true, [], arrayA);
        var b = jQuery.extend(true, [], arrayB);
        for (var i = 0, l = a.length; i < l; i++) {
            if (JSON.stringify(a) !== JSON.stringify(b)) {
                return false;
            }
        }
        return true;
    },
    queryStringToHash: function (query) {
        var query_string = {};
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            pair[0] = decodeURIComponent(pair[0]);
            pair[1] = decodeURIComponent(pair[1]);
            // If first entry with this name
            if (typeof query_string[pair[0]] === "undefined") {
                query_string[pair[0]] = pair[1];
                // If second entry with this name
            } else if (typeof query_string[pair[0]] === "string") {
                var arr = [query_string[pair[0]], pair[1]];
                query_string[pair[0]] = arr;
                // If third or later entry with this name
            } else {
                query_string[pair[0]].push(pair[1]);
            }
        }
        return query_string;
    },    
});

String.prototype.replaceAll = function(search,replacement){
    var target = this;
    return target.split(search).join(replacement);
}