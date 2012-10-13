$(document).ready(function()
{
	if($.url.param("content") == "scene6")
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
			ResourceManager.addRequest("torus", "res/models/shaderTest/torus.moj", "xml");
			ResourceManager.addRequest("pillar", "res/models/shaderTest/pillar.moj", "xml");
			ResourceManager.addDependencies(["torus", "pillar"], setupScene);
			ResourceManager.loadAll();
		}
		
		function setupScene()
		{
			// setup world
			var world = new World();
			Mp3D.activeWorld = world;
			
			// create light source
			var light = new Light();
			light.type = 0; // directional
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
			
			// add torus to scene
			torusNode = MojitoLoader.parseMojito(ResourceManager.data.torus);
			mat4.translate(torusNode.transformation, [-7, 5, 0]);
			mat4.scale(torusNode.transformation, [0.015, 0.015, 0.015]);
			world.nodes.push(torusNode);
			
			// add torus to scene
			pillarNode = MojitoLoader.parseMojito(ResourceManager.data.pillar);
			mat4.translate(pillarNode.transformation, [7, 0, 0]);
			mat4.scale(pillarNode.transformation, [0.02, 0.02, 0.02]);
			world.nodes.push(pillarNode);
			
			// adjust camera direction
			cameraNode.translate([0, 5, 30]);
			//Mp3D.activeWorld.camera.lookAt([0, 0, 0]);
				
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
		
			torusNode.rotate(Mp3D.degToRad(30)*elapsed, [0, 1, 0]);
			pillarNode.rotate(Mp3D.degToRad(30)*elapsed, [0, 1, 0]);
		
			Mp3D.drawScene();
			requestAnimFrame(main);
		}
	}
});
