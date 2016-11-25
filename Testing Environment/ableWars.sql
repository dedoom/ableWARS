
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
    [accountStatistics] int IDENTITY(1,1) NOT NULL,
    [username] nvarchar(max)  NOT NULL,
    [wins] int  NOT NULL,
	[losses] int NOT NULL,
	[fastestWin] int Null,
	[highestScore] int Null,
	[gamesPlayed] int NOT NULL
);
GO

CREATE TABLE [dbo].[Account] (
    [username] nvarchar(max) NOT NULL,
    [fname] nvarchar(max)  NULL,
    [lname] nvarchar(max)  NULL,
	[password] nvarchar(max) NOT NULL,
	[teamid] nvarchar(max) NULL
);
GO



-- --------------------------------------------------
-- Creating all PRIMARY KEY constraints
-- --------------------------------------------------

-- Creating primary key on [CountryId] in table 'Countries'
ALTER TABLE [dbo].[Statistics]
ADD CONSTRAINT [PK_Statistics]
    PRIMARY KEY CLUSTERED ([accountStatistics] ASC);
GO

ALTER TABLE [dbo].[Accounts]
ADD CONSTRAINT [PK_accounts]
    PRIMARY KEY CLUSTERED ([username] ASC);
GO

-- --------------------------------------------------
-- Creating all FOREIGN KEY constraints
-- --------------------------------------------------

-- Creating foreign key 
ALTER TABLE [dbo].[Account]
ADD CONSTRAINT [FK_Stats]
    FOREIGN KEY ([StatisticsUsername])
    REFERENCES [dbo].[Statistics]
        ([username])
    ON DELETE NO ACTION ON UPDATE NO ACTION;
GO




-- --------------------------------------------------
-- Script has ended
-- --------------------------------------------------