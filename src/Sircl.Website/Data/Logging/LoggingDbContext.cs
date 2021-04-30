using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace Sircl.Website.Data.Logging
{
    public class LoggingDbContext : DbContext
    {
        public LoggingDbContext(DbContextOptions<LoggingDbContext> options)
            : base(options)
        { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<RequestLog>().Property(e => e.Data).HasConversion(
                j => JsonSerializer.Serialize(j, null),
                s => JsonSerializer.Deserialize<Dictionary<string, string>>(s, null)
            );

            modelBuilder.Entity<RequestLog>().Property(e => e.Request).HasConversion(
                j => JsonSerializer.Serialize(j, null),
                s => JsonSerializer.Deserialize<Dictionary<string, string>>(s, null)
            );
        }

        public DbSet<RequestLog> RequestLogs { get; set; }
    }
}
