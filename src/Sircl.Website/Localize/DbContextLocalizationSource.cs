using Arebis.Core.AspNet.Localization;
using Arebis.Core.Localization;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Sircl.Website.Data.Localize;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Sircl.Website.Localize
{
    public class DbContextLocalizationSource : ILocalizationSource
    {
        public DbContextLocalizationSource(IConfiguration configuration, LocalizeDbContext context, IOptions<LocalizationOptions> localizationOptions)
        {
            this.Context = context;
            this.Options = localizationOptions.Value;
            this.Configuration = configuration;
        }

        public LocalizeDbContext Context { get; private set; }

        public LocalizationOptions Options { get; private set; }

        public IConfiguration Configuration { get; private set; }

        public IServiceProvider ServiceProvider { get; private set; }

        public LocalizationResources BuildResources()
        {
            var data = new LocalizationResources();

            foreach (var domainName in Options.Domains)
            {
                var domain = Context.LocalizeDomains.SingleOrDefault(d => d.Name == domainName);
                if (domain == null) continue;
                if (domain.Cultures == null) continue;
                if (domain.Cultures.Length == 0) continue;

                // Create keys from queries:
                foreach (var query in Context.LocalizeQueries.Where(q => q.DomainId == domain.Id))
                {
                    using (var conn = new SqlConnection(Configuration.GetConnectionString(query.ConnectionName)))
                    using (var cmd = conn.CreateCommand())
                    {
                        // Replace "{cultures}" in SQL command (replace single quotes to prevent SQL injection):
                        cmd.CommandText = query.Sql
                            .Replace("{cultures}", String.Join("','", domain.Cultures.Select(c => c.Replace('\'','*'))));

                        if (conn.State == System.Data.ConnectionState.Closed) conn.Open();

                        using (var reader = cmd.ExecuteReader())
                        {
                            var keyCount = (reader.GetColumnSchema().Count - 1) / 2;
                            while (reader.Read())
                            {
                                var culture = reader.GetString(0);
                                if (domain.Cultures.Contains(culture))
                                {
                                    for (int c = 0; c < keyCount; c++)
                                    {
                                        var key = reader.GetString(c * 2 + 1);
                                        var value = reader.GetString(c * 2 + 2);
                                        data.AddResourceValue(key, culture, value);
                                    }
                                }
                            }
                        }
                    }
                }

                // Create keys from keys:
                foreach (var key in Context.LocalizeKeys.Include(k => k.Values).Where(k => k.DomainId == domain.Id))
                {
                    var resource = new LocalizationResource();
                    resource.ForPath = key.ForPath;
                    foreach (var value in key.Values)
                    {
                        if (value.Value == null && value.Reviewed == false) continue;
                        if (domain.Cultures.Contains(value.Culture))
                        {
                            if (key.ParameterNames != null && key.ParameterNames.Length > 0)
                            {
                                for (int i = 0; i < key.ParameterNames.Length; i++)
                                {
                                    value.Value = (value.Value ?? "").Replace("{" + key.ParameterNames[i], "{" + i);
                                }
                            }
                            resource.Values[value.Culture] = (value.Value ?? "");
                        }
                    }
                    data.AddResource(key.Name, resource);
                }
            }

            return data;
        }
    }
}
