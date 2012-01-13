function ToonColorMaterial()
{
	this.color = null;
	this.alpha = 1;
	this.ignoreLighting = false;
}

Mp3D.registerMaterialClass(ToonColorMaterial);

ToonColorMaterial.getResourceDependencies = function()
{
	// register all resources needed for setup
	return [["toonColorVertexShader", "res/shaders/toonColorShader.vert"], ["toonColorFragmentShader", "res/shaders/toonColorShader.frag"]];
}

ToonColorMaterial.init = function()
{
	ToonColorMaterial.isInitialized = true;

	// load toon color shader
	var toonColorVertexShader = Mp3D.loadVertexShader("toonColorVertexShader");
	var toonColorFragmentShader = Mp3D.loadFragmentShader("toonColorFragmentShader");
		
	var toonColorShaderProgram = Mp3D.gl.createProgram();
    Mp3D.gl.attachShader(toonColorShaderProgram, toonColorVertexShader);
    Mp3D.gl.attachShader(toonColorShaderProgram, toonColorFragmentShader);
    Mp3D.gl.linkProgram(toonColorShaderProgram);

    if(!Mp3D.gl.getProgramParameter(toonColorShaderProgram, Mp3D.gl.LINK_STATUS))
    {
    	Mp3D.error("Could not initialise toon color shader.");
    }

	// set attributes
    toonColorShaderProgram.vertexPositionAttribute = Mp3D.gl.getAttribLocation(toonColorShaderProgram, "vertexPosition");
    toonColorShaderProgram.vertexNormalAttribute = Mp3D.gl.getAttribLocation(toonColorShaderProgram, "vertexNormal");

    // set uniforms
    toonColorShaderProgram.pMatrixUniform = Mp3D.gl.getUniformLocation(toonColorShaderProgram, "pMatrix");
    toonColorShaderProgram.mvMatrixUniform = Mp3D.gl.getUniformLocation(toonColorShaderProgram, "mvMatrix");
    toonColorShaderProgram.nMatrixUniform = Mp3D.gl.getUniformLocation(toonColorShaderProgram, "nMatrix");
    toonColorShaderProgram.color = Mp3D.gl.getUniformLocation(toonColorShaderProgram, "color");
    toonColorShaderProgram.alpha = Mp3D.gl.getUniformLocation(toonColorShaderProgram, "alpha");
    
    toonColorShaderProgram.lightDirection = Mp3D.gl.getUniformLocation(toonColorShaderProgram, "lightDirection");
    toonColorShaderProgram.lightPosition = Mp3D.gl.getUniformLocation(toonColorShaderProgram, "lightPosition");
    toonColorShaderProgram.lightAmbientColor = Mp3D.gl.getUniformLocation(toonColorShaderProgram, "lightAmbientColor");
    toonColorShaderProgram.lightDiffuseColor = Mp3D.gl.getUniformLocation(toonColorShaderProgram, "lightDiffuseColor");
    
    toonColorShaderProgram.ignoreLighting = Mp3D.gl.getUniformLocation(toonColorShaderProgram, "ignoreLighting");
    toonColorShaderProgram.lightType = Mp3D.gl.getUniformLocation(toonColorShaderProgram, "lightType");
    
    ToonColorMaterial.shaderProgram = toonColorShaderProgram;
}

ToonColorMaterial.prototype.setColor = function(colorString)
{
	var red = parseInt(colorString.slice(0, 2), 16)/255;
	var green = parseInt(colorString.slice(2, 4), 16)/255;
	var blue = parseInt(colorString.slice(4, 6), 16)/255;
	
	this.color = [red, green, blue];
}

ToonColorMaterial.prototype.setAlpha = function(alpha)
{
	this.alpha = alpha;
}

ToonColorMaterial.prototype.setIgnoreLighting = function(ignoreLighting)
{
	this.ignoreLighting = ignoreLighting;
}

ToonColorMaterial.prototype.enable = function()
{
    Mp3D.gl.enableVertexAttribArray(ToonColorMaterial.shaderProgram.vertexPositionAttribute);
    Mp3D.gl.enableVertexAttribArray(ToonColorMaterial.shaderProgram.vertexNormalAttribute);
}

ToonColorMaterial.prototype.disable = function()
{
    Mp3D.gl.disableVertexAttribArray(ToonColorMaterial.shaderProgram.vertexPositionAttribute);
    Mp3D.gl.disableVertexAttribArray(ToonColorMaterial.shaderProgram.vertexNormalAttribute);
}

ToonColorMaterial.prototype.setMatrixUniforms = function(mvMatrix)
{
	// set modelview and projection matrix
	Mp3D.gl.uniformMatrix4fv(ToonColorMaterial.shaderProgram.pMatrixUniform, false, Mp3D.pMatrix);
	Mp3D.gl.uniformMatrix4fv(ToonColorMaterial.shaderProgram.mvMatrixUniform, false, mvMatrix);
	
	// calculate and set normal matrix
	var normalMatrix = mat3.create();
    mat4.toInverseMat3(mvMatrix, normalMatrix);
    mat3.transpose(normalMatrix);

    Mp3D.gl.uniformMatrix3fv(ToonColorMaterial.shaderProgram.nMatrixUniform, false, normalMatrix);

	// set light information (if available)
	if(Mp3D.activeWorld && Mp3D.activeWorld.lights[0])
	{	
		Mp3D.gl.uniform3fv(ToonColorMaterial.shaderProgram.lightDirection, Mp3D.activeWorld.lights[0].relativeDirection);
		Mp3D.gl.uniform3fv(ToonColorMaterial.shaderProgram.lightPosition, Mp3D.activeWorld.lights[0].relativePosition);
		Mp3D.gl.uniform3fv(ToonColorMaterial.shaderProgram.lightAmbientColor, Mp3D.activeWorld.lights[0].ambientColor);
		Mp3D.gl.uniform3fv(ToonColorMaterial.shaderProgram.lightDiffuseColor, Mp3D.activeWorld.lights[0].diffuseColor);
		
    	Mp3D.gl.uniform1i(ToonColorMaterial.shaderProgram.lightType, Mp3D.activeWorld.lights[0].type);
	}
}

ToonColorMaterial.prototype.drawModel = function(model, mvMatrix)
{
	Mp3D.gl.useProgram(ToonColorMaterial.shaderProgram);
	
	this.enable();	
	this.setMatrixUniforms(mvMatrix);

	Mp3D.gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, model.vertexPositionBuffer);
    Mp3D.gl.vertexAttribPointer(ToonColorMaterial.shaderProgram.vertexPositionAttribute, model.vertexPositionBuffer.itemSize, WebGLRenderingContext.FLOAT, false, 0, 0);
    
	Mp3D.gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, model.vertexNormalBuffer);
    Mp3D.gl.vertexAttribPointer(ToonColorMaterial.shaderProgram.vertexNormalAttribute, model.vertexNormalBuffer.itemSize, WebGLRenderingContext.FLOAT, false, 0, 0);
    
    Mp3D.gl.bindBuffer(WebGLRenderingContext.ELEMENT_ARRAY_BUFFER, model.vertexIndexBuffer);
    
    if(this.color)
    {
    	Mp3D.gl.uniform3fv(ToonColorMaterial.shaderProgram.color, this.color);
    }
    
    Mp3D.gl.uniform1f(ToonColorMaterial.shaderProgram.alpha, this.alpha);
    Mp3D.gl.uniform1i(ToonColorMaterial.shaderProgram.ignoreLighting, this.ignoreLighting);

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

