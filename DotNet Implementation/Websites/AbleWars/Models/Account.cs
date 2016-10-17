namespace AbleWars.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("account")]
    public partial class Account
    {
        [Key]
        [StringLength(1)]
        public string username { get; set; }

        [StringLength(1)]
        public string fname { get; set; }

        [StringLength(1)]
        public string lname { get; set; }

        [StringLength(1)]
        public string password { get; set; }

        [StringLength(1)]
        public string teamId { get; set; }
    }
}
