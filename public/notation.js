// <editor-fold ******** GLOBAL VARIABLES *********************** //
// TIMING ------------------------ >
var FRAMERATE = 60.0;
var MSPERFRAME = 1000.0 / FRAMERATE;
var SECPERFRAME = 1.0 / FRAMERATE;
var PXPERSEC = 150.0;
var PXPERMS = PXPERSEC / 1000.0;
var PXPERFRAME = PXPERSEC / FRAMERATE;
// COLORS ------------------------ >
var clr_seaGreen = new THREE.Color("rgb(0, 255, 108)");
// SVG --------------------------- >
var SVG_NS = "http://www.w3.org/2000/svg";
var SVG_XLINK = 'http://www.w3.org/1999/xlink';
// CLOCK ------------------------- >
var framect = 0;
var delta = 0.0;
var lastFrameTimeMs = 0.0;
// THREEJS SCENE ------------------ >
var camera, scene, renderer, canvas;
//// Camera Position Settings ///
var CAM_Z = 130;
var CAM_Y = -195;
// var CAM_Z = 0;
// var CAM_Y = -100;
var CAM_ROTATION_X = rads(0);
var RUNWAY_ROTATION_X = -25
//// Scene Size /////////////////
var SCENE_W = 250;
var SCENE_H = 600;
var RUNWAYLENGTH = 600;
var RUNWAYLENGTH_FRAMES = RUNWAYLENGTH / PXPERFRAME;
var TRACK_DIAMETER = 5;
var TRACK_Y_OFFSET = 3;
// </editor-fold> *********************************************** //
// <editor-fold ******** START UP SEQUENCE ********************** //
// 01 START TIME SYNC ENGINE ----- >
var ts = timesync.create({
  //server: 'https://safe-plateau-48516.herokuapp.com/timesync',
  server: '/timesync',
  interval: 1000
});
// 02 MAKE NOTATION OBJECTS ------ >

// 03 START CLOCK SYNC ----------- >
startClockSync();
// 04 BEGIN ANIMATION ------------ >
requestAnimationFrame(animationEngine);
// </editor-fold> *********************************************** //
// <editor-fold *********** CREATE SCENE ************************ //

// FUNCTION: createScene ------------------------------------------------------------- //
function create3jsScene(canvasDivId, w, h, length) {
  // CAMERA ////////////////////////////////////////////////////////////////////
  camera = new THREE.PerspectiveCamera(75, w / h, 1, 3000);
  camera.position.set(0, CAM_Y, CAM_Z);
  camera.rotation.x = rads(CAM_ROTATION_X);
  // SCENE /////////////////////////////////////////////////////////////////////
  scene = new THREE.Scene();
  // LIGHTS ////////////////////////////////////////////////////////////////////
  var sun = new THREE.DirectionalLight(0xFFFFFF, 1.2);
  // sun.position.set(100, 600, 175);
  sun.position.set(100, 600, 700);
  scene.add(sun);
  var sun2 = new THREE.DirectionalLight(0x40A040, 0.6);
  // sun2.position.set(-100, 350, 200);
  sun2.position.set(-100, 350, 775);
  scene.add(sun2);
  // RENDERER //////////////////////////////////////////////////////////////////
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(w, h);
  canvas = document.getElementById(canvasDivId);
  canvas.appendChild(renderer.domElement);
  // RUNWAY ////////////////////////////////////////////////////////////////////
  var t_runwayW = w * 0.67;
  var conveyor = new THREE.Group();
  var runwayMatl =
    new THREE.MeshLambertMaterial({
      color: 0x0040C0
    });
  var runwayGeom = new THREE.PlaneGeometry(
    t_runwayW,
    length,
  );
  var runway = new THREE.Mesh(runwayGeom, runwayMatl);
  runway.position.z = -length / 2;
  conveyor.add(runway);
  // TRACK ////////////////////////////////////////////////////////////////////
  var trgeom = new THREE.CylinderGeometry(TRACK_DIAMETER, TRACK_DIAMETER, length, 32);
  var trmatl = new THREE.MeshLambertMaterial({
    color: 0x708090
  });
  var tTr = new THREE.Mesh(trgeom, trmatl);
  tTr.position.z = -(length / 2);
  tTr.position.y = (-TRACK_DIAMETER / 2) + TRACK_Y_OFFSET;
  tTr.position.x = 0;
  conveyor.add(tTr);
  // FRETS ///////////////////////////////////////////////////////////////
  var fretGeom = new THREE.CylinderGeometry(2, 2, t_runwayW, 32);
  var fretMatl = new THREE.MeshLambertMaterial({
    color: clr_seaGreen
  });
  var t_numFrets = 20;
  var t_fretGap = RUNWAYLENGTH / t_numFrets;
  for (var i = 1; i < 30; i++) {
    var t_fret = new THREE.Mesh(fretGeom, fretMatl);
    t_fret.rotation.z = rads(-90);
    t_fret.position.z = -(length / 2);
    t_fret.position.y = (RUNWAYLENGTH / 2) - (t_fretGap * i);
    conveyor.add(t_fret);
  }

  var fingGeom = new THREE.SphereGeometry(9, 32, 32);
  var fingMatl = new THREE.MeshBasicMaterial({
    color: 0xffff00
  });
  var fing = new THREE.Mesh(fingGeom, fingMatl);
  fing.position.z = -(length / 2);
  fing.position.y = (RUNWAYLENGTH / 2);
  var followFretMatl = new THREE.MeshLambertMaterial({
    color: 0xffff00
  });
  var t_ffret = new THREE.Mesh(fretGeom, followFretMatl);
  t_ffret.rotation.z = rads(-90);
  t_ffret.position.z = -(length / 2);
  t_ffret.position.y = (RUNWAYLENGTH / 2);
  // MOVE FINGER ///////////////////////////////////////////////////////////////
  t_ffret.position.y = (RUNWAYLENGTH / 2) - 100;
  fing.position.y = (RUNWAYLENGTH / 2) - 100;
  //ADD growing yelow track a little bigger than track
  conveyor.add(t_ffret);
  conveyor.add(fing);
  // ROTATE GROUP ///////////////////////////////////////////////////////////////
  conveyor.rotation.x = rads(RUNWAY_ROTATION_X);
  scene.add(conveyor);
  // RENDER ///////////////////////////////////////////////////////////////
  renderer.render(scene, camera);
}
// MAKE SVG CANVAS ----------------------------------
function mkSVGcanvas(ix, w, h) {
  var tsvgCanvas = document.createElementNS(SVG_NS, "svg");
  tsvgCanvas.setAttributeNS(null, "width", w);
  tsvgCanvas.setAttributeNS(null, "height", h);
  var tcvsid = "svgcanvas" + ix.toString();
  tsvgCanvas.setAttributeNS(null, "id", tcvsid);
  tsvgCanvas.style.backgroundColor = "black";
  return tsvgCanvas;
}

function mkCanvasDiv(ix, w, h, clr) {
  var t_div = document.createElement("div");
  t_div.style.width = w.toString() + "px";
  t_div.style.height = h.toString() + "px";
  t_div.style.background = clr;
  t_div.id = "canvas" + ix.toString();
  return t_div;
}
var cvsDiv = mkCanvasDiv(0, SCENE_W, SCENE_H, '#000000');
mkpanel(0, cvsDiv, 'center-top', SCENE_W, SCENE_H, 'A String');
create3jsScene('canvas0', SCENE_W, SCENE_H, RUNWAYLENGTH);
// create3jsScene();
// MAKE JSPANEL -------------------------------------
function mkpanel(ix, content, posString, w, h, title) {
  var tpanel;
  jsPanel.create({
    position: posString,
    id: "panel" + ix,
    contentSize: w.toString() + " " + h.toString(),
    header: 'auto-show-hide',
    headerControls: {
      minimize: 'remove',
      smallify: 'remove',
      maximize: 'remove',
      close: 'remove'
    },
    contentOverflow: 'hidden',
    headerTitle: title,
    theme: "light",
    content: content,
    resizeit: {
      aspectRatio: 'content',
      resize: function(panel, paneldata, e) {}
    },
    callback: function() {
      tpanel = this;
    }
  });
  return tpanel;
}
// </editor-fold> *********************************************** //
// <editor-fold ********* ANIMATION ENGINE ********************** //
// UPDATE -------------------------------------------
function update(aMSPERFRAME, currTimeMS) {
  framect++;
}
// ANIMATION ENGINE ---------------------------------
function animationEngine(timestamp) {
  var t_now = new Date(ts.now());
  var t_lt = t_now.getTime();
  delta += t_lt - lastFrameTimeMs;
  lastFrameTimeMs = t_lt;
  while (delta >= MSPERFRAME) {
    update(MSPERFRAME, t_lt);
    delta -= MSPERFRAME;
  }
  requestAnimationFrame(animationEngine);
}
// </editor-fold> *********************************************** //
// <editor-fold ******** START UP FUNCTIONS ********************* //
// START PIECE ----------------------------------------
function startPiece() {
  startClockSync();
  requestAnimationFrame(animationEngine);
}
// CLOCK SYNC -----------------------------------------
function startClockSync() {
  var t_now = new Date(ts.now());
  lastFrameTimeMs = t_now.getTime();
}
// </editor-fold> *********************************************** //

/* NOTES
Make String Gliss Animation
Bring over ThreeJs

*/
