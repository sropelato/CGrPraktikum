$(document).ready(function()
{
	if($.url.param("content") == "scene5")
	{
		key = new Array();
		oldKey = new Array();
		ignoredKeys = [32, 37, 38, 39, 40];
		
		shipSpeedMax = 14000;
		missiles = new Array();
	
		Mp3D.ready(function()
		{
			prepare();
		});
		Mp3D.init();

		function prepare()
		{
			// Array Remove - By John Resig (MIT Licensed)
			Array.prototype.remove = function(from, to)
			{
				var rest = this.slice((to || from) + 1 || this.length);
				this.length = from < 0 ? this.length + from : from;
				return this.push.apply(this, rest);
			};
			Array.prototype.removeObject = function(obj)
			{
				var index = $.inArray(obj, this);
				this.remove(index);
			}
		
			loadResources();
		}
		
		function loadResources()
		{
			ResourceManager.addRequest("spaceship", "res/models/ufo/ufo.moj", "xml");
			ResourceManager.addRequest("enemy", "res/models/ufo/ufo2.moj", "xml");
			ResourceManager.addRequest("fire1", "res/models/ufo/fire.moj", "xml");
			ResourceManager.addRequest("explosion", "res/models/ufo/explosion.moj", "xml");
			ResourceManager.addRequest("missile", "res/models/ufo/missile.moj", "xml");
			ResourceManager.addRequest("skybox", "res/models/skybox/skybox1.moj", "xml");
			ResourceManager.addDependencies(["spaceship", "enemy", "fire1", "explosion", "missile", "skybox"], setupScene);
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
			
			// load explosion bill board
			explosionNode = MojitoLoader.parseMojito(ResourceManager.data.explosion);
			explosionNode.visible = false;
			world.nodes.push(explosionNode);
			
			// create main node
			controlNode = new Node();
			world.nodes.push(controlNode);
			
			// add spaceship to scene
			spaceshipNode = MojitoLoader.parseMojito(ResourceManager.data.spaceship);
			spaceshipNode.scale([0.01, 0.01, 0.01]);
			controlNode.append(spaceshipNode);
			
			// load thrust fire model
			fireModelNode = MojitoLoader.parseMojito(ResourceManager.data.fire1);
			fireModelNode.scale([2, 2, 2]);
			fireModelNode.translate([0, 10, 0]);
			
			// add thrust fire to my ship		
			fireNode1 = new Node();
			spaceshipNode.append(fireNode1);
			fireNode1.append(fireModelNode);
			
			// add enemy to scene
			enemyNode = MojitoLoader.parseMojito(ResourceManager.data.enemy);
			enemyNode.scale([0.01, 0.01, 0.01]);
			enemyNode.translate([-10, 0, 10]);
			world.nodes.push(enemyNode);
			
			// add thrust fire to enemy ship
			fireNode2 = new Node();
			fireNode2.append(fireModelNode);
			enemyNode.append(fireNode2);
			
			// add missile to scene
			missileNode = MojitoLoader.parseMojito(ResourceManager.data.missile);
			missileNode.scale([0.006, 0.006, 0.006]);
			missileNode.translate([0, 0, 0]);
			
			// define a camera
			var camera = new Camera();
			cameraNode = new Node();
			camera.node = cameraNode;
			world.camera = camera;
			
			// append camera to control node
			controlNode.append(cameraNode);
			cameraNode.translate([0, 3, -20]);
			camera.lookAt(spaceshipNode.getAbsolutePosition());
			cameraNode.translate([0, 2, 0]);
				
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
			
			fireMaterialId = 0;
			explosionMaterialId = 0;
			explosionMaterialCounter = 0;
			
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
				shipYaw += Mp3D.degToRad(60) * elapsed;
			}			
			if(key[39])
			{
				// yaw right
				shipYaw -= Mp3D.degToRad(60) * elapsed;
			}
			if(key[38])
			{
				// increase height
				//shipYSpeed += 20 * elapsed;
			}			
			if(key[40])
			{
				// decreate height
				//shipYSpeed -= 20 * elapsed;
			}
			if(key[65])
			{
				// move left
				shipXSpeed += 40 * elapsed;
				shipRoll -= Mp3D.degToRad(60) * elapsed;
			}
			if(key[68])
			{
				// move right
				shipXSpeed -= 40 * elapsed;
				shipRoll += Mp3D.degToRad(60) * elapsed;
			}
			if(key[87])
			{
				// move forward
				shipZSpeed += 40 * elapsed;
				shipPitch += Mp3D.degToRad(60) * elapsed;
			}
			if(key[83])
			{
				// move backward
				shipZSpeed -= 40 * elapsed;
				shipPitch -= Mp3D.degToRad(60) * elapsed;
			}
			if(key[32] && !oldKey[32])
			{
				launchMissile = true;
			}
			oldKey[32] = key[32];
			
			// reduce values
			shipPitch = shipPitch * Math.pow(0.01, elapsed);
			shipRoll = shipRoll * Math.pow(0.01, elapsed);
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
				var newMissileNode = new Node();
				newMissileNode.append(missileNode);
				Mp3D.activeWorld.nodes.push(newMissileNode);

				newMissileNode.translate(controlNode.getAbsolutePosition());
				newMissileNode.rotate(shipYaw + Mp3D.degToRad(180), [0, 1, 0]);
				missiles.push(newMissileNode);
				
			}		
			
			// update existing missiles
			var missilesToBeRemoved = new Array();
			$.each(missiles, function()
			{				
				if(Mp3D.distance(this.getAbsolutePosition(), enemyNode.getAbsolutePosition()) < 5)
				{
					explosionNode.resetTransformation();
					explosionNode.scale([0.05, 0.05, 0.05]);
					explosionNode.translate(enemyNode.getAbsolutePosition());
					explosionNode.rotate(shipYaw, [0, 1, 0]);
					explosionNode.visible = true;
					
					explosionMaterialCounter = 100;
					explosionMaterialId = -1;
					
					// repostion enemy
					var enemyScale = enemyNode.getScale();
					enemyNode.resetTransformation();
					enemyNode.scale(enemyScale);
					enemyNode.translate([(Math.random()-0.5)*100, 0, (Math.random()-0.5)*100]);
					
					missilesToBeRemoved.push(this);
				}
				else if(Mp3D.distance(this.getAbsolutePosition(), controlNode.getAbsolutePosition()) > 1000)
				{
					missilesToBeRemoved.push(this);
				}
				this.translate2([0, 0, -50 * elapsed]);
			});
			$.each(missilesToBeRemoved, function()
			{
				missiles.removeObject(this);
				Mp3D.activeWorld.nodes.removeObject(this);
			});
			
			// change material of fire bill boards
			fireMaterialId++;
			if(fireMaterialId > 7)
				fireMaterialId = 0;
			fireNode1.assignMaterial(Mp3D.materials["Fire"+(fireMaterialId+1)]);
			
			// change material of explosion bill boards
			explosionMaterialCounter++;
			if(explosionMaterialCounter > 1)
			{
				explosionMaterialCounter = 0;
				explosionMaterialId++;
				if(explosionMaterialId > 9)
				{
					explosionMaterialId = 0;
					explosionNode.visible = false;
				}
			}
			explosionNode.assignMaterial(Mp3D.materials["Explosion"+(explosionMaterialId+1)]);
			
			// rotate explosion bill board
			var explosionNodeScale = explosionNode.getScale();
			var explosionNodePosition = explosionNode.getPosition();
			explosionNode.resetTransformation();
			explosionNode.scale(explosionNodeScale);
			explosionNode.translate(explosionNodePosition);
			explosionNode.rotate(shipYaw, [0, 1, 0]);
			
			
			// rotate enemy's fire bill board
 			var fireNode2Scale = fireNode2.getScale();
			var fireNode2Position = fireNode2.getPosition();
			fireNode2.resetTransformation();
			fireNode2.translate(fireNode2Position);
			fireNode2.scale(fireNode2Scale);
			fireNode2.rotate(shipYaw, [0, 1, 0]);
			
		
			Mp3D.drawScene();
			requestAnimFrame(main);
		}

	}
});

