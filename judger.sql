-- phpMyAdmin SQL Dump
-- version 4.8.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 09, 2020 at 01:39 PM
-- Server version: 10.1.36-MariaDB
-- PHP Version: 5.6.38

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `judger`
--
CREATE DATABASE IF NOT EXISTS `judger` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `judger`;

-- --------------------------------------------------------

--
-- Table structure for table `contest`
--

CREATE TABLE `contest` (
  `contest_id` int(11) NOT NULL,
  `contest_name` varchar(50) NOT NULL,
  `teacher_rollnumber` varchar(10) NOT NULL,
  `time_begin` datetime NOT NULL,
  `time_end` datetime NOT NULL,
  `deleted` int(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `contest`
--

INSERT INTO `contest` (`contest_id`, `contest_name`, `teacher_rollnumber`, `time_begin`, `time_end`, `deleted`) VALUES
(1, 'Contest01', 'abc123', '2020-04-08 00:00:00', '2020-04-11 00:00:00', 0),
(2, 'Contest02', 'abc123', '2020-04-09 10:50:00', '2020-04-10 03:05:00', 0),
(3, 'Contest03', 'abc123', '2020-01-01 01:00:00', '2020-04-06 19:41:00', 0),
(4, 'Contest04', 'abc123', '2020-04-09 10:41:00', '2020-04-10 10:41:00', 0),
(5, 'Contest05', 'abc123', '2020-04-09 10:48:00', '2020-04-12 10:48:00', 0);

-- --------------------------------------------------------

--
-- Table structure for table `contest_student`
--

CREATE TABLE `contest_student` (
  `student_rollnumber` varchar(10) NOT NULL,
  `contest_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `contest_student`
--

INSERT INTO `contest_student` (`student_rollnumber`, `contest_id`) VALUES
('ce140237', 1),
('ce140238', 1),
('ce140239', 1),
('ce140240', 2),
('ce140241', 2);

-- --------------------------------------------------------

--
-- Table structure for table `student_account`
--

CREATE TABLE `student_account` (
  `id` int(11) NOT NULL,
  `rollnumber` varchar(10) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `class` varchar(50) NOT NULL,
  `in_contest` int(1) NOT NULL COMMENT '1: in contest, 0: not in contest',
  `ip` varchar(20) NOT NULL,
  `timeout` datetime NOT NULL,
  `islogin` int(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `student_account`
--

INSERT INTO `student_account` (`id`, `rollnumber`, `username`, `password`, `name`, `class`, `in_contest`, `ip`, `timeout`, `islogin`) VALUES
(1, 'ce140237', 'admin', '21232f297a57a5a743894a0e4a801fc3', 'Nguyễn Vương Khang Hy', 'IA1401', 1, '::1', '2020-04-08 17:48:45', 0),
(2, 'ce140238', 'ce140238', 'e10adc3949ba59abbe56e057f20f883e', 'ce140239', 'IA1401', 1, '', '0000-00-00 00:00:00', 0),
(3, 'ce140239', 'ce140239', 'e10adc3949ba59abbe56e057f20f883e', 'ce140239', 'IA1401', 1, '', '0000-00-00 00:00:00', 0),
(4, 'ce140240', 'ce140240', 'e10adc3949ba59abbe56e057f20f883e', 'ce140240', 'SE1501', 1, '::1', '2020-04-08 12:04:02', 0),
(5, 'ce140241', 'ce140241', 'e10adc3949ba59abbe56e057f20f883e', 'ce140241', 'SE1501', 1, '', '0000-00-00 00:00:00', 0),
(6, 'ce140242', 'ce140242', 'e10adc3949ba59abbe56e057f20f883e', 'ce140242', 'SE1502', 0, '::1', '2020-04-08 16:01:28', 1);

-- --------------------------------------------------------

--
-- Table structure for table `teacher_account`
--

CREATE TABLE `teacher_account` (
  `id` int(11) NOT NULL,
  `rollnumber` varchar(10) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `teacher_account`
--

INSERT INTO `teacher_account` (`id`, `rollnumber`, `username`, `password`, `name`) VALUES
(1, 'abc123', 'h', '2510c39011c5be704182423e3a695e91', 'Admin Teacher');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `contest`
--
ALTER TABLE `contest`
  ADD PRIMARY KEY (`contest_id`);

--
-- Indexes for table `contest_student`
--
ALTER TABLE `contest_student`
  ADD PRIMARY KEY (`student_rollnumber`);

--
-- Indexes for table `student_account`
--
ALTER TABLE `student_account`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uni_student_rollnumber` (`rollnumber`),
  ADD UNIQUE KEY `uni_student_username` (`username`);

--
-- Indexes for table `teacher_account`
--
ALTER TABLE `teacher_account`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uni_teacher_username` (`username`),
  ADD UNIQUE KEY `uni_rollnumber_teacher` (`rollnumber`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `contest`
--
ALTER TABLE `contest`
  MODIFY `contest_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `student_account`
--
ALTER TABLE `student_account`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `teacher_account`
--
ALTER TABLE `teacher_account`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
