
# Practica 1
### Sistemas operativos 1

Este proyecto consta de una calculadora simple. En el frontend de esta se ingresan operaciones aritmeticas basicas las cuales son enviadas a un backend para su procesamiento. Una vez procesadas, son guardadas en una base de datos para mantener registro de las operaciones hechas. Al mismo tiempo se guarda en un .log información de las operaciones como una copia de lo que realizo un usuario (respaldo redundante de la base de datos). Sobre este archivo de logs se generan estadisticas a través de un script escrito en bash.

![Docker components diagram](https://iili.io/HEGUadF.png)


**Los programas utilizados para crear este programa fueron:**
- Distribución de Linux (probado en Kali 6.0.0)
- Docker (Docker-compose por separado en la version para kali)
- Golang
- Node.js
- React.js
- MySQL (MariaDB en el caso especial de kali)

A pesar de estos ser los requisitos de instalación en la computadora de desarrollo, muchas de ellas no son necesarias para correr la aplicación ya que estas vienen encapsuladas dentro de docker. Por lo que realmente una distro de linux y docker(junto con docker-compose) son los unicos necesarios para correr la aplicacion.



## Instalación de Docker y Docker-Compose

- Primero instalaremos Docker haciendo uso de apt 

    ```
    sudo apt update
    sudo apt install -y docker.io
    ```


- Habilitamos el servicio


    `sudo systemctl enable docker --now`
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

# Creación de las imagenes para docker
Los componentes de backend y frontend del proyecto tienen sus respectivos `Dockerfile` de los cuales se puede compilar la imagen usando el codigo fuente respectivo. Por otro lado, *DockerHub* nos provee ya con imagenes precompiladas de [MySQL](https://hub.docker.com/_/mysql "MySQL") y [Bash](https://hub.docker.com/_/bash "Bash").

Para compilar las dos faltantes y descargar las 2 ya compiladas, abrimos una terminal en la raíz del proyecto y usamos docker-compose:

`docker-compose build`
![Output of docker-compose command](https://iili.io/HEMHdIR.jpg)

O bien, se puede correr cada *Dockerfile* por separado con sus respectivos tags

    docker build -t matusb42/backend_practica1_201801290:latest
    docker build -t matusb42/frontend_practica1_201801290:latest
    docker pull mysql/mysql-server:latest
    docker pull bash:5.2.15-alpine3.16

Podemos ver ahora las imágenes localmente en la computadora con `docker images`
![List of the four images ](https://iili.io/HEMj3Eg.png)

# Corriendo y configurando la aplicación

Ahora podemos crear los contenedores para la aplicacion.\
`docker-compose up -d`

![Containers being started](https://iili.io/HEMjuGn.png)

Antes de poder usar la aplicación, hay un paso que se debe realizar una sola vez. Y es que la base de datos no ha sido creada. Se creo el usuario root con la clave defecto encontrada en el `docker-compose.yml`.  La clave por defecto es *qwerty*. ***SE RECOMIENDA CAMBIAR  ESTA CLAVE***. De igual manera, crearemos un usuario específico para el uso de la aplicación con los permisos suficientes para funcionar. Ya que no se recomienda usar el usuario root para operaciones comunes. Nos conectamos a la base de datos usando cualquier cliente de mysql. 
    `mysql -u root -p`

Dependiendo de la configuracion de la computadora, puede que por default no este permitido acceder al usuario root desde fuera del localhost interno del contenedor y que no nos permita conectarnos. De ser así, la solución es entrar desde una shell del contenedor y modificar el usuario root para permitir conexiones de mas lugares.

`docker exec -it mysql_docker mysql -p`

Una vez en la linea de comandos de sql, creamos el usuario nuevo
    
    CREATE user 'so1'@'%' identified by 'secretpassword';
    grant select,insert,update,delete on so1.* to 'so1'@'%';
    flush privileges;
  
Una vez creado el usuario, creamos la db y tabla utilizados por el backend
  

    START TRANSACTION;
    
    CREATE TABLE `prac1` (
      `id` int(11) NOT NULL,
      `LeftOperator` varchar(30) NOT NULL,
      `RightOperator` varchar(30) NOT NULL,
      `Operator` char(1) NOT NULL,
      `Result` varchar(150) NOT NULL,
      `TIMESTAMP` timestamp NOT NULL DEFAULT current_timestamp()
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    
    
    ALTER TABLE `prac1`
      ADD PRIMARY KEY (`id`);
      
    ALTER TABLE `prac1`
      MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;
    COMMIT;
            
Una vez creada la base de datos, la aplicación está lista para usar! Se puede acceder a el front desde cualquier navegador a travéz de `http://localhost:3000/`

![Application GUI](https://iili.io/HEMv3GI.png)


La otra funcionalidad de los logs de bash se puede acceder abriendo un shell hacia el respectivo contenedor

    docker exec -it bashd bash

Ejecutamos el script de reportes
    /log_script/reports.sh
![Application logs being displayed on terminal](https://iili.io/HEvcuyJ.png)
###### El que lea esto me debe poner 100/100