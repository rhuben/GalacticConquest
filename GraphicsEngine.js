// This source is the javascript needed to build a simple moving
// cube in **three.js** based on this
// [example](https://raw.github.com/mrdoob/three.js/r44/examples/canvas_geometry_cube.html)
// It is the source about this [blog post](/blog/2011/08/06/lets-do-a-cube/).

// ## Now lets start

// declare a bunch of variable we will need later
var container;
var camera, scene, renderer, stats;
var cube;
var isMouseDown=false;
//var lastMouseX, lastMouseY;



var POIs=[];
POIs.push([[0,0,0], "red", "base"]);
POIs.push([[100,200,0], "blue", "harvestor"]);
POIs.push([[100,200,50], "blue", "fighter"]);
POIs.push([[100,100,50], "blue", "bomb"]);
POIs.push([[-100,-150,-200], "neutral", "planet"]);
POIs.push([[0,-200,-100], "red", "mobile monitor"]);
POIs.push([[0,-200,-50], "red", "static monitor"]);
POIs.push([[0,-100,-50], "red", "annihilator"]);



// initialize everything
init();
// make it move         
animate();

// ## Initialize everything
function init() {

    // create the camera
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.z = 1000;

    // create the Scene
    scene = new THREE.Scene();


    addLights();
    addAxes();
    drawPOIs();

    // create the container element
    container = document.createElement( 'div' );
    document.appendChild( container );

    // init the WebGL renderer and append it to the Dom
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );
    
    animate();

    addEventListeners();
}

function addLights()
{
    var pointLight1=new THREE.PointLight(0xAAAAAA);
    pointLight1.position.x = 1000;
    pointLight1.position.y = 1000;
    pointLight1.position.z = 1000;
    scene.add(pointLight1);
    
    var pointLight2=new THREE.PointLight(0xAAAAAA);
    pointLight2.position.x = -1000;
    pointLight2.position.y = -1000;
    pointLight2.position.z = -1000;
    scene.add(pointLight2); 
    
    var ambientLight = new THREE.AmbientLight( 0x222222 );
    scene.add( ambientLight );
}

function addAxes()
{
    var xAxis=new THREE.Mesh(new THREE.CylinderGeometry(1,1,2000,10,10), new THREE.MeshLambertMaterial({color: 0x000000}));
    scene.add(xAxis);
    var yAxis=new THREE.Mesh(new THREE.CylinderGeometry(1,1,2000,10,10), new THREE.MeshLambertMaterial({color: 0x000000}));
    yAxis.rotation.x=(Math.PI)/2;
    scene.add(yAxis);
    var zAxis=new THREE.Mesh(new THREE.CylinderGeometry(1,1,2000,10,10), new THREE.MeshLambertMaterial({color: 0x000000}));
    zAxis.rotation.z=(Math.PI)/2;
    scene.add(zAxis); 
}


function drawPOIs()
{
    for (var i=0;i<POIs.length;i++)
    {
        var location=POIs[i] [0];
        var alignment=POIs[i] [1];
        var type= POIs[i] [2];
        
        
        
        

        var geometry;
        var material=new THREE.MeshLambertMaterial();
        
        
        if (type=="planet")   geometry=new THREE.SphereGeometry(25,50,50);
        if (type=="base")   geometry = new THREE.CubeGeometry(40, 40, 40);
        if (type=="harvestor")   geometry = new THREE.TorusGeometry( 15, 4, 15, 15 );
        if (type=="mobile monitor")   geometry=new THREE.CylinderGeometry(10,10,10,10,10);
        if (type=="static monitor")   geometry=new THREE.CylinderGeometry(0,10,10,10,10);
        if (type=="fighter")  geometry=new THREE.CylinderGeometry(0, 7.5, 20, 4, 1); 
        if (type== "bomb")   geometry=new THREE.OctahedronGeometry(10); 
        if (type=="annihilator")   geometry=new THREE.SphereGeometry(15,40,40);
            
        var interestingMesh=new THREE.Mesh(geometry, material);

        
        var colorArray= [.7,.2,.6];
        
        if (alignment=="blue")
        {
            colorArray=[0,1,0];
        }
        
        if (alignment=="red")
        {
            colorArray=[1,0,0];
        }   
        
        
        interestingMesh.material.color.r=colorArray[0];
        interestingMesh.material.color.b=colorArray[1];
        interestingMesh.material.color.g=colorArray[2];
        
        interestingMesh.rotation.x=Math.random();
        interestingMesh.rotation.y=Math.random();
        interestingMesh.rotation.z=Math.random();
        
        

        interestingMesh.position.x=location[0];
        interestingMesh.position.y=location[1];
        interestingMesh.position.z=location[2];
        
        
        scene.add( interestingMesh );

        
        
        
        
    }
}


// ## Animate and Display the Scene
function animate() {
    requestAnimationFrame( animate );
    camera.lookAt( scene.position );

    renderer.render( scene, camera );
    
/*    // render the 3D scene
    render();
    // relaunch the 'timer' 
    requestAnimationFrame( animate );
    // update the stats */
}




function addEventListeners() {
    
    document.addEventListener('mousedown', onMouseDown, false);
    document.addEventListener('mouseup', onMouseUp, false);
    document.addEventListener('mousemove', onMouseMove, false);
    document.addEventListener('mousewheel', onMouseWheel, false);
    document.addEventListener('resize', onWindowResize, false);
    
    
  }

function onMouseDown()
{
    isMouseDown=true;
    lastMouseX=event.clientX;
    lastMouseY=event.clientY;
    
   
}

function onMouseUp()
{
    isMouseDown=false;
}

function onMouseMove()
{
    if(isMouseDown) {

            mouseX = ( event.clientX - window.innerWidth / 2 ) * 10;
            mouseY = ( event.clientY - window.innerHeight / 2 ) * 10;

      
      camera.position.x += ( mouseX - camera.position.x ) * .005;
      camera.position.y += ( - mouseY - camera.position.y ) * .01;

      
      /*        var currentMouseX=event.clientX;
      var currentMouseY=event.clientY;

    
    camera.position.x += currentMouseX-lastMouseX;
    camera.position.y += currentMouseY-lastMouseY;
    
    lastMouseX=currentMouseX;
    lastMouseY=currentMouseY; */
      
      
      
    }
}

function onMouseWheel()
{
    camera.position.z-=event.wheelDeltaY;

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;

    renderer.setSize( window.innerWidth, window.innerHeight );


}