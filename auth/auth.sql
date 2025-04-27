-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: auth
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `drivers`
--

DROP TABLE IF EXISTS `drivers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `drivers` (
  `user_id` int NOT NULL,
  `vehical_info` text,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `drivers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `drivers`
--

LOCK TABLES `drivers` WRITE;
/*!40000 ALTER TABLE `drivers` DISABLE KEYS */;
INSERT INTO `drivers` VALUES (5,'motorbike');
/*!40000 ALTER TABLE `drivers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kitchen_staffs`
--

DROP TABLE IF EXISTS `kitchen_staffs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kitchen_staffs` (
  `user_id` int NOT NULL,
  `branch_id` int NOT NULL,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `kitchen_staffs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kitchen_staffs`
--

LOCK TABLES `kitchen_staffs` WRITE;
/*!40000 ALTER TABLE `kitchen_staffs` DISABLE KEYS */;
INSERT INTO `kitchen_staffs` VALUES (3,1),(7,1);
/*!40000 ALTER TABLE `kitchen_staffs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(64) NOT NULL,
  `username` varchar(64) NOT NULL,
  `hashed_password` varchar(60) NOT NULL,
  `role` enum('admin','customer','owner','kitchen_staff','driver','support_staff') NOT NULL DEFAULT 'customer',
  `is_active` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin@gmail.com','admin','$2b$12$5AQU08FRMMm/sKSyQ06qPOZ.howL9fIWP.Km075jmgWSUB49IynvG','admin',1),(2,'owner@gmail.com','owner','$2b$12$2PpZt6idYwlGB2tMFMOP5OJRna72Hi7f4pHaEh1kaR3xqxiPEfZ46','owner',1),(3,'kitchen_staff_1@gmail.com','kitchen_staff1','$2b$12$YcSYqHuPkFzzHjxMGehaK.kRZmWk5hiljj5/OCzedM3R4U7z9koDC','kitchen_staff',1),(4,'customer1@gmail.com','customer1','$2b$12$YRaoxsOQp42gNwp1e2fcq.yFrH8z9hyifS0OB/zA.fVIyP/sOcAQq','customer',1),(5,'driver1@gmai.com','driver1','$2b$12$NG7TWfI7EW3QGiQbK.5ph.a0xUVPBVKZ8SKaYmNWwyNJVhSqIz9Qy','driver',1),(6,'customer2@gmail.com','customer2','$2b$12$h449TlOV704Clo.es6diwuIN6F1RQKZVklWyGLbteLrfb1e.1zvuq','customer',1),(7,'kitchen_staff2@gmail.com','kitchen_staff2','$2b$12$3LvEP9AHzdHiO2.LMkDbi.8wpb.TCNoaJp/aCddhMFAimFaJYhVA6','kitchen_staff',1);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-27 19:35:53
