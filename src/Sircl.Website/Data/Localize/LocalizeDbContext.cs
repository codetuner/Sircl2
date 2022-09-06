using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;

namespace Sircl.Website.Data.Localize
{
    public class LocalizeDbContext : DbContext
    {
        private static readonly char[] StringSeparator = new char[] { ',' };

        public LocalizeDbContext(DbContextOptions<LocalizeDbContext> options)
            : base(options)
        { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder
                .Entity<Domain>()
                .Property(e => e.Cultures)
                .HasConversion(
                    a => (a == null || a.Length == 0) ? null : String.Join(StringSeparator[0], a),
                    s => (s == null) ? null : s.Split(StringSeparator),
                    new ValueComparer<string[]>(
                        (a1, a2) => a1.SequenceEqual(a2),
                        a => a.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                        a => a.ToArray()
                    )
                );

            modelBuilder
                .Entity<Key>()
                .Property(e => e.ParameterNames)
                .HasConversion(
                    a => (a == null || a.Length == 0) ? null : String.Join(StringSeparator[0], a),
                    s => (s == null) ? null : s.Split(StringSeparator),
                    new ValueComparer<string[]>(
                        (a1, a2) => a1.SequenceEqual(a2),
                        a => a.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                        a => a.ToArray()
                    )
                );

            modelBuilder
                .Entity<Key>()
                .Property(e => e.ValuesToReview)
                .HasConversion(
                    a => (a == null || a.Length == 0) ? null : String.Join(StringSeparator[0], a),
                    s => (s == null) ? null : s.Split(StringSeparator),
                    new ValueComparer<string[]>(
                        (a1, a2) => a1.SequenceEqual(a2),
                        a => a.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                        a => a.ToArray()
                    )
                );
        }

        public DbSet<Domain> LocalizeDomains { get; set; }
        
        public DbSet<Key> LocalizeKeys { get; set; }
               
        public DbSet<KeyValue> LocalizeKeyValues { get; set; }
        
        public DbSet<Query> LocalizeQueries { get; set; }
    }
}
