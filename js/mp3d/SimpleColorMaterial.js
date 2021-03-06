function SimpleColorMaterial()
{
	this.color = null;
	this.alpha = 1;
	this.ignoreLighting = false;
}

Mp3D.registerMaterialClass(SimpleColorMaterial);

SimpleColorMaterial.getResourceDependencies = function()
{
	// register all resources needed for setup
	return [["simpleColorVertexShader", "res/shaders/simpleColorShader.vert"], ["simpleColorFragmentShader", "res/shaders/simpleColorShader.frag"]];
}

SimpleColorMaterial.init = function()
{
	SimpleColorMaterial.isInitialized = true;

	// load simple color shader
	var simpleColorVertexShader = Mp3D.loadVertexShader("simpleColorVertexShader");
	var simpleColorFragmentShader = Mp3D.loadFragmentShader("simpleColorFragmentShader");
		
	var simpleColorShaderProgram = Mp3D.gl.createProgram();
    Mp3D.gl.attachShader(simpleColorShaderProgram, simpleColorVertexShader);
    Mp3D.gl.attachShader(simpleColorShaderProgram, simpleColorFragmentShader);
    Mp3D.gl.linkProgram(simpleColorShaderProgram);

    if(!Mp3D.gl.getProgramParameter(simpleColorShaderProgram, Mp3D.gl.LINK_STATUS))
    {
    	Mp3D.error("Could not initialise simple color shader.");
    }

	// set attributes
    simpleColorShaderProgram.vertexPositionAttribute = Mp3D.gl.getAttribLocation(simpleColorShaderProgram, "vertexPosition");
    simpleColorShaderProgram.vertexNormalAttribute = Mp3D.gl.getAttribLocation(simpleColorShaderProgram, "vertexNormal");

    // set uniforms
    simpleColorShaderProgram.pMatrixUniform = Mp3D.gl.getUniformLocation(simpleColorShaderProgram, "pMatrix");
    simpleColorShaderProgram.mvMatrixUniform = Mp3D.gl.getUniformLocation(simpleColorShaderProgram, "mvMatrix");
    simpleColorShaderProgram.nMatrixUniform = Mp3D.gl.getUniformLocation(simpleColorShaderProgram, "nMatrix");
    simpleColorShaderProgram.color = Mp3D.gl.getUniformLocation(simpleColorShaderProgram, "color");
    simpleColorShaderProgram.alpha = Mp3D.gl.getUniformLocation(simpleColorShaderProgram, "alpha");
    
    simpleColorShaderProgram.lightDirection = Mp3D.gl.getUniformLocation(simpleColorShaderProgram, "lightDirection");
    simpleColorShaderProgram.lightPosition = Mp3D.gl.getUniformLocation(simpleColorShaderProgram, "lightPosition");
    simpleColorShaderProgram.lightAmbientColor = Mp3D.gl.getUniformLocation(simpleColorShaderProgram, "lightAmbientColor");
    simpleColorShaderProgram.lightDiffuseColor = Mp3D.gl.getUniformLocation(simpleColorShaderProgram, "lightDiffuseColor");
    
    simpleColorShaderProgram.ignoreLighting = Mp3D.gl.getUniformLocation(simpleColorShaderProgram, "ignoreLighting");
    simpleColorShaderProgram.lightType = Mp3D.gl.getUniformLocation(simpleColorShaderProgram, "lightType");
    
    SimpleColorMaterial.shaderProgram = simpleColorShaderProgram;
}

SimpleColorMaterial.prototype.setColor = function(colorString)
{
	var red = parseInt(colorString.slice(0, 2), 16)/255;
	var green = parseInt(colorString.slice(2, 4), 16)/255;
	var blue = parseInt(colorString.slice(4, 6), 16)/255;
	
	this.color = [red, green, blue];
}

SimpleColorMaterial.prototype.setAlpha = function(alpha)
{
	this.alpha = alpha;
}

SimpleColorMaterial.prototype.setIgnoreLighting = function(ignoreLighting)
{
	this.ignoreLighting = ignoreLighting;
}

SimpleColorMaterial.prototype.enable = function()
{
    Mp3D.gl.enableVertexAttribArray(SimpleColorMaterial.shaderProgram.vertexPositionAttribute);
    Mp3D.gl.enableVertexAttribArray(SimpleColorMaterial.shaderProgram.vertexNormalAttribute);
}

SimpleColorMaterial.prototype.disable = function()
{
    Mp3D.gl.disableVertexAttribArray(SimpleColorMaterial.shaderProgram.vertexPositionAttribute);
    Mp3D.gl.disableVertexAttribArray(SimpleColorMaterial.shaderProgram.vertexNormalAttribute);
}

SimpleColorMaterial.prototype.setMatrixUniforms = function(mvMatrix)
{
	// set modelview and projection matrix
	Mp3D.gl.uniformMatrix4fv(SimpleColorMaterial.shaderProgram.pMatrixUniform, false, Mp3D.pMatrix);
	Mp3D.gl.uniformMatrix4fv(SimpleColorMaterial.shaderProgram.mvMatrixUniform, false, mvMatrix);
	
	// calculate and set normal matrix
	var normalMatrix = mat3.create();
    mat4.toInverseMat3(mvMatrix, normalMatrix);
    mat3.transpose(normalMatrix);

    Mp3D.gl.uniformMatrix3fv(SimpleColorMaterial.shaderProgram.nMatrixUniform, false, normalMatrix);

	// set light information (if available)
	if(Mp3D.activeWorld && Mp3D.activeWorld.lights[0])
	{	
		Mp3D.gl.uniform3fv(SimpleColorMaterial.shaderProgram.lightDirection, Mp3D.activeWorld.lights[0].relativeDirection);
		Mp3D.gl.uniform3fv(SimpleColorMaterial.shaderProgram.lightPosition, Mp3D.activeWorld.lights[0].relativePosition);
		Mp3D.gl.uniform3fv(SimpleColorMaterial.shaderProgram.lightAmbientColor, Mp3D.activeWorld.lights[0].ambientColor);
		Mp3D.gl.uniform3fv(SimpleColorMaterial.shaderProgram.lightDiffuseColor, Mp3D.activeWorld.lights[0].diffuseColor);
		
    	Mp3D.gl.uniform1i(SimpleColorMaterial.shaderProgram.lightType, Mp3D.activeWorld.lights[0].type);
	}
}

SimpleColorMaterial.prototype.drawModel = function(model, mvMatrix)
{
	Mp3D.gl.useProgram(SimpleColorMaterial.shaderProgram);
	
	this.enable();	
	this.setMatrixUniforms(mvMatrix);

	Mp3D.gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, model.vertexPositionBuffer);
    Mp3D.gl.vertexAttribPointer(SimpleColorMaterial.shaderProgram.vertexPositionAttribute, model.vertexPositionBuffer.itemSize, WebGLRenderingContext.FLOAT, false, 0, 0);
    
	Mp3D.gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, model.vertexNormalBuffer);
    Mp3D.gl.vertexAttribPointer(SimpleColorMaterial.shaderProgram.vertexNormalAttribute, model.vertexNormalBuffer.itemSize, WebGLRenderingContext.FLOAT, false, 0, 0);
    
    Mp3D.gl.bindBuffer(WebGLRenderingContext.ELEMENT_ARRAY_BUFFER, model.vertexIndexBuffer);
    
    if(this.color)
    {
    	Mp3D.gl.uniform3fv(SimpleColorMaterial.shaderProgram.color, this.color);
    }
    
    Mp3D.gl.uniform1f(SimpleColorMaterial.shaderProgram.alpha, this.alpha);
    Mp3D.gl.uniform1i(SimpleColorMaterial.shaderProgram.ignoreLighting, this.ignoreLighting);

	if(this.alpha < 1)
    {
  		Mp3D.gl.blendFunc(WebGLRenderingContext.SRC_ALPHA, WebGLRenderingContext.ONE_MINUS_SRC_ALPHA);
		Mp3D.gl.enable(WebGLRenderingContext.BLEND);
		Mp3D.gl.disable(WebGLRenderingContext.DEPTH_TEST);	
	}

 	Mp3D.gl.drawElements(WebGLRenderingContext.TRIANGLES, model.vertexIndexBuffer.numItems, WebGLRenderingContext.UNSIGNED_SHORT, 0);
 
  	if(this.alpha < 1)
    {
		Mp3D.gl.disable(WebGLRenderingContext.BLEND);
		Mp3D.gl.enable(WebGLRenderingContext.DEPTH_TEST);
	}
 	 	
 	this.disable();
 }

