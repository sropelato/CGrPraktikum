function NormalTextureMaterial()
{
	this.texture = null;
	this.normalMap = null;
	this.shininess = 10;
}

Mp3D.registerMaterialClass(NormalTextureMaterial);

NormalTextureMaterial.getResourceDependencies = function()
{
	// register all resources needed for setup
	return [["normalTextureVertexShader", "res/shaders/normalTextureShader.vert"], ["normalTextureFragmentShader", "res/shaders/normalTextureShader.frag"]];
}

NormalTextureMaterial.init = function()
{
	NormalTextureMaterial.isInitialized = true;
	
	// load normal texture shader
	var normalTextureVertexShader = Mp3D.loadVertexShader("normalTextureVertexShader");
	var normalTextureFragmentShader = Mp3D.loadFragmentShader("normalTextureFragmentShader");
	
	var normalTextureShaderProgram = Mp3D.gl.createProgram();
    Mp3D.gl.attachShader(normalTextureShaderProgram, normalTextureVertexShader);
    Mp3D.gl.attachShader(normalTextureShaderProgram, normalTextureFragmentShader);
    Mp3D.gl.linkProgram(normalTextureShaderProgram);

    if(!Mp3D.gl.getProgramParameter(normalTextureShaderProgram, WebGLRenderingContext.LINK_STATUS))
    {
    	Mp3D.error("Could not initialise normal texture shader.");
    }

	// set attributes
    normalTextureShaderProgram.vertexPositionAttribute = Mp3D.gl.getAttribLocation(normalTextureShaderProgram, "vertexPosition");
    
    normalTextureShaderProgram.vertexNormalAttribute = Mp3D.gl.getAttribLocation(normalTextureShaderProgram, "vertexNormal");
    normalTextureShaderProgram.vertexTangentAttribute = Mp3D.gl.getAttribLocation(normalTextureShaderProgram, "vertexTangent");
    normalTextureShaderProgram.vertexBitangentAttribute = Mp3D.gl.getAttribLocation(normalTextureShaderProgram, "vertexBitangent");
    
    normalTextureShaderProgram.vertexTexCoordAttribute = Mp3D.gl.getAttribLocation(normalTextureShaderProgram, "vertexTexCoord");
    
    // set uniforms
    normalTextureShaderProgram.pMatrixUniform = Mp3D.gl.getUniformLocation(normalTextureShaderProgram, "pMatrix");
    normalTextureShaderProgram.mvMatrixUniform = Mp3D.gl.getUniformLocation(normalTextureShaderProgram, "mvMatrix");
    normalTextureShaderProgram.nMatrixUniform = Mp3D.gl.getUniformLocation(normalTextureShaderProgram, "nMatrix");
    normalTextureShaderProgram.textureSampler = Mp3D.gl.getUniformLocation(normalTextureShaderProgram, "textureSampler");
    normalTextureShaderProgram.normalMapSampler = Mp3D.gl.getUniformLocation(normalTextureShaderProgram, "normalMapSampler");

    normalTextureShaderProgram.lightDirection = Mp3D.gl.getUniformLocation(normalTextureShaderProgram, "lightDirection");
    normalTextureShaderProgram.lightPosition = Mp3D.gl.getUniformLocation(normalTextureShaderProgram, "lightPosition");
    normalTextureShaderProgram.lightAmbientColor = Mp3D.gl.getUniformLocation(normalTextureShaderProgram, "lightAmbientColor");
    normalTextureShaderProgram.lightDiffuseColor = Mp3D.gl.getUniformLocation(normalTextureShaderProgram, "lightDiffuseColor");
    normalTextureShaderProgram.lightType = Mp3D.gl.getUniformLocation(normalTextureShaderProgram, "lightType");
	normalTextureShaderProgram.shininess = Mp3D.gl.getUniformLocation(normalTextureShaderProgram, "shininess");
    
    NormalTextureMaterial.shaderProgram = normalTextureShaderProgram;
}

NormalTextureMaterial.prototype.setTexture = function(filename)
{
	this.texture = Mp3D.gl.createTexture();
	this.texture.image = new Image();
	var loadedTexture = this.texture;
	this.texture.image.onload = function(){ Mp3D.handleLoadedTexture(loadedTexture); };
	this.texture.image.src = filename;
}

NormalTextureMaterial.prototype.setNormalMap = function(filename)
{
	this.normalMap = Mp3D.gl.createTexture();
	this.normalMap.image = new Image();
	var loadedTexture = this.normalMap;
	this.normalMap.image.onload = function(){ Mp3D.handleLoadedTexture(loadedTexture); };
	this.normalMap.image.src = filename;
}

NormalTextureMaterial.prototype.setShininess = function(shininess)
{
	this.shininess = shininess;
}

NormalTextureMaterial.prototype.enable = function()
{
    Mp3D.gl.enableVertexAttribArray(NormalTextureMaterial.shaderProgram.vertexPositionAttribute);
    Mp3D.gl.enableVertexAttribArray(NormalTextureMaterial.shaderProgram.vertexNormalAttribute);
    Mp3D.gl.enableVertexAttribArray(NormalTextureMaterial.shaderProgram.vertexTangentAttribute);
    Mp3D.gl.enableVertexAttribArray(NormalTextureMaterial.shaderProgram.vertexBitangentAttribute);
    Mp3D.gl.enableVertexAttribArray(NormalTextureMaterial.shaderProgram.vertexTexCoordAttribute);
}

NormalTextureMaterial.prototype.disable = function()
{
	Mp3D.gl.disableVertexAttribArray(NormalTextureMaterial.shaderProgram.vertexPositionAttribute);
    Mp3D.gl.disableVertexAttribArray(NormalTextureMaterial.shaderProgram.vertexNormalAttribute);
    Mp3D.gl.disableVertexAttribArray(NormalTextureMaterial.shaderProgram.vertexTangentAttribute);
    Mp3D.gl.disableVertexAttribArray(NormalTextureMaterial.shaderProgram.vertexBitangentAttribute);
    Mp3D.gl.disableVertexAttribArray(NormalTextureMaterial.shaderProgram.vertexTexCoordAttribute);
}

NormalTextureMaterial.prototype.setMatrixUniforms = function(mvMatrix)
{
	// set modelview and projection matrix
	Mp3D.gl.uniformMatrix4fv(NormalTextureMaterial.shaderProgram.pMatrixUniform, false, Mp3D.pMatrix);
	Mp3D.gl.uniformMatrix4fv(NormalTextureMaterial.shaderProgram.mvMatrixUniform, false, mvMatrix);
	
	// calculate and set normal matrix
	var normalMatrix = mat3.create();
    mat4.toInverseMat3(mvMatrix, normalMatrix);
    mat3.transpose(normalMatrix);
    Mp3D.gl.uniformMatrix3fv(NormalTextureMaterial.shaderProgram.nMatrixUniform, false, normalMatrix);
    
	// set light information (if available)
	if(Mp3D.activeWorld && Mp3D.activeWorld.lights[0])
	{
		Mp3D.gl.uniform3fv(NormalTextureMaterial.shaderProgram.lightDirection, Mp3D.activeWorld.lights[0].relativeDirection);
		Mp3D.gl.uniform3fv(NormalTextureMaterial.shaderProgram.lightPosition, Mp3D.activeWorld.lights[0].relativePosition);
		Mp3D.gl.uniform3fv(NormalTextureMaterial.shaderProgram.lightAmbientColor, Mp3D.activeWorld.lights[0].ambientColor);
		Mp3D.gl.uniform3fv(NormalTextureMaterial.shaderProgram.lightDiffuseColor, Mp3D.activeWorld.lights[0].diffuseColor);
		
    	Mp3D.gl.uniform1i(NormalTextureMaterial.shaderProgram.lightType, Mp3D.activeWorld.lights[0].type);
	}
	
	Mp3D.gl.uniform1f(NormalTextureMaterial.shaderProgram.shininess, this.shininess);
}

NormalTextureMaterial.prototype.drawModel = function(model, mvMatrix)
{
	Mp3D.gl.useProgram(NormalTextureMaterial.shaderProgram);
	this.enable();
	this.setMatrixUniforms(mvMatrix);

	Mp3D.gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, model.vertexPositionBuffer);
    Mp3D.gl.vertexAttribPointer(NormalTextureMaterial.shaderProgram.vertexPositionAttribute, model.vertexPositionBuffer.itemSize, WebGLRenderingContext.FLOAT, false, 0, 0);
    
	Mp3D.gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, model.vertexNormalBuffer);
    Mp3D.gl.vertexAttribPointer(NormalTextureMaterial.shaderProgram.vertexNormalAttribute, model.vertexNormalBuffer.itemSize, WebGLRenderingContext.FLOAT, false, 0, 0);
    
	Mp3D.gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, model.vertexTangentBuffer);
    Mp3D.gl.vertexAttribPointer(NormalTextureMaterial.shaderProgram.vertexTangentAttribute, model.vertexTangentBuffer.itemSize, WebGLRenderingContext.FLOAT, false, 0, 0);

	Mp3D.gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, model.vertexBitangentBuffer);
    Mp3D.gl.vertexAttribPointer(NormalTextureMaterial.shaderProgram.vertexBitangentAttribute, model.vertexBitangentBuffer.itemSize, WebGLRenderingContext.FLOAT, false, 0, 0);
    
	Mp3D.gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, model.vertexTexCoordBuffer);
    Mp3D.gl.vertexAttribPointer(NormalTextureMaterial.shaderProgram.vertexTexCoordAttribute, model.vertexTexCoordBuffer.itemSize, WebGLRenderingContext.FLOAT, false, 0, 0);
    
    Mp3D.gl.bindBuffer(WebGLRenderingContext.ELEMENT_ARRAY_BUFFER, model.vertexIndexBuffer);
    
    if(this.texture && this.normalMap)
    {
		Mp3D.gl.activeTexture(WebGLRenderingContext.TEXTURE0);
    	Mp3D.gl.bindTexture(WebGLRenderingContext.TEXTURE_2D, this.texture);
		Mp3D.gl.activeTexture(WebGLRenderingContext.TEXTURE1);
    	Mp3D.gl.bindTexture(WebGLRenderingContext.TEXTURE_2D, this.normalMap);
    	Mp3D.gl.uniform1i(NormalTextureMaterial.shaderProgram.textureSampler, 0);
    	Mp3D.gl.uniform1i(NormalTextureMaterial.shaderProgram.normalMapSampler, 1);
    }

 	Mp3D.gl.drawElements(WebGLRenderingContext.TRIANGLES, model.vertexIndexBuffer.numItems, WebGLRenderingContext.UNSIGNED_SHORT, 0);

	this.disable();
}

