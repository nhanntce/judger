-- phpMyAdmin SQL Dump
-- version 5.0.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 07, 2020 at 04:38 AM
-- Server version: 10.4.14-MariaDB
-- PHP Version: 7.2.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `judger`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_setCustomVal` (`sSeqName` VARCHAR(50), `sSeqGroup` VARCHAR(10), `nVal` INT UNSIGNED)  BEGIN
    IF (SELECT COUNT(*) FROM _sequence  
            WHERE seq_name = sSeqName  
                AND seq_group = sSeqGroup) = 0 THEN
        INSERT INTO _sequence (seq_name,seq_group,seq_val)
        VALUES (sSeqName,sSeqGroup,nVal);
    ELSE
        UPDATE _sequence SET seq_val = nVal
        WHERE seq_name = sSeqName AND seq_group = sSeqGroup;
    END IF;
END$$

--
-- Functions
--
CREATE DEFINER=`root`@`localhost` FUNCTION `getNextCustomSeq` (`sSeqName` VARCHAR(50), `sSeqGroup` VARCHAR(10)) RETURNS VARCHAR(20) CHARSET utf8 BEGIN
    DECLARE nLast_val INT; 
 
    SET nLast_val =  (SELECT seq_val
                          FROM _sequence
                          WHERE seq_name = sSeqName
                                AND seq_group = sSeqGroup);
    IF nLast_val IS NULL THEN
        SET nLast_val = 1;
        INSERT INTO _sequence (seq_name,seq_group,seq_val)
        VALUES (sSeqName,sSeqGroup,nLast_Val);
    ELSE
        SET nLast_val = nLast_val + 1;
        UPDATE _sequence SET seq_val = nLast_val
        WHERE seq_name = sSeqName AND seq_group = sSeqGroup;
    END IF; 
 
    SET @ret = (SELECT concat(sSeqGroup,'-',lpad(nLast_val,6,'0')));
    RETURN @ret;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `contest`
--

CREATE TABLE `contest` (
  `contest_id` int(11) NOT NULL,
  `teacher_id` varchar(20) NOT NULL,
  `contest_name` varchar(50) NOT NULL,
  `time_begin` datetime NOT NULL,
  `time_end` datetime NOT NULL,
  `language` varchar(30) NOT NULL,
  `deleted` int(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `contest`
--

INSERT INTO `contest` (`contest_id`, `teacher_id`, `contest_name`, `time_begin`, `time_end`, `language`, `deleted`) VALUES
(1, 'TC-000003', 'demo1', '2020-11-05 06:30:00', '2020-11-13 18:50:00', 'C,C++', 0),
(2, 'TC-000001', 'demo2', '2020-11-05 06:30:00', '2020-11-13 11:55:00', 'MySQL', 0);

-- --------------------------------------------------------

--
-- Table structure for table `contest_detail`
--

CREATE TABLE `contest_detail` (
  `contest_id` int(11) NOT NULL,
  `problem_id` varchar(50) NOT NULL,
  `path_problem` varchar(255) NOT NULL,
  `path_testcase` varchar(255) NOT NULL,
  `times` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `contest_detail`
--

INSERT INTO `contest_detail` (`contest_id`, `problem_id`, `path_problem`, `path_testcase`, `times`) VALUES
(1, 'A', './public/debai/demo1/KhanhVH_PRF192_SE1502_1.pdf', './public/thumuctest/demo1/A', 10),
(1, 'B', './public/debai/demo1/KhanhVH_PRF192_SE1502.HL.pdf', './public/thumuctest/demo1/B', 10),
(2, 'A', './public/debai/demo2/1001 DIEU UOC.pdf', './public/thumuctest/demo2/A', 10);

-- --------------------------------------------------------

--
-- Table structure for table `contest_owner`
--

CREATE TABLE `contest_owner` (
  `contest_id` int(11) NOT NULL,
  `teacher_id` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `student_account`
--

CREATE TABLE `student_account` (
  `id` int(11) NOT NULL,
  `userId` varchar(20) DEFAULT NULL,
  `rollnumber` varchar(10) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `class` varchar(50) NOT NULL,
  `contest_id` int(11) NOT NULL DEFAULT 0,
  `ip` varchar(20) NOT NULL DEFAULT '1',
  `timeout` datetime NOT NULL DEFAULT current_timestamp(),
  `islogin` int(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `student_account`
--

INSERT INTO `student_account` (`id`, `userId`, `rollnumber`, `username`, `password`, `name`, `class`, `contest_id`, `ip`, `timeout`, `islogin`) VALUES
(1, 'SD-000001', 'h', 'h', '2510c39011c5be704182423e3a695e91', 'Khang Hy', 'IA1401', 1, '1', '2020-11-06 21:34:02', 1),
(43, 'SD-000043', 'CE140237', 'ce140237', '46e0e6ce167bbf79b81892b7f58ce01a', 'Nguyễn Vương Khang Hy', 'FCoder', 0, '1', '2020-11-05 00:00:00', 0),
(77, 'SD-000058', 'CE140019', 'ce140019', '46e0e6ce167bbf79b81892b7f58ce01a', 'Trịnh Đình Quang', 'PE0309', 0, '1', '2020-11-05 00:00:00', 0),
(78, 'SD-000059', 'CE140212', 'ce140212', '46e0e6ce167bbf79b81892b7f58ce01a', 'Nguyễn Trọng Nghĩa', 'PE0309', 0, '1', '2020-11-05 00:00:00', 0),
(79, 'SD-000060', 'CE140242', 'ce140242', '46e0e6ce167bbf79b81892b7f58ce01a', 'Nguyễn Hứa Quốc Bảo', 'PE0309', 0, '1', '2020-11-05 00:00:00', 0),
(80, 'SD-000061', 'CE140284', 'ce140284', '46e0e6ce167bbf79b81892b7f58ce01a', 'Biện Minh Thông', 'PE0309', 0, '1', '2020-11-05 00:00:00', 0),
(81, 'SD-000062', 'CE140411', 'ce140411', '46e0e6ce167bbf79b81892b7f58ce01a', 'Lê Thanh Sang', 'PE0309', 0, '1', '2020-11-05 00:00:00', 0),
(82, 'SD-000063', 'CE140426', 'ce140426', '46e0e6ce167bbf79b81892b7f58ce01a', 'Bùi Quách Thịnh', 'PE0309', 0, '1', '2020-11-05 00:00:00', 0),
(83, 'SD-000064', 'CE140462', 'ce140462', '46e0e6ce167bbf79b81892b7f58ce01a', 'Nguyễn Khắc Huy', 'PE0309', 0, '1', '2020-11-05 00:00:00', 0),
(84, 'SD-000065', 'CE140520', 'ce140520', '46e0e6ce167bbf79b81892b7f58ce01a', 'Trần Nguyễn Quốc Huy', 'PE0309', 0, '1', '2020-11-05 00:00:00', 0),
(85, 'SD-000066', 'CE140524', 'ce140524', '46e0e6ce167bbf79b81892b7f58ce01a', 'Nguyễn Tấn Hiệp', 'PE0309', 0, '1', '2020-11-05 00:00:00', 0),
(86, 'SD-000067', 'CE140556', 'ce140556', '46e0e6ce167bbf79b81892b7f58ce01a', 'Huỳnh Hải Giang', 'PE0309', 0, '1', '2020-11-05 00:00:00', 0),
(87, 'SD-000068', 'CE150093', 'ce150093', '46e0e6ce167bbf79b81892b7f58ce01a', 'Phạm Minh Nhí', 'PE0309', 0, '1', '2020-11-05 00:00:00', 0),
(88, 'SD-000069', 'CE150124', 'ce150124', '46e0e6ce167bbf79b81892b7f58ce01a', 'Nguyễn Quốc Trung Nhân', 'PE0309', 0, '1', '2020-11-05 00:00:00', 0),
(89, 'SD-000070', 'CE150493', 'ce150493', '46e0e6ce167bbf79b81892b7f58ce01a', 'Phạm Đặng Lan Thịnh', 'PE0309', 0, '1', '2020-11-05 00:00:00', 0),
(90, 'SD-000071', 'CE150499', 'ce150499', '46e0e6ce167bbf79b81892b7f58ce01a', 'Trần Thị Hồng Mai', 'PE0309', 0, '1', '2020-11-05 00:00:00', 0),
(91, 'SD-000072', 'CE150569', 'ce150569', '46e0e6ce167bbf79b81892b7f58ce01a', 'Lê Trí Hào', 'PE0309', 0, '1', '2020-11-05 00:00:00', 0),
(92, 'SD-000073', 'CE150623', 'ce150623', '46e0e6ce167bbf79b81892b7f58ce01a', 'Trương Trung Tín', 'PE0309', 0, '1', '2020-11-05 00:00:00', 0),
(93, 'SD-000074', 'CE150662', 'ce150662', '46e0e6ce167bbf79b81892b7f58ce01a', 'Nguyễn Đăng Khánh', 'PE0309', 0, '1', '2020-11-05 00:00:00', 0),
(94, 'SD-000075', 'CE150718', 'ce150718', '46e0e6ce167bbf79b81892b7f58ce01a', 'Lý Tuấn Đạt', 'PE0309', 0, '1', '2020-11-05 00:00:00', 0),
(95, 'SD-000076', 'CE150762', 'ce150762', '46e0e6ce167bbf79b81892b7f58ce01a', 'Võ Gia Nguyên', 'PE0309', 0, '1', '2020-11-05 00:00:00', 0),
(96, 'SD-000077', 'user1', 'user1', '24c9e15e52afc47c225b757e7bee1f9d', 'user1', 'test', 0, '1', '2020-11-05 00:00:00', 0),
(97, 'SD-000078', 'user2', 'user2', '7e58d63b60197ceb55a1c487989a3720', 'user2', 'test', 0, '1', '2020-11-05 00:00:00', 0),
(98, 'SD-000079', 'user3', 'user3', '92877af70a45fd6a2ed7fe81e1236b78', 'user3', 'test', 0, '1', '2020-11-05 00:00:00', 0),
(99, 'SD-000080', 'user4', 'user4', '3f02ebe3d7929b091e3d8ccfde2f3bc6', 'user4', 'test', 0, '1', '2020-11-05 00:00:00', 0),
(100, 'SD-000081', 'user5', 'user5', '0a791842f52a0acfbb3a783378c066b8', 'user5', 'test', 0, '1', '2020-11-05 00:00:00', 0);

--
-- Triggers `student_account`
--
DELIMITER $$
CREATE TRIGGER `student_account_bi` BEFORE INSERT ON `student_account` FOR EACH ROW BEGIN
   SET NEW.userId = getNextCustomSeq("userId","SD");
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `teacher_account`
--

CREATE TABLE `teacher_account` (
  `id` int(11) NOT NULL,
  `userId` varchar(20) DEFAULT NULL,
  `rollnumber` varchar(10) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `role` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `teacher_account`
--

INSERT INTO `teacher_account` (`id`, `userId`, `rollnumber`, `username`, `password`, `name`, `role`) VALUES
(1, 'TC-000001', 'abc123', 'h', '2510c39011c5be704182423e3a695e91', 'IT', 0),
(2, 'TC-000002', 'GV123', 'a', '0cc175b9c0f1b6a831c399e269772661', 'Giáo vụ', 1),
(3, 'TC-000003', 'GV456', 'b', '92eb5ffee6ae2fec3ad71c777531578f', 'Giảng viên', 2);

--
-- Triggers `teacher_account`
--
DELIMITER $$
CREATE TRIGGER `teacher_account_bi` BEFORE INSERT ON `teacher_account` FOR EACH ROW BEGIN
   SET NEW.userId = getNextCustomSeq("userId1","TC");
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `_sequence`
--

CREATE TABLE `_sequence` (
  `seq_name` varchar(50) NOT NULL,
  `seq_group` varchar(10) NOT NULL,
  `seq_val` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `_sequence`
--

INSERT INTO `_sequence` (`seq_name`, `seq_group`, `seq_val`) VALUES
('userId', 'SD', 81),
('userId1', 'TC', 3);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `contest`
--
ALTER TABLE `contest`
  ADD PRIMARY KEY (`contest_id`);

--
-- Indexes for table `contest_detail`
--
ALTER TABLE `contest_detail`
  ADD PRIMARY KEY (`contest_id`,`problem_id`);

--
-- Indexes for table `contest_owner`
--
ALTER TABLE `contest_owner`
  ADD PRIMARY KEY (`contest_id`,`teacher_id`);

--
-- Indexes for table `student_account`
--
ALTER TABLE `student_account`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uni_student_rollnumber` (`rollnumber`),
  ADD UNIQUE KEY `uni_student_username` (`username`),
  ADD UNIQUE KEY `userId` (`userId`);

--
-- Indexes for table `teacher_account`
--
ALTER TABLE `teacher_account`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uni_teacher_username` (`username`),
  ADD UNIQUE KEY `uni_rollnumber_teacher` (`rollnumber`),
  ADD UNIQUE KEY `userId` (`userId`);

--
-- Indexes for table `_sequence`
--
ALTER TABLE `_sequence`
  ADD PRIMARY KEY (`seq_name`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `contest`
--
ALTER TABLE `contest`
  MODIFY `contest_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `student_account`
--
ALTER TABLE `student_account`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=101;

--
-- AUTO_INCREMENT for table `teacher_account`
--
ALTER TABLE `teacher_account`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
