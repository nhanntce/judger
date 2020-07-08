-- phpMyAdmin SQL Dump
-- version 4.8.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 04, 2020 at 04:29 PM
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
  `contest_name` varchar(50) NOT NULL,
  `teacher_id` varchar(20) NOT NULL,
  `time_begin` datetime NOT NULL,
  `time_end` datetime NOT NULL,
  `deleted` int(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `contest`
--

INSERT INTO `contest` (`contest_id`, `contest_name`, `teacher_id`, `time_begin`, `time_end`, `deleted`) VALUES
(1, 'Contest01', 'TC-000001', '2020-06-01 11:16:00', '2020-07-11 23:55:00', 0),
(2, 'Contest02', 'TC-000001', '2020-04-09 10:50:00', '2020-07-11 19:15:00', 0),
(3, 'Contest03', 'TC-000001', '2020-04-11 00:00:00', '2020-04-13 00:00:00', 0),
(4, 'Contest04', 'TC-000001', '2020-05-15 10:41:00', '2020-07-25 15:35:00', 0),
(5, 'Contest05', 'TC-000001', '2020-04-14 01:00:00', '2020-04-30 01:00:00', 1),
(6, 'hy', 'TC-000001', '2020-05-28 18:35:00', '2020-05-29 15:35:00', 1),
(7, 'Con heo biet noi', 'TC-000001', '2020-05-17 12:40:00', '2020-06-05 16:15:00', 1),
(8, 'Alo 123', 'TC-000001', '2020-05-24 16:40:00', '2020-06-03 17:45:00', 1),
(9, 'asdf', 'TC-000001', '2020-06-03 06:30:00', '2020-06-05 08:15:00', 1),
(11, 'alo', 'TC-000001', '2020-06-05 19:15:00', '2020-06-11 19:15:00', 0),
(12, 'FCoder', 'TC-000001', '2020-06-11 18:15:00', '2020-07-11 19:00:00', 0);

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
(1, 'A', './public/debai/Contest01/1001 DIEU UOC.pdf', './public/thumuctest/Contest01/A', 10),
(1, 'B', './public/debai/Contest01/DI-CƯ.docx', './public/thumuctest/Contest01/B', 10),
(1, 'C', './public/debai/Contest01/Prime.pdf', './public/thumuctest/Contest01/C', 10),
(2, 'A', './public/debai/Contest02/1001 DIEU UOC.pdf', './public/thumuctest/Contest02/A', 10),
(4, 'A', './public/debai/Contest04/1001 DIEU UOC.pdf', './public/thumuctest/Contest04/A', 10),
(4, 'B', './public/debai/Contest04/DI-CƯ.docx', './public/thumuctest/Contest04/B', 10),
(11, 'A', './public/debai/alo/Power of 8.pdf', './public/thumuctest/alo/A', 10),
(11, 'B', './public/debai/alo/Division of Power 2.pdf', './public/thumuctest/alo/B', 10),
(11, 'C', './public/debai/alo/Non-Overlapping Area.pdf', './public/thumuctest/alo/C', 10),
(12, 'A', './public/debai/FCoder/Power of 8.pdf', './public/thumuctest/FCoder/A', 10),
(12, 'B', './public/debai/FCoder/Division of Power 2.pdf', './public/thumuctest/FCoder/B', 10),
(12, 'C', './public/debai/FCoder/Non-Overlapping Area.pdf', './public/thumuctest/FCoder/C', 10);

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
  `contest_id` int(11) NOT NULL DEFAULT '0',
  `ip` varchar(20) NOT NULL DEFAULT '1',
  `timeout` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `islogin` int(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `student_account`
--

INSERT INTO `student_account` (`id`, `userId`, `rollnumber`, `username`, `password`, `name`, `class`, `contest_id`, `ip`, `timeout`, `islogin`) VALUES
(1, 'SD-000001', 'h', 'h', '2510c39011c5be704182423e3a695e91', 'Khang Hy', 'IA1401', 1, '1', '2020-07-04 16:26:36', 0),
(2, 'SD-000002', 'CE130208', 'anhlnqce130208', '46e0e6ce167bbf79b81892b7f58ce01a', 'Lê Nguyễn Quốc Anh', 'SE1503', 4, '1', '2020-07-04 16:28:24', 1),
(3, 'SD-000003', 'CE140069', 'phunhce140069', '46e0e6ce167bbf79b81892b7f58ce01a', 'Nguyễn Hào Phú', 'SE1503', 4, '1', '2020-07-04 16:29:01', 1),
(4, 'SD-000004', 'CE140212', 'nghiantce140212', '46e0e6ce167bbf79b81892b7f58ce01a', 'Nguyễn Trọng Nghĩa', 'SE1503', 4, '1', '2020-06-02 19:31:35', 0),
(5, 'SD-000005', 'CE140345', 'anvtce140345', '46e0e6ce167bbf79b81892b7f58ce01a', 'Võ Thành An', 'SE1503', 4, '1', '2020-07-04 17:25:48', 0),
(6, 'SD-000006', 'CE150004', 'khangtdce150004', '46e0e6ce167bbf79b81892b7f58ce01a', 'Thượng Duy Khang', 'SE1503', 3, '1', '2020-06-02 19:31:35', 0),
(7, 'SD-000007', 'CE150019', 'thotace150019', '46e0e6ce167bbf79b81892b7f58ce01a', 'Tiêu Anh Thọ', 'SE1503', 3, '1', '2020-06-02 19:31:35', 0),
(8, 'SD-000008', 'CE150020', 'thanhndce150020', '46e0e6ce167bbf79b81892b7f58ce01a', 'Nguyễn Đại Thành', 'SE1503', 3, '1', '2020-06-02 19:31:35', 0),
(9, 'SD-000009', 'CE150022', 'minhdnce150022', '46e0e6ce167bbf79b81892b7f58ce01a', 'Đoàn Ngọc Minh', 'SE1503', 3, '1', '2020-06-02 19:31:35', 0),
(10, 'SD-000010', 'CE150056', 'danhlptce150056', '46e0e6ce167bbf79b81892b7f58ce01a', 'Lê Phạm Thành Danh', 'SE1503', 3, '1', '2020-06-02 19:31:35', 0),
(11, 'SD-000011', 'CE150063', 'lamttce150063', '46e0e6ce167bbf79b81892b7f58ce01a', 'Tống Thanh Lâm', 'SE1503', 3, '1', '2020-06-02 19:31:35', 0),
(12, 'SD-000012', 'CE150099', 'datltce150099', '46e0e6ce167bbf79b81892b7f58ce01a', 'Lê Thành Đạt', 'SE1503', 3, '1', '2020-06-02 19:31:35', 0),
(13, 'SD-000013', 'CE150103', 'khoinmce150103', '46e0e6ce167bbf79b81892b7f58ce01a', 'Nguyễn Minh Khôi', 'SE1503', 3, '1', '2020-06-02 19:31:35', 0),
(14, 'SD-000014', 'CE150141', 'longlhhce150141', '46e0e6ce167bbf79b81892b7f58ce01a', 'Lê Hoàng Hải Long', 'SE1503', 3, '1', '2020-06-02 19:31:35', 0),
(15, 'SD-000015', 'CE150161', 'duyenhmce150161', '46e0e6ce167bbf79b81892b7f58ce01a', 'Huỳnh Mỹ Duyên', 'SE1503', 3, '1', '2020-06-02 19:31:35', 0),
(16, 'SD-000016', 'CE150226', 'hoangnnce150226', '46e0e6ce167bbf79b81892b7f58ce01a', 'Nguyễn Nhật Hoàng', 'SE1503', 3, '1', '2020-06-02 19:31:35', 0),
(17, 'SD-000017', 'CE150261', 'kietptce150261', '46e0e6ce167bbf79b81892b7f58ce01a', 'Phạm Tuấn Kiệt', 'SE1503', 3, '1', '2020-06-02 19:31:35', 0),
(18, 'SD-000018', 'CE150269', 'toantkce150269', '46e0e6ce167bbf79b81892b7f58ce01a', 'Trần Khánh Toàn', 'SE1503', 3, '1', '2020-06-02 19:31:35', 0),
(19, 'SD-000019', 'CE150284', 'vinhce150284', '46e0e6ce167bbf79b81892b7f58ce01a', 'Nguyễn Hoàng Vĩ', 'SE1503', 3, '1', '2020-06-02 19:31:35', 0),
(20, 'SD-000020', 'CE150337', 'phucnnhce150337', '46e0e6ce167bbf79b81892b7f58ce01a', 'Ngô Nguyễn Hoàng Phúc', 'SE1503', 3, '1', '2020-06-02 19:31:35', 0),
(21, 'SD-000021', 'CE150405', 'locpbce150405', '46e0e6ce167bbf79b81892b7f58ce01a', 'Phạm Bảo Lộc', 'SE1503', 3, '1', '2020-06-02 19:31:35', 0),
(22, 'SD-000022', 'CE150568', 'thinhnpce150568', '46e0e6ce167bbf79b81892b7f58ce01a', 'Nguyễn Phúc Thịnh', 'SE1503', 3, '1', '2020-06-02 19:31:35', 0),
(23, 'SD-000023', 'CE150569', 'haoltce150569', '46e0e6ce167bbf79b81892b7f58ce01a', 'Lê Trí Hào', 'SE1503', 3, '1', '2020-06-02 19:31:35', 0),
(24, 'SD-000024', 'CE150599', 'phuttce150599', '46e0e6ce167bbf79b81892b7f58ce01a', 'Trần Thiện Phú', 'SE1503', 3, '1', '2020-06-02 19:31:35', 0),
(25, 'SD-000025', 'CE150696', 'vynlce150696', '46e0e6ce167bbf79b81892b7f58ce01a', 'Nguyễn Lê Vỹ', 'SE1503', 3, '1', '2020-06-02 19:31:35', 0),
(26, 'SD-000026', 'CE150706', 'binhthce150706', '46e0e6ce167bbf79b81892b7f58ce01a', 'Trần Hòa Bình', 'SE1503', 3, '1', '2020-06-02 19:31:35', 0),
(27, 'SD-000027', 'CE150762', 'nguyenvgce150762', '46e0e6ce167bbf79b81892b7f58ce01a', 'Võ Gia Nguyên', 'SE1503', 3, '1', '2020-06-02 19:31:35', 0),
(28, 'SD-000028', 'CE150076', 'ce150076', '46e0e6ce167bbf79b81892b7f58ce01a', 'Võ Ngọc Thiên', 'FCoder', 12, '1', '2020-06-04 21:02:24', 0),
(29, 'SD-000029', 'CE140102', 'ce140102', '46e0e6ce167bbf79b81892b7f58ce01a', 'Phan Lê Trọng Nghĩa', 'FCoder', 12, '1', '2020-06-04 21:02:24', 0),
(30, 'SD-000030', 'CE150394', 'ce150394', '46e0e6ce167bbf79b81892b7f58ce01a', 'Huỳnh Tấn Phúc', 'FCoder', 12, '1', '2020-06-04 21:02:24', 0),
(31, 'SD-000031', 'CE150521', 'ce150521', '46e0e6ce167bbf79b81892b7f58ce01a', 'Trần Văn Hảo', 'FCoder', 12, '1', '2020-06-04 21:02:24', 0),
(32, 'SD-000032', 'CE140196', 'ce140196', '46e0e6ce167bbf79b81892b7f58ce01a', 'Nguyễn Đức Tông', 'FCoder', 12, '1', '2020-06-04 21:02:24', 0),
(33, 'SD-000033', 'CE130319', 'ce130319', '46e0e6ce167bbf79b81892b7f58ce01a', 'Phan Tấn Phát', 'FCoder', 12, '1', '2020-06-04 21:02:24', 0),
(34, 'SD-000034', 'CE130100', 'ce130100', '46e0e6ce167bbf79b81892b7f58ce01a', 'Lê Đức An', 'FCoder', 12, '1', '2020-06-04 21:02:24', 0),
(35, 'SD-000035', 'CE130042', 'ce130042', '46e0e6ce167bbf79b81892b7f58ce01a', 'Trịnh Đức Thống', 'FCoder', 12, '1', '2020-06-04 21:02:24', 0),
(36, 'SD-000036', 'CE130109', 'ce130109', '46e0e6ce167bbf79b81892b7f58ce01a', 'Phạm Chí Đức', 'FCoder', 12, '1', '2020-06-04 21:02:24', 0),
(37, 'SD-000037', 'CE130157', 'ce130157', '46e0e6ce167bbf79b81892b7f58ce01a', 'Đỗ Trung Tín', 'FCoder', 12, '1', '2020-06-04 21:02:24', 0),
(38, 'SD-000038', 'CE130204', 'ce130204', '46e0e6ce167bbf79b81892b7f58ce01a', 'Lý Dương', 'FCoder', 12, '1', '2020-06-04 21:02:24', 0),
(39, 'SD-000039', 'CE130336', 'ce130336', '46e0e6ce167bbf79b81892b7f58ce01a', 'Phan Minh Đức', 'FCoder', 12, '1', '2020-06-04 21:02:24', 0),
(40, 'SD-000040', 'CE140401', 'ce140401', '46e0e6ce167bbf79b81892b7f58ce01a', 'Dương Trí Tín', 'FCoder', 12, '1', '2020-06-04 21:02:24', 0),
(41, 'SD-000041', 'CE140037', 'ce140037', '46e0e6ce167bbf79b81892b7f58ce01a', 'Quản Đức Lộc', 'FCoder', 12, '1', '2020-06-04 21:02:24', 0),
(42, 'SD-000042', 'CE140085', 'ce140085', '46e0e6ce167bbf79b81892b7f58ce01a', 'Trần Minh Thắng', 'FCoder', 12, '1', '2020-06-04 21:02:24', 0),
(43, 'SD-000043', 'CE140237', 'ce140237', '46e0e6ce167bbf79b81892b7f58ce01a', 'Nguyễn Vương Khang Hy', 'FCoder', 12, '1', '2020-07-04 00:00:00', 0),
(44, 'SD-000044', 'CE140520', 'ce140520', '46e0e6ce167bbf79b81892b7f58ce01a', 'Đào Anh Tuấn', 'FCoder', 12, '1', '2020-06-04 21:02:24', 0),
(45, 'SD-000045', 'CE140133', 'ce140133', '46e0e6ce167bbf79b81892b7f58ce01a', 'Nguyễn Huỳnh Tuấn Khôi', 'FCoder', 12, '1', '2020-06-04 21:02:24', 0),
(46, 'SD-000046', 'CS140536', 'cs140536', '46e0e6ce167bbf79b81892b7f58ce01a', 'Nguyễn Thanh Trúc', 'FCoder', 12, '1', '2020-06-04 21:02:24', 0),
(47, 'SD-000047', 'CE140137', 'ce140137', '46e0e6ce167bbf79b81892b7f58ce01a', 'Pham Văn Trọng Nhân', 'FCoder', 12, '1', '2020-06-04 21:02:24', 0),
(48, 'SD-000048', 'CE150130', 'ce150130', '46e0e6ce167bbf79b81892b7f58ce01a', 'Huỳnh Quang Tiên', 'FCoder', 12, '1', '2020-07-04 00:00:00', 0),
(49, 'SD-000049', 'CE150075', 'ce150075', '46e0e6ce167bbf79b81892b7f58ce01a', 'Nguyễn Mạnh Tân', 'FCoder', 12, '1', '2020-06-04 21:02:24', 0),
(50, 'SD-000050', 'CE150280', 'ce150280', '46e0e6ce167bbf79b81892b7f58ce01a', 'Nguyễn Hoàng Khang', 'FCoder', 12, '1', '2020-06-04 21:02:24', 0),
(51, 'SD-000051', 'CE150424', 'ce150424', '46e0e6ce167bbf79b81892b7f58ce01a', 'Bùi Hữu Khang', 'FCoder', 12, '1', '2020-06-04 21:02:24', 0),
(52, 'SD-000052', 'CE150842', 'ce150842', '46e0e6ce167bbf79b81892b7f58ce01a', 'Nguyễn Phi Trường', 'FCoder', 12, '1', '2020-06-04 21:02:24', 0),
(53, 'SD-000053', 'CE150756', 'ce150756', '46e0e6ce167bbf79b81892b7f58ce01a', 'Đặng Minh Cảnh', 'FCoder', 12, '1', '2020-06-04 21:02:24', 0),
(54, 'SD-000054', 'CE150471', 'ce150471', '46e0e6ce167bbf79b81892b7f58ce01a', 'Lê Quốc Hùng', 'FCoder', 12, '1', '2020-06-04 21:02:24', 0),
(55, 'SD-000055', 'CE150505', 'ce150505', '46e0e6ce167bbf79b81892b7f58ce01a', 'Trần Thị Bích Trâm', 'FCoder', 12, '1', '2020-06-04 21:02:24', 0),
(56, 'SD-000056', 'CE150695', 'ce150695', '46e0e6ce167bbf79b81892b7f58ce01a', 'Trần Minh Kha', 'FCoder', 12, '1', '2020-06-04 21:02:24', 0),
(57, 'SD-000057', 'CE150509', 'ce150509', '46e0e6ce167bbf79b81892b7f58ce01a', 'Bảo', 'FCoder', 12, '1', '2020-06-19 01:34:14', 0);

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
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `teacher_account`
--

INSERT INTO `teacher_account` (`id`, `userId`, `rollnumber`, `username`, `password`, `name`) VALUES
(1, 'TC-000001', 'abc123', 'h', '2510c39011c5be704182423e3a695e91', 'Teacher');

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
('userId', 'SD', 57),
('userId1', 'TC', 1);

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
  MODIFY `contest_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `student_account`
--
ALTER TABLE `student_account`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=58;

--
-- AUTO_INCREMENT for table `teacher_account`
--
ALTER TABLE `teacher_account`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
