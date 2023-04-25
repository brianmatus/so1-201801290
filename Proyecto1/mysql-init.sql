create database so1;
use so1;

ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';
ALTER USER 'root'@'localhost' IDENTIFIED BY '';



CREATE user 'so1'@'%' identified by '';
ALTER USER 'so1'@'%' IDENTIFIED WITH mysql_native_password BY '';
grant all privileges on so1.* to 'so1'@'%';
flush privileges;


-- MariaDB dump 10.19  Distrib 10.11.2-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: so1
-- ------------------------------------------------------
-- Server version 10.11.2-MariaDB-1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `departments` (
  `ID` int(11) NOT NULL,
  `NAME` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
INSERT INTO `departments` VALUES
(1,'Alta Verapaz'),
(2,'Baja Verapaz'),
(3,'Chimaltenango'),
(4,'Chiquimula'),
(5,'El Progreso'),
(6,'Escuintla'),
(7,'Guatemala'),
(8,'Huehuetenango'),
(9,'Izabal'),
(10,'Jalapa'),
(11,'Jutiapa'),
(12,'Petén'),
(13,'Quetzaltenango'),
(14,'Quiché'),
(15,'Retalhuleu'),
(16,'Sacatepéquez'),
(17,'San Marcos'),
(18,'Santa Rosa'),
(19,'Sololá'),
(20,'Suchitepéquez'),
(21,'Totonicapán'),
(22,'Zacapa');
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `municipalities`
--

DROP TABLE IF EXISTS `municipalities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `municipalities` (
  `ID` int(11) NOT NULL,
  `DPT` int(11) NOT NULL,
  `NAME` varchar(45) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `municipalities`
--

LOCK TABLES `municipalities` WRITE;
/*!40000 ALTER TABLE `municipalities` DISABLE KEYS */;
INSERT INTO `municipalities` VALUES
(1,1,'Cobán'),
(2,1,'Santa Cruz Verapaz'),
(3,1,'San Cristóbal Verapaz'),
(4,1,'Tactic'),
(5,1,'Tamahú'),
(18,2,'Salamá'),
(19,2,'San Miguel Chicaj'),
(20,2,'Rabinal'),
(21,2,'Cubulco'),
(22,2,'Granados'),
(26,3,'Chimaltenango'),
(27,3,'San José Poaquil'),
(28,3,'San Martín Jilotepeque'),
(29,3,'San Juan Comalapa'),
(30,3,'Santa Apolonia'),
(42,4,'Chiquimula'),
(43,4,'Jocotán'),
(44,4,'Esquipulas'),
(45,4,'Camotán'),
(46,4,'Quezaltepeque'),
(53,5,'El Jícaro'),
(54,5,'Morazán'),
(55,5,'San Agustín Acasaguastlán'),
(56,5,'San Antonio La Paz'),
(57,5,'San Cristóbal Acasaguastlán'),
(61,6,'Escuintla'),
(62,6,'Santa Lucía Cotzumalguapa'),
(63,6,'La Democracia'),
(64,6,'Siquinalá'),
(65,6,'Masagua'),
(74,7,'Santa Catarina Pinula'),
(75,7,'San José Pinula'),
(76,7,'Guatemala'),
(77,7,'San José del Golfo'),
(78,7,'Palencia'),
(91,8,'Huehuetenango'),
(92,8,'Chiantla'),
(93,8,'Malacatancito'),
(94,8,'Cuilco'),
(95,8,'Nentón'),
(122,9,'Morales'),
(123,9,'Los Amates'),
(124,9,'Livingston'),
(125,9,'El Estor'),
(126,9,'Puerto Barrios'),
(127,10,'Jalapa'),
(128,10,'San Pedro Pinula'),
(129,10,'San Luis Jilotepeque'),
(130,10,'San Manuel Chaparrón'),
(131,10,'San Carlos Alzatate'),
(134,11,'Jutiapa'),
(135,11,'El Progreso'),
(136,11,'Santa Catarina Mita'),
(137,11,'Agua Blanca'),
(138,11,'Asunción Mita'),
(150,12,'Flores'),
(151,12,'San José'),
(152,12,'San Benito'),
(153,12,'San Andrés'),
(154,12,'La Libertad'),
(162,13,'Quetzaltenango'),
(163,13,'Salcajá'),
(164,13,'San Juan Olintepeque'),
(165,13,'San Carlos Sija'),
(166,13,'Sibilia'),
(186,14,'Santa Cruz del Quiché'),
(187,14,'Chiché'),
(188,14,'Chinique'),
(189,14,'Zacualpa'),
(190,14,'Chajul'),
(207,15,'Retalhuleu'),
(208,15,'San Sebastián'),
(209,15,'Santa Cruz Muluá'),
(210,15,'San Martín Zapotitlán'),
(211,15,'San Felipe'),
(216,16,'Antigua Guatemala'),
(217,16,'Jocotenango'),
(218,16,'Pastores'),
(219,16,'Sumpango'),
(220,16,'Santo Domingo Xenacoj'),
(232,17,'San Marcos'),
(233,17,'Ayutla'),
(234,17,'Catarina'),
(235,17,'Comitancillo'),
(236,17,'Concepción Tutuapa'),
(262,18,'Cuilapa'),
(263,18,'Casillas Santa Rosa'),
(264,18,'Chiquimulilla'),
(265,18,'Guazacapán'),
(266,18,'Nueva Santa Rosa'),
(276,19,'Sololá'),
(277,19,'Concepción'),
(278,19,'Nahualá'),
(279,19,'Panajachel'),
(280,19,'San Andrés Semetabaj'),
(295,20,'Mazatenango'),
(296,20,'Cuyotenango'),
(297,20,'San Francisco Zapotitlán'),
(298,20,'San Bernardino'),
(299,20,'San José El Ídolo'),
(315,21,'Totonicapán'),
(316,21,'San Cristóbal Totonicapán'),
(317,21,'San Francisco El Alto'),
(318,21,'San Andrés Xecul'),
(319,21,'Momostenango'),
(323,22,'Cabañas'),
(324,22,'Estanzuela'),
(325,22,'Gualán'),
(326,22,'Huité'),
(327,22,'La Unión');
/*!40000 ALTER TABLE `municipalities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `papers`
--

DROP TABLE IF EXISTS `papers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `papers` (
  `ID` int(11) NOT NULL,
  `NAME` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `papers`
--

LOCK TABLES `papers` WRITE;
/*!40000 ALTER TABLE `papers` DISABLE KEYS */;
INSERT INTO `papers` VALUES
(1,'Blanca'),
(2,'Verde'),
(3,'Rosada');
/*!40000 ALTER TABLE `papers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parties`
--

DROP TABLE IF EXISTS `parties`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `parties` (
  `ID` int(11) NOT NULL,
  `NAME` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parties`
--

LOCK TABLES `parties` WRITE;
/*!40000 ALTER TABLE `parties` DISABLE KEYS */;
INSERT INTO `parties` VALUES
(1,'UNE'),
(2,'VAMOS'),
(3,'FCN'),
(4,'UNIONISTA'),
(5,'VALOR');
/*!40000 ALTER TABLE `parties` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `votes`
--

DROP TABLE IF EXISTS `votes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `votes` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `SEDE` int(11) NOT NULL,
  `MUNICIPIO` int(11) NOT NULL,
  `DEPARTAMENTO` int(11) NOT NULL,
  `PAPELETA` int(11) NOT NULL,
  `PARTIDO` int(11) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `votes`
--

LOCK TABLES `votes` WRITE;
/*!40000 ALTER TABLE `votes` DISABLE KEYS */;
/*!40000 ALTER TABLE `votes` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-04-24 19:24:54

