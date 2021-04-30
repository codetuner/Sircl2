using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Sircl.Website.Data.Localize
{
    public class LocalizeDbContext : DbContext
    {
        public LocalizeDbContext(DbContextOptions<LocalizeDbContext> options)
            : base(options)
        { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
        }

        public DbSet<Domain> LocalizeDomains { get; set; }
        
        public DbSet<Key> LocalizeKeys { get; set; }
               
        public DbSet<KeyValue> LocalizeKeyValues { get; set; }
        
        public DbSet<Query> LocalizeQueries { get; set; }
    }
}
