SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

-- -----------------------------------------------------
-- Schema garden
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `garden` DEFAULT CHARACTER SET utf8 ;
USE `garden` ;

-- -----------------------------------------------------
-- Table `garden`.`users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `garden`.`users` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `pass` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 2
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `garden`.`plants`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `garden`.`plants` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `user_id` INT(11) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_plants_users_idx` (`user_id` ASC),
  CONSTRAINT `fk_plants_users`
    FOREIGN KEY (`user_id`)
    REFERENCES `garden`.`users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 15
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `garden`.`reports`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `garden`.`reports` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `value` VARCHAR(45) NOT NULL,
  `plant_id` INT(11) NOT NULL,
  `read_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_reports_plants1_idx` (`plant_id` ASC),
  CONSTRAINT `fk_reports_plants1`
    FOREIGN KEY (`plant_id`)
    REFERENCES `garden`.`plants` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
