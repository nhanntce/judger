-- phpMyAdmin SQL Dump
-- version 5.1.0
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th7 31, 2021 lúc 01:45 PM
-- Phiên bản máy phục vụ: 10.4.19-MariaDB
-- Phiên bản PHP: 8.0.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `judger`
--

DELIMITER $$
--
-- Thủ tục
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
-- Các hàm
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
-- Cấu trúc bảng cho bảng `contest`
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

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `contest_detail`
--

CREATE TABLE `contest_detail` (
  `contest_id` int(11) NOT NULL,
  `problem_id` varchar(50) NOT NULL,
  `path_problem` varchar(255) NOT NULL,
  `path_testcase` varchar(255) NOT NULL,
  `times` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `contest_student`
--

CREATE TABLE `contest_student` (
  `id` int(11) NOT NULL,
  `student_id` int(11) DEFAULT NULL,
  `contest_id` int(11) DEFAULT NULL,
  `status` int(11) NOT NULL COMMENT '1 is exists, 0 is deleted'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `role`
--

CREATE TABLE `role` (
  `role_id` int(11) NOT NULL,
  `role_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Đang đổ dữ liệu cho bảng `role`
--

INSERT INTO `role` (`role_id`, `role_name`) VALUES
(0, 'Admin'),
(1, 'Academic'),
(2, 'Teacher');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `student_account`
--

CREATE TABLE `student_account` (
  `id` int(11) NOT NULL,
  `userId` varchar(20) DEFAULT NULL,
  `rollnumber` varchar(10) NOT NULL,
  `name` varchar(100) NOT NULL,
  `class` varchar(50) NOT NULL,
  `contest_id` int(11) NOT NULL DEFAULT 0,
  `ip` varchar(20) NOT NULL DEFAULT '1',
  `timeout` datetime NOT NULL DEFAULT current_timestamp(),
  `islogin` int(1) NOT NULL DEFAULT 0,
  `email` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Đang đổ dữ liệu cho bảng `student_account`
--

INSERT INTO `student_account` (`id`, `userId`, `rollnumber`, `name`, `class`, `contest_id`, `ip`, `timeout`, `islogin`, `email`) VALUES
(1, 'SD-000001', 'h', 'Khang Hy', 'IA1401', 0, '1', '2021-07-13 09:06:00', 0, NULL),
(43, 'SD-000043', 'CE140237', 'Nguyễn Vương Khang Hy', 'FCoder', 0, '1', '2021-07-08 20:05:06', 0, NULL),
(77, 'SD-000058', 'CE140019', 'Trịnh Đình Quang', 'PE0309', 0, '1', '2021-06-29 22:35:47', 0, NULL),
(78, 'SD-000059', 'CE140212', 'Nguyễn Trọng Nghĩa', 'PE0309', 0, '1', '2021-07-05 11:12:26', 0, NULL),
(79, 'SD-000060', 'CE140242', 'Nguyễn Hứa Quốc Bảo', 'PE0309', 0, '1', '2021-07-05 11:15:59', 0, NULL),
(80, 'SD-000061', 'CE140284', 'Biện Minh Thông', 'PE0309', 0, '1', '2021-07-05 11:16:24', 0, NULL),
(81, 'SD-000062', 'CE140411', 'Lê Thanh Sang', 'PE0309', 0, '1', '2021-07-05 11:19:07', 0, NULL),
(82, 'SD-000063', 'CE140426', 'Bùi Quách Thịnh', 'PE0309', 0, '1', '2021-07-05 11:22:28', 0, NULL),
(83, 'SD-000064', 'CE140462', 'Nguyễn Khắc Huy', 'PE0309', 0, '1', '2021-07-05 11:31:05', 0, NULL),
(84, 'SD-000065', 'CE140520', 'Trần Nguyễn Quốc Huy', 'PE0309', 0, '1', '2021-07-05 11:28:41', 0, NULL),
(85, 'SD-000066', 'CE140524', 'Nguyễn Tấn Hiệp', 'PE0309', 0, '1', '2021-07-05 11:27:37', 0, NULL),
(86, 'SD-000067', 'CE140556', 'Huỳnh Hải Giang', 'PE0309', 0, '1', '2021-07-05 11:18:19', 0, NULL),
(87, 'SD-000068', 'CE150093', 'Phạm Minh Nhí', 'PE0309', 0, '1', '2021-07-05 11:16:22', 0, NULL),
(88, 'SD-000069', 'CE150124', 'Nguyễn Quốc Trung Nhân', 'PE0309', 0, '1', '2021-07-05 11:14:43', 0, NULL),
(89, 'SD-000070', 'CE150493', 'Phạm Đặng Lan Thịnh', 'PE0309', 0, '1', '2021-07-05 11:10:34', 0, NULL),
(90, 'SD-000071', 'CE150499', 'Trần Thị Hồng Mai', 'PE0309', 0, '1', '2021-07-05 11:07:25', 0, NULL),
(91, 'SD-000072', 'CE150569', 'Lê Trí Hào', 'PE0309', 0, '1', '2021-07-05 11:03:35', 0, NULL),
(92, 'SD-000073', 'CE150623', 'Trương Trung Tín', 'PE0309', 0, '1', '2021-07-05 11:01:00', 0, NULL),
(93, 'SD-000074', 'CE150662', 'Nguyễn Đăng Khánh', 'PE0309', 0, '1', '2021-07-05 10:57:23', 0, NULL),
(94, 'SD-000075', 'CE150718', 'Lý Tuấn Đạt', 'PE0309', 0, '1', '2021-07-05 11:07:12', 0, NULL),
(95, 'SD-000076', 'CE150762', 'Võ Gia Nguyên', 'PE0309', 0, '1', '2021-07-05 10:53:25', 0, NULL),
(96, 'SD-000077', 'user1', 'user1', 'test', 0, '1', '2020-11-05 00:00:00', 0, NULL),
(97, 'SD-000078', 'user2', 'user2', 'test', 0, '1', '2020-11-05 00:00:00', 0, NULL),
(98, 'SD-000079', 'user3', 'user3', 'test', 0, '1', '2020-11-05 00:00:00', 0, NULL),
(99, 'SD-000080', 'user4', 'user4', 'test', 0, '1', '2020-11-05 00:00:00', 0, NULL),
(100, 'SD-000081', 'user5', 'user5', 'test', 0, '1', '2020-11-05 00:00:00', 0, NULL),
(131, 'SD-000097', 'CE130353', 'Nguyễn Minh Thảo', 'SU21_JFE201_SE1302', 6, '1', '2021-07-30 22:30:49', 1, 'minhthao3260@gmail.com'),
(132, 'SD-000098', 'CE130021', 'Võ Trương Hải Đăng', 'SU21_JFE201_SE1302', 6, '240280063a592f098bff', '2021-07-21 21:16:31', 1, 'kyntce130282@fpt.edu.vn'),
(133, 'SD-000099', 'CE130252', 'Nguyễn Chí Linh', 'SU21_JFE201_SE1302', 6, '24028006390dcbdb12a5', '2021-07-21 20:35:17', 1, 'chilinh361@gmail.com'),
(134, 'SD-000100', 'CE133213', 'Nguyễn Thành Nhân', 'SU21_JFE201_SE1302', 6, '113-22-66-222', '2021-07-21 20:35:56', 1, 'nhannt909@gmail.com'),
(135, 'SD-000101', 'CE134554', 'Phạm Trương Anh Tú', 'SU21_JFE201_SE1302', 6, '113-183-184-88', '2021-07-21 20:35:16', 1, 'njken022@gmail.com');

--
-- Bẫy `student_account`
--
DELIMITER $$
CREATE TRIGGER `student_account_bi` BEFORE INSERT ON `student_account` FOR EACH ROW BEGIN
   SET NEW.userId = getNextCustomSeq("userId","SD");
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `teacher_account`
--

CREATE TABLE `teacher_account` (
  `id` int(11) NOT NULL,
  `userId` varchar(20) DEFAULT NULL,
  `rollnumber` varchar(10) NOT NULL,
  `name` varchar(100) NOT NULL,
  `role_id` int(11) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `status` int(11) NOT NULL COMMENT '1 is active, 0 is not active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Đang đổ dữ liệu cho bảng `teacher_account`
--

INSERT INTO `teacher_account` (`id`, `userId`, `rollnumber`, `name`, `role_id`, `email`, `status`) VALUES
(1, 'TC-000001', 'abc123', 'Nguyen Minh Thao', 0, 'minhthao3620@gmail.com', 1),
(2, 'TC-000002', 'GV123', 'Nguyen Chi Linh', 1, 'thaonmce130353@fpt.edu.vn', 1),
(3, 'TC-000003', 'GV456', 'Nguyen Thanh Nhan', 2, 'nguyenminhthaobt1@gmail.com', 1);

--
-- Bẫy `teacher_account`
--
DELIMITER $$
CREATE TRIGGER `teacher_account_bi` BEFORE INSERT ON `teacher_account` FOR EACH ROW BEGIN
   SET NEW.userId = getNextCustomSeq("userId1","TC");
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `_sequence`
--

CREATE TABLE `_sequence` (
  `seq_name` varchar(50) NOT NULL,
  `seq_group` varchar(10) NOT NULL,
  `seq_val` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Đang đổ dữ liệu cho bảng `_sequence`
--

INSERT INTO `_sequence` (`seq_name`, `seq_group`, `seq_val`) VALUES
('userId', 'SD', 101),
('userId1', 'TC', 3);

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `contest`
--
ALTER TABLE `contest`
  ADD PRIMARY KEY (`contest_id`);

--
-- Chỉ mục cho bảng `contest_detail`
--
ALTER TABLE `contest_detail`
  ADD PRIMARY KEY (`contest_id`,`problem_id`);

--
-- Chỉ mục cho bảng `contest_student`
--
ALTER TABLE `contest_student`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `contest_id` (`contest_id`);

--
-- Chỉ mục cho bảng `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`role_id`);

--
-- Chỉ mục cho bảng `student_account`
--
ALTER TABLE `student_account`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uni_student_rollnumber` (`rollnumber`),
  ADD UNIQUE KEY `userId` (`userId`);

--
-- Chỉ mục cho bảng `teacher_account`
--
ALTER TABLE `teacher_account`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uni_rollnumber_teacher` (`rollnumber`),
  ADD UNIQUE KEY `userId` (`userId`),
  ADD KEY `role_id` (`role_id`);

--
-- Chỉ mục cho bảng `_sequence`
--
ALTER TABLE `_sequence`
  ADD PRIMARY KEY (`seq_name`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `contest`
--
ALTER TABLE `contest`
  MODIFY `contest_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `contest_student`
--
ALTER TABLE `contest_student`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT cho bảng `student_account`
--
ALTER TABLE `student_account`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=137;

--
-- AUTO_INCREMENT cho bảng `teacher_account`
--
ALTER TABLE `teacher_account`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `contest_student`
--
ALTER TABLE `contest_student`
  ADD CONSTRAINT `contest_student_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `student_account` (`id`),
  ADD CONSTRAINT `contest_student_ibfk_2` FOREIGN KEY (`contest_id`) REFERENCES `contest` (`contest_id`);

--
-- Các ràng buộc cho bảng `teacher_account`
--
ALTER TABLE `teacher_account`
  ADD CONSTRAINT `teacher_account_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `role` (`role_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
