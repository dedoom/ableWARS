USE master;  
GO  
CREATE DATABASE AbleWars;

use [AbleWars]
GO

CREATE TABLE dbo.account 
(  
    username varchar(30) PRIMARY KEY NOT NULL  
    ,fName varchar(30) NULL  
    ,lName varchar(30) NULL  
    ,password varchar(30) NOT NULL  
    ,teamid varchar(10) NULL
); 