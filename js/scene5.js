$(document).ready(function()
{
	if($.url.param("content") == "scene5")
	{
		key = new Array();
		oldKey = new Array();
		ignoredKeys = [32, 37, 38, 39, 40];
		
		shipSpeedMax = 14000;
		shipRollMax = 1.3;
	
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
			ResourceManager.addRequest("spaceship", "res/models/ufo/ufo.moj", "xml");
			ResourceManager.addRequest("enemy", "res/models/ufo/ufo2.moj", "xml");
			ResourceManager.addRequest("missile", "res/models/ufo/missile.moj", "xml");
			ResourceManager.addRequest("skybox", "res/models/skybox/skybox1.moj", "xml");
			ResourceManager.addDependencies(["spaceship", "enemy", "missile", "skybox"], setupScene);
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
			light.ambientColor = [0.4, 0.4, 0.4];
			light.diffuseColor = [1.0, 1.0, 1.0];
			light.specularColor = [1.0, 1.0, 1.0];
			world.lights.push(light);				
			
			// add skybox
			skyboxNode = MojitoLoader.parseMojito(ResourceManager.data.skybox);
			skyboxNode.scale([10, 10, 10]);
			world.nodes.push(skyboxNode);
			
			// create main node
			controlNode = new Node();
			world.nodes.push(controlNode);
			
			// add spaceship to scene
			spaceshipNode = MojitoLoader.parseMojito(ResourceManager.data.spaceship);
			spaceshipNode.scale([0.01, 0.01, 0.01]);
			controlNode.append(spaceshipNode);
			
			// add enemy to scene
			enemyNode = MojitoLoader.parseMojito(ResourceManager.data.enemy);
			enemyNode.scale([0.01, 0.01, 0.01]);
			enemyNode.translate([-10, 0, 10]);
			world.nodes.push(enemyNode);
			
			// add missile to scene
			missileNode = MojitoLoader.parseMojito(ResourceManager.data.missile);
			missileNode.scale([0.01, 0.01, 0.01]);
			missileNode.translate([0, 0, 0]);
			world.nodes.push(missileNode);
			
			// define a camera
			var camera = new Camera();
			cameraNode = new Node();
			camera.node = cameraNode;
			world.camera = camera;
			
			// append camera to control node
			controlNode.append(cameraNode);
			cameraNode.translate([0, 2, -20]);
			camera.lookAt(spaceshipNode.getAbsolutePosition());
				
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
			shipYaw = 0;
			shipPitch = 0;
			shipRoll = 0;
			
			shipXSpeed = 0;
			shipYSpeed = 0;
			shipZSpeed = 0;
			
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
			
			var launchMissile = false;
			
			if(key[37])
			{
				// yaw left
				shipYaw += 1 * elapsed;
			}			
			if(key[39])
			{
				// yaw right
				shipYaw -= 1 * elapsed;
			}
			if(key[38])
			{
				// increase height
				shipYSpeed += 20 * elapsed;
			}			
			if(key[40])
			{
				// decreate height
				shipYSpeed -= 20 * elapsed;
			}
			if(key[65])
			{
				// move left
				shipXSpeed += 40 * elapsed;
				shipRoll -= 1 * elapsed;
			}
			if(key[68])
			{
				// move right
				shipXSpeed -= 40 * elapsed;
				shipRoll += 1 * elapsed;
			}
			if(key[87])
			{
				// move forward
				shipZSpeed += 40 * elapsed;
				shipPitch += 1 * elapsed;
			}
			if(key[83])
			{
				// move backward
				shipZSpeed -= 40 * elapsed;
				shipPitch -= 1 * elapsed;
			}
			if(key[32] && !oldKey[32])
			{
				launchMissile = true;
			}
			oldKey[32] = key[32];
			
			// reduce values
			shipPitch = shipPitch * Math.pow(0.05, elapsed);
			shipRoll = shipRoll * Math.pow(0.05, elapsed);
			shipXSpeed = shipXSpeed * Math.pow(0.1, elapsed);	
			shipYSpeed = shipYSpeed * Math.pow(0.1, elapsed);		
			shipZSpeed = shipZSpeed * Math.pow(0.1, elapsed);		
			
			//console.log(shipXSpeed);
						
			// update ship position
			controlNode.translate2([shipXSpeed * elapsed, shipYSpeed * elapsed, shipZSpeed * elapsed]);
			
			// update ship rotation
			var shipPosition = controlNode.getAbsolutePosition();
			var shipScale = spaceshipNode.getScale();
			
			controlNode.resetTransformation();
			spaceshipNode.resetTransformation();
	
			controlNode.translate(shipPosition);
			controlNode.rotate(shipYaw, [0, 1, 0]);
			
			spaceshipNode.scale(shipScale);
			spaceshipNode.rotate(shipPitch, [1, 0, 0]);
			spaceshipNode.rotate(shipRoll, [0, 0, 1]);
			
			if(launchMissile)
			{
				var missileScale = missileNode.getScale();
				missileNode.setTransformation(controlNode.getAbsoluteTransformation());
				missileNode.scale(missileScale);
				missileNode.rotate(Mp3D.degToRad(180), [0, 1, 0]);
				//missileNode.rotate()
			}
			
			missileNode.translate2([0, 0, -10000 * elapsed]);
		
			//Mp3D.activeWorld.camera.lookAt(spaceshipNode.getAbsolutePosition());
		
			Mp3D.drawScene();
			requestAnimFrame(main);
		}

	}
});

