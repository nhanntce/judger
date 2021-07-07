-- phpMyAdmin SQL Dump
-- version 5.1.0
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th7 07, 2021 lúc 11:23 AM
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

--
-- Đang đổ dữ liệu cho bảng `contest`
--

INSERT INTO `contest` (`contest_id`, `teacher_id`, `contest_name`, `time_begin`, `time_end`, `language`, `deleted`) VALUES
(1, 'TC-000001', 'demo1', '2021-07-04 09:40:00', '2021-07-28 10:40:00', 'C,C++,Java,Python 3,MySQL', 0),
(2, 'TC-000001', 'demo2', '2021-07-04 09:40:00', '2021-07-28 10:40:00', 'C,C++,Java,Python 3,MySQL', 0);

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

--
-- Đang đổ dữ liệu cho bảng `contest_detail`
--

INSERT INTO `contest_detail` (`contest_id`, `problem_id`, `path_problem`, `path_testcase`, `times`) VALUES
(1, 'A', './public/problem/demo1/1001 DIEU UOC.pdf', './public/testcase/demo1/A', 10),
(1, 'B', './public/problem/demo1/KhanhVH_PRF192_SE1502.HL.pdf', './public/testcase/demo1/B', 10),
(1, 'C', './public/problem/demo1/1 - if.doc', './public/testcase/demo1/C', 10),
(1, 'D', './public/problem/demo1/1001 DIEU UOC.pdf', './public/testcase/demo1/D', 10),
(1, 'E', './public/problem/demo1/1001 DIEU UOC.pdf', './public/testcase/demo1/E', 10),
(2, 'A', './public/problem/demo2/1 - if.doc', './public/testcase/demo2/A', 10),
(2, 'B', './public/problem/demo2/2 - for.doc', './public/testcase/demo2/B', 10);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `contest_owner`
--

CREATE TABLE `contest_owner` (
  `contest_id` int(11) NOT NULL,
  `teacher_id` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `student_account`
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
-- Đang đổ dữ liệu cho bảng `student_account`
--

INSERT INTO `student_account` (`id`, `userId`, `rollnumber`, `username`, `password`, `name`, `class`, `contest_id`, `ip`, `timeout`, `islogin`) VALUES
(1, 'SD-000001', 'h', 'h', 'e10adc3949ba59abbe56e057f20f883e', 'Khang Hy', 'IA1401', 0, '14-160-188-220', '2021-06-30 21:44:02', 1),
(43, 'SD-000043', 'CE140237', 'ce140237', 'e10adc3949ba59abbe56e057f20f883e', 'Nguyễn Vương Khang Hy', 'FCoder', 0, '1', '2021-06-29 22:31:46', 1),
(77, 'SD-000058', 'CE140019', 'ce140019', 'e10adc3949ba59abbe56e057f20f883e', 'Trịnh Đình Quang', 'PE0309', 0, '1', '2021-06-29 22:35:47', 0),
(78, 'SD-000059', 'CE140212', 'ce140212', 'e10adc3949ba59abbe56e057f20f883e', 'Nguyễn Trọng Nghĩa', 'PE0309', 0, '118-69-133-17', '2021-07-05 11:12:26', 0),
(79, 'SD-000060', 'CE140242', 'ce140242', 'e10adc3949ba59abbe56e057f20f883e', 'Nguyễn Hứa Quốc Bảo', 'PE0309', 0, '118-69-133-17', '2021-07-05 11:15:59', 0),
(80, 'SD-000061', 'CE140284', 'ce140284', 'e10adc3949ba59abbe56e057f20f883e', 'Biện Minh Thông', 'PE0309', 0, '118-69-133-17', '2021-07-05 11:16:24', 0),
(81, 'SD-000062', 'CE140411', 'ce140411', 'e10adc3949ba59abbe56e057f20f883e', 'Lê Thanh Sang', 'PE0309', 0, '118-69-133-17', '2021-07-05 11:19:07', 0),
(82, 'SD-000063', 'CE140426', 'ce140426', 'e10adc3949ba59abbe56e057f20f883e', 'Bùi Quách Thịnh', 'PE0309', 0, '118-69-133-17', '2021-07-05 11:22:28', 0),
(83, 'SD-000064', 'CE140462', 'ce140462', 'e10adc3949ba59abbe56e057f20f883e', 'Nguyễn Khắc Huy', 'PE0309', 0, '118-69-133-17', '2021-07-05 11:31:05', 1),
(84, 'SD-000065', 'CE140520', 'ce140520', 'e10adc3949ba59abbe56e057f20f883e', 'Trần Nguyễn Quốc Huy', 'PE0309', 0, '118-69-133-17', '2021-07-05 11:28:41', 0),
(85, 'SD-000066', 'CE140524', 'ce140524', 'e10adc3949ba59abbe56e057f20f883e', 'Nguyễn Tấn Hiệp', 'PE0309', 0, '118-69-133-17', '2021-07-05 11:27:37', 0),
(86, 'SD-000067', 'CE140556', 'ce140556', 'e10adc3949ba59abbe56e057f20f883e', 'Huỳnh Hải Giang', 'PE0309', 0, '118-69-133-17', '2021-07-05 11:18:19', 0),
(87, 'SD-000068', 'CE150093', 'ce150093', 'e10adc3949ba59abbe56e057f20f883e', 'Phạm Minh Nhí', 'PE0309', 0, '118-69-133-17', '2021-07-05 11:16:22', 0),
(88, 'SD-000069', 'CE150124', 'ce150124', 'e10adc3949ba59abbe56e057f20f883e', 'Nguyễn Quốc Trung Nhân', 'PE0309', 0, '118-69-133-17', '2021-07-05 11:14:43', 0),
(89, 'SD-000070', 'CE150493', 'ce150493', 'e10adc3949ba59abbe56e057f20f883e', 'Phạm Đặng Lan Thịnh', 'PE0309', 0, '118-69-133-17', '2021-07-05 11:10:34', 0),
(90, 'SD-000071', 'CE150499', 'ce150499', 'e10adc3949ba59abbe56e057f20f883e', 'Trần Thị Hồng Mai', 'PE0309', 0, '118-69-133-17', '2021-07-05 11:07:25', 0),
(91, 'SD-000072', 'CE150569', 'ce150569', 'e10adc3949ba59abbe56e057f20f883e', 'Lê Trí Hào', 'PE0309', 0, '118-69-133-17', '2021-07-05 11:03:35', 0),
(92, 'SD-000073', 'CE150623', 'ce150623', 'e10adc3949ba59abbe56e057f20f883e', 'Trương Trung Tín', 'PE0309', 0, '118-69-133-17', '2021-07-05 11:01:00', 0),
(93, 'SD-000074', 'CE150662', 'ce150662', 'e10adc3949ba59abbe56e057f20f883e', 'Nguyễn Đăng Khánh', 'PE0309', 0, '118-69-133-17', '2021-07-05 10:57:23', 0),
(94, 'SD-000075', 'CE150718', 'ce150718', 'e10adc3949ba59abbe56e057f20f883e', 'Lý Tuấn Đạt', 'PE0309', 0, '118-69-133-17', '2021-07-05 11:07:12', 0),
(95, 'SD-000076', 'CE150762', 'ce150762', 'e10adc3949ba59abbe56e057f20f883e', 'Võ Gia Nguyên', 'PE0309', 0, '118-69-133-17', '2021-07-05 10:53:25', 0),
(96, 'SD-000077', 'user1', 'user1', 'e10adc3949ba59abbe56e057f20f883e', 'user1', 'test', 0, '1', '2020-11-05 00:00:00', 0),
(97, 'SD-000078', 'user2', 'user2', 'e10adc3949ba59abbe56e057f20f883e', 'user2', 'test', 0, '1', '2020-11-05 00:00:00', 0),
(98, 'SD-000079', 'user3', 'user3', 'e10adc3949ba59abbe56e057f20f883e', 'user3', 'test', 0, '1', '2020-11-05 00:00:00', 0),
(99, 'SD-000080', 'user4', 'user4', 'e10adc3949ba59abbe56e057f20f883e', 'user4', 'test', 0, '1', '2020-11-05 00:00:00', 0),
(100, 'SD-000081', 'user5', 'user5', 'e10adc3949ba59abbe56e057f20f883e', 'user5', 'test', 0, '1', '2020-11-05 00:00:00', 0);

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
  `username` varchar(50) NOT NULL,
  `password` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `role` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Đang đổ dữ liệu cho bảng `teacher_account`
--

INSERT INTO `teacher_account` (`id`, `userId`, `rollnumber`, `username`, `password`, `name`, `role`) VALUES
(1, 'TC-000001', 'abc123', 'h', '2510c39011c5be704182423e3a695e91', 'IT', 0),
(2, 'TC-000002', 'GV123', 'a', '0cc175b9c0f1b6a831c399e269772661', 'Giáo vụ', 1),
(3, 'TC-000003', 'GV456', 'b', '92eb5ffee6ae2fec3ad71c777531578f', 'Giảng viên', 2);

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
('userId', 'SD', 81),
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
-- Chỉ mục cho bảng `contest_owner`
--
ALTER TABLE `contest_owner`
  ADD PRIMARY KEY (`contest_id`,`teacher_id`);

--
-- Chỉ mục cho bảng `student_account`
--
ALTER TABLE `student_account`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uni_student_rollnumber` (`rollnumber`),
  ADD UNIQUE KEY `uni_student_username` (`username`),
  ADD UNIQUE KEY `userId` (`userId`);

--
-- Chỉ mục cho bảng `teacher_account`
--
ALTER TABLE `teacher_account`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uni_teacher_username` (`username`),
  ADD UNIQUE KEY `uni_rollnumber_teacher` (`rollnumber`),
  ADD UNIQUE KEY `userId` (`userId`);

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
  MODIFY `contest_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `student_account`
--
ALTER TABLE `student_account`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=101;

--
-- AUTO_INCREMENT cho bảng `teacher_account`
--
ALTER TABLE `teacher_account`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
