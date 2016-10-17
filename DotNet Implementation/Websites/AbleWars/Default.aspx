<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Default.aspx.cs" Inherits="_Default" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>Login</title>
    <style type="text/css">
        .auto-style1 {
            height: 26px;
        }
    </style>
    <link rel="StyleSheet" href="../loginStyle.css" />

</head>
<body style="font-family: Arial, Helvetica, sans-serif; text-align: center;">
    <div id="center">
        <br />
    <h2>Login Page</h2>
    <h4>Please enter your credentials</h4>
    <form id="form1" runat="server">
    <div id="LoginForm">
        <table border="0" align="center">
            <tr>
                <td>Username :<br />
&nbsp;</td>
                <td>
                    <asp:TextBox ID="txtUser" runat="server" Width="180px"></asp:TextBox>
                    <br />
&nbsp;<asp:Label ID="validUser" runat="server" Font-Bold="True" Font-Italic="True" ForeColor="Red"></asp:Label>
                    <asp:Label ID="errorUser" runat="server" Font-Bold="True" Font-Italic="True" ForeColor="#CC0000"></asp:Label>
                </td>
            </tr>
            <tr>
                <td class="auto-style1">Password :<br />
&nbsp;</td>
                <td class="auto-style1">

                    <asp:TextBox ID="txtPass" runat="server" Width="180px" TextMode="Password"></asp:TextBox>

                    <br />
&nbsp;<asp:Label ID="validPass" runat="server" Font-Bold="True" Font-Italic="True" ForeColor="Red"></asp:Label>
                    <asp:Label ID="errorPass" runat="server" Font-Bold="True" Font-Italic="True" ForeColor="#CC0000"></asp:Label>

                </td>
            </tr>
            <tr>
                <td></td>
                <td style="text-align: right">
                    <asp:Button ID="btnLogin" runat="server" OnClick="btnLogin_Click" Text="Login" Width="100px" style="margin-left: 0px" />
                </td>
            </tr>
        </table>
    </div>
    </form>
    </div>
</body>
</html>
