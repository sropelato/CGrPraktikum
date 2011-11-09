$(document).ready(function()
{
	if($.url.param("content") == "scene4")
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
			ResourceManager.addRequest("spaceship", "res/models/spaceship/spaceship2_with_wheels.moj", "xml");
			ResourceManager.addRequest("spaceshipShadow", "res/models/spaceship/spaceship2_with_wheels.moj", "xml");
			ResourceManager.addRequest("plane", "res/models/plane/plane.moj", "xml");
			ResourceManager.addDependencies(["spaceship", "spaceshipShadow", "plane"], setupScene);
			ResourceManager.loadAll();
		}
		
		function setupScene()
		{
			// setup world
			var world = new World();
			Mp3D.activeWorld = world;
			
			// create light source
			var light = new Light();
			light.direction = [-2, -1, -1];
			light.ambientColor = [0.1, 0.1, 0.1];
			light.diffuseColor = [1.0, 1.0, 1.0];
			light.specularColor = [1.0, 1.0, 1.0];
			world.lights.push(light);	
			
			// define a camera
			var camera = new Camera();
			cameraNode = new Node();
				camera.node = cameraNode;
			world.camera = camera;
						
			// add spaceship to scene
			spaceshipNode = MojitoLoader.parseMojito(ResourceManager.data.spaceship);
			mat4.translate(spaceshipNode.transformation, [0, 0, 0]);
			mat4.scale(spaceshipNode.transformation, [0.01, 0.01, 0.01]);
			world.nodes.push(spaceshipNode);
			
			// add spaceship shadow to scene
			spaceshipShadowNode = MojitoLoader.parseMojito(ResourceManager.data.spaceshipShadow);
			mat4.translate(spaceshipShadowNode.transformation, [0, -3, 0]);
			mat4.scale(spaceshipShadowNode.transformation, [0.01, 0.01, 0.01]);
			spaceshipShadowNode.assignMaterial(Mp3D.materials["Shadow"]);
			world.nodes.push(spaceshipShadowNode);
			
			// add plane
			planeNode = MojitoLoader.parseMojito(ResourceManager.data.plane);
			mat4.translate(planeNode.transformation, [0, -0.01, 0]);
			mat4.scale(planeNode.transformation, [100, 100, 100]);
			world.nodes.push(planeNode);
			
			// adjust camera
			cameraNode.translate([0, 10, 20]);
			camera.lookAt(spaceshipNode.getAbsolutePosition());
				
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
			
			var activeLight = Mp3D.activeWorld.lights[0];
			
			var shadowMatrix = mat4.create([1, 0, 0, 0, activeLight.direction[0]/-activeLight.direction[1], 0, activeLight.direction[2]/-activeLight.direction[1], 0, 0, 0, 1, 0, 0, 0, 0, 1]);
			
			spaceshipNode.rotate(Mp3D.degToRad(20) * elapsed, [0, 1, 0]);
			mat4.set(spaceshipNode.transformation, spaceshipShadowNode.transformation);
			
			mat4.multiply(shadowMatrix, spaceshipShadowNode.transformation, spaceshipShadowNode.transformation);
			
			
		
			Mp3D.drawScene();
			requestAnimFrame(main);
		}

	}
});

