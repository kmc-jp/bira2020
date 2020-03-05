var scene = document.querySelector("a-scene");
AFRAME.registerComponent('registerevents', {
    init: function () {
        var marker = this.el;

        marker.addEventListener('markerFound', function() {
            var markerId = marker.id;
            console.log('markerFound', markerId);
            // TODO: Add your own code here to react to the marker being found.
            
        });

        marker.addEventListener('markerLost', function() {
            var markerId = marker.id;
            console.log('markerLost', markerId);
            // TODO: Add your own code here to react to the marker being lost.
        });
    }
});