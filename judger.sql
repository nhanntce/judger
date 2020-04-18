-- phpMyAdmin SQL Dump
-- version 4.8.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 15, 2020 at 01:38 PM
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
(1, 'Contest01', 'abc123', '2020-04-11 09:02:00', '2020-04-30 00:00:00', 0),
(2, 'Contest02', 'abc123', '2020-04-09 10:50:00', '2020-04-10 03:05:00', 0),
(3, 'Contest03', 'abc123', '2020-04-11 00:00:00', '2020-04-13 00:00:00', 0),
(4, 'Contest04', 'abc123', '2020-04-09 10:41:00', '2020-04-10 10:41:00', 0),
(5, 'Contest05', 'abc123', '2020-04-14 01:00:00', '2020-04-16 01:00:00', 1);

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
  `contest_id` int(11) NOT NULL DEFAULT '0',
  `ip` varchar(20) DEFAULT NULL,
  `timeout` datetime DEFAULT NULL,
  `islogin` int(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `student_account`
--

INSERT INTO `student_account` (`id`, `rollnumber`, `username`, `password`, `name`, `class`, `contest_id`, `ip`, `timeout`, `islogin`) VALUES
(1, 'ce140237', 'admin', '21232f297a57a5a743894a0e4a801fc3', 'Nguyễn Vương Khang Hy', 'IA1401', 1, '::1', '2020-04-15 13:29:15', 1),
(2, 'ce140238', 'ce140238', 'e10adc3949ba59abbe56e057f20f883e', 'ce140238', 'IA1401', 1, '', '0000-00-00 00:00:00', 0),
(3, 'ce140239', 'ce140239', 'e10adc3949ba59abbe56e057f20f883e', 'ce140239', 'IA1401', 1, '', '0000-00-00 00:00:00', 0),
(4, 'ce140240', 'ce140240', 'e10adc3949ba59abbe56e057f20f883e', 'ce140240', 'SE1501', 2, '::1', '2020-04-08 12:04:02', 0),
(5, 'ce140241', 'ce140241', 'e10adc3949ba59abbe56e057f20f883e', 'ce140241', 'SE1501', 2, '', '0000-00-00 00:00:00', 0),
(6, 'ce140242', 'ce140242', 'e10adc3949ba59abbe56e057f20f883e', 'ce140242', 'SE1502', 3, '::1', '2020-04-08 16:01:28', 1),
(7, 'CE140069', 'phunhce140069', '96b7794d2d325d0f316d49d9e04941d3', 'Nguyễn Hào Phú', 'SE1503', 0, NULL, NULL, NULL),
(8, 'CE130208', 'anhlnqce130208', 'b90a7713e6136d486cf999c30d0626a3', 'Lê Nguyễn Quốc Anh', 'SE1503', 0, NULL, NULL, NULL),
(9, 'CE140212', 'nghiantce140212', 'fad3123925604977dd6fe00e99205828', 'Nguyễn Trọng Nghĩa', 'SE1503', 0, NULL, NULL, NULL),
(10, 'CE150004', 'khangtdce150004', 'a4ac9345a1d086b2dd5acec4d1a2adbf', 'Thượng Duy Khang', 'SE1503', 0, NULL, NULL, NULL),
(11, 'CE150019', 'thotace150019', '325e606caa226e6efa1694a10d7e8379', 'Tiêu Anh Thọ', 'SE1503', 0, NULL, NULL, NULL),
(12, 'CE140345', 'anvtce140345', 'c49fe4b1398d90727e461d6fcde02dab', 'Võ Thành An', 'SE1503', 0, NULL, NULL, NULL),
(13, 'CE150020', 'thanhndce150020', 'dd70330d5ca548cbac20f870841d5180', 'Nguyễn Đại Thành', 'SE1503', 0, NULL, NULL, NULL),
(14, 'CE150022', 'minhdnce150022', 'ff4d8fc2f950e5ff30db9d86e83d2a39', 'Đoàn Ngọc Minh', 'SE1503', 0, NULL, NULL, NULL),
(15, 'CE150056', 'danhlptce150056', '4faca21aedc2553718df197f5047198e', 'Lê Phạm Thành Danh', 'SE1503', 0, NULL, NULL, NULL),
(16, 'CE150063', 'lamttce150063', '0bd55504a013f765ad61916e5dcb529d', 'Tống Thanh Lâm', 'SE1503', 0, NULL, NULL, NULL),
(17, 'CE150099', 'datltce150099', 'e69ce4f7e852cc2f616c150554f89b16', 'Lê Thành Đạt', 'SE1503', 0, NULL, NULL, NULL),
(18, 'CE150103', 'khoinmce150103', '062ef0102fd1cb1920a13610cb4bf472', 'Nguyễn Minh Khôi', 'SE1503', 0, NULL, NULL, NULL),
(19, 'CE150141', 'longlhhce150141', 'a445fb6c0bae957781a05194b1925d5f', 'Lê Hoàng Hải Long', 'SE1503', 0, NULL, NULL, NULL),
(20, 'CE150161', 'duyenhmce150161', '4ac87674d4c67f07e4a5abcddae65efd', 'Huỳnh Mỹ Duyên', 'SE1503', 0, NULL, NULL, NULL),
(21, 'CE150261', 'kietptce150261', '8ca43adf2a868d9b5d5b1191384bc57a', 'Phạm Tuấn Kiệt', 'SE1503', 0, NULL, NULL, NULL),
(22, 'CE150226', 'hoangnnce150226', '2cb909c12d1a7743d15c7f8c0ec9b7bc', 'Nguyễn Nhật Hoàng', 'SE1503', 0, NULL, NULL, NULL),
(23, 'CE150284', 'vinhce150284', '4386de04f13ec359f965cfaf8ad27375', 'Nguyễn Hoàng Vĩ', 'SE1503', 0, NULL, NULL, NULL),
(24, 'CE150337', 'phucnnhce150337', '0fa76b8c9cae71682016fd59461a1ff9', 'Ngô Nguyễn Hoàng Phúc', 'SE1503', 0, NULL, NULL, NULL),
(25, 'CE150269', 'toantkce150269', '53140a6aaf5152e8e6c979af7dac5d55', 'Trần Khánh Toàn', 'SE1503', 0, NULL, NULL, NULL),
(26, 'CE150405', 'locpbce150405', '93ab28f310aa84767b6d8992fcd537a6', 'Phạm Bảo Lộc', 'SE1503', 0, NULL, NULL, NULL),
(27, 'CE150568', 'thinhnpce150568', 'ebf6edf037647dd0a9769136c892ef49', 'Nguyễn Phúc Thịnh', 'SE1503', 0, NULL, NULL, NULL),
(28, 'CE150569', 'haoltce150569', 'c6f5b89426da07e6375048c86151e456', 'Lê Trí Hào', 'SE1503', 0, NULL, NULL, NULL),
(29, 'CE150599', 'phuttce150599', '83dc3d130608a20413fabe673320a723', 'Trần Thiện Phú', 'SE1503', 0, NULL, NULL, NULL),
(30, 'CE150696', 'vynlce150696', '5cfd2b9271371ab198c2a3f06c8f5bd9', 'Nguyễn Lê Vỹ', 'SE1503', 0, NULL, NULL, NULL),
(31, 'CE150706', 'binhthce150706', '33e5de212c783c988d9218a37e246bc2', 'Trần Hòa Bình', 'SE1503', 0, NULL, NULL, NULL),
(32, 'CE150762', 'nguyenvgce150762', '7f72771d9cdb3134abffe2b9ab8277b0', 'Võ Gia Nguyên', 'SE1503', 0, NULL, NULL, NULL);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `teacher_account`
--
ALTER TABLE `teacher_account`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
