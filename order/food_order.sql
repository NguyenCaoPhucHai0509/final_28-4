-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: food_order
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
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `menu_item_id` int NOT NULL,
  `quantity` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `status` enum('pending','preparing','ready') NOT NULL DEFAULT 'pending',
  `note` text,
  `kitchen_staff_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  CONSTRAINT `order_items_chk_1` CHECK ((`quantity` > 0)),
  CONSTRAINT `order_items_chk_2` CHECK ((`price` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,1,1,12.99,'pending',NULL,NULL,'2025-04-27 15:33:10',NULL),(2,1,4,1,14.50,'pending',NULL,NULL,'2025-04-27 15:33:10',NULL),(3,2,1,1,12.99,'pending',NULL,NULL,'2025-04-27 15:40:35',NULL),(4,2,4,1,14.50,'pending',NULL,NULL,'2025-04-27 15:40:35',NULL),(5,3,1,1,12.99,'pending',NULL,NULL,'2025-04-27 15:41:10',NULL),(6,3,4,1,14.50,'pending',NULL,NULL,'2025-04-27 15:41:10',NULL),(7,4,1,1,12.99,'pending',NULL,NULL,'2025-04-27 15:43:32',NULL),(8,4,4,1,14.50,'pending',NULL,NULL,'2025-04-27 15:43:32',NULL),(9,5,1,1,12.99,'pending',NULL,NULL,'2025-04-27 15:45:46',NULL),(10,5,4,1,14.50,'pending',NULL,NULL,'2025-04-27 15:45:46',NULL),(11,6,1,1,12.99,'pending',NULL,NULL,'2025-04-27 15:48:38',NULL),(12,6,4,1,14.50,'pending',NULL,NULL,'2025-04-27 15:48:38',NULL),(13,7,1,1,12.99,'pending',NULL,NULL,'2025-04-27 15:57:20',NULL),(14,7,4,1,14.50,'pending',NULL,NULL,'2025-04-27 15:57:20',NULL),(15,8,1,1,12.99,'pending',NULL,NULL,'2025-04-27 15:59:50',NULL),(16,8,4,1,14.50,'pending',NULL,NULL,'2025-04-27 15:59:50',NULL),(17,9,1,1,12.99,'pending',NULL,NULL,'2025-04-27 16:03:25',NULL),(18,9,4,1,14.50,'pending',NULL,NULL,'2025-04-27 16:03:25',NULL),(19,10,1,1,12.99,'pending',NULL,NULL,'2025-04-27 16:07:54',NULL),(20,10,4,1,14.50,'pending',NULL,NULL,'2025-04-27 16:07:54',NULL),(21,11,1,1,12.99,'pending',NULL,NULL,'2025-04-27 16:26:01',NULL),(22,11,4,1,14.50,'pending',NULL,NULL,'2025-04-27 16:26:01',NULL),(23,12,1,1,12.99,'pending',NULL,NULL,'2025-04-27 16:29:37',NULL),(24,12,4,1,14.50,'pending',NULL,NULL,'2025-04-27 16:29:37',NULL),(25,13,1,1,12.99,'pending',NULL,NULL,'2025-04-27 16:30:26',NULL),(26,13,4,1,14.50,'pending',NULL,NULL,'2025-04-27 16:30:26',NULL),(27,14,1,1,12.99,'pending',NULL,NULL,'2025-04-27 16:37:48',NULL),(28,14,4,1,14.50,'pending',NULL,NULL,'2025-04-27 16:37:48',NULL),(29,15,1,1,12.99,'pending',NULL,NULL,'2025-04-27 16:47:07',NULL),(30,15,4,1,14.50,'pending',NULL,NULL,'2025-04-27 16:47:07',NULL),(31,16,1,1,12.99,'pending',NULL,NULL,'2025-04-27 16:48:09',NULL),(32,16,4,1,14.50,'pending',NULL,NULL,'2025-04-27 16:48:09',NULL),(33,17,1,1,12.99,'pending',NULL,NULL,'2025-04-27 16:57:15',NULL),(34,17,4,1,14.50,'pending',NULL,NULL,'2025-04-27 16:57:15',NULL),(35,18,1,1,12.99,'pending',NULL,NULL,'2025-04-27 16:59:30',NULL),(36,18,4,1,14.50,'pending',NULL,NULL,'2025-04-27 16:59:30',NULL),(37,19,1,1,12.99,'pending',NULL,NULL,'2025-04-27 17:01:00',NULL),(38,19,4,1,14.50,'pending',NULL,NULL,'2025-04-27 17:01:00',NULL),(39,20,1,1,12.99,'pending',NULL,NULL,'2025-04-27 17:03:42',NULL),(40,20,4,1,14.50,'pending',NULL,NULL,'2025-04-27 17:03:42',NULL),(41,21,1,1,12.99,'pending',NULL,NULL,'2025-04-27 17:15:31',NULL),(42,21,4,1,14.50,'pending',NULL,NULL,'2025-04-27 17:15:31',NULL),(43,22,1,1,12.99,'pending',NULL,NULL,'2025-04-27 17:16:26',NULL),(44,22,4,1,14.50,'pending',NULL,NULL,'2025-04-27 17:16:26',NULL),(45,23,1,1,12.99,'pending',NULL,NULL,'2025-04-27 17:19:15',NULL),(46,23,4,1,14.50,'pending',NULL,NULL,'2025-04-27 17:19:15',NULL),(47,24,1,1,12.99,'pending',NULL,NULL,'2025-04-27 17:19:34',NULL),(48,24,4,1,14.50,'pending',NULL,NULL,'2025-04-27 17:19:34',NULL),(49,25,1,1,12.99,'pending',NULL,NULL,'2025-04-27 17:22:53',NULL),(50,25,4,1,14.50,'pending',NULL,NULL,'2025-04-27 17:22:53',NULL),(51,26,1,1,12.99,'ready',NULL,7,'2025-04-27 17:30:46','2025-04-27 17:55:03'),(52,26,4,1,14.50,'ready',NULL,7,'2025-04-27 17:30:46','2025-04-27 17:55:18');
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `branch_id` int NOT NULL,
  `status` enum('pending','preparing','ready_for_delivery','canceled') NOT NULL DEFAULT 'pending',
  `total_amount` decimal(12,3) NOT NULL DEFAULT '0.000',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,6,1,'pending',0.000,'2025-04-27 15:33:10'),(2,6,1,'pending',0.000,'2025-04-27 15:40:35'),(3,6,1,'pending',0.000,'2025-04-27 15:41:10'),(4,6,1,'pending',0.000,'2025-04-27 15:43:32'),(5,6,1,'pending',0.000,'2025-04-27 15:45:46'),(6,6,1,'pending',0.000,'2025-04-27 15:48:38'),(7,6,1,'pending',0.000,'2025-04-27 15:57:20'),(8,6,1,'pending',0.000,'2025-04-27 15:59:50'),(9,6,1,'pending',0.000,'2025-04-27 16:03:25'),(10,6,1,'pending',0.000,'2025-04-27 16:07:54'),(11,6,1,'pending',0.000,'2025-04-27 16:26:01'),(12,6,1,'pending',0.000,'2025-04-27 16:29:37'),(13,6,1,'pending',0.000,'2025-04-27 16:30:26'),(14,6,1,'pending',0.000,'2025-04-27 16:37:48'),(15,6,1,'pending',0.000,'2025-04-27 16:47:07'),(16,6,1,'pending',0.000,'2025-04-27 16:48:09'),(17,6,1,'pending',0.000,'2025-04-27 16:57:15'),(18,6,1,'pending',0.000,'2025-04-27 16:59:30'),(19,6,1,'pending',0.000,'2025-04-27 17:01:00'),(20,6,1,'pending',0.000,'2025-04-27 17:03:42'),(21,6,1,'pending',0.000,'2025-04-27 17:15:31'),(22,6,1,'pending',0.000,'2025-04-27 17:16:26'),(23,6,1,'pending',0.000,'2025-04-27 17:19:15'),(24,6,1,'pending',0.000,'2025-04-27 17:19:34'),(25,6,1,'pending',0.000,'2025-04-27 17:22:53'),(26,6,1,'ready_for_delivery',0.000,'2025-04-27 17:30:46');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-27 19:37:24
