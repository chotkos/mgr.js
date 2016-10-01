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
    }
});
