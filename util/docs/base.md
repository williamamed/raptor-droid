Raptor droid
=======
<img style="float: right;margin-top: -70px" src="lib/raptor-android-a.png" height="90">

Raptor Droid es una herramienta perteneciente al Proyecto Raptor, está orientada
a la creación de aplicaciones android con tecnologías web de forma embebida.

En pocos pasos podras poner operativa una aplicación android utilizando HTML, CSS y Javascript,
puedes comunicarte con los principales servicios del backend de la aplicación.

 * Servicio de Geolocalización
 * Reproducir sonidos
 * Tomar fotos
 * Ejecutar Intents nativos
 * Soporte a Base de Datos


Comenzando
---------------
Lo primero que haremos será instalar Node.js en nuestro equipo, una vez instalado utilizaremos el gestor de
paquetes de node `npm` para instalar `raptor-droid` utilizando el paquete tar descargado(Pronto estará en el npm registry).
Indicaremos que la instalación sera de forma global así que especificaremos el siguiente comando.

Con conexión a internet:
``` batch
$npm install raptor-droid -g
```

Sin conexión a internet y teniendo el paquete offline:
``` batch
$npm install /direccion/local/al/paquete/raptor-droid-0.0.3.tgz -g
```

Una vez instalado crearemos un nuevo proyecto en forma de paquete node en un directorio de nuestro equipo:

``` batch
$mkdir holamundoapp
$cd /holamundoapp
$npm init
```
Npm pedirá un conjunto de datos de configuración iniciales de nuestro paquete y luego en nuestro directorio `holamundoapp` podrás
ver un archivo package.json con la información configurada por el npm. Hasta este punto ya estamos listos para crear nuestra aplicación 
embebida de android.

Para crear un nuevo proyecto android abre la consola `cmd` en el directorio recién creado y escribe
el comando: 

``` batch
$raptor-droid create holamundo cu.miweb.apphola
```

Esta opción crea un nuevo proyecto, donde el nombre de la aplicación sería `holamundo` y el paquete definido
`cu.miweb.apphola` 


Por defecto el proyecto se creará con los siguientes directorios:

 * `app` Contiene las fuentes de la aplicación android.
 * `www` Contiene nuestros recursos HTML, CSS, JS, Imágenes y configuración.

Una vez creado el proyecto debemos modificar el archivo de configuración ubicado en el directorio `www` para
establecer el SDK de android y el wrapper gradle para compilar nuestra aplicación. El archivo aparecerá con
la siguiente configuración:
```json
{
  "name": "holamundo",
  "icon": "@mipmap/raptor",
  "pkg": "cu.miweb.apphola",
  "permissions": [],
  "gradleDistributionUrl": "wrapper gradle ej. file:///C:/android/gradle-4.1-all.zip",
  "sdk": "Directorio del sdk",
  "version":{
    "name":"0.0.1",
    "code":1
  }
}
```

Para configurar nuestra app debemos descargar el SDK android y descompromirlo en cualquier parte de
nuestra PC. Si contamos con conexión a internet podemos dejar el campo `gradleDistributionUrl` vacío para que automaticamente se descargue,
de lo contrario descargamos gradle-4.1-all.zip de forma manual y lo descomprimimos en nuestra pc. La configuración quedaría de la 
siguiente forma:
```json
{
  "name": "holamundo",
  "icon": "@mipmap/raptor",
  "pkg": "cu.miweb.apphola",
  "permissions": [],
  "gradleDistributionUrl": "file:///C:/android/gradle-4.1-all.zip",
  "sdk": "C:/android/sdk",
  "version":{
    "name":"0.0.1",
    "code":1
  }
}
```


### Compilando

Para compilar nuestra aplicación abrimos la consola cmd en el directorio de 
nuestra app y escribimos el comando:

``` batch
$raptor-droid build
```

En modo de desarrollo podremos conectar nuestro dispositivo y correr nuestra app
a través del comando `raptor-droid run`. (Recuerde habilitar el modo de desarrollo en su dispositivo)


### Modo liberación

Para crear nuestra apk en modo liberación abrimos la consola cmd en el directorio de 
nuestra app y escribimos el comando:

``` batch
$raptor-droid release <keystore>
```
El `<keystore>` especificado es el 
nombre del archivo jks que se utilizará en el proceso de firma de nuestra apk.

Este comando detecta si existe un jks con ese nombre en el directorio home de nuestra pc, si no existe le pedirá
un conjunto de datos para crear uno y finalmente compilará nuestra apk.

La apk firmada se encontrará en el directorio `app\app\build\outputs\apk\release` de nuestro proyecto.



Referencia
===========

$d
-----

### Recepción de Eventos

Los eventos podrán ser escuchados a través de la función on:

#### droid:ready
Evento disparado cuando el dispositivo se encuentra listo para ejecutarse.

``` javascript
$d.on("droid:ready", function(e,data) {
	console.log("Mobile ready")
})
```

#### droid:photo.result
Evento disparado cuando el resultado de la toma de la foto está listo, devuelve la toma
codificada en base64. Requiere el permiso [android.permission.CAMERA]

``` javascript
$d.send('droid:photo','thumbnail')

$d.on('droid:photo.result',function(e,result){
  $('#photo').attr('src',result)
})
```

#### droid:gps.location
Evento disparado cuando el dispositivo ha fijado la posición gps, devuelve un objeto `{lat: -45.235555, lon:36.256522}`. Requiere el permiso [android.permission.ACCESS_FINE_LOCATION]

``` javascript
$d.send('droid:gps.init')

$d.on('droid:gps.location',function(e,location){
   $('#gps').html(location)
})
```

#### droid:gps.status
Evento disparado cuando el dispositivo comienza la busqueda de posición gps, devuelve un objeto con los datos busqueda ej. `{status:true,satelliteCount:10,satelliteUsed:7}`. Requiere el permiso [android.permission.ACCESS_FINE_LOCATION]

``` javascript
$d.send('droid:gps.init')

$d.on('droid:gps.status',function(e,status){
  $('#status').html(status)
})
```



### Funciones

#### .send(String: nombre, Object: datos|String: datos): void
Envía una señal hacia el backend para ejecutar el nombre de evento especificado así como el parámetro datos en forma de objeto o string.

``` javascript
$d.send('droid:gps.init')

```

#### .sendGetString(String: nombre, Object: datos|String: datos): String
Envía una señal hacia el backend para ejecutar el nombre de evento especificado así como el parámetro datos en forma de objeto o string.

``` javascript
var result=$d.sendGetString('example1')

```

#### .on(String: nombre, Function: callbak): void
Registra la función callback para el evento especificado.

``` javascript
$d.on('droid:gps.location',function(e,location){
	console.log(location)
})

```


### Envío de eventos

Los eventos enviados indican al backend realizar una función nativa, raptor-droid tiene eventos definidos
que pueden ser llamados a través de la función `$d.send(...)`. Entre las funciones se encuentra la ejecución de 
Intents nativos, inicialización del GPS, reprodución de audio etc.


#### droid:photo
Indica que se levante el intent para la toma de una imagen a través de camara, el resultado de la toma podrá ser
recogido a través de la recepción del evento `droid:photo.result`.

``` javascript
$d.send('droid:photo','thumbnail')

```

#### droid:openurl
Indica que se levante el intent para abrir una url en el navegador del dispositivo.

``` javascript
$d.send('droid:openurl','http://google.com')

```

#### droid:loadurl
Indica que se cargue en la propia ventana la página local indicada, relativa al directorio `www`.

``` javascript
$d.send('droid:loadurl','miDirectorio/index.html')

```

#### droid:intent
Indica que se levante el intent especificado en el atributo `action` del parámetro Object especificado.

`Object:`

 * `action:` String, nombre del intent a levantar.
 * `uri:` String, uri del intent.
 * `extras:` Array, extras especificados
 * `result:` Integer(opcional), identificador entero del resultado esperado del intent


``` javascript
$d.send('droid:intent',{
	action:"com.google.zxing.client.android.SCAN",
    extras:[{
		name:'SCAN_MODE',
        value:'QR_CODE_MODE'
    }],
	result:106
})
```

#### droid:notification
Muestra un mensaje en la barra de notificaciones.

`Object:`

 * `title:` String, Título del mensaje de notificación.
 * `text:` String, Texto del mensaje de notificación.


``` javascript
$d.send('droid:notification',{
	title:"Hola mundo",
	text:"texto de notificación del mensaje"
})

```

#### droid:playsound
Reproduce un sonido en el dispositivo.

`fileSound:` String, Url local del archivo a reproducir relativo a www.

``` javascript
$d.send('droid:playsound','/sounds/efecto.mp3')

```

Comandos y herramientas
------------------

Los comandos y herramientas son utilitarios que te ayudarn a configurar y desplegar la aplicación
movil.

### genicon
El comando genicon levanta la herramienta utilitaria Android Asset Studio en nuestro navegador para la generación
de los iconos de nuestra apk.


``` batchfile
$raptor-droid genicon

```

Una vez configurado el icono le especificamos un Name y pulsamos en el ícono exportar, la herramienta exportará un archivo ZIP con
los iconos generados para todas las resoluciones. Descargamos el archivo en la carpeta `www` y le damos descomprimir, dentro del directorio se creará
un nuevo directorio `res` con la estructura requerida.

En nuestro archivo de configuración (config.json) en el directorio `www` cambiaremos el icono de nuestra apk al generado anteriormente.

```json
{
  "name": "holamundo",
  "icon": "@mipmap/miicono",
  "pkg": "cu.miweb.apphola",
  "permissions": [],
  "gradleDistributionUrl": "wrapper gradle ej. file:///C:/android/gradle-4.1-all.zip",
  "sdk": "Directorio del sdk",
  "version":{
    "name":"0.0.1",
    "code":1
  }
}
```


Terceros
====

db.js
------------

db.js es un wrapper para [IndexedDB](http://www.w3.org/TR/IndexedDB/) permitiendo una interfaz
más próxima a la gestión de base de datos mediante querys.

[Ver API](db.html)

Proyecto Raptor
====
Raptor Droid
----------------

© 2014, 2019, Proyecto Raptor Cuba [MIT 
License](http://www.opensource.org/licenses/mit-license.php).

**Raptor Droid** es mantenido por el [Proyecto Raptor](http://raptorweb.cubava.cu) con ayuda de los contribuidores.

 * [Proyecto Raptor](http://raptorweb.cubava.cu) (raptor.cubava.cu)
 * [Github](http://github.com/williamamed) (@williamamed)
 * [Facebook](http://facebook.com/raptorwebcuba) (@proyectoraptor)

 

[dist]: https://github.com/williamamed/raptor-droid
