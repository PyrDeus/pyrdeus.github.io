(function () {
  var globe = planetaryjs.planet();

  globe.loadPlugin(autorotate(6));

  globe.loadPlugin(
    planetaryjs.plugins.earth({
      topojson: {
        file: "scripts/world-110m.json",
      },
      oceans: { fill: "#000080" },
      land: { fill: "#339966" },
      borders: { stroke: "#008000" },
    }),
  );

  globe.loadPlugin(planetaryjs.plugins.pings());

  globe.loadPlugin(
    planetaryjs.plugins.zoom({
      scaleExtent: [100, 300],
    }),
  );

  globe.loadPlugin(
    planetaryjs.plugins.drag({
      onDragStart: function () {
        this.plugins.autorotate.pause();
      },
      onDragEnd: function () {
        this.plugins.autorotate.resume();
      },
    }),
  );

  var canvas = document.getElementById("rotatingGlobe");
  if (!canvas) {
    return;
  }

  function resizeGlobe() {
    var rect = canvas.getBoundingClientRect();
    var size = Math.min(rect.width, rect.height);
    var resolution = window.devicePixelRatio || 1;
    canvas.width = Math.floor(size * resolution);
    canvas.height = Math.floor(size * resolution);
    var context = canvas.getContext("2d");
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.scale(resolution, resolution);
    globe.projection
      .scale(size / 2)
      .translate([size / 2, size / 2])
      .rotate([0, -10, 0]);
  }

  resizeGlobe();
  window.addEventListener("resize", resizeGlobe);

  var colors = ["red", "yellow", "white", "orange", "green", "cyan", "pink"];
  setInterval(function () {
    var lat = Math.random() * 170 - 85;
    var lng = Math.random() * 360 - 180;
    var color = colors[Math.floor(Math.random() * colors.length)];
    globe.plugins.pings.add(lng, lat, {
      color: color,
      ttl: 2000,
      angle: Math.random() * 10,
    });
  }, 150);

  globe.draw(canvas);

  function autorotate(degPerSec) {
    return function (planet) {
      var lastTick = null;
      var paused = false;
      planet.plugins.autorotate = {
        pause: function () {
          paused = true;
        },
        resume: function () {
          paused = false;
        },
      };
      planet.onDraw(function () {
        if (paused || !lastTick) {
          lastTick = new Date();
        } else {
          var now = new Date();
          var delta = now - lastTick;
          var rotation = planet.projection.rotate();
          rotation[0] += (degPerSec * delta) / 1000;
          if (rotation[0] >= 180) {
            rotation[0] -= 360;
          }
          planet.projection.rotate(rotation);
          lastTick = now;
        }
      });
    };
  }
})();
