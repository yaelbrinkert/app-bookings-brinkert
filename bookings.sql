-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Hôte : localhost:8889
-- Généré le : mar. 08 oct. 2024 à 09:51
-- Version du serveur : 5.7.39
-- Version de PHP : 8.2.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `bookings`
--

-- --------------------------------------------------------

--
-- Structure de la table `bookings`
--

CREATE TABLE `bookings` (
  `id` int(11) NOT NULL,
  `date` date NOT NULL,
  `email` varchar(100) NOT NULL,
  `name` varchar(25) NOT NULL,
  `hour` time NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `bookings`
--

INSERT INTO `bookings` (`id`, `date`, `email`, `name`, `hour`) VALUES
(1, '2024-09-26', 'yael.brinkert@gmail.com', 'BRINKERT', '09:30:00'),
(2, '2024-09-30', 'exemple@gmail.com', 'PARGA', '11:30:00'),
(3, '2024-09-26', 'yael.brinkert@gmail.com', 'PARGA', '11:30:00'),
(5, '2024-09-27', 'sophie.bluel@test.tld', 'Claude', '10:00:00'),
(6, '2024-09-27', 'nolou1997@gmail.com', 'CUBILLOS', '09:00:00');

-- --------------------------------------------------------

--
-- Structure de la table `off_days`
--

CREATE TABLE `off_days` (
  `id` int(11) NOT NULL,
  `date` date NOT NULL,
  `reason` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Structure de la table `opening_hours`
--

CREATE TABLE `opening_hours` (
  `id` int(11) NOT NULL,
  `day_of_week` int(11) NOT NULL,
  `start_time_morning` time NOT NULL DEFAULT '09:00:00',
  `end_time_morning` time NOT NULL DEFAULT '12:00:00',
  `start_time_afternoon` time NOT NULL DEFAULT '13:30:00',
  `end_time_afternoon` time NOT NULL DEFAULT '17:30:00',
  `is_open` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `opening_hours`
--

INSERT INTO `opening_hours` (`id`, `day_of_week`, `start_time_morning`, `end_time_morning`, `start_time_afternoon`, `end_time_afternoon`, `is_open`) VALUES
(1, 0, '09:00:00', '12:00:00', '13:30:00', '17:30:00', 0),
(2, 1, '09:00:00', '12:00:00', '13:30:00', '17:30:00', 1),
(3, 2, '09:00:00', '12:00:00', '13:30:00', '17:30:00', 1),
(4, 3, '09:00:00', '12:00:00', '13:30:00', '17:30:00', 1),
(5, 4, '09:00:00', '12:00:00', '13:30:00', '17:30:00', 1),
(6, 5, '09:00:00', '12:00:00', '13:30:00', '17:30:00', 1),
(7, 6, '00:00:00', '00:00:00', '13:30:00', '17:30:00', 1);

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `off_days`
--
ALTER TABLE `off_days`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `opening_hours`
--
ALTER TABLE `opening_hours`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT pour la table `off_days`
--
ALTER TABLE `off_days`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `opening_hours`
--
ALTER TABLE `opening_hours`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
