-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3306
-- Tiempo de generación: 16-11-2025 a las 05:30:00
-- Versión del servidor: 8.3.0
-- Versión de PHP: 8.2.18

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `inventario`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_venta`
--

DROP TABLE IF EXISTS `detalle_venta`;
CREATE TABLE IF NOT EXISTS `detalle_venta` (
  `id_detalle` int NOT NULL AUTO_INCREMENT,
  `id_venta` int NOT NULL,
  `id_producto` int DEFAULT NULL,
  `cantidad` int NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `producto_nombre` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id_detalle`),
  KEY `id_venta` (`id_venta`),
  KEY `id_producto` (`id_producto`)
) ENGINE=InnoDB AUTO_INCREMENT=78 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `detalle_venta`
--

INSERT INTO `detalle_venta` (`id_detalle`, `id_venta`, `id_producto`, `cantidad`, `precio_unitario`, `subtotal`, `producto_nombre`) VALUES
(1, 1, 1, 2, 20.00, 40.00, 'Coca Cola 600ml'),
(2, 1, NULL, 1, 12.00, 12.00, 'Galletas Oreo'),
(3, 1, NULL, 1, 30.00, 30.00, 'sabritas'),
(4, 2, 1, 1, 20.00, 20.00, 'Coca Cola 600ml'),
(5, 2, NULL, 2, 12.00, 24.00, 'Galletas Oreo'),
(6, 3, NULL, 3, 12.00, 36.00, 'Galletas Oreo'),
(7, 3, NULL, 1, 30.00, 30.00, 'sabritas'),
(8, 4, 1, 2, 20.00, 40.00, 'Coca Cola 600ml'),
(9, 4, NULL, 2, 30.00, 60.00, 'sabritas'),
(10, 5, 1, 3, 20.00, 60.00, 'Coca Cola 600ml'),
(11, 5, NULL, 2, 12.00, 24.00, 'Galletas Oreo'),
(12, 5, NULL, 1, 30.00, 30.00, 'sabritas'),
(13, 6, NULL, 3, 40.00, 120.00, 'Coquita Azul'),
(14, 7, NULL, 14, 40.00, 560.00, 'Coquita Azul'),
(15, 8, 1, 50, 20.00, 1000.00, 'Coca Cola 600ml'),
(16, 9, 10, 8, 18.00, 144.00, 'Galletas Marías'),
(17, 10, NULL, 1, 40.00, 40.00, 'Coquita Azul'),
(18, 11, NULL, 10, 40.00, 400.00, 'Coquita Azul'),
(19, 12, 1, 10, 20.00, 200.00, 'Coca Cola 600ml'),
(20, 12, NULL, 1, 10.00, 10.00, 'Kilo de Tomate'),
(21, 13, NULL, 7, 10.00, 70.00, 'Kilo de Tomate'),
(22, 13, NULL, 9, 144.00, 1296.00, 'Don Cangrejo'),
(23, 14, NULL, 1, 144.00, 144.00, 'Don Cangrejo'),
(24, 15, NULL, 1, 144.00, 144.00, 'Don Cangrejo'),
(25, 16, NULL, 1, 12.00, 12.00, 'Galletas Oreo'),
(26, 17, NULL, 1, 30.00, 30.00, 'sabritas'),
(27, 17, 10, 2, 18.00, 36.00, 'Galletas Marías'),
(28, 17, NULL, 4, 144.00, 576.00, 'Don Cangrejo'),
(29, 18, NULL, 15, 22.00, 330.00, 'Ruffles Queso'),
(30, 19, NULL, 3, 12.00, 36.00, 'Galletas Oreo'),
(31, 19, NULL, 1, 30.00, 30.00, 'sabritas'),
(32, 20, NULL, 1, 12.00, 12.00, 'Galletas Oreo'),
(33, 21, NULL, 5, 5.00, 25.00, NULL),
(34, 21, NULL, 1, 22.00, 22.00, 'Ruffles Queso'),
(35, 21, NULL, 1, 144.00, 144.00, 'Don Cangrejo'),
(36, 22, 1, 50, 20.00, 1000.00, 'Coca Cola 600ml'),
(37, 23, NULL, 1, 12.00, 12.00, 'Galletas Oreo'),
(38, 24, NULL, 1, 30.00, 30.00, 'sabritas'),
(39, 25, NULL, 5, 30.00, 150.00, 'sabritas'),
(40, 26, 10, 1, 18.00, 18.00, 'Galletas Marías'),
(41, 27, NULL, 1, 10.00, 10.00, 'Kilo de Tomate'),
(42, 28, NULL, 1, 12.00, 12.00, 'Galletas Oreo'),
(43, 29, NULL, 1, 12.00, 12.00, 'Galletas Oreo'),
(44, 30, NULL, 42, 5.00, 210.00, NULL),
(45, 31, NULL, 46, 100.00, 4600.00, 'Buzanit'),
(46, 32, NULL, 4, 100.00, 400.00, 'Buzanit'),
(47, 33, NULL, 1, 144.00, 144.00, 'Don Cangrejo'),
(48, 34, NULL, 1, 22.00, 22.00, 'Ruffles Queso'),
(49, 35, NULL, 8, 144.00, 1152.00, 'Don Cangrejo'),
(50, 60, NULL, 1, 12.00, 12.00, 'Galletas Oreo'),
(51, 61, NULL, 12, 12.00, 144.00, 'Galletas Oreo'),
(52, 62, 15, 5, 100.00, 500.00, 'Antonio'),
(53, 63, NULL, 2, 1.00, 2.00, 'Eduardo Gay'),
(54, 64, 10, 1, 18.00, 18.00, 'Galletas Marías'),
(55, 65, 10, 4, 18.00, 72.00, 'Galletas Marías'),
(56, 66, 10, 4, 18.00, 72.00, 'Galletas Marías'),
(57, 67, NULL, 2, 10.00, 20.00, 'Kilo de Tomate'),
(58, 68, NULL, 4, 10.00, 40.00, 'Kilo de Tomate'),
(59, 68, 10, 2, 18.00, 36.00, 'Galletas Marías'),
(60, 68, NULL, 1, 40.00, 40.00, 'Coquita Azul'),
(61, 68, NULL, 2, 1.00, 2.00, 'Eduardo Gay'),
(62, 69, NULL, 3, 10.00, 30.00, 'Kilo de Tomate'),
(63, 70, NULL, 3, 1.00, 3.00, 'Eduardo Gay'),
(64, 70, 15, 1, 100.00, 100.00, 'Antonio'),
(65, 70, NULL, 2, 40.00, 80.00, 'Coquita Azul'),
(66, 70, NULL, 5, 10.00, 50.00, 'Kilo de Tomate'),
(67, 71, NULL, 1, 10.00, 10.00, 'Kilo de Tomate'),
(68, 72, 15, 24, 100.00, 2400.00, 'Antonio'),
(69, 72, NULL, 2, 10.00, 20.00, 'Kilo de Tomate'),
(70, 72, NULL, 1, 1.00, 1.00, 'Eduardo Gay'),
(71, 73, NULL, 5, 10.00, 50.00, 'Kilo de Tomate'),
(72, 74, 1, 4, 20.00, 80.00, 'Coca Cola 600ml'),
(73, 75, 15, 1, 100.00, 100.00, 'Antonio'),
(74, 75, 50, 1, 23.00, 23.00, 'Eduardo Gay'),
(75, 76, 50, 29, 23.00, 667.00, 'Eduardo Gay'),
(76, 76, 15, 5, 100.00, 500.00, 'Antonio'),
(77, 77, 1, 16, 20.00, 320.00, 'Coca Cola 600ml');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

DROP TABLE IF EXISTS `productos`;
CREATE TABLE IF NOT EXISTS `productos` (
  `id_producto` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `tipo` enum('SABRITAS','FRUTAS Y VERDURAS','LIMPIEZA','BEBIDAS','FARMACIA','ABARROTES') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `precio` decimal(10,2) NOT NULL,
  `imagen` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `stock` int DEFAULT '0',
  `stock_minimo` int NOT NULL DEFAULT '5',
  `fecha_creacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_producto`)
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id_producto`, `nombre`, `tipo`, `descripcion`, `precio`, `imagen`, `stock`, `stock_minimo`, `fecha_creacion`) VALUES
(1, 'Coca Cola 600ml', 'ABARROTES', 'Refresco frío', 20.00, '/img/Coca_Cola_600ml_1762753666034.jpg', 0, 5, '2025-09-17 11:52:11'),
(10, 'Galletas Marías', 'ABARROTES', 'tubo de 232g', 18.00, '/img/Galletas_Marías_1763050068417.png', 30, 5, '2025-10-24 18:54:07'),
(15, 'Antonio', 'FARMACIA', 'MASCULINO', 100.00, '/img/Antonio_1762191396467.jpg', 0, 5, '2025-10-28 03:36:13'),
(50, 'Eduardo Gay', 'BEBIDAS', 'REGRESCO DE COLA', 23.00, '/img/Eduardo_Gay_1762881975506.jpg', 0, 5, '2025-11-11 17:26:15');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nombre_usuario` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `nombre_completo` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `correo` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `contraseña` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `rol` enum('supervisor','admin','cajero') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `nombre_usuario` (`nombre_usuario`),
  UNIQUE KEY `correo` (`correo`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id_usuario`, `nombre_usuario`, `nombre_completo`, `correo`, `contraseña`, `rol`, `fecha_creacion`) VALUES
(2, 'daniel', 'Daniel Salcido', 'practicassalcido@gmail.com', '1234', 'admin', '2025-10-28 02:51:30'),
(12, 'elcliente', 'Alejandro Morales', 'elcliente@gmail.com', '$2b$10$taqkf/BAP/US4RSTah07meBeo00HsBww/sKFuvU3ELbNzHKT0x45u', 'supervisor', '2025-11-10 15:04:03'),
(15, 'tyron', 'Tyron', 'tyron@gmail.com', '$2b$10$ds/Z8pvKAsxt2rAv6p2tvO7sTQySfIiDRwG23L4jxVHcDBi0hZem6', 'admin', '2025-11-13 15:57:48'),
(16, 'jorg', 'jorge salvaje', 'jor@gmail.com', '$2b$10$8RPpYkoSoU.pJplFdECI2uuXfeRIhDhNJe7TrvmGO9zR2gayWLQP.', 'cajero', '2025-11-13 16:03:21');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ventas`
--

DROP TABLE IF EXISTS `ventas`;
CREATE TABLE IF NOT EXISTS `ventas` (
  `id_venta` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int DEFAULT NULL,
  `fecha_venta` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `metodo_pago` enum('efectivo','transferencia') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `total` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id_venta`),
  KEY `id_usuario` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=78 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ventas`
--

INSERT INTO `ventas` (`id_venta`, `id_usuario`, `fecha_venta`, `metodo_pago`, `total`) VALUES
(1, NULL, '2025-10-10 07:00:00', 'efectivo', 60.00),
(2, NULL, '2025-10-10 07:00:00', '', 44.00),
(3, NULL, '2025-10-11 07:00:00', 'efectivo', 42.00),
(4, NULL, '2025-10-12 07:00:00', '', 82.00),
(5, NULL, '2025-10-13 07:00:00', 'efectivo', 102.00),
(6, NULL, '2025-10-28 16:14:20', 'efectivo', 120.00),
(7, NULL, '2025-10-28 16:17:58', 'efectivo', 560.00),
(8, NULL, '2025-10-28 16:19:53', 'efectivo', 1000.00),
(9, NULL, '2025-10-28 16:26:11', '', 144.00),
(10, NULL, '2025-10-28 16:26:34', 'efectivo', 40.00),
(11, NULL, '2025-10-28 16:32:35', 'efectivo', 400.00),
(12, NULL, '2025-10-28 17:14:36', 'efectivo', 210.00),
(13, NULL, '2025-11-03 00:58:08', 'efectivo', 1366.00),
(14, NULL, '2025-11-03 00:59:00', '', 144.00),
(15, NULL, '2025-11-03 02:20:14', 'transferencia', 144.00),
(16, NULL, '2025-11-03 02:21:28', 'efectivo', 12.00),
(17, NULL, '2025-11-03 02:23:35', 'transferencia', 642.00),
(18, NULL, '2025-11-03 03:39:16', 'transferencia', 330.00),
(19, NULL, '2025-11-03 03:50:30', 'transferencia', 66.00),
(20, NULL, '2025-11-03 17:53:20', 'transferencia', 12.00),
(21, NULL, '2025-11-04 17:17:44', 'transferencia', 191.00),
(22, NULL, '2025-11-06 18:25:35', 'transferencia', 1000.00),
(23, NULL, '2025-11-10 05:08:48', 'transferencia', 12.00),
(24, NULL, '2025-11-10 05:13:00', 'transferencia', 30.00),
(25, NULL, '2025-11-10 05:13:24', 'transferencia', 150.00),
(26, NULL, '2025-11-10 05:13:58', 'efectivo', 18.00),
(27, NULL, '2025-11-10 05:14:47', 'efectivo', 10.00),
(28, NULL, '2025-11-10 05:24:48', 'efectivo', 12.00),
(29, NULL, '2025-11-10 05:27:26', 'efectivo', 12.00),
(30, NULL, '2025-11-10 05:38:08', 'efectivo', 210.00),
(31, NULL, '2025-11-10 06:00:23', 'transferencia', 4600.00),
(32, NULL, '2025-11-10 06:00:33', 'transferencia', 400.00),
(33, NULL, '2025-11-10 15:02:53', 'efectivo', 144.00),
(34, NULL, '2025-11-10 15:02:59', 'transferencia', 22.00),
(35, NULL, '2025-11-10 15:07:48', 'transferencia', 1152.00),
(60, NULL, '2025-11-11 03:33:43', 'transferencia', 12.00),
(61, NULL, '2025-11-11 03:34:59', 'efectivo', 144.00),
(62, 2, '2025-11-11 03:37:15', 'transferencia', 500.00),
(63, 2, '2025-11-11 03:37:33', 'transferencia', 2.00),
(64, NULL, '2025-11-11 03:40:32', 'transferencia', 18.00),
(65, 12, '2025-11-11 03:42:29', 'transferencia', 72.00),
(66, 2, '2025-11-11 04:51:57', 'transferencia', 72.00),
(67, 2, '2025-11-11 04:55:18', 'transferencia', 20.00),
(68, NULL, '2025-11-11 13:07:17', 'efectivo', 118.00),
(69, 2, '2025-11-11 13:15:48', 'transferencia', 30.00),
(70, 2, '2025-11-11 13:17:50', 'transferencia', 233.00),
(71, 2, '2025-11-11 13:37:08', 'transferencia', 10.00),
(72, NULL, '2025-11-11 13:43:49', 'efectivo', 2421.00),
(73, NULL, '2025-11-11 13:50:37', 'transferencia', 50.00),
(74, 2, '2025-11-11 17:17:52', 'efectivo', 80.00),
(75, 2, '2025-11-11 18:40:41', 'efectivo', 123.00),
(76, 12, '2025-11-12 18:35:03', 'transferencia', 1167.00),
(77, 15, '2025-11-13 16:01:18', 'transferencia', 320.00);

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `detalle_venta`
--
ALTER TABLE `detalle_venta`
  ADD CONSTRAINT `fk_detalle_producto` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `ventas`
--
ALTER TABLE `ventas`
  ADD CONSTRAINT `fk_ventas_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
