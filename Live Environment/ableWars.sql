
-- --------------------------------------------------
-- Entity Designer DDL Script for SQL Server 2005, 2008, 2012 and Azure
-- --------------------------------------------------
-- Date Created: 10/05/2016 11:53:09
-- Generated from EDMX file: C:\Workspace\PROG35142 - 1169_89862\Source\Classroom Content\prog35142.week2.modelfirst\prog35142.week2.modelfirst\OlympicsContext.edmx
-- --------------------------------------------------
--CREATE DATABASE AbleWars;

SET QUOTED_IDENTIFIER OFF;
GO
USE [AbleWars];
GO
IF SCHEMA_ID(N'dbo') IS NULL EXECUTE(N'CREATE SCHEMA [dbo]');
GO


-- --------------------------------------------------
-- Creating table
-- --------------------------------------------------

-- Creating table 'Statistics'
CREATE TABLE [dbo].[Statistics] (
    [accountStatistics] int IDENTITY(1,1) PRIMARY KEY NOT NULL,
    [username] varchar(30)  NOT NULL,
    [wins] int  NOT NULL,
	[losses] int NOT NULL,
	[fastestWin] int Null,
	[highestScore] int Null,
	[gamesPlayed] int NOT NULL
);
GO

CREATE TABLE [dbo].[account] (
    [username] varchar(30) NOT NULL,
    [fname] varchar(30)  NULL,
    [lname] varchar(30)  NULL,
	[password] varchar(30) NOT NULL,
	[teamid] varchar(10) NULL
);
GO

-- --------------------------------------------------
-- Creating all FOREIGN KEY constraints
-- --------------------------------------------------

-- Creating foreign key 
ALTER TABLE [dbo].[Statistics]
ADD CONSTRAINT [FK_User]
    FOREIGN KEY ([username])
    REFERENCES [dbo].[account]
        ([username])
    ON DELETE NO ACTION ON UPDATE NO ACTION;
GO