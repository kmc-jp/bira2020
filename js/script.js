var scene = document.querySelector("a-scene");
AFRAME.registerComponent('registerevents', {
    init: function () {
        console.log("aaaaaaaaaaaaaaa")
        var marker = this.el;
        marker.addEventListener('markerFound', function() {
            var markerId = marker.id;
            console.log('markerFound', markerId);
            // TODO: Add your own code here to react to the marker being found.
            // document.querySelector("#bira1").emit("fade")
            Array.from(document.querySelectorAll("[id^='bira']"),  e => {e.emit("fade")})
        });

        marker.addEventListener('markerLost', function() {
            var markerId = marker.id;
            console.log('markerLost', markerId);
            // TODO: Add your own code here to react to the marker being lost.
        });
    }
});