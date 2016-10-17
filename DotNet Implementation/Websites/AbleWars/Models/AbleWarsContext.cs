namespace AbleWars.Models
{
    using System;
    using System.Data.Entity;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Linq;
    using AbleWars.Models;

    public partial class AbleWarsContext : DbContext
    {
        public AbleWarsContext()
            : base("name=AbleWarsContext")
        {
        }

        public virtual DbSet<account> accounts { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<account>()
                .Property(e => e.username)
                .IsUnicode(false);

            modelBuilder.Entity<account>()
                .Property(e => e.fname)
                .IsUnicode(false);

            modelBuilder.Entity<account>()
                .Property(e => e.lname)
                .IsUnicode(false);

            modelBuilder.Entity<account>()
                .Property(e => e.password)
                .IsUnicode(false);

            modelBuilder.Entity<account>()
                .Property(e => e.teamId)
                .IsUnicode(false);
        }
    }
}
