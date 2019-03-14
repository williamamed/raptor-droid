#!/usr/bin/env node


//console.log("hola",args,process.cwd())
const fs=require('fs'),
	path=require('path'),
	os=require('os'),
	admZip=require('adm-zip'),
	fse=require('fs-extra');
	

const mobile={
	create:function(pkg,name){
		var currentDir=process.cwd()
		console.log('---------------- CREANDO PROYECTO -----------------')
		if(!fs.existsSync(path.join(currentDir,'www')))
			fs.mkdirSync(path.join(currentDir,'www'))
		//REPLACE WITH ZIP
		var zipWww=new admZip(path.join(__dirname,'..','lib','packages','www.zip'))
		zipWww.extractAllTo(path.join(currentDir,'www'))
		//fse.copySync(path.join(__dirname,'..','lib','www'),path.join(currentDir,'www'))
		
		console.log('El directorio www fue creado en : ',currentDir)
		if(!fs.existsSync(path.join(currentDir,'app')))
			fs.mkdirSync(path.join(currentDir,'app'))
		//REPLACE WITH ZIP
		var zipApp=new admZip(path.join(__dirname,'..','lib','packages','raptor-android.zip'))
		zipApp.extractAllTo(path.join(currentDir,'app'))
		//fse.copySync(path.join(__dirname,'..','lib','raptor-android'),path.join(currentDir,'app'))

		console.log('La aplicación fue creada en app: ',currentDir)
		this.createConfig(pkg,name)
		this.createPkg(pkg,currentDir,name)
		
	},
	
	buildState:function(){
	    console.log('Copiando los recursos www....')
	    var currentDir=process.cwd();
	    fse.copySync(path.join(process.cwd(),'www'),path.join(currentDir,'app/app/src/main/assets/www'))
	    console.log('Hecho!')
	    console.log('Actualizando el Manifest.xml....')
	    var config=require(path.join(process.cwd(),'www','config.json'))
	    // Creando plantilla string
		var templateString=fs.readFileSync(path.join(__dirname,'..','lib','java','strings.xml'))
		templateString=templateString.toString().replace(/{appname}/g,config.name)
		fs.writeFileSync(path.join(currentDir,'app/app/src/main/res/values','strings.xml'),templateString)
	    
	    // Manifest.xml
		var templateManifest=fs.readFileSync(path.join(__dirname,'..','lib','java','AndroidManifest.xml'))
		templateManifest=templateManifest.toString().replace(/{pkgname}/g,config.pkg)
		templateManifest=templateManifest.replace(/{icon}/g,config.icon)
		var permissions=""
		if(config.permissions){
		    for (var i = 0; i < config.permissions.length; i++) {
		        permissions+='<uses-permission android:name="'+config.permissions[i]+'"'+"/>\n"
		    }
		}
		templateManifest=templateManifest.replace(/{permissions}/g,permissions)
		fs.writeFileSync(path.join(currentDir,'app/app/src/main','AndroidManifest.xml'),templateManifest)
	    
		console.log('Hecho!')

		console.log('Copiando icono...')
		if(fs.existsSync(path.join(process.cwd(),'www','res')))
			fse.copySync(path.join(process.cwd(),'www','res'),path.join(currentDir,'app/app/src/main/res'))
		console.log('Hecho!')

		// Plantilla Gradle build
		var templateGradle=fs.readFileSync(path.join(__dirname,'..','lib','java','build.gradle'))
		templateGradle=templateGradle.toString().replace(/{pkgname}/g,config.pkg)
		templateGradle=templateGradle.toString().replace(/{versionCode}/g,config.version.code)
		templateGradle=templateGradle.toString().replace(/{versionName}/g,config.version.name)
		fs.writeFileSync(path.join(currentDir,'app/app','build.gradle'),templateGradle)


		console.log('Configurando gradle wrapper...')
		var gradleProp=fs.readFileSync(path.join(__dirname,'..','lib','java','gradle-wrapper.properties'))
		gradleProp=gradleProp.toString().replace(/{gradle}/g,config.gradleDistributionUrl?config.gradleDistributionUrl:"https\://services.gradle.org/distributions/gradle-4.1-all.zip")
		fs.writeFileSync(path.join(currentDir,'app/gradle/wrapper','gradle-wrapper.properties'),gradleProp)
		console.log('Hecho!')
		console.log('Configurando gradle local.properties...')
		var gradleLocalProp=fs.readFileSync(path.join(__dirname,'..','lib','java','local.properties'))
		gradleLocalProp=gradleLocalProp.toString().replace(/{sdk}/g,config.sdk?config.sdk:"Ruta del sdk")
		fs.writeFileSync(path.join(currentDir,'app','local.properties'),gradleLocalProp)
	    console.log('Hecho!')
		

	},
	
	createConfig:function(pkg,name){
	    var currentDir=process.cwd()
	    
		var conf={
		    name:name,
		    icon:"@mipmap/raptor",
			pkg: pkg,
			permissions:[],
			gradleDistributionUrl:"Distribucion gradle ej. file:///E:/android/gradle-4.1-all.zip",
			sdk:"Directorio del sdk",
			version:{
				name:"0.0.1",
				code:1
			}
		}
		fs.writeFileSync(path.join(currentDir,'www','config.json'),JSON.stringify(conf,null, 2))
	},
	
	createPkg:function(pkg,currentDir,name){
		var divide=pkg.replace(/\./g,'/')
		var config=require(path.join(currentDir,'www/config.json'))
		if(!fs.existsSync(path.join(currentDir,'app/app/src/main/java',divide)))
		    fse.mkdirsSync(path.join(currentDir,'app/app/src/main/java',divide))
		    
		// Create Activity
		var template=fs.readFileSync(path.join(__dirname,'..','lib','java','MainActivity.java.tpl'))
		template=template.toString().replace(/{pkgname}/g,pkg)
		fs.writeFileSync(path.join(currentDir,'app/app/src/main/java',divide,'MainActivity.java'),template)
		
		// Manifest.xml
		var templateManifest=fs.readFileSync(path.join(__dirname,'..','lib','java','AndroidManifest.xml'))
		templateManifest=templateManifest.toString().replace(/{pkgname}/g,pkg)
		templateManifest=templateManifest.replace(/{icon}/g,path.basename(config.icon,'.png'))
		
		var permissions=""
		if(config.permissions){
		    for (var i = 0; i < config.permissions.length; i++) {
		        permissions+='<uses-permission android:name="'+config.permissions[i]+'"'+"/>\n"
		    }
		}
		templateManifest=templateManifest.replace(/{permissions}/g,permissions)
		fs.writeFileSync(path.join(currentDir,'app/app/src/main','AndroidManifest.xml'),templateManifest)
		
		// Creando plantilla string
		var templateString=fs.readFileSync(path.join(__dirname,'..','lib','java','strings.xml'))
		templateString=templateString.toString().replace(/{appname}/g,name)
		fs.writeFileSync(path.join(currentDir,'app/app/src/main/res/values','strings.xml'),templateString)
		
		// Plantilla Gradle build
		var templateGradle=fs.readFileSync(path.join(__dirname,'..','lib','java','build.gradle'))
		templateGradle=templateGradle.toString().replace(/{pkgname}/g,pkg)
		fs.writeFileSync(path.join(currentDir,'app/app','build.gradle'),templateGradle)
		
		// activiity_main
		var templateView=fs.readFileSync(path.join(__dirname,'..','lib','java','activity_main.xml'))
		templateView=templateView.toString().replace(/{pkgname}/g,pkg)
		fs.writeFileSync(path.join(currentDir,'app/app/src/main/res/layout','activity_main.xml'),templateView)
		
		console.log('Se creo el paquete',pkg)
		console.log('---------------------------------------------------')
	},
	
	run:function(state,fun){
		var bat=(path.join(__dirname,'..','lib',state))
		var config=require(path.join(process.cwd(),'www','config.json'))
		this.buildState()
		//support for other OS
        var ls=require('child_process').spawn(bat,[config.pkg],{
			stdio:'inherit',
			cwd:path.join(process.cwd(),'app')
		})
        ls.on('exit',function(code){
			if(fun && code==0)
				fun.apply(this)
		})
	},
	adb:function(state){
		var bat=path.join(__dirname,'..','lib',state)
		var config=require(path.join(process.cwd(),'www','config.json'))
		//this.buildState()
		//support for other OS
        var ls=require('child_process').spawn(bat,[config.pkg,config.pkg],{
			stdio:'inherit',
			cwd: config.sdk+'/platform-tools'
		})
        
	},

	createBackend:function(name){
		// Creando plantilla string
		console.log("Creando nuevo backend {"+name+"}")
		var templateString=fs.readFileSync(path.join(__dirname,'..','lib','java','Backend.java.tpl'))
		templateString=templateString.toString().replace(/{name}/g,name)
		fs.writeFileSync(path.join(process.cwd(),'app/app/src/main/java/cu/raptor/backend',name+'.java'),templateString)
		var config=require(path.join(process.cwd(),'www','config.json'))
		if(config.backend)
			config.backend.push(name)
		else
			config.backend=[name];
		fs.writeFileSync(path.join(process.cwd(),'www','config.json'),JSON.stringify(config,null, 2))
		console.log("Hecho!")
		console.log("El backend fue creado en: "+path.join(process.cwd(),'app/app/src/main/java/cu/raptor/backend',name+'.java'))
	},

	openExplorer:function(page){
		
		//var config=require(path.join(process.cwd(),'www','config.json'))
		//this.buildState()
		//support for other OS
        var ls=require('child_process').spawn('explorer',[page],{
			stdio:'inherit'
		})
	},

	runGeneric:function(state,params,fun){
		var bat=(path.join(__dirname,'..','lib',state))
		var config=require(path.join(process.cwd(),'www','config.json'))
		this.buildState()
		//support for other OS
        var ls=require('child_process').spawn(bat,params,{
			stdio:'inherit',
			cwd:path.join(process.cwd(),'app')
		})
        ls.on('exit',function(code){
			if(fun && code==0)
				fun.apply(this)
		})
	},
	runGenericApp:function(state,params,fun){
		var bat=(path.join(process.cwd(),'app',state))
		
		this.buildState()
		//support for other OS
        var ls=require('child_process').spawn(bat,params,{
			stdio:'inherit',
			cwd:path.join(process.cwd(),'app')
		})
        ls.on('exit',function(code){
			if(fun && code==0)
				fun.apply(this)
		})
	}
}

var program = require('commander');
var package=require(__dirname+"/../package.json")
program
  .version(package.version)
  .option('create <appname> <package>', 'Crea un nuevo proyecto android')
  .option('build', 'Compila el proyecto')
  .option('prebuild', 'PreCompila el proyecto')
  .option('run', 'Corre el proyecto android')
  .option('install', 'Instala la apk')
  .option('backend <name>', 'Crea un backend java que extiende de Controller para esta app')
  .option('genicon', 'Utilidad para generar iconos')
  .option('release <keystore> <alias> <storepassword> <keypassword>', 'Genera la apk modo release')
  //.option('tasks', 'Lista las tareas gradle')
  .option('gradle [ar...]', 'Ejecuta una tarea gradle')
  .option('docs', 'Muestra la documentación de Raptor-droid')

// must be before .parse() since
// node's emit() is immediate

program.parse(process.argv);
//console.log(program)
if(program.create){
	mobile.create(program.args[0],program.create)
	
}
if(program.build){
	mobile.run('raptor-build.bat')
}
if(program.run){
	mobile.run('raptor-install.bat',function(){
		mobile.adb('raptor-run.bat')
	})
	
}
if(program.prebuild){
	
	mobile.buildState()
}
if(program.install){
	mobile.run('raptor-install.bat')
}
if(program.backend){
	mobile.createBackend(program.backend)
}
if(program.genicon){
	mobile.openExplorer(path.join(__dirname,'..','util','icons','index.html'))
}
if(program.docs){
	mobile.openExplorer(path.join(__dirname,'..','util','docs','base.html'))
}
if(program.tasks){
	//mobile.runGenericApp('gradlew.bat',['tasks'])
}
if(program.gradle){
	
	var argumentsComand=[program.gradle]
	argumentsComand=argumentsComand.concat(program.args)
	//console.log(argumentsComand)
	mobile.runGenericApp('gradlew.bat',argumentsComand)
}
if(program.release){
	return;
	if(fs.existsSync(path.join(os.homedir(),program.release+".jks"))){
		mobile.runGeneric('raptor-release.bat',[path.join(os.homedir(),program.release+".jks"),program.args[0],program.release,program.args[1]])
	}else{
		mobile.runGeneric('raptor-key.bat',[path.join(os.homedir(),program.release),program.release],function(){
			mobile.runGeneric('raptor-release.bat',[path.join(os.homedir(),program.release+".jks"),program.args[0],program.release,program.args[1]])
		})
	}
	//mobile.runGeneric('raptor-key.bat',[''])
}

