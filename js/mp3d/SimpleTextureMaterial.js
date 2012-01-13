function SimpleTextureMaterial()
{
	this.texture = null;
	this.alpha = 1;
	this.useTextureAlpha = false;
	this.blendMode = 0; // 0 = alpha, 1 = multiply
}

Mp3D.registerMaterialClass(SimpleTextureMaterial);

SimpleTextureMaterial.getResourceDependencies = function()
{
	// register all resources needed for setup
	return [["simpleTextureVertexShader", "res/shaders/simpleTextureShader.vert"], ["simpleTextureFragmentShader", "res/shaders/simpleTextureShader.frag"]];
}

SimpleTextureMaterial.init = function()
{
	SimpleTextureMaterial.isInitialized = true;

	// load simple texture shader
	var simpleTextureVertexShader = Mp3D.loadVertexShader("simpleTextureVertexShader");
	var simpleTextureFragmentShader = Mp3D.loadFragmentShader("simpleTextureFragmentShader");
	
	var simpleTextureShaderProgram = Mp3D.gl.createProgram();
    Mp3D.gl.attachShader(simpleTextureShaderProgram, simpleTextureVertexShader);
    Mp3D.gl.attachShader(simpleTextureShaderProgram, simpleTextureFragmentShader);
    Mp3D.gl.linkProgram(simpleTextureShaderProgram);

    if(!Mp3D.gl.getProgramParameter(simpleTextureShaderProgram, WebGLRenderingContext.LINK_STATUS))
    {
    	Mp3D.error("Could not initialise simple texture shader.");
    }

	// set attributes
    simpleTextureShaderProgram.vertexPositionAttribute = Mp3D.gl.getAttribLocation(simpleTextureShaderProgram, "vertexPosition");
    simpleTextureShaderProgram.vertexNormalAttribute = Mp3D.gl.getAttribLocation(simpleTextureShaderProgram, "vertexNormal");
    simpleTextureShaderProgram.vertexTexCoordAttribute = Mp3D.gl.getAttribLocation(simpleTextureShaderProgram, "vertexTexCoord");
    
    // set uniforms
    simpleTextureShaderProgram.pMatrixUniform = Mp3D.gl.getUniformLocation(simpleTextureShaderProgram, "pMatrix");
    simpleTextureShaderProgram.mvMatrixUniform = Mp3D.gl.getUniformLocation(simpleTextureShaderProgram, "mvMatrix");
    simpleTextureShaderProgram.nMatrixUniform = Mp3D.gl.getUniformLocation(simpleTextureShaderProgram, "nMatrix");
    simpleTextureShaderProgram.textureSampler = Mp3D.gl.getUniformLocation(simpleTextureShaderProgram, "textureSampler");
    simpleTextureShaderProgram.alpha = Mp3D.gl.getUniformLocation(simpleTextureShaderProgram, "alpha");
    simpleTextureShaderProgram.blendMode = Mp3D.gl.getUniformLocation(simpleTextureShaderProgram, "blendMode");
    simpleTextureShaderProgram.useTextureAlpha = Mp3D.gl.getUniformLocation(simpleTextureShaderProgram, "useTextureAlpha");
    
    simpleTextureShaderProgram.lightDirection = Mp3D.gl.getUniformLocation(simpleTextureShaderProgram, "lightDirection");
    simpleTextureShaderProgram.lightPosition = Mp3D.gl.getUniformLocation(simpleTextureShaderProgram, "lightPosition");
    simpleTextureShaderProgram.lightAmbientColor = Mp3D.gl.getUniformLocation(simpleTextureShaderProgram, "lightAmbientColor");
    simpleTextureShaderProgram.lightDiffuseColor = Mp3D.gl.getUniformLocation(simpleTextureShaderProgram, "lightDiffuseColor");
    
    simpleTextureShaderProgram.ignoreLighting = Mp3D.gl.getUniformLocation(simpleTextureShaderProgram, "ignoreLighting");
    simpleTextureShaderProgram.lightType = Mp3D.gl.getUniformLocation(simpleTextureShaderProgram, "lightType");
    
    SimpleTextureMaterial.shaderProgram = simpleTextureShaderProgram;
}

SimpleTextureMaterial.prototype.setTexture = function(filename)
{
	this.texture = Mp3D.gl.createTexture();
	this.texture.image = new Image();
	var loadedTexture = this.texture;
	this.texture.image.onload = function(){ Mp3D.handleLoadedTexture(loadedTexture); };
	this.texture.image.src = filename;
}

SimpleTextureMaterial.prototype.setAlpha = function(alpha)
{
	this.alpha = alpha;
}

SimpleTextureMaterial.prototype.setUseTextureAlpha = function(useTextureAlpha)
{
	this.useTextureAlpha = useTextureAlpha;
}

SimpleTextureMaterial.prototype.setBlendMode = function(blendMode)
{
	if(blendMode == "alpha")
		this.blendMode = 0;
	else if(blendMode == "multiply")
		this.blendMode = 1;
	else
		throw "unknown blend mode '"+blendMode+"'"; 
}

SimpleTextureMaterial.prototype.setIgnoreLighting = function(ignoreLighting)
{
	this.ignoreLighting = ignoreLighting;
}

SimpleTextureMaterial.prototype.enable = function()
{
    Mp3D.gl.enableVertexAttribArray(SimpleTextureMaterial.shaderProgram.vertexPositionAttribute);
    Mp3D.gl.enableVertexAttribArray(SimpleTextureMaterial.shaderProgram.vertexNormalAttribute);
    Mp3D.gl.enableVertexAttribArray(SimpleTextureMaterial.shaderProgram.vertexTexCoordAttribute);
}

SimpleTextureMaterial.prototype.disable = function()
{
	Mp3D.gl.disableVertexAttribArray(SimpleTextureMaterial.shaderProgram.vertexPositionAttribute);
    Mp3D.gl.disableVertexAttribArray(SimpleTextureMaterial.shaderProgram.vertexNormalAttribute);
    Mp3D.gl.disableVertexAttribArray(SimpleTextureMaterial.shaderProgram.vertexTexCoordAttribute);
}

SimpleTextureMaterial.prototype.setMatrixUniforms = function(mvMatrix)
{
	// set modelview and projection matrix
	Mp3D.gl.uniformMatrix4fv(SimpleTextureMaterial.shaderProgram.pMatrixUniform, false, Mp3D.pMatrix);
	Mp3D.gl.uniformMatrix4fv(SimpleTextureMaterial.shaderProgram.mvMatrixUniform, false, mvMatrix);
	
	// calculate and set normal matrix
	var normalMatrix = mat3.create();
    mat4.toInverseMat3(mvMatrix, normalMatrix);
    mat3.transpose(normalMatrix);

    Mp3D.gl.uniformMatrix3fv(SimpleTextureMaterial.shaderProgram.nMatrixUniform, false, normalMatrix);

	// set light information (if available)
	if(Mp3D.activeWorld && Mp3D.activeWorld.lights[0])
	{	
		Mp3D.gl.uniform3fv(SimpleTextureMaterial.shaderProgram.lightDirection, Mp3D.activeWorld.lights[0].relativeDirection);
		Mp3D.gl.uniform3fv(SimpleTextureMaterial.shaderProgram.lightPosition, Mp3D.activeWorld.lights[0].relativePosition);
		Mp3D.gl.uniform3fv(SimpleTextureMaterial.shaderProgram.lightAmbientColor, Mp3D.activeWorld.lights[0].ambientColor);
		Mp3D.gl.uniform3fv(SimpleTextureMaterial.shaderProgram.lightDiffuseColor, Mp3D.activeWorld.lights[0].diffuseColor);
		
    	Mp3D.gl.uniform1i(SimpleTextureMaterial.shaderProgram.lightType, Mp3D.activeWorld.lights[0].type);
	}
}

SimpleTextureMaterial.prototype.drawModel = function(model, mvMatrix)
{
	Mp3D.gl.useProgram(SimpleTextureMaterial.shaderProgram);
	this.enable();
	this.setMatrixUniforms(mvMatrix);

	Mp3D.gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, model.vertexPositionBuffer);
    Mp3D.gl.vertexAttribPointer(SimpleTextureMaterial.shaderProgram.vertexPositionAttribute, model.vertexPositionBuffer.itemSize, WebGLRenderingContext.FLOAT, false, 0, 0);
    
	Mp3D.gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, model.vertexNormalBuffer);
    Mp3D.gl.vertexAttribPointer(SimpleTextureMaterial.shaderProgram.vertexNormalAttribute, model.vertexNormalBuffer.itemSize, WebGLRenderingContext.FLOAT, false, 0, 0);
    
	Mp3D.gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, model.vertexTexCoordBuffer);
    Mp3D.gl.vertexAttribPointer(SimpleTextureMaterial.shaderProgram.vertexTexCoordAttribute, model.vertexTexCoordBuffer.itemSize, WebGLRenderingContext.FLOAT, false, 0, 0);
    
    Mp3D.gl.bindBuffer(WebGLRenderingContext.ELEMENT_ARRAY_BUFFER, model.vertexIndexBuffer);
    
    if(this.texture)
    {
		Mp3D.gl.activeTexture(WebGLRenderingContext.TEXTURE0);
    	Mp3D.gl.bindTexture(WebGLRenderingContext.TEXTURE_2D, this.texture);
    	Mp3D.gl.uniform1i(SimpleTextureMaterial.shaderProgram.textureSampler, 0);
    }
    
    Mp3D.gl.uniform1f(SimpleTextureMaterial.shaderProgram.alpha, this.alpha);
	Mp3D.gl.uniform1i(SimpleTextureMaterial.shaderProgram.blendMode, this.blendMode);
	Mp3D.gl.uniform1i(SimpleTextureMaterial.shaderProgram.useTextureAlpha, this.useTextureAlpha);
	Mp3D.gl.uniform1i(SimpleTextureMaterial.shaderProgram.ignoreLighting, this.ignoreLighting);

	if(this.alpha < 1 || this.useTextureAlpha || this.blendMode != 0)
    {
    	if(this.blendMode == 1) // multiply
    		Mp3D.gl.blendFunc(WebGLRenderingContext.SRC_COLOR, WebGLRenderingContext.ONE_MINUS_SRC_COLOR);
    	else // alpha
    		Mp3D.gl.blendFunc(WebGLRenderingContext.SRC_ALPHA, WebGLRenderingContext.ONE_MINUS_SRC_ALPHA);
    		
		Mp3D.gl.enable(WebGLRenderingContext.BLEND);
		//Mp3D.gl.disable(WebGLRenderingContext.DEPTH_TEST);
	}

 	Mp3D.gl.drawElements(WebGLRenderingContext.TRIANGLES, model.vertexIndexBuffer.numItems, WebGLRenderingContext.UNSIGNED_SHORT, 0);

  	if(this.alpha < 1 || this.useTextureAlpha  || this.blendMode != 0)
    {
		Mp3D.gl.disable(WebGLRenderingContext.BLEND);
		Mp3D.gl.enable(WebGLRenderingContext.DEPTH_TEST);
	}

	this.disable();
}

