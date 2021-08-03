-- phpMyAdmin SQL Dump
-- version 5.1.0
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th8 03, 2021 lúc 04:12 AM
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
-- Cấu trúc bảng cho bảng `class`
--

CREATE TABLE `class` (
  `id` int(11) NOT NULL,
  `semester` varchar(20) NOT NULL,
  `subject` varchar(20) NOT NULL,
  `class_name` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `class_student`
--

CREATE TABLE `class_student` (
  `student_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
-- Cấu trúc bảng cho bảng `employee_account`
--

CREATE TABLE `employee_account` (
  `id` int(11) NOT NULL,
  `userId` varchar(20) DEFAULT NULL,
  `rollnumber` varchar(10) NOT NULL,
  `name` varchar(100) NOT NULL,
  `role_id` int(11) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `status` int(11) NOT NULL COMMENT '1 is active, 0 is not active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Đang đổ dữ liệu cho bảng `employee_account`
--

INSERT INTO `employee_account` (`id`, `userId`, `rollnumber`, `name`, `role_id`, `email`, `status`) VALUES
(1, 'TC-000001', 'abc123', 'Nguyen Minh Thao', 0, 'minhthao3620@gmail.com', 1),
(2, 'TC-000002', 'GV123', 'Nguyen Chi Linh', 1, 'thaonmce130353@fpt.edu.vn', 1),
(3, 'TC-000003', 'GV456', 'Nguyen Thanh Nhan', 2, 'nguyenminhthaobt1@gmail.com', 1);

--
-- Bẫy `employee_account`
--
DELIMITER $$
CREATE TRIGGER `employee_account_bi` BEFORE INSERT ON `employee_account` FOR EACH ROW BEGIN
   SET NEW.userId = getNextCustomSeq("userId1","TC");
END
$$
DELIMITER ;

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
  `contest_id` int(11) NOT NULL DEFAULT 0,
  `ip` varchar(20) NOT NULL DEFAULT '1',
  `timeout` datetime NOT NULL DEFAULT current_timestamp(),
  `islogin` int(1) NOT NULL DEFAULT 0,
  `email` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Đang đổ dữ liệu cho bảng `student_account`
--

INSERT INTO `student_account` (`id`, `userId`, `rollnumber`, `name`, `contest_id`, `ip`, `timeout`, `islogin`, `email`) VALUES
(1, 'SD-000001', 'CE130353', 'Nguyễn Minh Thảo', 0, '1', '2021-08-02 18:46:43', 0, 'minhthao3260@gmail.com'),
(2, 'SD-000002', 'CE130021', 'Võ Trương Hải Đăng', 0, '1', '2021-08-02 16:49:51', 0, 'minhthao3221@gmail.com'),
(3, 'SD-000003', 'CE130252', 'Nguyễn Chí Linh', 0, '1', '2021-08-02 16:49:51', 0, 'minhthao3140@gmail.com'),
(4, 'SD-000004', 'CE133213', 'Nguyễn Thành Nhân', 0, '1', '2021-08-02 16:49:51', 0, 'minhthao3256@gmail.com'),
(5, 'SD-000005', 'CE130077', 'Phạm Trương Anh Tú', 0, '1', '2021-08-02 16:49:51', 0, 'minhthao1260@gmail.com');

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
('userId', 'SD', 5),
('userId1', 'TC', 3);

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `class`
--
ALTER TABLE `class`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `class_student`
--
ALTER TABLE `class_student`
  ADD KEY `class_id` (`class_id`),
  ADD KEY `student_id` (`student_id`);

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
-- Chỉ mục cho bảng `employee_account`
--
ALTER TABLE `employee_account`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uni_rollnumber_teacher` (`rollnumber`),
  ADD UNIQUE KEY `userId` (`userId`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `role_id` (`role_id`);

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
  ADD UNIQUE KEY `userId` (`userId`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Chỉ mục cho bảng `_sequence`
--
ALTER TABLE `_sequence`
  ADD PRIMARY KEY (`seq_name`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `class`
--
ALTER TABLE `class`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `contest`
--
ALTER TABLE `contest`
  MODIFY `contest_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `contest_student`
--
ALTER TABLE `contest_student`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `employee_account`
--
ALTER TABLE `employee_account`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `student_account`
--
ALTER TABLE `student_account`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `class_student`
--
ALTER TABLE `class_student`
  ADD CONSTRAINT `class_student_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `class` (`id`),
  ADD CONSTRAINT `class_student_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `student_account` (`id`);

--
-- Các ràng buộc cho bảng `contest_student`
--
ALTER TABLE `contest_student`
  ADD CONSTRAINT `contest_student_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `student_account` (`id`),
  ADD CONSTRAINT `contest_student_ibfk_2` FOREIGN KEY (`contest_id`) REFERENCES `contest` (`contest_id`);

--
-- Các ràng buộc cho bảng `employee_account`
--
ALTER TABLE `employee_account`
  ADD CONSTRAINT `employee_account_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `role` (`role_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
