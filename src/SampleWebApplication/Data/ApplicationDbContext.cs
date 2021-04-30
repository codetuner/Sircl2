using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace SampleWebApplication.Data
{
    public class ApplicationDbContext : IdentityDbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<ProductAttribute>()
                .HasKey(c => new { c.ProductId, c.Type });
        }

        public DbSet<Country> Country { get; set; }

        public DbSet<Customer> Customer { get; set; }
        
        public DbSet<Invoice> Invoice { get; set; }
        
        public DbSet<InvoiceLine> InvoiceLine { get; set; }
        
        public DbSet<Product> Product { get; set; }
        
        public DbSet<ProductAttribute> ProductAttributes { get; set; }
    }
}
