-- phpMyAdmin SQL Dump
-- version 5.1.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 24, 2021 at 06:48 AM
-- Server version: 10.4.19-MariaDB
-- PHP Version: 8.0.6

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
-- Table structure for table `class`
--

CREATE TABLE `class` (
  `id` int(11) NOT NULL,
  `semester` varchar(20) NOT NULL,
  `subject` varchar(20) NOT NULL,
  `class_name` varchar(20) NOT NULL,
  `status` int(1) NOT NULL DEFAULT 1 COMMENT '1 is active, 0 is unactive'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `class`
--

INSERT INTO `class` (`id`, `semester`, `subject`, `class_name`, `status`) VALUES
(8, 'SU21', 'PRF192', 'SE1302.HL', 1);

-- --------------------------------------------------------

--
-- Table structure for table `class_student`
--

CREATE TABLE `class_student` (
  `student_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `status` int(1) NOT NULL DEFAULT 1 COMMENT '1 is active, 0 is unactive'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `class_student`
--

INSERT INTO `class_student` (`student_id`, `class_id`, `status`) VALUES
(24, 8, 1),
(80, 8, 1),
(81, 8, 1),
(82, 8, 1),
(83, 8, 1),
(84, 8, 1),
(85, 8, 1),
(86, 8, 1),
(87, 8, 1),
(88, 8, 1),
(89, 8, 1),
(90, 8, 1),
(91, 8, 1),
(92, 8, 1),
(93, 8, 1),
(94, 8, 1),
(95, 8, 1),
(96, 8, 1),
(97, 8, 1),
(98, 8, 1),
(99, 8, 1),
(100, 8, 1),
(101, 8, 1),
(102, 8, 1),
(103, 8, 1),
(104, 8, 1),
(105, 8, 1),
(106, 8, 1),
(107, 8, 1),
(108, 8, 1),
(109, 8, 1),
(110, 8, 1),
(111, 8, 1),
(112, 8, 1),
(113, 8, 1),
(114, 8, 1),
(115, 8, 1),
(116, 8, 1),
(117, 8, 1),
(118, 8, 1),
(119, 8, 1),
(120, 8, 1),
(121, 8, 1),
(122, 8, 1),
(123, 8, 1),
(124, 8, 1);

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
  `status` int(1) NOT NULL DEFAULT 1 COMMENT '1 is active, 0 is unactive'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `contest`
--

INSERT INTO `contest` (`contest_id`, `teacher_id`, `contest_name`, `time_begin`, `time_end`, `language`, `status`) VALUES
(6, 'TC-000001', 'SU21_HCI201_SE1302_TEST01', '2021-08-17 18:32:00', '2021-08-18 18:30:00', 'C,C++,Java', 1);

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
(6, 'C', './public/problem/SU21_HCI201_SE1302_TEST01/Sorting Array.docx', './public/testcase/SU21_HCI201_SE1302_TEST01/C', 10);

-- --------------------------------------------------------

--
-- Table structure for table `contest_student`
--

CREATE TABLE `contest_student` (
  `id` int(11) NOT NULL,
  `student_id` int(11) DEFAULT NULL,
  `contest_id` int(11) DEFAULT NULL,
  `status` int(1) NOT NULL DEFAULT 1 COMMENT '1 is exists, 0 is deleted'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `contest_student`
--

INSERT INTO `contest_student` (`id`, `student_id`, `contest_id`, `status`) VALUES
(22, 24, 6, 1);

-- --------------------------------------------------------

--
-- Table structure for table `employee_account`
--

CREATE TABLE `employee_account` (
  `id` int(11) NOT NULL,
  `userId` varchar(20) DEFAULT NULL,
  `rollnumber` varchar(10) NOT NULL,
  `name` varchar(100) NOT NULL,
  `role_id` int(11) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `status` int(1) NOT NULL DEFAULT 1 COMMENT '1 is active, 0 is not active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `employee_account`
--

INSERT INTO `employee_account` (`id`, `userId`, `rollnumber`, `name`, `role_id`, `email`, `status`) VALUES
(1, 'TC-000001', 'AD130353', 'Nguyen Minh Thao', 0, 'minhthao3620@gmail.com', 1);

--
-- Triggers `employee_account`
--
DELIMITER $$
CREATE TRIGGER `employee_account_bi` BEFORE INSERT ON `employee_account` FOR EACH ROW BEGIN
   SET NEW.userId = getNextCustomSeq("userId1","TC");
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `role`
--

CREATE TABLE `role` (
  `role_id` int(11) NOT NULL,
  `role_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `role`
--

INSERT INTO `role` (`role_id`, `role_name`) VALUES
(0, 'Admin'),
(1, 'Academic'),
(2, 'Teacher');

-- --------------------------------------------------------

--
-- Table structure for table `student_account`
--

CREATE TABLE `student_account` (
  `id` int(11) NOT NULL,
  `userId` varchar(20) DEFAULT NULL,
  `rollnumber` varchar(10) NOT NULL,
  `name` varchar(100) NOT NULL,
  `ip` varchar(20) NOT NULL DEFAULT '1',
  `timeout` datetime NOT NULL DEFAULT current_timestamp(),
  `islogin` int(1) NOT NULL DEFAULT 0,
  `email` varchar(100) DEFAULT NULL,
  `status` int(1) NOT NULL DEFAULT 1 COMMENT '1 is active, 0 is unactive'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `student_account`
--

INSERT INTO `student_account` (`id`, `userId`, `rollnumber`, `name`, `ip`, `timeout`, `islogin`, `email`, `status`) VALUES
(24, 'SD-000025', 'CE130353', 'Nguyễn Minh Thảo', '1', '2021-08-24 11:39:03', 0, 'thaonmce130353@fpt.edu.vn', 1),
(80, 'SD-000081', 'CE130252', 'Nguyễn Chí Linh', '1', '2021-08-17 19:17:22', 0, 'linhncce130252@fpt.edu.vn', 1),
(81, 'SD-000082', 'CE133213', 'Nguyễn Thành Nhân', '1', '2021-08-17 19:17:22', 0, 'nhanntce130377@fpt.edu.vn', 1),
(82, 'SD-000083', 'CE130077', 'Phạm Trương Anh Tú', '1', '2021-08-17 19:17:22', 0, 'tuptace130136@fpt.edu.vn', 1),
(83, 'SD-000084', 'CE137481', 'Võ Trương Hải Đăng', '1', '2021-08-17 19:17:22', 0, 'dangvthce130021@fpt.edu.vn', 1),
(84, 'SD-000085', 'CE137482', 'Nguyễn Trường Kỳ', '1', '2021-08-17 19:17:22', 0, 'kynt26@gmail.com', 1),
(85, 'SD-000086', 'CE141481', 'Cull Youings', '1', '2021-08-17 19:17:22', 0, 'cyouings0@purevolume.com', 1),
(86, 'SD-000087', 'CE141482', 'Adella Casotti', '1', '2021-08-17 19:17:22', 0, 'acasotti1@oaic.gov.au', 1),
(87, 'SD-000088', 'CE141483', 'Ezra Klimentov', '1', '2021-08-17 19:17:22', 0, 'eklimentov2@marriott.com', 1),
(88, 'SD-000089', 'CE141484', 'Shannan Pawelek', '1', '2021-08-17 19:17:22', 0, 'spawelek3@blogspot.com', 1),
(89, 'SD-000090', 'CE141485', 'Alida Fishwick', '1', '2021-08-17 19:17:22', 0, 'afishwick4@scientificamerican.com', 1),
(90, 'SD-000091', 'CE141486', 'Donna Walkingshaw', '1', '2021-08-17 19:17:22', 0, 'dwalkingshaw5@cocolog-nifty.com', 1),
(91, 'SD-000092', 'CE141487', 'Petronia Scahill', '1', '2021-08-17 19:17:22', 0, 'pscahill6@disqus.com', 1),
(92, 'SD-000093', 'CE141488', 'Alden Kuna', '1', '2021-08-17 19:17:22', 0, 'akuna7@yellowpages.com', 1),
(93, 'SD-000094', 'CE141489', 'Val Begg', '1', '2021-08-17 19:17:22', 0, 'vbegg8@nifty.com', 1),
(94, 'SD-000095', 'CE141490', 'Bellanca Prater', '1', '2021-08-17 19:17:22', 0, 'bprater9@wp.com', 1),
(95, 'SD-000096', 'CE141491', 'Genovera Blodgetts', '1', '2021-08-17 19:17:22', 0, 'gblodgettsa@1688.com', 1),
(96, 'SD-000097', 'CE141492', 'Eilis Gavan', '1', '2021-08-17 19:17:22', 0, 'egavanb@nature.com', 1),
(97, 'SD-000098', 'CE141493', 'Loy Willmetts', '1', '2021-08-17 19:17:22', 0, 'lwillmettsc@amazon.co.jp', 1),
(98, 'SD-000099', 'CE141494', 'Muire Sarginson', '1', '2021-08-17 19:17:22', 0, 'msarginsond@shinystat.com', 1),
(99, 'SD-000100', 'CE141495', 'Chrissy Staff', '1', '2021-08-17 19:17:22', 0, 'cstaffe@deviantart.com', 1),
(100, 'SD-000101', 'CE141496', 'Trudi Lewsie', '1', '2021-08-17 19:17:22', 0, 'tlewsief@gov.uk', 1),
(101, 'SD-000102', 'CE141497', 'Ralph Mervyn', '1', '2021-08-17 19:17:22', 0, 'rmervyng@ycombinator.com', 1),
(102, 'SD-000103', 'CE141498', 'Blaine Itzakovitz', '1', '2021-08-17 19:17:22', 0, 'bitzakovitzh@netvibes.com', 1),
(103, 'SD-000104', 'CE141499', 'Kellby Ridding', '1', '2021-08-17 19:17:22', 0, 'kriddingi@godaddy.com', 1),
(104, 'SD-000105', 'CE141500', 'Vina Herity', '1', '2021-08-17 19:17:22', 0, 'vherityj@google.com.au', 1),
(105, 'SD-000106', 'CE141501', 'Edithe Bevis', '1', '2021-08-17 19:17:22', 0, 'ebevisk@dropbox.com', 1),
(106, 'SD-000107', 'CE141502', 'Dolph Ambresin', '1', '2021-08-17 19:17:22', 0, 'dambresinl@senate.gov', 1),
(107, 'SD-000108', 'CE141503', 'Vivienne Fermoy', '1', '2021-08-17 19:17:22', 0, 'vfermoym@theglobeandmail.com', 1),
(108, 'SD-000109', 'CE141504', 'Cordy Farady', '1', '2021-08-17 19:17:22', 0, 'cfaradyn@hugedomains.com', 1),
(109, 'SD-000110', 'CE141505', 'Kristina Parrish', '1', '2021-08-17 19:17:22', 0, 'kparrisho@over-blog.com', 1),
(110, 'SD-000111', 'CE141506', 'Penni Novic', '1', '2021-08-17 19:17:22', 0, 'pnovicp@usnews.com', 1),
(111, 'SD-000112', 'CE141507', 'Rivi Abramovitz', '1', '2021-08-17 19:17:22', 0, 'rabramovitzq@cdbaby.com', 1),
(112, 'SD-000113', 'CE141508', 'Arvin Franzel', '1', '2021-08-17 19:17:22', 0, 'afranzelr@sourceforge.net', 1),
(113, 'SD-000114', 'CE141509', 'Lotti Lingwood', '1', '2021-08-17 19:17:22', 0, 'llingwoods@desdev.cn', 1),
(114, 'SD-000115', 'CE141510', 'Culley MacFadyen', '1', '2021-08-17 19:17:22', 0, 'cmacfadyent@hp.com', 1),
(115, 'SD-000116', 'CE141511', 'Jodi Vondrach', '1', '2021-08-17 19:17:22', 0, 'jvondrachu@amazon.de', 1),
(116, 'SD-000117', 'CE141512', 'Chiquita Powdrell', '1', '2021-08-17 19:17:22', 0, 'cpowdrellv@home.pl', 1),
(117, 'SD-000118', 'CE141513', 'Valdemar Bulgen', '1', '2021-08-17 19:17:22', 0, 'vbulgenw@utexas.edu', 1),
(118, 'SD-000119', 'CE141514', 'Rodie Zoppie', '1', '2021-08-17 19:17:22', 0, 'rzoppiex@nytimes.com', 1),
(119, 'SD-000120', 'CE141515', 'Una Van Der Vlies', '1', '2021-08-17 19:17:22', 0, 'uvany@360.cn', 1),
(120, 'SD-000121', 'CE141516', 'Iolanthe Killiner', '1', '2021-08-17 19:17:22', 0, 'ikillinerz@census.gov', 1),
(121, 'SD-000122', 'CE141517', 'Burtie Cundey', '1', '2021-08-17 19:17:22', 0, 'bcundey10@gnu.org', 1),
(122, 'SD-000123', 'CE141518', 'Ferrel Signe', '1', '2021-08-17 19:17:22', 0, 'fsigne11@marketwatch.com', 1),
(123, 'SD-000124', 'CE141519', 'Jaclyn Turfrey', '1', '2021-08-17 19:17:22', 0, 'jturfrey12@blogger.com', 1),
(124, 'SD-000125', 'CE141520', 'Cad Rankine', '1', '2021-08-17 19:17:22', 0, 'crankine13@disqus.com', 1),
(125, 'SD-000126', 'CE151123', 'Nguyen Thi 1', '1', '2021-08-17 19:18:06', 0, 'nguyenthi01@gmail.com', 1),
(126, 'SD-000127', 'CE151124', 'Nguyen Thi 2', '1', '2021-08-17 19:18:06', 0, 'nguyenthi02@gmail.com', 1),
(127, 'SD-000128', 'CE151125', 'Nguyen Thi 3', '1', '2021-08-17 19:18:06', 0, 'nguyenthi03@gmail.com', 1),
(128, 'SD-000129', 'CE151126', 'Nguyen Thi 4', '1', '2021-08-17 19:18:06', 0, 'nguyenthi04@gmail.com', 1),
(129, 'SD-000130', 'CE151127', 'Nguyen Thi 5', '1', '2021-08-17 19:18:06', 0, 'nguyenthi05@gmail.com', 1),
(130, 'SD-000131', 'CE151128', 'Nguyen Thi 6', '1', '2021-08-17 19:18:06', 0, 'nguyenthi06@gmail.com', 1),
(131, 'SD-000132', 'CE151129', 'Nguyen Thi 7', '1', '2021-08-17 19:18:06', 0, 'nguyenthi07@gmail.com', 1),
(132, 'SD-000133', 'CE151130', 'Nguyen Thi 8', '1', '2021-08-17 19:18:06', 0, 'nguyenthi08@gmail.com', 1),
(133, 'SD-000134', 'CE151131', 'Nguyen Thi 9', '1', '2021-08-17 19:18:06', 0, 'nguyenthi09@gmail.com', 1);

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
('userId', 'SD', 281),
('userId1', 'TC', 7);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `class`
--
ALTER TABLE `class`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `class_student`
--
ALTER TABLE `class_student`
  ADD KEY `class_id` (`class_id`),
  ADD KEY `student_id` (`student_id`);

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
-- Indexes for table `contest_student`
--
ALTER TABLE `contest_student`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `contest_id` (`contest_id`);

--
-- Indexes for table `employee_account`
--
ALTER TABLE `employee_account`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uni_rollnumber_teacher` (`rollnumber`),
  ADD UNIQUE KEY `userId` (`userId`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `role_id` (`role_id`);

--
-- Indexes for table `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`role_id`);

--
-- Indexes for table `student_account`
--
ALTER TABLE `student_account`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uni_student_rollnumber` (`rollnumber`),
  ADD UNIQUE KEY `userId` (`userId`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `_sequence`
--
ALTER TABLE `_sequence`
  ADD PRIMARY KEY (`seq_name`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `class`
--
ALTER TABLE `class`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `contest`
--
ALTER TABLE `contest`
  MODIFY `contest_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `contest_student`
--
ALTER TABLE `contest_student`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `employee_account`
--
ALTER TABLE `employee_account`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `student_account`
--
ALTER TABLE `student_account`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=281;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `class_student`
--
ALTER TABLE `class_student`
  ADD CONSTRAINT `class_student_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `class` (`id`),
  ADD CONSTRAINT `class_student_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `student_account` (`id`);

--
-- Constraints for table `contest_student`
--
ALTER TABLE `contest_student`
  ADD CONSTRAINT `contest_student_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `student_account` (`id`),
  ADD CONSTRAINT `contest_student_ibfk_2` FOREIGN KEY (`contest_id`) REFERENCES `contest` (`contest_id`);

--
-- Constraints for table `employee_account`
--
ALTER TABLE `employee_account`
  ADD CONSTRAINT `employee_account_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `role` (`role_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
