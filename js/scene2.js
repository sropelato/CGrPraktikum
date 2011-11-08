$(document).ready(function()
{
	if($.url.param("content") == "scene2")
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
			ResourceManager.addRequest("spaceship", "res/models/spaceship/spaceship2.moj", "xml");
			ResourceManager.addRequest("skybox", "res/models/skybox/skybox1.moj", "xml");
			ResourceManager.addDependencies(["spaceship", "skybox"], setupScene);
			ResourceManager.loadAll();
		}
		
		function setupScene()
		{
			// setup world
			var world = new World();
			Mp3D.activeWorld = world;
			
			// create light source
			var light = new Light();
			light.direction = [-1, -1, 0.2];
			light.ambientColor = [0.1, 0.1, 0.1];
			light.diffuseColor = [1.0, 1.0, 1.0];
			light.specularColor = [1.0, 1.0, 1.0];
			world.lights.push(light);	
			
			// define a camera
			var camera = new Camera();
			cameraNode = new Node();
				camera.node = cameraNode;
			world.camera = camera;
			
			cameraNode.translate([10, 5, 0]);
			
			// add spaceship to scene
			spaceshipNode = MojitoLoader.parseMojito(ResourceManager.data.spaceship);
			mat4.translate(spaceshipNode.transformation, [0, 0, -100]);
			mat4.scale(spaceshipNode.transformation, [0.01, 0.01, 0.01]);
			world.nodes.push(spaceshipNode);
			
			// add skybox
			skyboxNode = MojitoLoader.parseMojito(ResourceManager.data.skybox);
			mat4.scale(skyboxNode.transformation, [100, 100, 100]);
			world.nodes.push(skyboxNode);
				
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
		
			//spaceshipNode.rotate(Mp3D.degToRad(30)*elapsed, [0, 1, 0]);
			spaceshipNode.translate([0, 0, 20 * elapsed]);
			
			Mp3D.activeWorld.camera.lookAt(spaceshipNode.getAbsolutePosition());
		
			Mp3D.drawScene();
			requestAnimFrame(main);
		}

	}
});

