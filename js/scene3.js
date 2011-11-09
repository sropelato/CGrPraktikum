$(document).ready(function()
{
	if($.url.param("content") == "scene3")
	{
		key = new Array();
		ignoredKeys = [37, 38, 39, 40];
	
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
			ResourceManager.addRequest("sun", "res/models/universe/sun.moj", "xml");
			ResourceManager.addRequest("earth", "res/models/universe/earth.moj", "xml");
			ResourceManager.addRequest("moon", "res/models/universe/moon.moj", "xml");
			ResourceManager.addRequest("skybox", "res/models/skybox/skybox1.moj", "xml");
			ResourceManager.addDependencies(["sun", "earth", "skybox"], setupScene);
			ResourceManager.loadAll();
		}
		
		function setupScene()
		{
			// setup world
			var world = new World();
			Mp3D.activeWorld = world;
			
			// create light source
			var light = new Light();
			light.type = 1;
			light.position = [0, 0, 0];
			light.ambientColor = [0.1, 0.1, 0.1];
			light.diffuseColor = [1.0, 1.0, 1.0];
			light.specularColor = [1.0, 1.0, 1.0];
			world.lights.push(light);	
			
			// define a camera
			var camera = new Camera();
			cameraNode = new Node();
				camera.node = cameraNode;
			world.camera = camera;
			
			// add sun to scene
			sunNode = MojitoLoader.parseMojito(ResourceManager.data.sun);
			sunNode.scale([0.05, 0.05, 0.05]);
			world.nodes.push(sunNode);
			
			// create earth orbit node
			earthOrbitNode = new Node();
			earthOrbitNode.translate([10, 0, 0]);
			world.nodes.push(earthOrbitNode);
			
			// add earth to scene
			earthNode = MojitoLoader.parseMojito(ResourceManager.data.earth);
			mat4.scale(earthNode.transformation, [0.01, 0.01, 0.01]);
			earthOrbitNode.append(earthNode);
			
			// create moon orbit node
			moonOrbitNode = new Node();
			earthOrbitNode.append(moonOrbitNode);
			
			// create moon node
			moonNode = MojitoLoader.parseMojito(ResourceManager.data.moon);
			moonNode.scale([0.002, 0.002, 0.002]);
			moonNode.translate([2, 0, 0]);
			moonOrbitNode.append(moonNode);
			
			// adjust camera
			cameraNode.translate([0, 0, 20]);		
			
			// add skybox
			skyboxNode = MojitoLoader.parseMojito(ResourceManager.data.skybox);
			mat4.scale(skyboxNode.transformation, [100, 100, 100]);
			world.nodes.push(skyboxNode);
				
			startGame();
		}
		
		// setup keyboard inputs
		Array.prototype.contains = function(value)
		{
			for (var key in this)
				if (this[key] === value) return true;
			return false;
		}
		$(window).keydown(function(event)
		{
			if(ignoredKeys.contains(event.which))
			{
				event.preventDefault();
			}
			key[event.which] = true;
			//console.log("key "+event.which+" pressed.");
	
		});
		$(window).keyup(function(event)
		{
			key[event.which] = false;
			//console.log("key "+event.which+" released.");
		});
		
		function startGame()
		{
			timeBefore = 0;
			camYaw = 0;
			camPitch = 0;
			
			earthOffsetAngle = 0;
			
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
			
			if(key[37])
			{
				// look left
				camYaw += 1 * elapsed;
			}			
			if(key[39])
			{
				// look right
				camYaw -= 1 * elapsed;
			}
			if(key[38])
			{
				// look up
				camPitch -= 1 * elapsed;
			}			
			if(key[40])
			{
				// look down
				camPitch += 1 * elapsed;
			}
			
			// update camera rotation
			if(key[37] || key[38] || key[39] || key[40])
			{
				var camPosition = Mp3D.activeWorld.camera.node.getAbsolutePosition();
				Mp3D.activeWorld.camera.node.resetTransformation();
				Mp3D.activeWorld.camera.node.translate(camPosition);				
				Mp3D.activeWorld.camera.node.rotate(camYaw, [0, 1, 0]);
				Mp3D.activeWorld.camera.node.rotate(camPitch, [1, 0, 0]);
			}
			
			if(key[87])
			{
				// move forward
				Mp3D.activeWorld.camera.node.translate2([0, 0, -10 * elapsed]);
			}
			if(key[83])
			{
				// move backward
				Mp3D.activeWorld.camera.node.translate2([0, 0, 10 * elapsed]);
			}
			if(key[65])
			{
				// move left
				Mp3D.activeWorld.camera.node.translate2([-10 * elapsed, 0, 0]);
			}
			if(key[68])
			{
				// move right
				Mp3D.activeWorld.camera.node.translate2([10 * elapsed, 0, 0]);
			}
			if(key[49])
			{
				// move down
				Mp3D.activeWorld.camera.node.translate2([0, -10 * elapsed, 0]);
			}
			if(key[50])
			{
				// move up
				Mp3D.activeWorld.camera.node.translate2([0, 10 * elapsed, 0]);
			}
			
			earthOffsetAngle += Mp3D.degToRad(5) * elapsed;
			
			var earthOffsetX = Math.sin(earthOffsetAngle) * 10;
			var earthOffsetZ = Math.cos(earthOffsetAngle) * 10;
			
			earthOrbitNode.resetTransformation();
			earthOrbitNode.translate([earthOffsetX, 0, earthOffsetZ]);
			earthOrbitNode.rotate(Mp3D.degToRad(30), [1, 0, 0]);
			
			moonOrbitNode.rotate(Mp3D.degToRad(40) * elapsed, [0, 1, 0]);
			
			sunNode.rotate(Mp3D.degToRad(1) * elapsed, [0, 1, 0]);
			earthNode.rotate(Mp3D.degToRad(20) * elapsed, [0, 1, 0]);
					
			Mp3D.drawScene();
			requestAnimFrame(main);
		}

	}
});

