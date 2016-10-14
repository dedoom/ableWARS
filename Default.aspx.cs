using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Data.SqlClient;
using System.Configuration;

public partial class _Default : Page
{
    protected void Page_Load(object sender, EventArgs e)
    {

    }

    protected void btnLogin_Click(object sender, EventArgs e)
    {
        clearBoxes();

        if(txtUser.Text.Count()<1)
        {
            validUser.Text = "Please enter username";
        } else if(txtPass.Text.Count()<1)
        {
            validPass.Text = "Please enter password";
        }
        else
        {
            SqlConnection conn = new SqlConnection("data source = (localDB)\\MSSqlLocalDb; initial catalog = AbleWars; integrated security = True; MultipleActiveResultSets = True; App = EntityFramework");
            conn.Open();

            string verify = "select count(*) from account where username = '" + txtUser.Text + "'";
            SqlCommand comm = new SqlCommand(verify, conn);

            int temp = Convert.ToInt32(comm.ExecuteScalar().ToString());
            conn.Close();

            if (temp == 1)
            {
                conn.Open();
                string verifyPass = "select password from account where username = '" + txtUser.Text + "'";
                comm = new SqlCommand(verifyPass, conn);
                string pass = comm.ExecuteScalar().ToString();
                if (pass == txtPass.Text)
                {
                    Session["user"] = txtUser.Text;
                    Response.Redirect("index.html");
                }
                else
                {
                    errorPass.Text = "Password incorrect!";
                }
                conn.Close();
            }
            else
            {
                errorUser.Text = "Username doesn't exist!";
            }
        }
    }

    private void clearBoxes()
    {

        errorUser.Text = "";
        errorPass.Text = "";
        validUser.Text = "";
        validPass.Text = "";
    }
}
