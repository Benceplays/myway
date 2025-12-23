-- --------------------------------------------------------
-- Gazdagép:                     127.0.0.1
-- Szerver verzió:               10.4.32-MariaDB - mariadb.org binary distribution
-- Szerver OS:                   Win64
-- HeidiSQL Verzió:              12.13.0.7147
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Adatbázis struktúra mentése a my_way.
CREATE DATABASE IF NOT EXISTS `my_way` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;
USE `my_way`;

-- Struktúra mentése tábla my_way. daily_tasks
CREATE TABLE IF NOT EXISTS `daily_tasks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `area` enum('health','learning','money','relationships','me') NOT NULL,
  `title` varchar(255) NOT NULL,
  `points` int(11) NOT NULL DEFAULT 10,
  `active` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=161 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tábla adatainak mentése my_way.daily_tasks: ~95 rows (hozzávetőleg)
DELETE FROM `daily_tasks`;
INSERT INTO `daily_tasks` (`id`, `area`, `title`, `points`, `active`) VALUES
	(1, 'health', 'Mozogj legalább 10 percet', 10, 1),
	(2, 'learning', 'Tanulj vagy olvass 10 percet', 10, 1),
	(3, 'money', 'Nézz rá a pénzügyeidre', 10, 1),
	(4, 'relationships', 'Lépj kapcsolatba valakivel', 10, 1),
	(5, 'me', 'Tölts 10 percet magaddal', 10, 1),
	(6, 'health', 'Igyál meg egy pohár vizet', 5, 1),
	(7, 'health', 'Állj fel és nyújtózz 2 percig', 5, 1),
	(8, 'me', 'Vegyél 5 mély levegőt', 5, 1),
	(9, 'health', 'Sétálj 5 percet', 5, 1),
	(10, 'me', 'Írj le 1 dolgot, amiért hálás vagy', 5, 1),
	(11, 'me', 'Kapcsold ki a telefonod 5 percre', 5, 1),
	(12, 'relationships', 'Küldj egy kedves üzenetet', 5, 1),
	(13, 'health', 'Egyél egy gyümölcsöt', 5, 1),
	(14, 'me', 'Mosolyogj magadra a tükörben', 5, 1),
	(15, 'learning', 'Írj le egy mai célod', 5, 1),
	(16, 'me', 'Dicsérd meg magad', 5, 1),
	(17, 'health', 'Nyújtózz ülve', 5, 1),
	(18, 'me', 'Csukd be a szemed 1 percre', 5, 1),
	(19, 'health', 'Igazítsd meg a testtartásod', 5, 1),
	(20, 'me', 'Hallgass csendet 1 percig', 5, 1),
	(21, 'relationships', 'Mosolyogj valakire', 5, 1),
	(22, 'health', 'Igyál még egy pohár vizet', 5, 1),
	(23, 'me', 'Írj le egy pozitív gondolatot', 5, 1),
	(24, 'learning', 'Nyisd meg a naplód', 5, 1),
	(25, 'me', 'Köszönd meg a mai napot', 5, 1),
	(26, 'health', 'Sétálj 10 percet', 10, 1),
	(27, 'health', 'Mozogj tudatosan 10 percig', 10, 1),
	(28, 'learning', 'Tanulj 10 percet valami újat', 10, 1),
	(29, 'learning', 'Olvass 5 oldalt', 10, 1),
	(30, 'me', 'Írj le 3 hálás dolgot', 10, 1),
	(31, 'relationships', 'Beszélgess valakivel 10 percig', 10, 1),
	(32, 'learning', 'Írj le egy célod holnapra', 10, 1),
	(33, 'me', 'Kapcsolódj ki 30 percre', 10, 1),
	(34, 'health', 'Főzz egy egyszerű ételt', 10, 1),
	(35, 'learning', 'Hallgass meg egy podcast részletet', 10, 1),
	(36, 'learning', 'Tanulj meg egy új szót', 10, 1),
	(37, 'me', 'Figyelj a légzésedre 5 percig', 10, 1),
	(38, 'relationships', 'Írj egy üzenetet egy barátnak', 10, 1),
	(39, 'learning', 'Tervezd meg a holnapod', 10, 1),
	(40, 'health', 'Sétálj telefon nélkül', 10, 1),
	(41, 'me', 'Kapcsold ki a közösségi médiát 1 órára', 10, 1),
	(42, 'learning', 'Tanulj 15 percet', 10, 1),
	(43, 'me', 'Írj le egy sikert', 10, 1),
	(44, 'learning', 'Rendezd a jegyzeteid', 10, 1),
	(45, 'me', 'Írj le egy kérdést magadnak', 10, 1),
	(46, 'health', 'Mozogj 30 percet', 20, 1),
	(47, 'learning', 'Tanulj 30 percet fókuszáltan', 20, 1),
	(48, 'learning', 'Írj le egy komoly célod', 20, 1),
	(49, 'learning', 'Készíts heti tervet', 20, 1),
	(50, 'me', 'Írj le 5 hálás dolgot', 20, 1),
	(51, 'health', 'Sportolj intenzíven', 20, 1),
	(52, 'health', 'Főzz egészséges ételt', 20, 1),
	(53, 'learning', 'Olvass 20 oldalt', 20, 1),
	(54, 'me', 'Változtass meg egy rossz szokást ma', 20, 1),
	(55, 'relationships', 'Beszélj őszintén valakivel', 20, 1),
	(56, 'me', 'Kapcsolódj ki fél napra', 20, 1),
	(57, 'learning', 'Tervezd meg a heted', 20, 1),
	(58, 'money', 'Készíts pénzügyi áttekintést', 20, 1),
	(59, 'money', 'Tervezz megtakarítást', 20, 1),
	(60, 'learning', 'Dolgozz fókuszáltan 1 órát', 20, 1),
	(61, 'me', 'Írj heti visszatekintést', 20, 1),
	(62, 'relationships', 'Erősíts meg egy kapcsolatot', 20, 1),
	(63, 'health', 'Végezz intenzív edzést', 20, 1),
	(64, 'learning', 'Tanulj egy nehéz témát', 20, 1),
	(65, 'me', 'Állíts fel egy új rutint', 20, 1),
	(126, 'me', 'Írj le egy dolgot, amit ma jól csináltál', 5, 1),
	(127, 'health', 'Állj fel és mozgasd át a vállad', 5, 1),
	(128, 'me', 'Figyeld meg 1 percig a gondolataidat', 5, 1),
	(129, 'relationships', 'Kérdezd meg valakitől, hogy van', 5, 1),
	(130, 'health', 'Igyál meg egy pohár vizet lassan', 5, 1),
	(131, 'learning', 'Írj le egy kérdést, ami ma eszedbe jutott', 5, 1),
	(132, 'me', 'Vegyél 3 lassú, mély lélegzetet', 5, 1),
	(133, 'relationships', 'Mondj köszönetet valakinek', 5, 1),
	(134, 'health', 'Nyújtsd meg a nyakad óvatosan', 5, 1),
	(135, 'me', 'Csukd be a szemed és lazíts 1 percig', 5, 1),
	(136, 'health', 'Sétálj 15 percet egyenletes tempóban', 10, 1),
	(137, 'learning', 'Olvass egy cikket figyelmesen', 10, 1),
	(138, 'me', 'Írj le 3 gondolatot magadról', 10, 1),
	(139, 'relationships', 'Tölts minőségi időt valakivel 15 percig', 10, 1),
	(140, 'learning', 'Tanulj 20 percet megszakítás nélkül', 10, 1),
	(141, 'health', 'Mozgasd át a tested 15 percig', 10, 1),
	(142, 'me', 'Kapcsold ki a telefonod 45 percre', 10, 1),
	(143, 'learning', 'Jegyzetelj egy új témáról', 10, 1),
	(144, 'relationships', 'Írj egy őszinte üzenetet valakinek', 10, 1),
	(145, 'me', 'Gondold végig, mi motivál ma', 10, 1),
	(146, 'health', 'Végezz 30 perc aktív mozgást', 20, 1),
	(147, 'learning', 'Tanulj 45 percig fókuszáltan', 20, 1),
	(148, 'me', 'Írj egy hosszabb önreflexiót', 20, 1),
	(149, 'relationships', 'Beszélj át egy fontos témát valakivel', 20, 1),
	(150, 'money', 'Nézd át a havi kiadásaid', 20, 1),
	(151, 'learning', 'Dolgozz egy nehéz feladaton 1 órát', 20, 1),
	(152, 'me', 'Alakíts ki egy új napi szokást', 20, 1),
	(153, 'health', 'Sportolj magas intenzitással', 20, 1),
	(154, 'money', 'Állíts fel pénzügyi célt', 20, 1),
	(155, 'me', 'Írj le egy hosszú távú célod', 20, 1),
	(156, 'relationships', 'Teszt', 1, 1),
	(157, 'health', 'Fogmosás', 1, 1),
	(158, 'health', 'Teszt', 1, 1),
	(159, 'money', 'E', 1, 1),
	(160, 'me', 'A', 1, 1);

-- Struktúra mentése tábla my_way. user_area_points
CREATE TABLE IF NOT EXISTS `user_area_points` (
  `user_id` int(11) NOT NULL,
  `area` enum('health','learning','money','relationships','me') NOT NULL,
  `points` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`user_id`,`area`),
  CONSTRAINT `fk_uap_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tábla adatainak mentése my_way.user_area_points: ~5 rows (hozzávetőleg)
DELETE FROM `user_area_points`;
INSERT INTO `user_area_points` (`user_id`, `area`, `points`) VALUES
	(1, 'health', 2),
	(1, 'learning', 30),
	(1, 'money', 60),
	(1, 'relationships', 7),
	(1, 'me', 30);

-- Struktúra mentése tábla my_way. user_daily_tasks
CREATE TABLE IF NOT EXISTS `user_daily_tasks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `daily_task_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `completed` tinyint(1) DEFAULT 0,
  `completed_at` datetime DEFAULT NULL,
  `deleted` tinyint(1) NOT NULL DEFAULT 0,
  `points` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_user_task_day` (`user_id`,`daily_task_id`,`date`),
  KEY `fk_udt_task` (`daily_task_id`),
  CONSTRAINT `fk_udt_task` FOREIGN KEY (`daily_task_id`) REFERENCES `daily_tasks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_udt_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=432 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tábla adatainak mentése my_way.user_daily_tasks: ~31 rows (hozzávetőleg)
DELETE FROM `user_daily_tasks`;
INSERT INTO `user_daily_tasks` (`id`, `user_id`, `daily_task_id`, `date`, `completed`, `completed_at`, `deleted`, `points`) VALUES
	(395, 1, 130, '2025-12-20', 0, NULL, 1, 0),
	(402, 1, 133, '2025-12-20', 0, NULL, 1, 0),
	(403, 1, 142, '2025-12-20', 0, NULL, 1, 0),
	(404, 1, 137, '2025-12-20', 0, NULL, 1, 0),
	(405, 1, 59, '2025-12-20', 0, NULL, 1, 0),
	(406, 1, 58, '2025-12-20', 0, NULL, 1, 0),
	(407, 1, 156, '2025-12-20', 1, NULL, 1, 1),
	(408, 1, 157, '2025-12-20', 0, NULL, 1, 0),
	(409, 1, 40, '2025-12-21', 1, '2025-12-21 22:18:57', 1, 10),
	(410, 1, 39, '2025-12-21', 1, '2025-12-21 16:56:55', 1, 10),
	(411, 1, 150, '2025-12-21', 1, '2025-12-21 16:40:35', 1, 20),
	(412, 1, 149, '2025-12-21', 1, '2025-12-21 16:56:34', 1, 20),
	(413, 1, 45, '2025-12-21', 1, '2025-12-21 16:56:22', 1, 10),
	(414, 1, 158, '2025-12-21', 1, '2025-12-21 16:57:08', 1, 1),
	(415, 1, 6, '2025-12-21', 0, NULL, 1, 0),
	(416, 1, 49, '2025-12-21', 0, NULL, 1, 0),
	(417, 1, 59, '2025-12-21', 1, '2025-12-21 22:22:01', 1, 20),
	(418, 1, 62, '2025-12-21', 1, '2025-12-21 22:22:01', 1, 20),
	(419, 1, 145, '2025-12-21', 1, '2025-12-21 22:22:01', 1, 10),
	(420, 1, 159, '2025-12-21', 0, NULL, 1, 0),
	(421, 1, 160, '2025-12-21', 1, '2025-12-18 22:22:15', 0, 20),
	(422, 1, 17, '2025-12-21', 0, NULL, 0, 0),
	(423, 1, 32, '2025-12-21', 1, '2025-12-21 22:25:16', 0, 5),
	(424, 1, 58, '2025-12-21', 1, '2025-12-21 22:25:16', 0, 10),
	(425, 1, 133, '2025-12-21', 1, '2025-12-21 22:25:16', 0, 20),
	(426, 1, 152, '2025-12-21', 1, '2025-12-21 22:25:17', 0, 30),
	(427, 1, 157, '2025-12-23', 1, '2025-12-23 10:29:07', 0, 1),
	(428, 1, 28, '2025-12-23', 1, '2025-12-23 10:29:07', 0, 10),
	(429, 1, 150, '2025-12-23', 1, '2025-12-23 10:29:08', 0, 20),
	(430, 1, 156, '2025-12-23', 1, '2025-12-23 10:29:08', 0, 1),
	(431, 1, 18, '2025-12-23', 1, '2025-12-23 10:29:09', 0, 5);

-- Struktúra mentése tábla my_way. user_point_history
CREATE TABLE IF NOT EXISTS `user_point_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `area` enum('health','learning','money','relationships','me') NOT NULL,
  `points` int(11) NOT NULL,
  `created_at` date NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `user_point_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tábla adatainak mentése my_way.user_point_history: ~5 rows (hozzávetőleg)
DELETE FROM `user_point_history`;
INSERT INTO `user_point_history` (`id`, `user_id`, `area`, `points`, `created_at`) VALUES
	(1, 1, 'health', 1, '2025-12-23'),
	(2, 1, 'learning', 10, '2025-12-23'),
	(3, 1, 'money', 20, '2025-12-23'),
	(4, 1, 'relationships', 1, '2025-12-23'),
	(5, 1, 'me', 5, '2025-12-23'),
	(6, 1, 'health', 1, '2025-12-23'),
	(7, 1, 'learning', 10, '2025-12-23'),
	(8, 1, 'relationships', 1, '2025-12-23'),
	(9, 1, 'money', 20, '2025-12-23'),
	(10, 1, 'me', 5, '2025-12-23');

-- Struktúra mentése tábla my_way. user_streaks
CREATE TABLE IF NOT EXISTS `user_streaks` (
  `user_id` int(11) NOT NULL,
  `current_streak` int(11) DEFAULT 0,
  `last_completed` date DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_streak_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tábla adatainak mentése my_way.user_streaks: ~0 rows (hozzávetőleg)
DELETE FROM `user_streaks`;
INSERT INTO `user_streaks` (`user_id`, `current_streak`, `last_completed`) VALUES
	(1, 1, '2025-12-23');

-- Struktúra mentése tábla my_way. users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `totalPoints` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tábla adatainak mentése my_way.users: ~1 rows (hozzávetőleg)
DELETE FROM `users`;
INSERT INTO `users` (`id`, `email`, `password_hash`, `created_at`, `totalPoints`) VALUES
	(1, 'nemeth.csaba.bence@gmail.com', '$2b$10$ESYLENMi7xGrJonBN0SqC.BeceQl0M0Yiq7hLWgTPyBP6SjcWoF6u', '2025-12-20 11:39:18', 51);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
