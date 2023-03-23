

# Practica 2
### Sistemas operativos 1

Este proyecto consta de un dashboard de uso de recursos. Un modulo de kernel se encarga de obtener informacion del total de procesos que se encuentran en una computadora, sus estados, y otra información básica. También obtiene información general de la memoria RAM instalada en la computadora. Este modulo es accedido a travez de leer la informacion en el archivo info.txt ubicado en /proc/ram_201801290/ y /proc/cpu_201801290/ respectivamente. El Backend se encarga de hacer una lectura a este archivo y la informacion que se genera en ese mismo momento. Luego es almacenada en una base de datos mysql. Una tabla de procesos y otra del resumen de uso general. Esta base de datos puede ser entonces leida por una api que corre en una computadora por separado. Esta API organiza esta informacion y genera un poco de estadisticas de las mismas para poderlas proveer a quien consuma dicho API. En este caso, quien consume esta API es un frontend de React el cual muestra esta información de manera mas legible. El resumen de lo mencionado anteriormente se puede ver en el siguiente diagrama.
![Project components diagram](https://iili.io/HjUr75b.png)


**Los programas utilizados para crear este programa fueron:**
-VM Google Cloud Ubuntu, 22.10 (amd64 kinetic x86-64) para backend y modulo kernel
-VM Google Cloud Ubuntu, 22.10 (amd64 kinetic x86-64) para front y API
-Google Cloud SQL Instance version 8.0
- Golang
- Node.js
- React.js

## Creaciones de maquinas Ubuntu

- Primero crearemos la instancia, sera la misma tanto para el back general como para el front. Para el momento en que se realizó este proyecto, la generación de computadoras C3 se encuentran en beta público, por lo que pudimos crear instancias de estas maquinas totalmente gratuitas. Una maquina normal de E2 default consume aproximadamente USD26 por mes. C3, aproximadamente USD126 (que buen momento para crearlas!)
![Type of VM to create](https://iili.io/Hj4MY1R.png)

- Seleccionamos el disco de arranque para ser Ubuntu 22.10
![Type of VM to create](https://iili.io/Hj4gAhv.png)

- Permitimos el trafico HTTP(S) para la maquina
![HTTP and HTTPS enabling](https://iili.io/Hj4bQSf.png)

- Procedemos a crearla. Esto puede tardar un tiempo, en lo que se crea, podemos configurar las reglas de red para el proyecto para permitir la conexion de escritorio remota a traves de nomachine.  Nos vamos a la opcion de Redes VPC y seleccionamos la red default creada para el proyecto. En el menu de la izquierda seleccionamos la opcion de Firewall. 
![Firewall rule creation](https://iili.io/Hj6e8DQ.png)

- Le ponemos un nombre que podamos reconocer, en este caso "nomachine". Dejamos la red default y sin registros, y la prioridad en el valor default (1000). Que la regla sea permitir de ingreso. Agregamos la etiqueta "nomachine" (IMPORTANTE: el nombre de esta etiqueta posteriormente sera el que agregaremos a cada instancia de vm para que aplique a es vm, asi que deben coincidir, esto se configura mas adelante.)

- Seleccionamos rango de IP "0.0.0.0/0", TCP y el puerto 4000.

![Firewall tcp 4000 allowing](https://iili.io/HjP2RKN.png)
- Una vez creada esta red (y posiblemente ya nuestra instancia lista), procedemos a agregar esta red a la instancia. Vamos a la seccion de Compute Engine, le damos click al nombre de nuestra instancia y luego en editar.


![Instance editing selection](https://iili.io/HjP5CtR.png)

- Agregamos la etiqueta que creamos anteriormente a la instancia
- ![Tag added to vm instance](https://iili.io/HjPl1aI.png)

- Nuestra instancia esta lista para ser usada! (Puede que los cambios de la red no tomen efecto hasta la proxima vez que reiniciemos la instancia, pero antes de hacerlo, instalaremos otras cosas que tambien necesitaran un reinicio, asi nos evitamos tener que reiniciar dos veces). Nos conectamos a traves de SSH a la instancia
- ![SSH connection](https://iili.io/HjPO1sI.png)

- Una vez dentro, procederemos a ejecutar los siguientes comandos para actualizarla e instalar algunas cosas necesarias
    ```
    $ sudo apt update && sudo apt upgrade
    $ sudo apt install npm
    $ sudo apt install ubuntu-desktop
    ```
- Deberemos obtener un link a el .deb adecuado para el sistema en https://downloads.nomachine.com/es/. Para este caso, usaremos NoMachine para Linux -x86_64, amd64. Recomendamos ir a la pagina y obtener un link reciente a la hora de instalacion, ya que el mostrado aca puede estar desactualizado. De esta misma pagina podemos obtener NoMachine para la maquina desde la cual nos conectaremos, en la cual tenemos que instalar el cliente para conectarnos posteriormente.
    ```
   $ wget https://download.nomachine.com/download/8.4/Linux/nomachine_8.4.2_1_amd64.deb
   $ sudo apt install ./nomachine_8.4.2_1_amd64.deb
   $ sudo dpkg -i ./nomachine_8.4.2_1_amd64.deb
   ```
- Ahora debemos configurar algunas cosas de la configuracion ssh para poder establecer correctamente la conexion con nomachine. Primero crearemos un nuevo usuario (o pueden hacer `sudo -s` seguido de `passwd` para configurar el usuario root).

    ```
   $ sudo -s
   $ adduser practica2
   $ usermod -aG sudo,adm practica2
   $ nano /etc/ssh/sshd_config
    ```
- Aca tendremos que activar la opción `PasswordAuthentication yes`
![PasswordAuthentication enabling](https://iili.io/HjiD6Rj.png)

- Ahora podemos reiniciar la instancia y esperar a que vuelva a iniciar totalmente. Una vez hecho esto, podemos abrir nomachine, introducir la IP del equipo, el usuario y clave creados para el usuario, y podremos inciar remotamente en un entorno grafico en la maquina virtual.
![Nomachine login](https://iili.io/HjsK0xe.png)
![GUI of the vm showing up](https://iili.io/Hjsxi3g.png)


- La configuracion para la segunda maquina virtual es la misma, a exepcion de la creacion de red y regla de firewall. Lo unico pertinente de hacer respecto a esto es agregar la etiqueta `nomachine` a la red de la misma (sin volverla a crear en el VPC).



# Configuracion de Backend

- Hay algunas cosas que debemos instalar en cada maquina para poder compilar el modulo de kernel y correr el backend. Empezaremos con la libreria necesaria de kernel de linux. Incluir `$(uname -r)` aqui nos asegura instalar los headers necesarios para la version actual del kernel del sistema.
    ```
    $ sudo apt install linux-headers-$(uname -r)
    $ sudo apt install make
    ```
-  Ahora ya podemos compilar tanto el modulo ram y cpu con el comando `make all` en su respectiva carpeta. Seguido de correr `sudo insmod cpu.ko` y `sudo insmod ram.ko` respectivamente.
- Para correr el back de go basta con correr el comando `go run main.go` en su carpeta.

#### Instalacion Docker
 La  [guia de instalacion oficial de Docker](https://docs.docker.com/engine/install/ubuntu/) contiene información detallada, pero por referencia se deja un breve resumen aca:

```
   $ sudo apt-get remove docker docker-engine docker.io containerd runc
   $ sudo apt-get install \
   ca-certificates \
   curl \
   gnupg \
   lsb-release
   $ sudo mkdir -m 0755 -p /etc/apt/keyrings
   $ curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
   $ echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
  $ sudo chmod a+r /etc/apt/keyrings/docker.gpg
  $ sudo apt-get update
  $ sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```
- Agregamos nuestro usuario a el grupo de docker para no tener que prefijar cada comando con *sudo*
   ` sudo usermod -aG docker $USER`
- Ahora instalamos Docker-Compose (en caso el docker de la distro de linux no incluya la nueva variante de `docker compose`)

- Nos aseguramos que `curl` y `wget` esten instalados\
`sudo apt install -y curl wget`

- Descargamos el ultimo Compose\
`curl -s https://api.github.com/repos/docker/compose/releases/latest | grep browser_download_url  | grep docker-compose-linux-x86_64 | cut -d '"' -f 4 | wget -qi -`

- Marcamos el binario como ejecutable\
`chmod +x docker-compose-linux-x86_64`

- Lo movemos a un lugar de `$PATH` que sea accesible\
`sudo mv docker-compose-linux-x86_64 /usr/local/bin/docker-compose`

- Y verificamos la instalacion de ambas herramientas\
    ```
    $ docker -v && docker-compose -v
    Docker version 20.10.23+dfsg1, build 7155243
    Docker Compose version v2.15.1
    ```

#### Instalacion Golang
- Primero descargamos la ultima version del sitio oficial (ir al sitio oficial a obtener un link ya que el mostrado aca puede estar desactualizado)
```
$ wget https://go.dev/dl/go1.20.2.linux-amd64.tar.gz
$ rm -rf /usr/local/go && tar -C /usr/local -xzf go1.20.2.linux-amd64.tar.gz
```

- Exportamos PATH en nuestro ~/.bashrc con `export PATH=$PATH:/usr/local/go/bin`
- El programa utiliza variables de entorno para no incluir las credenciales de la base de datos en el repositorio, por lo que se deben exportar las siguientes variables con sus valores correspondientes:
	- C_DB_USER
	- C_DB_PASS
	- C_DB_NAME
	- C_DB_IP
	
(Lineas 218-226 de main.go si desean cambiar el nombre de estas referencias)
# Configuracion de Frontend/API
- Para esta configuracion solo necesitamos npm (hecho ya en la configuracion general de la VM).
- Ejecutamos `npm install` tanto en la carpeta del API como del Frontend
- Para correr la API, se utiliza el comando `node index.js`
- Para correr el frontend, se utiliza el comando `npm run start`
- Al igual que en el back, las credenciales hacia la base de datos se guardan en las siguientes variables de ambiente para uso del API:
 	- C_DB_USER
	- C_DB_PASS
	- C_DB_NAME
	- C_DB_HOST
	
(Lineas 19-30 de index.js si desean cambiar el nombre de estas referencias)
# Configuracion de Google MySQL
- Esta configuracion es bastante simple de realizar, la configuracion es la estandar de MySQL. Nos vamos al apartada de SQL del panel de control de google cloud y seleccionamos MySQL
![Google Cloud SQL Panel](https://iili.io/HjyJvgn.png)

Le damos un ID, la version deseada (8.0 en este caso) y una contraseña para el usuario root. Se sugiere leer la descripcion del modo de configuracion *Produccion*, *Desarrollo* o *Zona de Pruebas* para saber con que empezar, pero se recomienda una vez terminadas las pruebas usar ya sea Desarrollo o Produccion. La configuracion de las 2 tablas utilizadas en la base de datos se pueden encontrar en la raiz del directorio.
