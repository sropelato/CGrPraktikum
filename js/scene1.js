$(document).ready(function()
{
	if($.url.param("content") == "scene1" || $.url.param("content") == "")
	{
		Mp3D.ready(function()
		{
			prepare();
		});
		Mp3D.init();

		function prepare()
		{
			loadResources();
		}
		
		function loadResources()
		{
			ResourceManager.addRequest("earth", "res/models/universe/earth.moj", "xml");
			ResourceManager.addDependencies(["earth"], setupScene);
			ResourceManager.loadAll();
		}
		
		function setupScene()
		{
			// setup world
			var world = new World();
			Mp3D.activeWorld = world;
			
			// create light source
			var light = new Light();
			light.direction = [1, -1, -1];
			light.ambientColor = [0.1, 0.1, 0.1];
			light.diffuseColor = [1.0, 1.0, 1.0];
			light.specularColor = [1.0, 1.0, 1.0];
			world.lights.push(light);	
			
			// define a camera
			var camera = new Camera();
			cameraNode = new Node();
				camera.node = cameraNode;
			world.camera = camera;
			
			// add earth to scene
			earthNode = MojitoLoader.parseMojito(ResourceManager.data.earth);
			mat4.translate(earthNode.transformation, [0, 0, -20]);
			mat4.scale(earthNode.transformation, [0.08, 0.08, 0.08]);
			world.nodes.push(earthNode);
			
			// adjust camera direction
			cameraNode.translate([0, 15, 0]);
			Mp3D.activeWorld.camera.lookAt(earthNode.getAbsolutePosition());
				
			startGame();
		}
		
		function startGame()
		{
			timeBefore = 0;
			main();
		}
		
		function main()
		{
			var timeNow = new Date().getTime();
			
			if(timeBefore)
				elapsed = (timeNow-timeBefore)/1000;
			else
				elapsed = 0;
		
			timeBefore = timeNow;
		
			earthNode.rotate(Mp3D.degToRad(30)*elapsed, [0, 1, 0]);
		
			Mp3D.drawScene();
			requestAnimFrame(main);
		}
	}
});
